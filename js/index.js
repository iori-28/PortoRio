(() => {
  "use strict";

  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
  const navbar = document.getElementById("navbar");
  const updateNavbar = () => navbar?.classList.toggle("scrolled", window.scrollY > 20);
  window.addEventListener("scroll", updateNavbar, { passive: true });
  updateNavbar();

  class VinylController {
    constructor(surface, record) {
      this.surface = surface;
      this.record = record;
      this.rotation = 0;
      this.velocity = 0;
      this.frame = 0;
      this.pointer = null;
      this.enabled = true;
      this.samples = [];
      this.tick = this.tick.bind(this);
      surface.tabIndex = 0;
      surface.addEventListener("pointerdown", (event) => this.startDrag(event));
      surface.addEventListener("pointermove", (event) => this.moveDrag(event));
      surface.addEventListener("pointerup", (event) => this.endDrag(event));
      surface.addEventListener("pointercancel", (event) => this.endDrag(event, true));
      surface.addEventListener("lostpointercapture", (event) => this.endDrag(event, true));
      surface.addEventListener("keydown", (event) => this.keyboard(event));
      surface.addEventListener("dragstart", (event) => event.preventDefault());
      document.getElementById("stop-record")?.addEventListener("click", () => this.stop());
      window.addEventListener("blur", () => this.stop());
      window.addEventListener("resize", () => this.stop(), { passive: true });
      // Scrolling changes the cached center; interrupt safely instead of jumping.
      window.addEventListener("scroll", () => {
        if (this.pointer !== null) this.stop();
      }, { passive: true });
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) this.stop();
      });
      window.addEventListener("pagehide", () => this.stop());
      motionPreference.addEventListener("change", () => this.stop());
    }

    render() {
      this.record.style.transform = `rotate(${this.rotation}deg)`;
    }

    angleAt(event) {
      const x = event.clientX - this.center.x;
      const y = event.clientY - this.center.y;
      // The angle is unstable near the spindle. Rebase when leaving this area.
      return Math.hypot(x, y) < this.deadZone ? null : Math.atan2(y, x) * 180 / Math.PI;
    }

    startDrag(event) {
      if (!this.enabled || this.pointer !== null || !event.isPrimary || event.button !== 0) return;
      this.stop();
      const bounds = this.surface.getBoundingClientRect();
      this.center = { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
      this.deadZone = Math.max(10, bounds.width * .055);
      // Ignore the transparent square corners of the circular hit area.
      if (Math.hypot(event.clientX - this.center.x, event.clientY - this.center.y) > bounds.width / 2) return;
      event.preventDefault();
      this.surface.focus({ preventScroll: true });
      this.pointer = event.pointerId;
      this.lastAngle = this.angleAt(event);
      this.samples = [{ time: event.timeStamp, angle: this.rotation }];
      try {
        this.surface.setPointerCapture(event.pointerId);
      } catch {
        this.stop();
        return;
      }
      this.surface.classList.add("is-dragging");
    }

    sample(event) {
      const angle = this.angleAt(event);
      if (angle === null || this.lastAngle === null) {
        this.lastAngle = angle;
        this.samples = [{ time: event.timeStamp, angle: this.rotation }];
        return;
      }
      // Shortest signed delta; cumulative rotation itself is never wrapped.
      const delta = ((angle - this.lastAngle + 540) % 360) - 180;
      this.lastAngle = angle;
      this.rotation += delta;
      const previous = this.samples.at(-1);
      const beforePrevious = this.samples.at(-2);
      // A fresh scratch direction must take over immediately, including inertia.
      if (beforePrevious && delta * (previous.angle - beforePrevious.angle) < 0) {
        this.samples = [previous];
      }
      this.samples.push({ time: event.timeStamp, angle: this.rotation });
      this.samples = this.samples.filter((sample) => event.timeStamp - sample.time <= 100).slice(-20);
    }

    moveDrag(event) {
      if (event.pointerId !== this.pointer) return;
      const coalesced = event.getCoalescedEvents?.();
      for (const sample of coalesced?.length ? coalesced : [event]) this.sample(sample);
      this.render();
    }

    endDrag(event, cancelled = false) {
      if (event.pointerId !== this.pointer) return;
      if (!cancelled) this.sample(event);
      this.render();
      const first = this.samples[0];
      const last = this.samples.at(-1);
      const elapsed = last && first ? (last.time - first.time) / 1000 : 0;
      const velocity = elapsed >= .008 ? (last.angle - first.angle) / elapsed : 0;
      this.releasePointer();
      this.velocity = cancelled || motionPreference.matches ? 0 : Math.max(-1440, Math.min(1440, velocity));
      if (Math.abs(this.velocity) > 4) {
        this.lastFrameTime = performance.now();
        this.surface.classList.add("is-moving");
        this.frame = requestAnimationFrame(this.tick);
      }
    }

    releasePointer() {
      const pointer = this.pointer;
      this.pointer = null;
      this.surface.classList.remove("is-dragging");
      if (pointer !== null && this.surface.hasPointerCapture(pointer)) this.surface.releasePointerCapture(pointer);
    }

    tick(now) {
      this.frame = 0;
      if (!this.enabled || this.pointer !== null || document.hidden || motionPreference.matches) {
        this.stop();
        return;
      }
      const dt = Math.min(Math.max((now - this.lastFrameTime) / 1000, 0), .05);
      this.lastFrameTime = now;
      const friction = 2.35;
      const damping = Math.exp(-friction * dt);
      // Integrate exponential decay, rather than assuming a 60 Hz frame rate.
      this.rotation += this.velocity * (1 - damping) / friction;
      this.velocity *= damping;
      this.render();
      if (Math.abs(this.velocity) > 4) {
        this.frame = requestAnimationFrame(this.tick);
      } else {
        this.stop();
      }
    }

    stop() {
      cancelAnimationFrame(this.frame);
      this.frame = 0;
      this.velocity = 0;
      this.releasePointer();
      this.samples = [];
      this.surface.classList.remove("is-moving");
    }

    setEnabled(enabled) {
      this.stop();
      this.enabled = enabled;
      this.surface.setAttribute("aria-disabled", String(!enabled));
    }

    reset() {
      this.stop();
      this.rotation = 0;
      this.render();
    }

    keyboard(event) {
      if (!this.enabled || !["ArrowLeft", "ArrowRight", " ", "Escape"].includes(event.key)) return;
      event.preventDefault();
      this.stop();
      if (event.key.startsWith("Arrow")) {
        this.rotation += (event.key === "ArrowRight" ? 1 : -1) * (event.shiftKey ? 45 : 15);
        this.render();
      }
    }
  }

  function initializeCollection() {
    const room = document.getElementById("listening-room");
    const surface = document.getElementById("record-surface");
    const record = document.getElementById("record");
    const recordMotion = document.getElementById("record-motion");
    const notes = document.getElementById("liner-notes");
    const sleeves = [...document.querySelectorAll(".sleeve[data-record]")];
    const panels = [...document.querySelectorAll(".record-panel")];
    if (!room || !surface || !record || !recordMotion || !notes || sleeves.length !== panels.length) return;

    const controller = new VinylController(surface, record);
    const records = new Map(sleeves.map((sleeve, index) => [sleeve.dataset.record, {
      sleeve,
      panel: panels.find((panel) => panel.id === sleeve.dataset.record),
      title: sleeve.querySelector(".sleeve-caption > span:last-child").textContent,
      number: String(index + 1).padStart(2, "0"),
      side: String.fromCharCode(65 + index)
    }]));
    const aliases = { about: "home", competitions: "experience" };
    const resolve = (hash) => {
      const id = hash.replace(/^#/, "");
      return records.has(id) ? id : (Object.hasOwn(aliases, id) ? aliases[id] : "home");
    };
    let active = resolve(location.hash);
    let requested = { id: active, focus: false };
    let switching = false;
    let animation = null;
    let skipTransition = false;

    function setState(state) {
      room.dataset.state = state;
      controller.setEnabled(state === "ready");
    }

    function showRecord(id) {
      const entry = records.get(id);
      // Labels, content, and accessible selection change in the same task.
      const restoreFocus = panels.some((panel) => panel.id !== id && panel.contains(document.activeElement));
      panels.forEach((panel) => { panel.hidden = panel.id !== id; });
      sleeves.forEach((sleeve) => {
        if (sleeve.dataset.record === id) sleeve.setAttribute("aria-current", "true");
        else sleeve.removeAttribute("aria-current");
      });
      document.body.dataset.record = id;
      document.getElementById("record-title").textContent = entry.title.replace(" ", "\n");
      document.getElementById("record-side").textContent = `SIDE ${entry.side}`;
      document.getElementById("record-number").textContent = entry.number;
      document.getElementById("record-catalog").textContent = `PR—0${entry.number} · ORIGINAL PRESSING`;
      document.getElementById("playing-side").textContent = `Side ${entry.side} · Record ${entry.number}`;
      document.getElementById("playing-title").textContent = entry.title;
      document.getElementById("notes-jump").href = `#${id}`;
      surface.setAttribute("aria-label", `${entry.title} vinyl`);
      active = id;
      controller.reset();
      if (restoreFocus) entry.panel.querySelector("h2").focus({ preventScroll: true });
    }

    function sleevePosition(id, extracted = false) {
      const artwork = records.get(id).sleeve.querySelector(".sleeve-art");
      const target = artwork.getBoundingClientRect();
      const gallery = document.getElementById("sleeve-list").getBoundingClientRect();
      // A sleeve outside the scrollable gallery cannot receive a visible record.
      // Use a short lift/fade instead of sending it beyond the page boundary.
      if (target.left < gallery.left || target.right > gallery.right) {
        return "translateY(-12px) scale(.94)";
      }
      // offset dimensions remain independent of the animation transform.
      const deck = recordMotion.offsetParent.getBoundingClientRect();
      const width = recordMotion.offsetWidth;
      const x = target.left + target.width / 2 - (deck.left + recordMotion.offsetLeft + width / 2);
      const y = target.top + target.height / 2 - (deck.top + recordMotion.offsetTop + width / 2);
      const scale = target.width / width * .88;
      const direction = x < 0 ? 1 : -1;
      return `translate(${x + (extracted ? direction * target.width * .65 : 0)}px, ${y}px) scale(${scale})`;
    }

    function revealSleeve(id) {
      const gallery = document.getElementById("sleeve-list");
      if (gallery.scrollWidth <= gallery.clientWidth) return;
      const target = records.get(id).sleeve.getBoundingClientRect();
      const bounds = gallery.getBoundingClientRect();
      gallery.scrollBy({ left: target.left - bounds.left - (bounds.width - target.width) / 2, behavior: "instant" });
    }

    async function animateRecord(keyframes, duration) {
      if (skipTransition || motionPreference.matches || document.hidden || !recordMotion.animate) return;
      animation = recordMotion.animate(keyframes, { duration, easing: "cubic-bezier(.22,.7,.25,1)", fill: "forwards" });
      try { await animation.finished; } catch { /* Cancellation still commits the requested content. */ }
      animation.cancel();
      animation = null;
    }

    function focusNotes(id) {
      const panel = records.get(id).panel;
      panel.querySelector("h2").focus({ preventScroll: true });
      panel.scrollIntoView({ block: "start", behavior: motionPreference.matches ? "instant" : "smooth" });
    }

    async function processSelection() {
      if (switching) return;
      switching = true;
      try {
        // Only the latest pending request survives. There is one physical record.
        while (requested.id !== active) {
          skipTransition = motionPreference.matches || document.hidden;
          setState("returning");
          await animateRecord([
            { transform: "none", opacity: 1 },
            { transform: "translateY(-10px) scale(1.025)", opacity: 1, offset: .2 },
            { transform: sleevePosition(active, true), opacity: 1, offset: .8 },
            { transform: sleevePosition(active), opacity: 0 }
          ], 230);
          const next = requested.id;
          revealSleeve(next);
          showRecord(next);
          setState("extracting");
          const extracted = sleevePosition(next, true);
          await animateRecord([
            { transform: sleevePosition(next), opacity: 0 },
            { transform: extracted, opacity: 1 }
          ], 120);
          setState("placing");
          await animateRecord([
            { transform: extracted, opacity: 1 },
            { transform: "translateY(-5px) scale(1.02)", opacity: 1, offset: .8 },
            { transform: "none", opacity: 1 }
          ], 260);
        }
      } catch {
        // Core navigation also works if a browser cannot animate a record.
        showRecord(requested.id);
      } finally {
        animation?.cancel();
        animation = null;
        switching = false;
        setState("ready");
        document.getElementById("selection-status").textContent = `${records.get(active).title} selected. Liner notes are ready.`;
        if (requested.focus) focusNotes(active);
      }
    }

    function select(id, { focus = false, history = true } = {}) {
      if (!records.has(id)) return;
      if (history && location.hash !== `#${id}`) {
        // Hash routes work on static hosting and preserve browser Back/Forward.
        try { window.history.pushState(null, "", `#${id}`); } catch { location.hash = id; }
      }
      requested = { id, focus };
      if (active === id && !switching) {
        if (focus) focusNotes(id);
        return;
      }
      void processSelection();
    }

    document.addEventListener("click", (event) => {
      const anchor = event.target.closest('a[href^="#"]');
      if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const hash = anchor.getAttribute("href").slice(1);
      if (!records.has(hash) && !Object.hasOwn(aliases, hash)) return;
      event.preventDefault();
      select(resolve(hash), { focus: !anchor.classList.contains("sleeve") });
    });
    document.getElementById("sleeve-list").addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
      const index = sleeves.indexOf(event.target.closest(".sleeve"));
      if (index < 0) return;
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? sleeves.length - 1 :
        (index + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) + sleeves.length) % sleeves.length;
      sleeves[next].focus();
    });
    window.addEventListener("hashchange", () => {
      const hash = location.hash.slice(1);
      if (!hash || records.has(hash) || Object.hasOwn(aliases, hash)) {
        select(resolve(hash), { history: false });
      }
    });
    const finishTransition = () => {
      if (!switching) return;
      skipTransition = true;
      animation?.finish();
    };
    motionPreference.addEventListener("change", finishTransition);
    window.addEventListener("resize", finishTransition, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) finishTransition();
    });
    window.addEventListener("pagehide", finishTransition);
    showRecord(active);
    revealSleeve(active);
    document.body.classList.add("enhanced");
    document.getElementById("interaction-controls").hidden = false;
  }

  function initializeSkills() {
    const skills = document.querySelector(".skills-grid");
    if (!skills) return;
    skills.classList.add("skills-interactive");
    skills.querySelectorAll(".skill-card").forEach((card) => {
      const toggle = card.querySelector(".skill-toggle");
      if (!toggle) return;
      toggle.hidden = false;
      let pinned = false;
      const show = (visible) => {
        card.classList.toggle("logos-visible", visible);
        toggle.setAttribute("aria-pressed", String(visible));
        toggle.textContent = `${visible ? "Hide" : "Show"} logos ${visible ? "−" : "+"}`;
      };
      card.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "mouse") show(true);
      });
      card.addEventListener("pointerleave", (event) => {
        if (event.pointerType === "mouse" && !pinned && !card.contains(document.activeElement)) show(false);
      });
      card.addEventListener("focusin", () => {
        if (toggle.matches(":focus-visible")) show(true);
      });
      card.addEventListener("focusout", (event) => {
        if (!card.contains(event.relatedTarget) && !pinned) show(false);
      });
      card.addEventListener("click", () => {
        pinned = !card.classList.contains("logos-visible");
        show(pinned);
      });
      card.addEventListener("keydown", (event) => {
        if (event.key === "Escape") { pinned = false; show(false); }
      });
    });
  }

  initializeCollection();
  initializeSkills();
})();
