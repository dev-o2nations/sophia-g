/**
 * SOPHIA-G Main Script
 * — Scroll-reveal (IntersectionObserver)
 * — Hero product image slow zoom on scroll
 * — Hero content fade-up as hero section exits
 */

window.__sophiaInit = function () {
  initTheme();
  initReveal();
  initHeroEffects();
  initHeader();
  initMenu();
  initServicesDrag();
  initScrollTop();
};

/* ─── Header scroll state ─── */
function initHeader() {
  const header = document.getElementById("sophia-header");
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // run once on load
}

/* ─── Scroll Reveal ─── */
function initReveal() {
  const items = document.querySelectorAll(".sophia-reveal");
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add("is-visible"), i * 90);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((el) => observer.observe(el));
}

/* ─── Services draggable carousel ─── */
function initServicesDrag() {
  const track = document.getElementById("services-track");
  if (!track) return;

  let isDown   = false;
  let startX   = 0;
  let scrollLeft = 0;

  const start = (e) => {
    isDown = true;
    track.classList.add("is-dragging");
    startX     = (e.pageX ?? e.touches[0].pageX) - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  };

  const end = () => {
    isDown = false;
    track.classList.remove("is-dragging");
  };

  const move = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x    = (e.pageX ?? e.touches[0].pageX) - track.offsetLeft;
    const walk = (x - startX) * 1.4;   // 1.4 = drag multiplier
    track.scrollLeft = scrollLeft - walk;
  };

  /* Mouse */
  track.addEventListener("mousedown",  start);
  track.addEventListener("mouseleave", end);
  track.addEventListener("mouseup",    end);
  track.addEventListener("mousemove",  move);

  /* Touch (pointer) — native scroll handles it but we cancel text select */
  track.addEventListener("touchstart", start, { passive: true });
  track.addEventListener("touchend",   end);
  track.addEventListener("touchmove",  move, { passive: false });

  /* Prevent card links from firing on drag */
  track.querySelectorAll("a").forEach((a) => {
    a.addEventListener("mousedown", (e) => e.preventDefault());
  });

  /* Hide drag hint after first interaction */
  const hint = track.previousElementSibling;
  track.addEventListener("scroll", () => {
    if (hint && hint.classList.contains("sophia-services__drag-hint")) {
      hint.style.opacity = "0";
      hint.style.pointerEvents = "none";
    }
  }, { once: true });
}

/* ─── Hero Effects ─── */
function initHeroEffects() {
  const hero    = document.querySelector(".sophia-hero");
  const img     = document.querySelector(".sophia-hero__img");
  const content = document.querySelector(".sophia-hero__content");

  if (!hero) return;

  const stageH = window.innerHeight; // 100vh

  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;

      /* Slow scale-zoom on the product image */
      if (img) {
        const progress = Math.min(y / stageH, 1);      // 0 → 1 across first 100vh
        img.style.transform = `scale(${1 + progress * 0.06})`;
      }

      /* Label + button: fade out + float up as hero nears its end */
      if (content) {
        const fadeStart = stageH * 0.55;
        const fadeEnd   = stageH * 0.88;
        const t         = Math.max(0, Math.min(1, (y - fadeStart) / (fadeEnd - fadeStart)));
        content.style.opacity   = 1 - t;
        content.style.transform = `translateY(-${t * 24}px)`;
      }
    },
    { passive: true }
  );
}

/* ─── Scroll to top ─── */
function initScrollTop() {
  const btn = document.getElementById("sophia-scroll-top");
  if (!btn) return;

  const threshold = 380;

  const onScroll = () => {
    btn.classList.toggle("is-visible", window.scrollY > threshold);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ─── Nav Drawer ─── */
function initMenu() {
  const openBtn  = document.getElementById("menu-icon-btn");
  const closeBtn = document.getElementById("nav-close");
  const drawer   = document.getElementById("nav-drawer");
  const body     = document.body;

  if (!openBtn || !drawer) return;

  function openDrawer() {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    body.style.overflow = "hidden"; // prevent background scroll
    openBtn.setAttribute("aria-expanded", "true");
  }

  function closeDrawer() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    body.style.overflow = "";
    openBtn.setAttribute("aria-expanded", "false");
  }

  openBtn.addEventListener("click", openDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);

  // Close when clicking the dark backdrop (outside the inner panel)
  drawer.addEventListener("click", (e) => {
    if (e.target === drawer) closeDrawer();
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer();
  });
}

/* --- Theme toggle (light / dark) --- */
function initTheme() {
  const root   = document.documentElement;
  const btn    = document.getElementById('theme-toggle');
  const stored = localStorage.getItem('sg-theme');

  /* Apply saved preference; default to dark */
  root.setAttribute('data-theme', stored || 'dark');

  if (!btn) return;

  btn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('sg-theme', next);
  });
}
