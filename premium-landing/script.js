const preloader = document.getElementById("preloader");
const header = document.getElementById("site-header");
const menuToggle = document.getElementById("menu-toggle");
const siteNav = document.getElementById("site-nav");
const form = document.getElementById("contact-form");
const formFeedback = document.getElementById("form-feedback");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const coarsePointerQuery = window.matchMedia("(hover: none), (pointer: coarse)");
const narrowViewportQuery = window.matchMedia("(max-width: 991px)");

let ticking = false;
let allowOrbParallax = true;

const addMediaListener = (query, callback) => {
  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", callback);
    return;
  }

  if (typeof query.addListener === "function") {
    query.addListener(callback);
  }
};

const applyPerformanceProfile = () => {
  const mobileLike = coarsePointerQuery.matches || narrowViewportQuery.matches;
  document.body.classList.toggle("is-mobile", mobileLike);
  allowOrbParallax = !mobileLike && !reducedMotionQuery.matches;

  if (!allowOrbParallax) {
    document.documentElement.style.setProperty("--scroll-y", "0px");
  }
};

const onScroll = () => {
  header?.classList.toggle("scrolled", window.scrollY > 24);
  if (allowOrbParallax) {
    document.documentElement.style.setProperty("--scroll-y", `${window.scrollY}px`);
  }
  ticking = false;
};

window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  },
  { passive: true }
);

addMediaListener(reducedMotionQuery, applyPerformanceProfile);
addMediaListener(coarsePointerQuery, applyPerformanceProfile);
addMediaListener(narrowViewportQuery, applyPerformanceProfile);
applyPerformanceProfile();

const setupInertiaScroll = () => {
  let targetY = window.scrollY;
  let currentY = window.scrollY;
  let rafId = 0;
  let animating = false;

  const maxScrollTop = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const clampScroll = (value) => Math.min(maxScrollTop(), Math.max(0, value));

  const tick = () => {
    const delta = targetY - currentY;

    if (Math.abs(delta) < 0.4) {
      currentY = targetY;
      window.scrollTo(0, currentY);
      animating = false;
      rafId = 0;
      return;
    }

    currentY += delta * 0.14;
    window.scrollTo(0, currentY);
    rafId = requestAnimationFrame(tick);
  };

  const start = () => {
    if (animating) return;
    animating = true;
    rafId = requestAnimationFrame(tick);
  };

  const handleWheel = (event) => {
    if (event.ctrlKey || event.metaKey) return;
    if (coarsePointerQuery.matches || narrowViewportQuery.matches || reducedMotionQuery.matches) return;
    if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;

    event.preventDefault();
    const unit = event.deltaMode === 1 ? 18 : 1;
    const acceleration = Math.abs(event.deltaY) > 60 ? 1.06 : 0.9;
    targetY = clampScroll(targetY + event.deltaY * unit * acceleration);
    start();
  };

  const syncWithNativeScroll = () => {
    if (!animating) {
      targetY = window.scrollY;
      currentY = window.scrollY;
    }
  };

  const handleResize = () => {
    targetY = clampScroll(targetY);
    currentY = clampScroll(currentY);
  };

  window.addEventListener("wheel", handleWheel, { passive: false });
  window.addEventListener("scroll", syncWithNativeScroll, { passive: true });
  window.addEventListener("resize", handleResize, { passive: true });
  window.addEventListener("beforeunload", () => {
    if (rafId) cancelAnimationFrame(rafId);
  });
};

setupInertiaScroll();

window.addEventListener("load", () => {
  setTimeout(() => {
    preloader?.classList.add("hidden");
  }, 420);
  onScroll();
});

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.classList.toggle("active");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    siteNav.classList.toggle("open", isOpen);
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("open");
    });
  });
}

const revealItems = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
);

revealItems.forEach((item) => revealObserver.observe(item));

const accordionItems = document.querySelectorAll(".accordion-item");

const closeAccordionItem = (item) => {
  item.classList.remove("open");
  const trigger = item.querySelector(".accordion-trigger");
  const content = item.querySelector(".accordion-content");
  trigger?.setAttribute("aria-expanded", "false");
  if (content) content.style.maxHeight = "0px";
};

const openAccordionItem = (item) => {
  item.classList.add("open");
  const trigger = item.querySelector(".accordion-trigger");
  const content = item.querySelector(".accordion-content");
  trigger?.setAttribute("aria-expanded", "true");
  if (content) content.style.maxHeight = `${content.scrollHeight + 10}px`;
};

accordionItems.forEach((item) => {
  const trigger = item.querySelector(".accordion-trigger");
  trigger?.addEventListener("click", () => {
    const isOpen = item.classList.contains("open");

    accordionItems.forEach((current) => {
      if (current !== item) closeAccordionItem(current);
    });

    if (isOpen) {
      closeAccordionItem(item);
    } else {
      openAccordionItem(item);
    }
  });
});

