(() => {
  "use strict";
  const base = new URL("../", document.currentScript.src);
  const homePath = new URL("index.html", base).pathname;
  const detailPath = new URL("detail_PJ.html", base).pathname;
  const isDetail = (url) => url.pathname === detailPath;
  const isHome = (url) => url.pathname === homePath || url.pathname === base.pathname;
  const loadScript = (file) => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = new URL(`js/${file}`, base);
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });

  function mountControls(engine) {
    const lifetime = new AbortController();
    const controls = document.getElementById("interaction-controls") || document.getElementById("detail-playback");
    if (!controls) return () => { };
    controls.hidden = false;
    const play = controls.querySelector("[data-play]");
    const stop = controls.querySelector("[data-stop]");
    const retry = controls.querySelector("[data-retry]");
    const status = controls.querySelector("[data-audio-status]");
    const arm = document.getElementById("tonearm-body");
    const spectrum = controls.querySelector("[data-spectrum]");
    const bars = Array.from({ length: 24 }, (_, index) => {
      const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      bar.setAttribute("x", String(index * 10 + 2));
      bar.setAttribute("y", "44");
      bar.setAttribute("width", "6");
      bar.setAttribute("height", "4");
      spectrum?.append(bar);
      return bar;
    });
    let levels = new Float32Array(24).fill(4);
    const responsiveSpectrum = controls.id === "detail-playback" && spectrum;
    let frequencies;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let angle = -16;
    let lastTime = 0;
    const draw = (now) => {
      frame = 0;
      if (document.hidden || lifetime.signal.aborted) return;
      const engaged = ["starting", "playing", "scratching"].includes(engine.state);
      const progress = engine.duration ? engine.currentTime / engine.duration : 0;
      const target = engaged ? 12 + progress * 16 : -16;
      const dt = Math.min((now - (lastTime || now)) / 1000, .1);
      lastTime = now;
      const reduced = motion.matches;
      angle = reduced ? target : angle + (target - angle) * (1 - Math.exp(-7 * dt));
      arm?.setAttribute("transform", `rotate(${angle} 63 25)`);
      const live = !reduced && ["playing", "scratching"].includes(engine.state) && engine.analyser;
      if (live) {
        frequencies ||= new Uint8Array(engine.analyser.frequencyBinCount);
        engine.analyser.getByteFrequencyData(frequencies);
      }
      let settling = false;
      bars.forEach((bar, index) => {
        let energy = 0;
        if (live && responsiveSpectrum) {
          const position = Math.pow(frequencies.length, index / (bars.length - 1)) - 1;
          const bin = Math.floor(position);
          const next = Math.min(bin + 1, frequencies.length - 1);
          energy = frequencies[bin] + (frequencies[next] - frequencies[bin]) * (position - bin);
        } else if (live) {
          const start = Math.floor(Math.pow(128, index / bars.length));
          const end = Math.min(128, Math.max(start + 1, Math.ceil(Math.pow(128, (index + 1) / bars.length))));
          for (let bin = start; bin < end; bin++) energy = Math.max(energy, frequencies[bin]);
        }
        const height = 4 + energy / 255 * 44;
        levels[index] = reduced ? 4 : levels[index] + (height - levels[index]) * (1 - Math.exp(-18 * dt));
        if (Math.abs(levels[index] - 4) > .05) settling = true;
        bar.setAttribute("height", levels[index].toFixed(2));
        bar.setAttribute("y", (48 - levels[index]).toFixed(2));
      });
      if (live || settling || (arm && (engaged || Math.abs(angle - target) > .02))) frame = requestAnimationFrame(draw);
    };
    const update = () => {
      const active = ["loading", "starting", "playing", "scratching"].includes(engine.state);
      play.disabled = active || engine.state === "error";
      play.textContent = engine.state === "blocked" ? "Start Music" : "▶ Play";
      play.setAttribute("aria-label", engine.state === "blocked" ? "Start Music" : "Play record");
      play.setAttribute("aria-pressed", String(active));
      stop.disabled = !arm && !engine.intent && ["stopped", "stopping"].includes(engine.state);
      retry.hidden = engine.state !== "error";
      status.textContent = `${engine.tracks[engine.section]?.sectionTitle || "Record"} · ${engine.message}`;
      controls.dataset.playback = engine.state;
      if (!frame) frame = requestAnimationFrame(draw);
    };
    let resizeObserver;
    if (responsiveSpectrum) {
      let previousWidth = 0;
      const resizeSpectrum = () => {
        if (lifetime.signal.aborted) return;
        const bounds = spectrum.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        const width = bounds.width * 48 / bounds.height;
        if (Math.abs(width - previousWidth) < .1) return;
        previousWidth = width;
        const count = Math.min(128, Math.max(12, Math.round(width / 10)));
        if (count !== bars.length) {
          // Preserve the current envelope as the number of samples changes.
          const previousLevels = levels;
          levels = Float32Array.from({ length: count }, (_, index) => {
            const position = index * (previousLevels.length - 1) / (count - 1);
            const left = Math.floor(position);
            const right = Math.min(left + 1, previousLevels.length - 1);
            return previousLevels[left] + (previousLevels[right] - previousLevels[left]) * (position - left);
          });
          while (bars.length > count) bars.pop().remove();
          const fragment = document.createDocumentFragment();
          while (bars.length < count) {
            const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            bars.push(bar);
            fragment.append(bar);
          }
          spectrum.append(fragment);
        }
        spectrum.setAttribute("viewBox", `0 0 ${width} 48`);
        const pitch = width / count;
        const barWidth = Math.min(6, pitch * .6);
        bars.forEach((bar, index) => {
          bar.setAttribute("x", String(index * pitch + (pitch - barWidth) / 2));
          bar.setAttribute("width", String(barWidth));
          bar.setAttribute("height", levels[index].toFixed(2));
          bar.setAttribute("y", (48 - levels[index]).toFixed(2));
        });
        if (!frame) frame = requestAnimationFrame(draw);
      };
      resizeSpectrum();
      if (typeof ResizeObserver === "function") {
        resizeObserver = new ResizeObserver(resizeSpectrum);
        resizeObserver.observe(spectrum);
      } else window.addEventListener("resize", resizeSpectrum, { signal: lifetime.signal });
    }
    play.addEventListener("click", () => void engine.play(), { signal: lifetime.signal });
    retry.addEventListener("click", () => void engine.play(), { signal: lifetime.signal });
    stop.addEventListener("click", () => engine.stop(), { signal: lifetime.signal });
    engine.addEventListener("change", update, { signal: lifetime.signal });
    document.addEventListener("visibilitychange", update, { signal: lifetime.signal });
    motion.addEventListener("change", update, { signal: lifetime.signal });
    update();
    return () => { lifetime.abort(); resizeObserver?.disconnect(); cancelAnimationFrame(frame); };
  }

  function mountCredits(engine) {
    const dialog = document.getElementById("music-credits");
    const open = document.getElementById("music-credits-open");
    if (!dialog || !open) return () => { };
    const lifetime = new AbortController();
    const list = document.getElementById("music-credits-list");
    const panel = document.getElementById("music-credits-details");
    const tracks = Object.entries(engine.tracks);
    const buttons = new Map();
    const make = (tag, className, text) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text) node.textContent = text;
      return node;
    };
    const appendCredit = (node, value, label) => {
      // Preserve supplied attribution text and embedded creator/license links.
      for (const part of String(value).split(/(https?:\/\/[^\s]+)/g)) {
        if (/^https?:\/\//i.test(part)) {
          const link = make("a", "", part);
          link.href = part;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.setAttribute("aria-label", `${label}: ${part} (opens in a new tab)`);
          node.append(link);
        } else node.append(document.createTextNode(part));
      }
    };
    function showCredits(id) {
      const index = tracks.findIndex(([key]) => key === id);
      if (index < 0) return;
      const track = engine.tracks[id];
      buttons.forEach((button, key) => button.setAttribute("aria-pressed", String(key === id)));
      const catalog = make("p", "credits-kicker", `${String(index + 1).padStart(2, "0")} / ${track.sectionTitle}`);
      const title = make("h3", "credits-track-title", track.title || "Recording credits");
      title.id = "credits-track-title";
      const known = [track.title, track.composer, track.performer, track.source, track.license, track.attribution].some(Boolean);
      panel.replaceChildren(catalog);
      if (!known) {
        title.textContent = "Credits coming soon.";
        panel.append(title, make("p", "credits-empty", "Soundtrack information for this record has not been supplied yet."));
      } else {
        if (/filename/i.test(track.metadataNote || "") && track.title) panel.append(make("p", "credits-provisional", "Provisional title · supplied filename"));
        panel.append(title);
        if (track.composer) {
          const composer = make("p", "credits-composer");
          appendCredit(composer, track.composer, "Composer");
          panel.append(composer);
        }
        const details = make("dl", "credits-metadata");
        for (const [label, value] of Object.entries({ "Performer / recording artist": track.performer, "Recording source": track.source, License: track.license, Attribution: track.attribution })) {
          if (!value) continue;
          const description = make("dd");
          appendCredit(description, value, label);
          details.append(make("dt", "", label), description);
        }
        if (details.childElementCount) panel.append(details);
        if (![track.title, track.composer, track.performer, track.source, track.license, track.attribution].every(Boolean) || /verification/i.test(track.metadataNote || "")) {
          panel.append(make("p", "credits-note", "Recording details pending verification."));
        }
        if (track.metadataNote && !/^(Work identified from the supplied filename|Soundtrack and credits not yet supplied)/.test(track.metadataNote)) {
          panel.append(make("p", "credits-note", track.metadataNote));
        }
      }
      dialog.querySelector(".credits-body").scrollTop = 0;
    }
    tracks.forEach(([id, track], index) => {
      const button = make("button", "credits-section");
      button.type = "button";
      button.dataset.creditsSection = id;
      button.setAttribute("aria-controls", panel.id);
      button.setAttribute("aria-pressed", "false");
      const number = make("span", "credits-number", String(index + 1).padStart(2, "0"));
      number.setAttribute("aria-hidden", "true");
      button.append(number, make("span", "", track.sectionTitle));
      button.addEventListener("click", () => showCredits(id), { signal: lifetime.signal });
      buttons.set(id, button);
      list.append(button);
    });
    let opener = open;
    let backdropStart = false;
    const outside = (event) => {
      const rect = dialog.getBoundingClientRect();
      return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    };
    open.hidden = false;
    open.addEventListener("click", (event) => {
      opener = event.currentTarget;
      // This is read-only access to the player: credits selection is entirely local.
      showCredits(buttons.has(engine.section) ? engine.section : "home");
      document.documentElement.classList.add("music-credits-open");
      dialog.showModal();
      const selected = list.querySelector('[aria-pressed="true"]');
      list.scrollLeft = Math.max(0, selected.offsetLeft - list.offsetLeft - 12);
    }, { signal: lifetime.signal });
    document.getElementById("music-credits-close").addEventListener("click", () => dialog.close(), { signal: lifetime.signal });
    dialog.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      const focusable = [...dialog.querySelectorAll('button:not(:disabled), a[href]')];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }, { signal: lifetime.signal });
    dialog.addEventListener("pointerdown", (event) => { backdropStart = event.target === dialog && outside(event); }, { signal: lifetime.signal });
    dialog.addEventListener("pointerup", (event) => {
      if (backdropStart && event.target === dialog && outside(event)) dialog.close();
      backdropStart = false;
    }, { signal: lifetime.signal });
    // Native dialog provides focus containment and Escape behavior.
    dialog.addEventListener("close", () => {
      document.documentElement.classList.remove("music-credits-open");
      (opener?.isConnected ? opener : open).focus({ preventScroll: true });
    }, { signal: lifetime.signal });
    return () => {
      lifetime.abort();
      if (dialog.open) dialog.close();
      document.documentElement.classList.remove("music-credits-open");
    };
  }

  async function initialize() {
    await Promise.all(["audio-engine.js", "index.js", "detail.js"].map(loadScript));
    const engine = window.portorioAudio;
    let disposePage = () => { };
    let disposeControls = () => { };
    let disposeCredits = () => { };
    let navigation = 0;
    let request;
    let current = new URL(location.href);
    const templates = new Map();
    const stylesheetSets = new Map();
    const pageKey = (url) => isDetail(url) ? "detail" : "home";
    stylesheetSets.set(pageKey(current), [...document.querySelectorAll('link[rel="stylesheet"]')].filter((link) => !link.href.endsWith("/playback.css")));

    function mount() {
      if (isDetail(new URL(location.href))) {
        engine.select("projects");
        window.mountPortorioDetail();
        disposePage = () => { };
      } else disposePage = window.mountPortorioHome();
      disposeControls = mountControls(engine);
      disposeCredits = mountCredits(engine);
    }
    async function navigate(url, push = true) {
      const token = ++navigation;
      request?.abort();
      if (isHome(url) && isHome(current)) {
        if (push) history.pushState(null, "", url);
        current = url;
        window.dispatchEvent(new HashChangeEvent("hashchange"));
        return;
      }
      const key = pageKey(url);
      try {
        let template = templates.get(key);
        if (!template) {
          request = new AbortController();
          const response = await fetch(new URL(key === "home" ? "index.html" : "detail_PJ.html", base), { signal: request.signal });
          if (!response.ok) throw new Error(`Page HTTP ${response.status}`);
          template = new DOMParser().parseFromString(await response.text(), "text/html");
          if (token !== navigation) return;
          templates.set(key, template);
        }
        if (!stylesheetSets.has(key)) {
          const links = [...template.querySelectorAll('link[rel="stylesheet"]')].filter((link) => !link.getAttribute("href").endsWith("/playback.css"));
          const loaded = links.map((original) => {
            const link = original.cloneNode(true);
            link.href = new URL(original.getAttribute("href"), base);
            link.media = "not all";
            return {
              link, ready: new Promise((resolve, reject) => {
                link.onload = resolve;
                link.onerror = () => { link.remove(); reject(new Error("Stylesheet unavailable")); };
                document.head.append(link);
              })
            };
          });
          await Promise.all(loaded.map((item) => item.ready));
          if (stylesheetSets.has(key)) loaded.forEach((item) => item.link.remove());
          else stylesheetSets.set(key, loaded.map((item) => item.link));
        }
        if (token !== navigation) return;
        const body = document.importNode(template.body, true);
        body.querySelectorAll("script").forEach((script) => script.remove());
        disposeCredits();
        disposeControls();
        disposePage();
        if (push) history.pushState(null, "", url);
        current = url;
        for (const [name, links] of stylesheetSets) links.forEach((link) => { link.media = name === key ? "all" : "not all"; });
        document.body.replaceWith(body);
        document.title = template.title;
        const description = document.querySelector('meta[name="description"]');
        if (description) description.content = template.querySelector('meta[name="description"]')?.content || "";
        mount();
        window.scrollTo({ top: 0, behavior: "instant" });
        const heading = isDetail(url) ? document.querySelector("h1") : document.querySelector(".record-panel:not([hidden]) h2");
        heading?.setAttribute("tabindex", "-1");
        heading?.focus({ preventScroll: true });
      } catch (error) {
        if (token !== navigation || error.name === "AbortError") return;
        // Keep the live audio and current page; offer a deliberate full reload.
        console.warn("PortoRIO navigation failed:", error.message);
        let notice = document.getElementById("navigation-error");
        if (!notice) {
          notice = document.createElement("p");
          notice.id = "navigation-error";
          notice.className = "navigation-error";
          notice.setAttribute("role", "alert");
          document.body.prepend(notice);
        }
        const link = document.createElement("a");
        link.href = url;
        link.dataset.reload = "true";
        link.textContent = "Open with a full page load";
        notice.replaceChildren("Could not load this page. ", link);
      }
    }
    document.addEventListener("click", (event) => {
      const anchor = event.target.closest("a[href]");
      if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || anchor.download || anchor.dataset.reload || (anchor.target && anchor.target !== "_self")) return;
      const url = new URL(anchor.href);
      if (url.origin !== location.origin || (!isHome(url) && !isDetail(url))) return;
      if (url.pathname === location.pathname && url.search === location.search && anchor.getAttribute("href").startsWith("#")) {
        navigation++;
        request?.abort();
        return;
      }
      event.preventDefault();
      void navigate(url);
    });
    window.addEventListener("popstate", () => void navigate(new URL(location.href), false));
    window.addEventListener("hashchange", () => {
      const next = new URL(location.href);
      if (pageKey(next) === pageKey(current)) current = next;
    });
    window.addEventListener("pagehide", (event) => {
      if (event.persisted) engine.stop();
      else { disposeCredits(); disposeControls(); disposePage(); engine.destroy(); }
    });
    mount();
  }
  void initialize().catch((error) => console.warn("PortoRIO enhancement unavailable:", error));
})();
