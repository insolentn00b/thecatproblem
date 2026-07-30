/* ============================================================
   TheCatProblem.com — interaction & life
   ============================================================ */
(function () {
  "use strict";

  window.__catBuild = "s9-fanfare";

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

  /* ---------- Screen 9: pledge (animated count-up + confetti) ---------- */
  const pledgeBtn = document.getElementById("pledgeBtn");
  const pledgeCount = document.getElementById("pledgeCount");
  if (pledgeBtn && pledgeCount) {
    // Set window.CATPROBLEM_PLEDGE_URL once a counter backend is deployed.
    const PLEDGE_URL = window.CATPROBLEM_PLEDGE_URL || null;
    let currentCount = null;

    const fmt = (n) => {
      if (n <= 0) return "Be the first to pledge.";
      const noun = n === 1 ? "person has" : "people have";
      return n.toLocaleString("en-US") + " " + noun + " pledged so far";
    };
    const showCount = (n) => {
      if (typeof n !== "number" || isNaN(n)) return;
      currentCount = n;
      pledgeCount.textContent = fmt(n);
    };
    const animateTo = (to) => {
      const from = typeof currentCount === "number" ? currentCount : to;
      currentCount = to;
      if (reduceMotion || from === to) {
        pledgeCount.textContent = fmt(to);
        return;
      }
      const start = performance.now();
      const dur = 700;
      const tick = (t) => {
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        pledgeCount.textContent = fmt(Math.round(from + (to - from) * eased));
        if (p < 1) requestAnimationFrame(tick);
        else pledgeCount.textContent = fmt(to);
      };
      requestAnimationFrame(tick);
    };
    const popCount = () => {
      pledgeCount.classList.remove("pop");
      void pledgeCount.offsetWidth; // reflow so the animation can restart
      pledgeCount.classList.add("pop");
    };
    const setPledged = () => {
      pledgeBtn.textContent = "🐾 You're in — thank you";
      pledgeBtn.classList.add("pledged");
      pledgeBtn.disabled = true;
    };

    function confetti(originEl) {
      if (reduceMotion) return;
      const colors = ["#E8A23D", "#D9744A", "#8FA98A", "#E9A7A0", "#5B4A3E"];
      const r = originEl.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      for (let i = 0; i < 46; i++) {
        const piece = document.createElement("div");
        piece.className = "confetti-piece";
        piece.style.background = colors[i % colors.length];
        piece.style.left = cx + "px";
        piece.style.top = cy + "px";
        document.body.appendChild(piece);
        const ang = Math.random() * Math.PI * 2;
        const sp = 5 + Math.random() * 8;
        let vx = Math.cos(ang) * sp;
        let vy = Math.sin(ang) * sp - 7; // bias the burst upward
        let x = 0, y = 0, rot = Math.random() * 360, vr = (Math.random() - 0.5) * 24, life = 0;
        (function frame() {
          life++;
          vy += 0.33; // gravity
          x += vx;
          y += vy;
          piece.style.transform = `translate(${x}px, ${y}px) rotate(${(rot += vr)}deg)`;
          piece.style.opacity = String(Math.max(0, 1 - life / 75));
          if (life < 75) requestAnimationFrame(frame);
          else piece.remove();
        })();
      }
    }

    const bust = () => PLEDGE_URL + (PLEDGE_URL.includes("?") ? "&" : "?") + "t=" + Date.now();

    if (localStorage.getItem("cp_pledged") === "1") setPledged();
    if (PLEDGE_URL) {
      fetch(bust()).then((r) => r.json()).then((d) => showCount(d.count)).catch(() => {});
    }

    pledgeBtn.addEventListener("click", () => {
      if (localStorage.getItem("cp_pledged") === "1") return;
      localStorage.setItem("cp_pledged", "1");
      setPledged();
      confetti(pledgeBtn);
      if (PLEDGE_URL) {
        // optimistic: bump the number the instant they click
        const optimistic = (typeof currentCount === "number" ? currentCount : 0) + 1;
        showCount(optimistic);
        popCount();
        // then reconcile with the server; only ever tick UP, never down
        fetch(bust(), { method: "POST" })
          .then((r) => r.json())
          .then((d) => { if (typeof d.count === "number" && d.count > currentCount) animateTo(d.count); })
          .catch(() => {});
      } else {
        popCount();
        pledgeCount.textContent = "Thank you for making the pledge.";
      }
    });
  }

  /* ---------- Screen 9: share ---------- */
  const shareBtn = document.getElementById("shareBtn");
  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      const url = location.href.split("#")[0];
      const data = {
        title: "The Cat Problem",
        text: "Cats are a leading cause of bird extinction — and it starts closer to home than most of us realize.",
        url: url,
      };
      if (navigator.share) {
        try { await navigator.share(data); } catch (e) {}
      } else if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(url);
          const orig = shareBtn.textContent;
          shareBtn.textContent = "Link copied ✓";
          setTimeout(() => (shareBtn.textContent = orig), 2200);
        } catch (e) {}
      }
    });
  }

  /* ---------- Contact page: AJAX form submit ---------- */
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    const status = document.getElementById("formStatus");
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const honey = contactForm.querySelector('[name="_gotcha"]');
      if (honey && honey.value) return; // bot caught in honeypot
      status.style.color = "var(--ink-soft)";
      status.textContent = "Sending…";
      try {
        const res = await fetch(contactForm.action, {
          method: "POST",
          body: new FormData(contactForm),
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          contactForm.reset();
          status.style.color = "var(--sage)";
          status.textContent = "Thank you — your message was sent.";
        } else {
          status.style.color = "var(--terracotta)";
          status.textContent = "Something went wrong. Please try again.";
        }
      } catch (err) {
        status.style.color = "var(--terracotta)";
        status.textContent = "Something went wrong. Please try again.";
      }
    });
  }
})();
