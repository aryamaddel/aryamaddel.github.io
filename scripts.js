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
      document.querySelector(".nav-toggle")?.setAttribute("aria-expanded", "false");

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
  setupSmoothScroll();
  setupScrollSpy();
  updateLastUpdated("aryamaddel/aryamaddel.github.io");
});
