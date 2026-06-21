/**
 * Portfolio scripts — single page with smooth scroll & scroll-spy
 */

/**
 * Smoothly scrolls to a target Y position with an ease-in-out curve.
 */
function smoothScrollTo(targetY, duration = 700) {
  const startY = window.scrollY;
  const diff = targetY - startY;
  let startTime = null;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + diff * easeInOutCubic(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

/**
 * Wire up nav links to use the custom smooth scroll.
 */
function setupSmoothScroll() {
  document.querySelectorAll('.nav-links a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // Close mobile menu if open
      const nav = document.querySelector("nav");
      nav.classList.remove("open");
      document
        .querySelector(".nav-toggle")
        ?.setAttribute("aria-expanded", "false");

      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      const offset = parseInt(
        getComputedStyle(target).scrollMarginTop || "0",
        10,
      );
      const targetY =
        target.getBoundingClientRect().top + window.scrollY - offset;
      smoothScrollTo(targetY, 700);
    });
  });
}

/**
 * Hamburger toggle for mobile nav.
 */
function setupHamburger() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("nav");
  if (!toggle) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", isOpen);
  });
}

function setupThemeCircuitTransition() {
  const root = document.documentElement;
  const toggle = document.querySelector(".theme-toggle");
  const overlay = document.querySelector(".circuit-transition");
  const track = overlay?.querySelector(".circuit-transition__path");
  const THEME_KEY = "theme";
  const themes = {
    light: {
      icon: "bi-sun-fill",
      nextLabel: "Switch to dark mode",
      wipe: "#f6f4f0",
    },
    dark: {
      icon: "bi-moon-stars-fill",
      nextLabel: "Switch to light mode",
      wipe: "#0d1117",
    },
  };

  if (!toggle || !overlay) return;

  let circuitLength = 2200;
  if (track) {
    circuitLength = Math.ceil(track.getTotalLength());
    // One dash as long as the path, gap just as long. Sweeping the offset from
    // +L (hidden) through 0 (fully drawn) to -L erases the line in the SAME
    // direction it was drawn.
    track.style.strokeDasharray = `${circuitLength} ${circuitLength}`;
    track.style.strokeDashoffset = String(circuitLength);
  }

  // A smooth, always-forward pace whose speed drifts up and down across the
  // draw. It's the integral of a velocity built from a few random sine waves,
  // so the pen clearly accelerates and eases at different points — and the
  // pattern is different on every run — without ever stalling.
  function randomPace() {
    const waves = [];
    const n = 2 + Math.floor(Math.random() * 2); // 2 or 3 overlapping waves
    let ampSum = 0;
    for (let k = 0; k < n; k++) {
      const amp = 0.3 + Math.random() * 0.5;
      ampSum += amp;
      waves.push({
        amp,
        freq: 1 + Math.floor(Math.random() * 3), // 1..3 cycles across the draw
        phase: Math.random() * Math.PI * 2,
      });
    }
    const norm = 0.75 / ampSum; // keep velocity comfortably positive
    const N = 256;
    const cum = new Float64Array(N + 1);
    let acc = 0;
    for (let i = 0; i < N; i++) {
      const t = i / N;
      let v = 1;
      for (const w of waves) {
        v += norm * w.amp * Math.sin(2 * Math.PI * w.freq * t + w.phase);
      }
      acc += Math.max(0.08, v);
      cum[i + 1] = acc;
    }
    const totalC = cum[N];
    return (t) => {
      if (t <= 0) return 0;
      if (t >= 1) return 1;
      const x = t * N;
      const i = Math.floor(x);
      const f = x - i;
      return (cum[i] + (cum[i + 1] - cum[i]) * f) / totalC;
    };
  }

  // Draws the circuit start->end, holds at full, then erases it in the same
  // direction. onFullyDrawn fires at the fully-drawn beat (flips the theme).
  function runCircuit(onFullyDrawn) {
    const L = circuitLength;
    const drawMs = 2500;
    const holdMs = 100;
    const eraseMs = 2500;
    const total = drawMs + holdMs + eraseMs;
    const easeDraw = randomPace();
    const easeErase = randomPace();
    let startTs = null;
    let flipped = false;

    function frame(ts) {
      if (startTs === null) startTs = ts;
      const t = ts - startTs;
      let offset;
      if (t < drawMs) {
        offset = L * (1 - easeDraw(t / drawMs)); // L -> 0
      } else if (t < drawMs + holdMs) {
        offset = 0;
      } else if (t < total) {
        offset = -L * easeErase((t - drawMs - holdMs) / eraseMs); // 0 -> -L
      } else {
        track.style.strokeDashoffset = String(-L);
        overlay.classList.remove("is-running");
        return;
      }
      if (!flipped && t >= drawMs) {
        flipped = true;
        onFullyDrawn();
      }
      track.style.strokeDashoffset = String(offset);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
    const isDark = theme === "dark";

    toggle.setAttribute("aria-pressed", String(isDark));
    toggle.setAttribute("aria-label", themes[theme].nextLabel);
  }

  applyTheme(root.dataset.theme === "dark" ? "dark" : "light");

  toggle.addEventListener("click", () => {
    if (overlay.classList.contains("is-running")) return;

    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";

    if (!track) {
      applyTheme(nextTheme);
      return;
    }

    overlay.classList.remove("is-running");
    void overlay.offsetWidth;
    track.style.strokeDashoffset = String(circuitLength);
    overlay.classList.add("is-running");

    // The circuit draws on, the theme flips at the fully-drawn beat, then the
    // line peels away in the same direction to reveal the new theme.
    runCircuit(() => applyTheme(nextTheme));
  });
}

function hideLoadingScreen() {
  const loader = document.getElementById("loading-screen");
  const container = document.querySelector(".container");
  if (loader) {
    loader.classList.add("fade-out");
    document.body.style.overflow = "auto";
  }
  if (container) {
    container.style.opacity = "1";
  }
}

/**
 * Scroll-spy: highlight the nav link whose section is currently in view.
 */
function setupScrollSpy() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === "#" + entry.target.id,
            );
          });
        }
      });
    },
    {
      rootMargin: "-30% 0px -60% 0px",
    },
  );

  sections.forEach((section) => observer.observe(section));
}

