/**
 * SOPHIA-G Main Script
 * — Scroll-reveal (IntersectionObserver)
 * — Hero media (image or video): slow zoom on scroll
 * — Hero video: autoplay on load (muted loop)
 * — Hero content fade-up as hero section exits
 */

window.__sophiaInit = function () {
  initTheme();
  initReveal();
  initSectionReveal(".sophia-welcome, .sophia-subscribe");
  initWelcomeParallax();
  initHeroEffects();
  initChapterEffects();
  initChapterVideo();
  initHeader();
  initMenu();
  initServicesDrag();
  initScrollTop();
  initWordmarkStretch();
  initHeroScrollVideo();
  initServiceVideoControls();
  initServiceCardsInView();
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

/* ─── Section entrance (welcome, chapters) ─── */
function initSectionReveal(selector) {
  const sections = document.querySelectorAll(selector);
  if (!sections.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    sections.forEach((el) => el.classList.add("is-inview"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-inview");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -4% 0px" }
  );

  sections.forEach((el) => observer.observe(el));
}

/* ─── Welcome: subtle parallax while scrolling through copy ─── */
function initWelcomeParallax() {
  const section = document.querySelector(".sophia-welcome");
  const main = section?.querySelector(".sophia-welcome__main");
  if (!section || !main) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return;

  const onScroll = () => {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    if (rect.bottom < 0 || rect.top > vh) return;

    const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height * 0.35)));
    const drift = (progress - 0.5) * 14;
    main.style.transform = `translateY(${drift}px)`;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
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
  const video   = document.querySelector(".sophia-hero__video");
  const media   = img || video;
  const content = document.querySelector(".sophia-hero__content");

  if (!hero) return;

  const stageH = window.innerHeight; // 100vh

  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;

      /* Slow scale-zoom on hero image or video */
      if (media) {
        const progress = Math.min(y / stageH, 1);      // 0 → 1 across first 100vh
        media.style.transform = `scale(${1 + progress * 0.06})`;
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

/* ─── Chapters: sticky stage + cinematic scroll reveal ─── */
function initChapterEffects() {
  const section = document.querySelector(".sophia-chapters");
  const scroll  = section?.querySelector(".sophia-chapters__scroll");
  const media   = section?.querySelector(".sophia-chapters__video");
  const badge   = section?.querySelector(".sophia-chapters__badge");
  const rule    = section?.querySelector(".sophia-chapters__rule");
  const titleLines = section?.querySelectorAll(".sophia-chapters__title-line");
  const cta       = section?.querySelector(".sophia-chapters__cta");

  if (!section || !scroll) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    section.classList.add("is-inview");
    return;
  }

  const clamp01 = (n) => Math.min(1, Math.max(0, n));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const animItem = (el, enterT, exitT, opts = {}) => {
    if (!el) return;
    const delay = opts.delay ?? 0;
    const yIn = opts.yIn ?? 32;
    const scale = opts.scale ?? false;
    const t = easeOut(clamp01((enterT - delay) / Math.max(0.001, 1 - delay)));
    const exit = clamp01(exitT);
    const opacity = Math.min(t, 1 - exit);
    const y = (1 - t) * yIn - exit * 18;
    const s = scale ? 0.92 + t * 0.08 - exit * 0.04 : 1;
    el.style.opacity = String(opacity);
    el.style.transform = scale
      ? `translateY(${y}px) scale(${s})`
      : `translateY(${y}px)`;
  };

  const update = () => {
    const rect = scroll.getBoundingClientRect();
    const scrollable = scroll.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;

    const progress = clamp01(-rect.top / scrollable);
    const revealEnd = 0.42;
    const exitStart = 0.9;
    const enterT = easeOut(clamp01(progress / revealEnd));
    const exitT  = clamp01((progress - exitStart) / (1 - exitStart));
    const approach = clamp01((window.innerHeight - rect.top) / (window.innerHeight * 0.85));

    section.classList.toggle("is-inview", progress > 0.02);
    section.classList.toggle("is-entering", enterT > 0.05 && enterT < 0.98);
    section.style.setProperty("--chapter-enter", String(enterT));
    section.style.setProperty("--chapter-exit", String(exitT));
    section.style.setProperty("--chapter-approach", String(approach));
    section.style.setProperty(
      "--chapter-overlay",
      String(0.58 - enterT * 0.22)
    );

    if (media) {
      const scale = 1.18 - enterT * 0.12 + progress * 0.05;
      const bright = 0.88 + enterT * 0.14;
      const blur = (1 - enterT) * 6;
      media.style.transform = `scale(${scale})`;
      media.style.filter = `brightness(${bright}) blur(${blur}px)`;
    }

    animItem(badge, enterT, exitT, { delay: 0, yIn: 28 });
    if (rule) {
      const ruleT = easeOut(clamp01((enterT - 0.08) / 0.92));
      rule.style.opacity = String(Math.min(ruleT, 1 - exitT));
      rule.style.width = `${ruleT * 56}px`;
      rule.style.transform = `scaleX(${ruleT})`;
    }
    titleLines.forEach((line, i) => {
      animItem(line, enterT, exitT, {
        delay: 0.12 + i * 0.12,
        yIn: 56,
      });
    });
    animItem(cta, enterT, exitT, { delay: 0.38, yIn: 32, scale: true });
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  update();
}

/* ─── Chapter video: autoplay, loop 36s → 38s only ─── */
const CHAPTER_VIDEO_START = 36;
const CHAPTER_VIDEO_END   = 38;

function initChapterVideo() {
  const video = document.querySelector(".sophia-chapters__video");
  if (!video) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return;

  video.muted = true;
  video.defaultMuted = true;
  video.loop = false;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");

  const seekToClipStart = () => {
    if (video.duration && video.duration > CHAPTER_VIDEO_START) {
      video.currentTime = CHAPTER_VIDEO_START;
    }
  };

  video.addEventListener("timeupdate", () => {
    if (video.currentTime >= CHAPTER_VIDEO_END) {
      video.currentTime = CHAPTER_VIDEO_START;
    }
  });

  video.addEventListener("loadedmetadata", seekToClipStart, { once: true });

  let started = false;

  async function startChapterVideo() {
    if (started) return;
    started = true;
    seekToClipStart();
    try {
      await video.play();
    } catch (_) {
      started = false;
    }
  }

  video.addEventListener("loadeddata", () => void startChapterVideo(), { once: true });
  video.addEventListener("canplay", () => void startChapterVideo(), { once: true });
  if (video.readyState >= 2) void startChapterVideo();
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

/* ─── Wordmark Scroll Reveal (scale + fade, no clip) ─── */
function initWordmarkStretch() {
  const img = document.querySelector(".sf__wordmark-img");
  if (!img) return;

  function update() {
    const rect     = img.getBoundingClientRect();
    const vh       = window.innerHeight;

    // 0 = just entered viewport bottom, 1 = fully visible
    const progress = Math.min(1, Math.max(0,
      (vh - rect.top) / (vh * 0.65)
    ));

    const scale  = 0.94 + (progress * 0.06);
    const transY = (1 - progress) * 12;

    img.style.transform = `scale(${scale.toFixed(3)}) translateY(${transY.toFixed(1)}px)`;
    img.style.opacity   = String(0.88 + progress * 0.12);
  }

  window.addEventListener("scroll", update, { passive: true });
  update();
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

/* ─── Hero video: autoplay on load (all viewports) ─── */
const HERO_VIDEO_CLIP_SEC = 11;

function initHeroScrollVideo() {
  const video = document.querySelector(".sophia-hero__video");
  if (!video) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return;

  video.muted = true;
  video.defaultMuted = true;
  video.loop = false;
  video.playsInline = true;

  video.addEventListener("timeupdate", () => {
    if (video.currentTime >= HERO_VIDEO_CLIP_SEC) {
      video.currentTime = 0;
    }
  });
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");

  let started = false;

  async function startHeroVideo() {
    if (started) return;
    started = true;
    try {
      await video.play();
    } catch (_) {
      started = false;
    }
  }

  video.addEventListener("loadeddata", () => void startHeroVideo(), { once: true });
  video.addEventListener("canplay", () => void startHeroVideo(), { once: true });
  if (video.readyState >= 2) void startHeroVideo();
}

function syncServiceVpBtn(btn, video) {
  const paused = video.paused;
  btn.classList.toggle("is-paused", paused);
  btn.setAttribute("aria-label", paused ? "Play video" : "Pause video");
}

/* ─── Services: in-view class for media entrance ─── */
function initServiceCardsInView() {
  const cards = document.querySelectorAll(".sophia-service-card");
  if (!cards.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-inview");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25, rootMargin: "0px 0px -8% 0px" }
  );

  cards.forEach((card) => observer.observe(card));
}

/* ─── Services: play/pause control on each card video ─── */
function initServiceVideoControls() {
  document.querySelectorAll(".sophia-service-card__vp-btn").forEach((btn) => {
    const media = btn.closest(".sophia-service-card__media");
    const video = media?.querySelector(".sophia-service-card__video");
    if (!video) return;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (video.paused) void video.play();
      else video.pause();
      syncServiceVpBtn(btn, video);
    });

    video.addEventListener("play", () => syncServiceVpBtn(btn, video));
    video.addEventListener("pause", () => syncServiceVpBtn(btn, video));
    syncServiceVpBtn(btn, video);
  });
}
