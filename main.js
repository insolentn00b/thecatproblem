/* ============================================================
   TheCatProblem.com — interaction & life
   ============================================================ */
(function () {
  "use strict";

  window.__catBuild = "s6-health";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- reveal-on-scroll ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          entry.target
            .querySelectorAll(".reveal")
            .forEach((el) => el.classList.add("in"));
        }
      });
    },
    { threshold: 0.25 }
  );
  document.querySelectorAll(".step").forEach((s) => io.observe(s));

  /* ---------- floating motes (hero ambiance) ---------- */
  const motes = document.querySelector(".motes");
  if (motes && !reduceMotion) {
    const COUNT = 14;
    for (let i = 0; i < COUNT; i++) {
      const m = document.createElement("span");
      m.className = "mote";
      m.style.left = Math.random() * 100 + "%";
      m.style.animationDuration = 9 + Math.random() * 10 + "s";
      m.style.animationDelay = -Math.random() * 16 + "s";
      const s = 0.5 + Math.random() * 1.1;
      m.style.transform = `scale(${s})`;
      m.style.opacity = 0.25 + Math.random() * 0.3;
      // gentle color variety between marigold and terracotta
      m.style.background = Math.random() > 0.5 ? "var(--marigold)" : "var(--terracotta)";
      motes.appendChild(m);
    }
  }

  /* ---------- the cat: blinking + ear twitches ---------- */
  const eyes = document.querySelector(".eyes");
  const ears = document.querySelectorAll(".ear");

  function blink() {
    if (!eyes) return;
    eyes.classList.add("blink");
    setTimeout(() => eyes.classList.remove("blink"), 130);
    // occasional charming double-blink
    if (Math.random() < 0.3) {
      setTimeout(() => {
        eyes.classList.add("blink");
        setTimeout(() => eyes.classList.remove("blink"), 130);
      }, 300);
    }
  }
  function twitch() {
    if (!ears.length) return;
    const ear = ears[Math.random() < 0.5 ? 0 : 1];
    ear.classList.add("twitch");
    setTimeout(() => ear.classList.remove("twitch"), 200);
  }

  function loop(fn, min, max) {
    if (reduceMotion) return;
    const next = () => {
      fn();
      setTimeout(next, min + Math.random() * (max - min));
    };
    setTimeout(next, min + Math.random() * (max - min));
  }
  loop(blink, 2600, 5200);
  loop(twitch, 4000, 9000);

  /* ---------- Screen 2: scroll-driven scale counter ---------- */
  const scaleSection = document.querySelector(".scale");
  const countEl = document.getElementById("birdCount");
  const field = document.getElementById("dotfield");

  if (scaleSection && countEl && field) {
    const TARGET = 2_400_000_000; // median US bird estimate (Loss et al. 2013)
    const DOTS = 2400; // each dot = 1,000,000 birds

    // build the dot field once
    const frag = document.createDocumentFragment();
    const dotEls = new Array(DOTS);
    for (let i = 0; i < DOTS; i++) {
      const d = document.createElement("span");
      d.className = "dot";
      dotEls[i] = d;
      frag.appendChild(d);
    }
    field.appendChild(frag);

    let lastLit = 0;
    let ticking = false;

    const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);

    function render() {
      ticking = false;
      const rect = scaleSection.getBoundingClientRect();
      const total = scaleSection.offsetHeight - window.innerHeight;
      const p = clamp01(total > 0 ? -rect.top / total : 0);

      countEl.textContent = Math.round(p * TARGET).toLocaleString("en-US");

      const lit = Math.round(p * DOTS);
      if (lit > lastLit) {
        for (let i = lastLit; i < lit; i++) dotEls[i].classList.add("lit");
      } else if (lit < lastLit) {
        for (let i = lit; i < lastLit; i++) dotEls[i].classList.remove("lit");
      }
      lastLit = lit;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(render);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    render(); // set initial state
  }

  /* ---------- Screen 4: scroll-driven species gallery ---------- */
  const gallery = document.querySelector(".gallery");
  if (gallery) {
    const cards = Array.from(gallery.querySelectorAll(".species-card"));
    const dots = Array.from(gallery.querySelectorAll(".rail-dot"));
    const N = cards.length;
    let lastIdx = -1;
    let gTicking = false;

    const clampG = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);

    function gRender() {
      gTicking = false;
      const rect = gallery.getBoundingClientRect();
      const total = gallery.offsetHeight - window.innerHeight;
      const p = clampG(total > 0 ? -rect.top / total : 0);
      let idx = Math.floor(p * N);
      if (idx >= N) idx = N - 1;
      if (idx < 0) idx = 0;
      if (idx !== lastIdx) {
        cards.forEach((c, i) => c.classList.toggle("active", i === idx));
        dots.forEach((d, i) => d.classList.toggle("on", i <= idx));
        lastIdx = idx;
      }
    }

    function gScroll() {
      if (!gTicking) {
        gTicking = true;
        requestAnimationFrame(gRender);
      }
    }

    window.addEventListener("scroll", gScroll, { passive: true });
    window.addEventListener("resize", gScroll);
    gRender();
  }

  /* ---------- Screen 5: the hidden-toll critter field ---------- */
  const critterField = document.getElementById("critterField");
  if (critterField) {
    const TOTAL = 24;
    const seen = new Set([3, 7, 11, 15, 19, 23]); // ~1 in 4 "brought home"
    const bird =
      '<svg viewBox="0 0 32 24" class="critter-ico" aria-hidden="true">' +
      '<g fill="currentColor">' +
      '<ellipse cx="14" cy="14" rx="9" ry="7"/>' +
      '<circle cx="22" cy="9" r="4.5"/>' +
      '<path d="M26,7 L31,9 L26,11 Z"/>' +
      '<path d="M5,12 L1,6 L7,11 Z"/>' +
      "</g></svg>";
    const frag = document.createDocumentFragment();
    for (let i = 0; i < TOTAL; i++) {
      const isSeen = seen.has(i);
      const span = document.createElement("span");
      span.className = "critter " + (isSeen ? "seen" : "hidden");
      // seen ones appear first; hidden ones cascade in afterward
      span.style.transitionDelay = isSeen ? ".1s" : (0.7 + i * 0.03).toFixed(2) + "s";
      span.innerHTML = bird;
      frag.appendChild(span);
    }
    critterField.appendChild(frag);
  }
})();