/**
 * Fetches the last commit date for the repository and updates the footer.
 */
function updateLastUpdated(repo) {
  const element = document.getElementById("last-updated");
  if (!element) return;

  const CACHE_KEY = `last-updated-${repo}`;
  const cached = localStorage.getItem(CACHE_KEY);
  const now = Date.now();

  if (cached) {
    const { date, timestamp } = JSON.parse(cached);
    if (now - timestamp < 3600000) {
      element.innerText = "Last updated: " + date;
      return;
    }
  }

  fetch(`https://api.github.com/repos/${repo}/commits?per_page=1`)
    .then((response) => {
      if (!response.ok) throw new Error("Rate limit");
      return response.json();
    })
    .then((data) => {
      if (data && data[0] && data[0].commit) {
        const dateStr = new Date(
          data[0].commit.committer.date,
        ).toLocaleDateString();
        element.innerText = "Last updated: " + dateStr;
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ date: dateStr, timestamp: now }),
        );
      }
    })
    .catch(() => {
      if (
        !element.innerText ||
        element.innerText.includes("recently") ||
        element.innerText.includes("Fetching")
      ) {
        element.innerText = "Last updated: recently";
      }
    });
}

document.addEventListener("DOMContentLoaded", () => {
  hideLoadingScreen();
  setupHamburger();
  setupThemeCircuitTransition();
  setupSmoothScroll();
  setupScrollSpy();
  updateLastUpdated("aryamaddel/aryamaddel.github.io");
});
