/**
 * SOPHIA-G Main Script
 * — Scroll-reveal (IntersectionObserver)
 * — Hero media (image or video): slow zoom on scroll
 * — Hero video: smooth scroll‑scrubs timeline (eased scrub)
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
  initWordmarkStretch();
  initHeroScrollVideo();
  initServiceVideoControls();
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
  const img = document.querySelector(".sc__wordmark-img");
  if (!img) return;

  function update() {
    const rect     = img.getBoundingClientRect();
    const vh       = window.innerHeight;

    // 0 = just entered viewport bottom, 1 = fully visible
    const progress = Math.min(1, Math.max(0,
      (vh - rect.top) / (vh * 0.65)
    ));

    // scaleY: 1.18 → 1.0 (stretch eases away)
    const scaleY  = 1.18 - (progress * 0.18);
    // translateY: 8% → 0
    const transY  = (1 - progress) * 8;

    img.style.transform = `scaleY(${scaleY.toFixed(3)}) translateY(${transY.toFixed(1)}%)`;
    img.style.opacity   = "1";
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

/* ─── Hero video: smooth scroll-scrub through the hero section ─── */
function initHeroScrollVideo() {
  const hero  = document.querySelector(".sophia-hero");
  const video = document.querySelector(".sophia-hero__video");
  if (!hero || !video) return;

  const motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let duration   = 0;
  let ticking    = false;
  let smoothP    = 0;
  let lastTickMs = 0;
  /** Ease time constant (seconds); higher = silkier, more settle lag */
  const TAU_SEC  = motionOK ? 0.52 : 0;
  /** Stop rAF when smoothed progress has settled on the scroll target */
  const EPS_P    = 0.002;

  function syncDuration() {
    const d = video.duration;
    duration = typeof d === "number" && isFinite(d) && d > 0 ? d : 0;
  }

  function rawHeroProgress() {
    const vh   = window.innerHeight;
    const top  = hero.offsetTop;
    const span = hero.offsetHeight - vh;
    return Math.min(1, Math.max(0, (window.scrollY - top) / Math.max(1, span)));
  }

  video.addEventListener("loadedmetadata", syncDuration);
  video.addEventListener("durationchange", syncDuration);
  if (video.readyState >= 1) syncDuration();

  function applyInstantScrub() {
    syncDuration();
    if (!duration) return;
    const p = rawHeroProgress();
    smoothP = p;
    video.pause();
    try {
      video.currentTime = p * duration;
    } catch (_) {}
  }

  function tick() {
    if (!duration || !motionOK) {
      ticking = false;
      return;
    }

    const targetP = rawHeroProgress();
    const now = performance.now();
    const dtSec = lastTickMs ? Math.min(0.055, (now - lastTickMs) / 1000) : 1 / 60;
    lastTickMs = now;
    const k = motionOK && TAU_SEC > 0 ? 1 - Math.exp(-dtSec / TAU_SEC) : 1;
    smoothP += (targetP - smoothP) * k;

    const t = smoothP * duration;
    video.pause();

    try {
      if (Math.abs(video.currentTime - t) > 0.0025) video.currentTime = t;
    } catch (_) {
      ticking = false;
      return;
    }

    if (Math.abs(targetP - smoothP) > EPS_P) {
      requestAnimationFrame(tick);
    } else {
      ticking = false;
    }
  }

  function kick() {
    if (!motionOK) {
      applyInstantScrub();
      return;
    }
    syncDuration();
    if (!duration) return;

    /*
      One rAF chain runs while smoothP eases toward scroll.
      Finished chains restart on the next kick() (scroll / resize).
    */
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(tick);
    }
  }

  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", kick, { passive: true });

  video.pause();

  function bootstrap() {
    syncDuration();
    if (!motionOK || !duration) {
      applyInstantScrub();
      return;
    }
    smoothP = rawHeroProgress();
    try {
      video.currentTime = smoothP * duration;
    } catch (_) {}
    kick();
  }

  syncDuration();
  if (duration) bootstrap();
  else video.addEventListener("loadedmetadata", bootstrap, { once: true });
}

function syncServiceVpBtn(btn, video) {
  const paused = video.paused;
  btn.classList.toggle("is-paused", paused);
  btn.setAttribute("aria-label", paused ? "Play video" : "Pause video");
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
