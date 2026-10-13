(() => {
  "use strict";
  if (window.portorioAudio) return;

  // Single configuration for playback and credits. Null fields await owner verification.
  const tracks = {
    home: { src: "assets/audio/main/Classicals.de+-+Vivaldi+-+The+Four+Seasons+-+Spring+-+Violin+Concerto+in+E+major,+Op.+8,+No.+1,+RV.+269.mp3", sectionTitle: "Main", title: "The Four Seasons: Spring, Violin Concerto in E major, Op. 8 No. 1, RV 269", composer: "Antonio Vivaldi", performer: "John Harrison, https://johnharrison.cc", license: "https://creativecommons.org/licenses/by-nc/4.0/" },
    projects: { src: "assets/audio/projects/Classicals.de - Mozart - Marriage of Figaro.mp3", sectionTitle: "Projects Discography", title: "The Marriage of Figaro", composer: "Wolfgang Amadeus Mozart", performer: "The Czech National Symphony Orchestra", license: "https://creativecommons.org/publicdomain/mark/1.0/" },
    skills: { src: "assets/audio/techStack/Classicals.de - Grieg - Peer Gynt Suite No. 1, Op. 46 - I. Morning.mp3", sectionTitle: "Tech Stack", title: "Peer Gynt Suite No. 1, Op. 46 - I. Morning", composer: "Edvard Grieg", performer: "The Czech National Symphony Orchestra", license: "https://creativecommons.org/publicdomain/mark/1.0/" },
    studies: { src: "assets/audio/studies/Classicals.de - Ravel - Jeux d'eau - M. 30.mp3", sectionTitle: "Studies", title: "Jeux d'eau - M. 30", composer: "Maurice Ravel", performer: "Gregor Quendel", license: "https://creativecommons.org/licenses/by-nc/4.0/" },
    experience: { src: "assets/audio/experience/Classicals.de - Mozart - Sonata in E Minor, K 304, for Piano and Violin - Performed by the Park Sisters.mp3", sectionTitle: "Experience", title: "Sonata in E Minor, K 304, for Piano and Violin", composer: "Wolfgang Amadeus Mozart", performer: "The Park Sisters (Mi-Young Park, Violin & Pong-Hi Park, Piano)", license: "https://creativecommons.org/licenses/by-sa/4.0/" },
    contact: { src: "assets/audio/contact/Classicals.de - Bach - Notebook for Anna Magdalena - No. 4, Minuet in G major - BWV Anh 114 (1725) - Arranged for Piano - Concert Grand Mix.mp3", sectionTitle: "Contact", title: "Bach - Notebook for Anna Madgalena", composer: "Johann Sebastian Bach", performer: "Gregor Quendel", license: "https://creativecommons.org/licenses/by-nc/4.0/" }
  };
  for (const [id, track] of Object.entries(tracks)) {
    tracks[id] = {
      title: null, composer: null, performer: null, source: null, license: null, attribution: null, ...track,
      metadataNote: track.title ? "Work identified from the supplied filename; recording credits still need verification." : "Soundtrack and credits not yet supplied."
    };
  }
  const wrap = (value, duration) => Number.isFinite(value) && Number.isFinite(duration) && duration > 0 ? ((value % duration) + duration) % duration : 0;
  class AudioEngine extends EventTarget {
    constructor() {
      super();
      this.tracks = tracks;
      this.state = "stopped";
      this.section = null;
      this.intent = false;
      this.position = 0;
      this.positions = new Map();
      this.angle = 0;
      this.generation = 0;
      this.nodes = new Set();
      this.cache = new Map();
      this.message = "Stopped";
    }
    update(state, message = state) {
      this.state = state;
      this.message = message;
      this.dispatchEvent(new Event("change"));
    }
    get duration() { return this.buffer?.duration || this.media?.duration || 0; }
    get currentTime() {
      if (this.media && ["playing", "scratching"].includes(this.state)) return Number.isFinite(this.media.currentTime) ? this.media.currentTime : this.position;
      if (this.state !== "playing") return this.position;
      return wrap(this.position + this.context.currentTime - this.startedAt, this.duration);
    }
    savePosition() {
      const current = this.currentTime;
      this.position = Number.isFinite(current) && current >= 0 ? current : 0;
      if (this.section) this.positions.set(this.section, this.position);
    }
    select(section) {
      if (!Object.hasOwn(tracks, section) || section === this.section) return;
      this.savePosition();
      this.cancel();
      this.section = section;
      this.position = this.positions.get(section) || 0;
      this.buffer = null;
      this.reverse = null;
      this.update("stopped", "Paused");
      // Stop holds only within the current owner; Projects children share an owner.
      void this.play();
    }
    cancel() {
      this.generation++;
      this.request?.abort();
      clearTimeout(this.timer);
      this.stopNodes();
      this.media?.pause();
    }
    stopNodes() {
      for (const node of this.nodes) {
        try { node.stop(); } catch { /* Already ended. */ }
        node.disconnect();
      }
      this.nodes.clear();
      this.source = null;
      this.grain = null;
    }
    async play() {
      if (!this.section || ["starting", "loading", "playing", "scratching"].includes(this.state)) return;
      this.intent = true;
      const token = ++this.generation;
      const track = tracks[this.section];
      const Context = window.AudioContext || window.webkitAudioContext;
      this.update("loading", "Loading soundtrack…");
      try {
        if (!Context) {
          await this.playMedia(track, token);
          return;
        }
        if (!this.context) {
          this.context = new Context();
          this.gain = this.context.createGain();
          this.gain.gain.value = .35;
          this.analyser = this.context.createAnalyser();
          this.analyser.fftSize = 256;
          this.analyser.smoothingTimeConstant = .75;
          this.gain.connect(this.analyser);
          this.analyser.connect(this.context.destination);
          this.context.addEventListener("statechange", () => {
            if (this.context.state !== "running" && ["playing", "scratching"].includes(this.state)) {
              this.stop();
              this.update("stopped", "Audio suspended. Press Play to resume.");
            }
          });
        }
        let resumeTimeout;
        try {
          await Promise.race([
            this.context.resume(),
            new Promise((_, reject) => {
              resumeTimeout = setTimeout(() => reject(new DOMException("Choose Start Music to allow playback.", "NotAllowedError")), 4000);
            })
          ]);
        } finally { clearTimeout(resumeTimeout); }
        if (token !== this.generation) return;
        if (this.context.state !== "running") throw new DOMException("Choose Start Music to allow playback.", "NotAllowedError");
        let decoded = this.cache.get(track.src);
        if (!decoded) {
          const request = this.request = new AbortController();
          const timeout = setTimeout(() => request.abort(), 20000);
          try {
            const response = await fetch(track.src, { signal: request.signal });
            if (!response.ok) throw new Error(`Audio HTTP ${response.status}: ${track.src}`);
            const buffer = await this.context.decodeAudioData(await response.arrayBuffer());
            if (token !== this.generation) return;
            const reverse = this.context.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
            for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
              reverse.copyToChannel(buffer.getChannelData(channel).slice().reverse(), channel);
            }
            decoded = { buffer, reverse };
            this.cache.set(track.src, decoded);
            if (this.cache.size > 2) this.cache.delete(this.cache.keys().next().value);
          } finally { clearTimeout(timeout); }
        }
        if (token !== this.generation) return;
        this.buffer = decoded.buffer;
        this.reverse = decoded.reverse;
        this.position = wrap(this.position, this.duration);
        this.update("starting", "Lowering stylus…");
        this.timer = setTimeout(() => {
          if (token !== this.generation || !this.intent) return;
          this.startSource();
        }, this.armDuration());
      } catch (error) {
        if (token === this.generation) this.fail(error);
      }
    }
    async playMedia(track, token) {
      if (!this.media) {
        this.media = new Audio();
        this.media.addEventListener("error", () => {
          if (["playing", "scratching"].includes(this.state)) this.fail(new Error("Audio playback failed"));
        });
      }
      const media = this.media;
      media.loop = true;
      media.volume = .35;
      const request = this.request = new AbortController();
      const ready = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => finish(new Error("Audio loading timed out")), 20000);
        const finish = (error) => {
          clearTimeout(timeout);
          media.removeEventListener("canplay", loaded);
          media.removeEventListener("error", failed);
          request.signal.removeEventListener("abort", aborted);
          error ? reject(error) : resolve();
        };
        const loaded = () => finish();
        const failed = () => finish(new Error("Audio file could not be loaded"));
        const aborted = () => finish(new DOMException("Cancelled", "AbortError"));
        media.addEventListener("canplay", loaded);
        media.addEventListener("error", failed);
        request.signal.addEventListener("abort", aborted, { once: true });
        const src = new URL(track.src, document.baseURI).href;
        if (media.src !== src || media.error) { media.src = src; media.load(); }
        if (media.readyState >= 3) finish();
      });
      await ready;
      if (token !== this.generation) return;
      this.position = wrap(this.position, media.duration);
      media.currentTime = this.position;
      this.update("starting", "Lowering stylus…");
      this.timer = setTimeout(async () => {
        if (token !== this.generation) return;
        try {
          await media.play();
          if (token === this.generation) this.update("playing", "Playing · visual scratch mode");
        } catch (error) { if (token === this.generation) this.fail(error); }
      }, this.armDuration());
    }
    armDuration() { return matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 750; }
    fail(error) {
      this.savePosition();
      this.cancel();
      if (error.name === "NotAllowedError") {
        this.intent = false;
        this.update("blocked", "Choose Start Music to allow playback.");
      } else {
        console.warn("PortoRIO soundtrack unavailable:", error.message);
        this.update("error", "Soundtrack unavailable. Choose another record or retry.");
      }
    }
    startSource() {
      this.stopNodes();
      const source = this.context.createBufferSource();
      source.buffer = this.buffer;
      source.loop = true;
      source.connect(this.gain);
      this.gain.gain.cancelScheduledValues(this.context.currentTime);
      this.gain.gain.setValueAtTime(0, this.context.currentTime);
      this.gain.gain.linearRampToValueAtTime(.35, this.context.currentTime + .025);
      source.start(0, wrap(this.position, this.duration));
      this.source = source;
      this.nodes.add(source);
      this.startedAt = this.context.currentTime;
      this.update("playing", "Playing");
    }
    stop() {
      this.savePosition();
      this.intent = false;
      this.cancel();
      this.update("stopping", "Pausing");
      const token = this.generation;
      this.timer = setTimeout(() => {
        if (token === this.generation) this.update("stopped", "Paused");
      }, this.armDuration());
    }
    beginScratch() {
      if (this.state !== "playing") return;
      this.position = this.currentTime;
      this.stopNodes();
      this.media?.pause();
      this.lastGrain = -Infinity;
      this.update("scratching", "Scratching");
    }
    scratch(delta, velocity) {
      if (this.state !== "scratching") return;
      this.position = wrap(this.position + delta / 200, this.duration);
      if (this.media) {
        this.media.currentTime = this.position;
        return;
      }
      const now = this.context.currentTime;
      if (Math.abs(delta) < .01 || now - this.lastGrain < .016) return;
      this.lastGrain = now;
      // Only one short, enveloped grain sounds at once, from the actual track.
      this.stopNodes();
      const source = this.context.createBufferSource();
      const envelope = this.context.createGain();
      source.buffer = delta < 0 ? this.reverse : this.buffer;
      source.loop = true;
      source.playbackRate.value = Math.max(.2, Math.min(4, Math.abs(velocity) / 200));
      source.connect(envelope);
      envelope.connect(this.gain);
      envelope.gain.setValueAtTime(0, now);
      envelope.gain.linearRampToValueAtTime(.9, now + .004);
      envelope.gain.linearRampToValueAtTime(0, now + .065);
      source.start(now, wrap(delta < 0 ? this.duration - this.position : this.position, this.duration));
      source.stop(now + .07);
      this.nodes.add(source);
      source.onended = () => { this.nodes.delete(source); source.disconnect(); envelope.disconnect(); };
    }
    endScratch() {
      if (this.state !== "scratching") return;
      if (this.media) {
        const token = this.generation;
        void this.media.play().then(() => {
          if (token === this.generation) this.update("playing", "Playing · visual scratch mode");
        }).catch((error) => { if (token === this.generation) this.fail(error); });
      } else this.startSource();
    }
    destroy() {
      this.intent = false;
      this.cancel();
      this.cache.clear();
      this.gain?.disconnect();
      this.analyser?.disconnect();
      if (this.media) { this.media.removeAttribute("src"); this.media.load(); }
      void this.context?.close();
    }
  }
  window.portorioAudio = new AudioEngine();
})();
