/**
 * SPA-like navigation and preloading for Arya Maddel's Portfolio
 */

const CACHE = {};
const PAGES = ['/', '/work.html', '/research.html'];
/**
 * Initializes the page by preloading all content and setting up listeners
 */
async function initialize() {
    // 1. Mark current page as cached
    const currentPath = normalizePath(window.location.pathname);
    CACHE[currentPath] = document.documentElement.outerHTML;

    // 2. Preload other pages
    const preloadPromises = PAGES.map(normalizePath)
        .filter(p => p !== currentPath)
        .map(async (path) => {
            try {
                const response = await fetch(path);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const html = await response.text();
                CACHE[path] = html;
                console.log(`Preloaded: ${path}`);
            } catch (err) {
                console.error(`Failed to preload ${path}:`, err);
            }
        });

    await Promise.all(preloadPromises);

    // 3. Hide loading screen immediately after content is ready
    hideLoadingScreen();

    // 4. Set up navigation interception
    setupNavigation();

    // 5. Initial scripts for current page
    runPageScripts();
}

function normalizePath(path) {
    if (!path || path === '/' || path === '/index') return '/index.html';
    if (!path.endsWith('.html')) {
        // Handle paths like /work or /research
        return (path.startsWith('/') ? path : '/' + path) + '.html';
    }
    return path.startsWith('/') ? path : '/' + path;
}

function hideLoadingScreen() {
    const loader = document.getElementById('loading-screen');
    const container = document.querySelector('.container');
    if (loader) {
        loader.classList.add('fade-out');
        document.body.style.overflow = 'auto';
    }
    if (container) {
        container.style.opacity = '1';
    }
}

function setupNavigation() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const url = new URL(link.href);
        const path = normalizePath(url.pathname);

        // Check if it's an internal link
        if (url.origin === window.location.origin && PAGES.map(normalizePath).includes(path)) {
            e.preventDefault();
            navigateTo(url.pathname);
        }
    });

    window.addEventListener('popstate', () => {
        renderPage(window.location.pathname);
    });
}

async function navigateTo(path) {
    if (window.location.pathname === path) return;
    
    // Add transition out
    const container = document.querySelector('.container');
    container.style.opacity = '0';
    container.style.transform = 'translateY(10px)';

    setTimeout(async () => {
        history.pushState(null, '', path);
        await renderPage(path);
        
        // Transition in
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }, 300);
}

async function renderPage(path) {
    const normalized = normalizePath(path);
    let html = CACHE[normalized];

    if (!html) {
        // Fallback fetch if not in cache
        const response = await fetch(normalized);
        html = await response.text();
        CACHE[normalized] = html;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Update title
    document.title = doc.title;

    // Update body content (specifically the .container)
    const newContent = doc.querySelector('.container').innerHTML;
    document.querySelector('.container').innerHTML = newContent;

    // Scroll to top
    window.scrollTo(0, 0);

    // Re-run scripts
    runPageScripts();
}

const PROJECTS = [
    {
        name: "frsh - Tech Blog",
        description: "Collaborative technical writing platform maintained with peers. Documentation of learning journey and project insights.",
        html_url: "https://frshtech.vercel.app/",
        language: "Technical Writing",
    },
    {
        name: "DIQA",
        description: "A lightweight, production-ready Python library for No-Reference Image Quality Assessment (NR-IQA).",
        html_url: "https://pypi.org/project/diqa/",
        language: "Python Package",
    },
    {
        name: "AutoManim",
        description: "AI-powered web application converting natural language descriptions into mathematical animations using Manim and LLM.",
        html_url: "https://github.com/aryamaddel/AutoManim",
        language: "AI & Web",
    },
    {
        name: "Alexa PC Control",
        description: "Smart home integration using ESP32 for remote PC control with voice commands. Explored edge computing and IoT protocols.",
        html_url: "https://github.com/aryamaddel/alexa-pc-control",
        language: "IoT & Embedded",
    },
    {
        name: "Sujalam Chemicals",
        description: "Full-stack mobile application with real-time tracking and automated alerts. Built with React Native and Express.",
        html_url: "https://github.com/aryamaddel/sujalam-chemicals",
        language: "Full Stack",
    },
];

/**
 * Re-runs scripts that are specific to certain pages (like project loading)
 */
function runPageScripts() {
    // Check if we are on the work page
    const container = document.getElementById("projects-container");
    if (container) {
        container.innerHTML = "";
        PROJECTS.forEach((project) => {
            const projectEl = document.createElement("div");
            projectEl.className = "project-item";
            projectEl.innerHTML = `
                <h3><a href="${project.html_url}" target="_blank">${project.name}</a></h3>
                <div class="project-meta">${project.language}</div>
                <p>${project.description}</p>
            `;
            container.appendChild(projectEl);
        });
    }

    // Update last updated timestamp
    updateLastUpdated("aryamaddel/aryamaddel.github.io");
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
        // Use cache if it's less than 1 hour old
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
                const dateStr = new Date(data[0].commit.committer.date).toLocaleDateString();
                element.innerText = "Last updated: " + dateStr;
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    date: dateStr,
                    timestamp: now
                }));
            }
        })
        .catch(() => {
            // Quietly fall back to "recently" or existing cache if fetch fails
            if (!element.innerText || element.innerText.includes("recently") || element.innerText.includes("Fetching")) {
                element.innerText = "Last updated: recently";
            }
        });
}

// Start initialization
document.addEventListener('DOMContentLoaded', initialize);
