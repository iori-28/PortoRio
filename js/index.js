window.mountPortorioHome = () => {
  "use strict";

  const lifetime = new AbortController();
  const listen = (target, type, callback, options = {}) => target?.addEventListener(type, callback, { ...options, signal: lifetime.signal });
  const engine = window.portorioAudio;
  let disposeCollection = () => { };
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
  const navbar = document.getElementById("navbar");
  let navbarFrame = 0;
  const updateNavbar = () => {
    navbarFrame = 0;
    navbar?.classList.toggle("scrolled", window.scrollY > 20);
  };
  // Coalesce scroll events to at most one class check per frame.
  listen(window, "scroll", () => { navbarFrame ||= requestAnimationFrame(updateNavbar); }, { passive: true });
  lifetime.signal.addEventListener("abort", () => cancelAnimationFrame(navbarFrame));
  updateNavbar();

  class VinylController {
    constructor(surface, record) {
      this.surface = surface;
      this.record = record;
      this.rotation = engine.angle;
      this.velocity = 0;
      this.frame = 0;
      this.pointer = null;
      this.enabled = true;
      this.samples = [];
      this.visible = true;
      this.tick = this.tick.bind(this);
      surface.tabIndex = 0;
      // Spinning a record nobody can see wastes frames (notably on mobile, where the
      // liner notes sit below the deck). Pause the loop off-screen; resume on return.
      if (typeof IntersectionObserver === "function") {
        const observer = new IntersectionObserver(([entry]) => {
          this.visible = entry.isIntersecting;
          if (this.visible) this.wake();
        });
        observer.observe(surface);
        lifetime.signal.addEventListener("abort", () => observer.disconnect());
      }
      listen(surface, "pointerdown", (event) => this.startDrag(event));
      listen(surface, "pointermove", (event) => this.moveDrag(event));
      listen(surface, "pointerup", (event) => this.endDrag(event));
      listen(surface, "pointercancel", (event) => this.endDrag(event, true));
      listen(surface, "lostpointercapture", (event) => this.endDrag(event, true));
      listen(surface, "keydown", (event) => this.keyboard(event));
      listen(surface, "dragstart", (event) => event.preventDefault());
      listen(document.getElementById("stop-record"), "click", () => this.stop());
      listen(window, "blur", () => this.stop());
      listen(window, "resize", () => this.stop(), { passive: true });
      // Scrolling changes the cached center; interrupt safely instead of jumping.
      listen(window, "scroll", () => {
        if (this.pointer !== null) this.stop();
      }, { passive: true });
      listen(document, "visibilitychange", () => {
        if (document.hidden) this.stop();
      });
      listen(window, "pagehide", () => this.stop());
      listen(motionPreference, "change", () => this.stop());
    }

    render() {
      engine.angle = this.rotation;
      this.record.style.transform = `rotate(${this.rotation}deg)`;
    }

    angleAt(event) {
      const x = event.clientX - this.center.x;
      const y = event.clientY - this.center.y;
      // The angle is unstable near the spindle. Rebase when leaving this area.
      return Math.hypot(x, y) < this.deadZone ? null : Math.atan2(y, x) * 180 / Math.PI;
    }

    startDrag(event) {
      if (engine.state === "starting" || !this.enabled || this.pointer !== null || !event.isPrimary || event.button !== 0) return;
      const bounds = this.surface.getBoundingClientRect();
      this.center = { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
      this.deadZone = Math.max(10, bounds.width * .055);
      // Ignore the transparent square corners of the circular hit area.
      if (Math.hypot(event.clientX - this.center.x, event.clientY - this.center.y) > bounds.width / 2) return;
      this.stop();
      event.preventDefault();
      this.surface.focus({ preventScroll: true });
      this.origin = { x: event.clientX, y: event.clientY };
      this.hasDragged = false;
      this.pointer = event.pointerId;
      this.lastAngle = this.angleAt(event);
      this.samples = [{ time: event.timeStamp, angle: this.rotation }];
      try {
        this.surface.setPointerCapture(event.pointerId);
      } catch {
        this.stop();
        this.wake();
        return;
      }
      this.surface.classList.add("is-dragging");
      engine.beginScratch();
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
      if (this.origin && Math.hypot(event.clientX - this.origin.x, event.clientY - this.origin.y) > 6) this.hasDragged = true;
      const elapsed = Math.max(.008, (event.timeStamp - this.samples.at(-1).time) / 1000);
      engine.scratch(delta, delta / elapsed);
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
      this.suppressClick = this.hasDragged;
      this.releasePointer();
      engine.endScratch();
      this.velocity = cancelled || motionPreference.matches ? 0 : Math.max(-1440, Math.min(1440, velocity));
      if (Math.abs(this.velocity) > 4 || engine.state === "playing") {
        this.lastFrameTime = performance.now();
        this.surface.classList.add("is-moving");
        if (!this.frame) this.frame = requestAnimationFrame(this.tick);
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
      if (!this.visible) {
        // Keep momentum state simple: settle immediately while hidden.
        cancelAnimationFrame(this.frame);
        this.frame = 0;
        this.velocity = 0;
        this.surface.classList.remove("is-moving");
        return;
      }
      const dt = Math.min(Math.max((now - this.lastFrameTime) / 1000, 0), .05);
      this.lastFrameTime = now;
      const target = engine.state === "playing" ? 200 : 0;
      const friction = target ? 7 : 2.35;
      const damping = Math.exp(-friction * dt);
      this.rotation += target * dt + (this.velocity - target) * (1 - damping) / friction;
      this.velocity = target + (this.velocity - target) * damping;
      this.render();
      if (target || Math.abs(this.velocity) > 4) this.frame = requestAnimationFrame(this.tick);
      else this.stop();
    }

    wake() {
      if (this.frame || this.pointer !== null || !this.enabled || !this.visible || document.hidden || motionPreference.matches) return;
      if (engine.state !== "playing") return;
      this.lastFrameTime = performance.now();
      this.surface.classList.add("is-moving");
      this.frame = requestAnimationFrame(this.tick);
    }

    stop() {
      cancelAnimationFrame(this.frame);
      this.frame = 0;
      this.velocity = 0;
      this.releasePointer();
      engine.endScratch();
      this.samples = [];
      this.surface.classList.remove("is-moving");
    }

    setEnabled(enabled) {
      this.enabled = enabled;
      this.stop();
      this.surface.setAttribute("aria-disabled", String(!enabled));
      if (enabled) this.wake();
    }

    reset() {
      this.stop();
      this.render();
      this.wake();
    }

    keyboard(event) {
      if (!this.enabled || !["ArrowLeft", "ArrowRight", " ", "Escape"].includes(event.key)) return;
      event.preventDefault();
      this.stop();
      if ([" ", "Escape"].includes(event.key)) engine.stop();
      if (event.key.startsWith("Arrow")) {
        this.rotation += (event.key === "ArrowRight" ? 1 : -1) * (event.shiftKey ? 45 : 15);
        this.render();
        this.wake();
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
    listen(engine, "change", () => {
      if (["stopping", "error", "loading", "starting"].includes(engine.state)) controller.stop();
      controller.wake();
    });
    listen(document, "visibilitychange", () => controller.wake());
    listen(window, "focus", () => controller.wake());
    listen(window, "resize", () => controller.wake(), { passive: true });
    listen(motionPreference, "change", () => controller.wake());
    listen(surface, "click", (event) => {
      if (controller.suppressClick) { event.preventDefault(); event.stopPropagation(); controller.suppressClick = false; }
    }, { capture: true });
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

    let disposed = false;
    function setState(state) {
      room.dataset.state = state;
      controller.setEnabled(state === "ready");
    }

    let initialized = false;
    function showRecord(id) {
      const entry = records.get(id);
      if (initialized) room.classList.add("animate-panels");
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
      engine.select(id);
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
        while (!disposed && requested.id !== active) {
          skipTransition = motionPreference.matches || document.hidden;
          setState("returning");
          await animateRecord([
            { transform: "none", opacity: 1 },
            { transform: "translateY(-10px) scale(1.025)", opacity: 1, offset: .2 },
            { transform: sleevePosition(active, true), opacity: 1, offset: .8 },
            { transform: sleevePosition(active), opacity: 0 }
          ], 230);
          if (disposed) return;
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
        if (disposed) return;
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

    listen(document, "click", (event) => {
      const anchor = event.target.closest('a[href^="#"]');
      if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const hash = anchor.getAttribute("href").slice(1);
      if (!records.has(hash) && !Object.hasOwn(aliases, hash)) return;
      event.preventDefault();
      select(resolve(hash), { focus: !anchor.classList.contains("sleeve") });
    });
    listen(document.getElementById("sleeve-list"), "keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
      const index = sleeves.indexOf(event.target.closest(".sleeve"));
      if (index < 0) return;
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? sleeves.length - 1 :
        (index + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) + sleeves.length) % sleeves.length;
      sleeves[next].focus();
    });
    listen(window, "hashchange", () => {
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
    listen(motionPreference, "change", finishTransition);
    listen(window, "resize", finishTransition, { passive: true });
    listen(document, "visibilitychange", () => {
      if (document.hidden) finishTransition();
    });
    listen(window, "pagehide", finishTransition);
    disposeCollection = () => { disposed = true; animation?.cancel(); controller.enabled = false; controller.stop(); };
    showRecord(active);
    initialized = true;
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
      listen(card, "pointerenter", (event) => {
        if (event.pointerType === "mouse") show(true);
      });
      listen(card, "pointerleave", (event) => {
        if (event.pointerType === "mouse" && !pinned && !card.contains(document.activeElement)) show(false);
      });
      listen(card, "focusin", () => {
        if (toggle.matches(":focus-visible")) show(true);
      });
      listen(card, "focusout", (event) => {
        if (!card.contains(event.relatedTarget) && !pinned) show(false);
      });
      listen(card, "click", () => {
        pinned = !card.classList.contains("logos-visible");
        show(pinned);
      });
      listen(card, "keydown", (event) => {
        if (event.key === "Escape") { pinned = false; show(false); }
      });
    });
  }

  // Business card: drag to turn it in 3D, like LinkedIn's card; on release it
  // springs to the nearest face, carrying the finger's speed. A tap (or the
  // keyboard button) turns it over. Only `transform` changes, once per frame.
  function initializeBusinessCard() {
    const card = document.getElementById("card-flip");
    const button = document.querySelector(".card-flip-button");
    const hint = document.querySelector(".card-hint");
    if (!card || !button) return;
    const front = card.querySelector(".card-front");
    const back = card.querySelector(".card-back");
    const DEG_PER_PX = .5;
    let rx = 0;
    let ry = 0;
    let rz = 0; // only used briefly to spin an upside-down card upright
    let drag = null;
    let frame = 0;
    const render = () => {
      frame = 0;
      card.style.transform = `rotateZ(${rz}deg) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    };
    const schedule = () => { frame ||= requestAnimationFrame(render); };
    // The front faces the viewer while its normal points at them: cos(rx)·cos(ry) > 0.
    const sync = () => {
      const showingBack = Math.cos(rx * Math.PI / 180) * Math.cos(ry * Math.PI / 180) < 0;
      button.setAttribute("aria-pressed", String(showingBack));
      front.setAttribute("aria-hidden", String(showingBack));
      back.setAttribute("aria-hidden", String(!showingBack));
    };
    const settle = (vx = 0, vy = 0) => {
      // Project ~160 ms of momentum (capped so a hard flick adds at most about
      // one extra half-turn), then land on the nearest face.
      const snap = (angle, velocity) => Math.round((angle + Math.max(-1.2, Math.min(1.2, velocity)) * 160) / 180) * 180;
      rx = snap(rx, vy);
      ry = snap(ry, vx);
      // With reduced motion there is no spring, so land upright straight away.
      if (motionPreference.matches && upsideDown()) { rx -= 180; ry += 180; }
      card.classList.add("is-settling");
      cancelAnimationFrame(frame);
      render();
      sync();
    };
    // Tipped over the top (an odd number of half-turns on X) the face reads upside down.
    const upsideDown = () => Math.abs(Math.round(rx / 180)) % 2 === 1;
    // rotateX(180°) looks the same as rotateY(180°) + rotateZ(180°): switch to that
    // form without animating, then turn Z back to 0, an in-plane spin to upright.
    const rightSideUp = () => {
      rx -= 180;
      ry += 180;
      rz = 180;
      card.classList.remove("is-settling");
      render();
      void card.offsetWidth; // commit the identical-looking pose before animating
      card.classList.add("is-righting");
      rz = 0;
      render();
    };
    const turnOver = () => { ry += 180; settle(); };
    const end = (event, cancelled) => {
      if (!drag || event.pointerId !== drag.id) return;
      const { moved, ignored, vx, vy, lastTime } = drag;
      drag = null;
      card.classList.remove("is-dragging");
      if (card.hasPointerCapture(event.pointerId)) card.releasePointerCapture(event.pointerId);
      if (ignored) return;
      if (!moved) { if (!cancelled) turnOver(); return; }
      // Holding still before letting go means no fling.
      const fresh = event.timeStamp - lastTime < 80;
      settle(fresh ? vx : 0, fresh ? vy : 0);
    };

    button.hidden = false;
    if (hint) hint.hidden = false;
    // Prepare the 3D layers while the card is near the screen, so even the first
    // turn is smooth; release them when it scrolls away.
    if (typeof IntersectionObserver === "function") {
      const observer = new IntersectionObserver(([entry]) => card.classList.toggle("is-near", entry.isIntersecting), { rootMargin: "300px 0px" });
      observer.observe(card);
      lifetime.signal.addEventListener("abort", () => observer.disconnect());
    }
    listen(card, "pointerdown", (event) => {
      if (drag || !event.isPrimary || event.button !== 0) return;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, rx, ry, lastX: event.clientX, lastY: event.clientY, lastTime: event.timeStamp, vx: 0, vy: 0, moved: false };
      try { card.setPointerCapture(event.pointerId); } catch { /* Capture is optional. */ }
    });
    listen(card, "pointermove", (event) => {
      if (!drag || drag.ignored || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (!drag.moved) {
        if (Math.hypot(dx, dy) < 6) return;
        // On touch, a mostly vertical start is a page scroll: leave the card alone.
        if (event.pointerType !== "mouse" && Math.abs(dy) > Math.abs(dx)) {
          drag.ignored = true;
          return;
        }
        drag.moved = true;
        card.classList.remove("is-settling", "is-righting");
        card.classList.add("is-dragging");
      }
      ry = drag.ry + dx * DEG_PER_PX;
      rx = drag.rx - dy * DEG_PER_PX;
      const dt = Math.max(1, event.timeStamp - drag.lastTime);
      // Smoothed angular velocity in degrees per millisecond.
      drag.vx = drag.vx * .6 + ((event.clientX - drag.lastX) * DEG_PER_PX / dt) * .4;
      drag.vy = drag.vy * .6 + (-(event.clientY - drag.lastY) * DEG_PER_PX / dt) * .4;
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
      drag.lastTime = event.timeStamp;
      schedule();
    });
    listen(card, "pointerup", (event) => end(event, false));
    // A vertical swipe on touch hands the gesture to page scrolling.
    listen(card, "pointercancel", (event) => end(event, true));
    listen(card, "lostpointercapture", (event) => end(event, true));
    listen(card, "transitionend", (event) => {
      if (event.target !== card || event.propertyName !== "transform") return;
      if (card.classList.contains("is-righting")) { card.classList.remove("is-righting"); return; }
      card.classList.remove("is-settling");
      if (!drag && upsideDown()) rightSideUp();
    });
    listen(button, "click", turnOver);
    lifetime.signal.addEventListener("abort", () => cancelAnimationFrame(frame));
  }

  initializeCollection();
  initializeSkills();
  initializeBusinessCard();
  return () => { lifetime.abort(); disposeCollection(); };
};
