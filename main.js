/* ============================================================
   TheCatProblem.com — interaction & life
   ============================================================ */
(function () {
  "use strict";

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
})();