if (form && formFeedback) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    formFeedback.textContent = "Mensagem enviada com sucesso. Em breve, nosso time entrará em contato.";
    form.reset();

    window.setTimeout(() => {
      formFeedback.textContent = "";
    }, 5500);
  });
}

const track = document.getElementById("testimonials-track");
const viewport = document.getElementById("testimonials-viewport");
const controls = document.querySelectorAll("[data-rail-control]");

if (track && viewport) {
  track.innerHTML += track.innerHTML;

  const baseSpeedDesktop = 0.42;
  const baseSpeedMobile = 0.24;
  const burstSpeedDesktop = 2.3;
  const burstSpeedMobile = 1.3;

  let currentX = 0;
  let currentSpeed = baseSpeedDesktop;
  let targetSpeed = baseSpeedDesktop;
  let currentDirection = 1;
  let targetDirection = 1;
  let paused = false;
  let rafId = 0;
  let limit = track.scrollWidth / 2;
  let inView = false;
  let pageVisible = !document.hidden;

  const getBaseSpeed = () =>
    document.body.classList.contains("is-mobile") ? baseSpeedMobile : baseSpeedDesktop;
  const getBurstSpeed = () =>
    document.body.classList.contains("is-mobile") ? burstSpeedMobile : burstSpeedDesktop;

  const refreshLimit = () => {
    limit = track.scrollWidth / 2;
  };

  const canAnimate = () => !reducedMotionQuery.matches && inView && pageVisible && limit > 0;

  const ensureAnimationState = () => {
    if (canAnimate() && rafId === 0) {
      rafId = requestAnimationFrame(animate);
      return;
    }

    if (!canAnimate() && rafId !== 0) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };

  const animate = () => {
    if (!canAnimate()) {
      rafId = 0;
      return;
    }

    if (!paused) {
      currentSpeed += (targetSpeed - currentSpeed) * 0.08;
      currentDirection += (targetDirection - currentDirection) * 0.12;

      currentX += currentSpeed * currentDirection;

      if (currentX > limit) currentX -= limit;
      if (currentX < 0) currentX += limit;

      track.style.transform = `translate3d(-${currentX}px, 0, 0)`;
    }

    rafId = requestAnimationFrame(animate);
  };

  const normalize = () => {
    targetDirection = 1;
    targetSpeed = getBaseSpeed();
  };

  const pauseRail = () => {
    paused = true;
  };

  const resumeRail = () => {
    paused = false;
    normalize();
    ensureAnimationState();
  };

  if (!coarsePointerQuery.matches) {
    viewport.addEventListener("mouseenter", pauseRail);
    viewport.addEventListener("mouseleave", resumeRail);
  }

  viewport.addEventListener("touchstart", pauseRail, { passive: true });
  viewport.addEventListener("touchend", resumeRail, { passive: true });
  viewport.addEventListener("touchcancel", resumeRail, { passive: true });

  const boost = (side) => {
    targetDirection = side === "left" ? 1 : -1;
    targetSpeed = getBurstSpeed();
    paused = false;
    ensureAnimationState();
  };

  controls.forEach((control) => {
    const side = control.getAttribute("data-rail-control");

    control.addEventListener("mousedown", () => boost(side));
    control.addEventListener("mouseup", normalize);
    control.addEventListener("mouseleave", normalize);

    control.addEventListener("touchstart", () => boost(side), { passive: true });
    control.addEventListener("touchend", normalize, { passive: true });
  });

  const visibilityHandler = () => {
    pageVisible = !document.hidden;
    ensureAnimationState();
  };

  const viewportObserver = new IntersectionObserver(
    (entries) => {
      inView = Boolean(entries[0]?.isIntersecting);
      ensureAnimationState();
    },
    { threshold: 0.08 }
  );

  viewportObserver.observe(viewport);
  document.addEventListener("visibilitychange", visibilityHandler);
  window.addEventListener(
    "resize",
    () => {
      refreshLimit();
      normalize();
      ensureAnimationState();
    },
    { passive: true }
  );
  addMediaListener(coarsePointerQuery, () => {
    normalize();
    ensureAnimationState();
  });
  addMediaListener(narrowViewportQuery, () => {
    normalize();
    ensureAnimationState();
  });
  addMediaListener(reducedMotionQuery, ensureAnimationState);

  refreshLimit();
  normalize();
  ensureAnimationState();

  window.addEventListener("beforeunload", () => {
    if (rafId) cancelAnimationFrame(rafId);
    viewportObserver.disconnect();
    document.removeEventListener("visibilitychange", visibilityHandler);
  });
}

const yearNode = document.getElementById("year");
if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}
