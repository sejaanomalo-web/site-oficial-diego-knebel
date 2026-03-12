const preloader = document.getElementById("preloader");
const header = document.getElementById("site-header");
const menuToggle = document.getElementById("menu-toggle");
const siteNav = document.getElementById("site-nav");
const form = document.getElementById("contact-form");
const formFeedback = document.getElementById("form-feedback");

let ticking = false;

const onScroll = () => {
  header?.classList.toggle("scrolled", window.scrollY > 24);
  document.documentElement.style.setProperty("--scroll-y", `${window.scrollY}px`);
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

  const baseSpeed = 0.42;
  const burstSpeed = 2.3;

  let currentX = 0;
  let currentSpeed = baseSpeed;
  let targetSpeed = baseSpeed;
  let currentDirection = 1;
  let targetDirection = 1;
  let paused = false;
  let rafId = 0;
  let limit = track.scrollWidth / 2;

  const refreshLimit = () => {
    limit = track.scrollWidth / 2;
  };

  const animate = () => {
    if (!paused && limit > 0) {
      currentSpeed += (targetSpeed - currentSpeed) * 0.08;
      currentDirection += (targetDirection - currentDirection) * 0.12;

      currentX += currentSpeed * currentDirection;

      if (currentX > limit) currentX -= limit;
      if (currentX < 0) currentX += limit;

      track.style.transform = `translateX(-${currentX}px)`;
    }

    rafId = requestAnimationFrame(animate);
  };

  viewport.addEventListener("mouseenter", () => {
    paused = true;
  });

  viewport.addEventListener("mouseleave", () => {
    paused = false;
    targetSpeed = baseSpeed;
    targetDirection = 1;
  });

  const boost = (side) => {
    targetDirection = side === "left" ? 1 : -1;
    targetSpeed = burstSpeed;
    paused = false;
  };

  const normalize = () => {
    targetDirection = 1;
    targetSpeed = baseSpeed;
  };

  controls.forEach((control) => {
    const side = control.getAttribute("data-rail-control");

    control.addEventListener("mousedown", () => boost(side));
    control.addEventListener("mouseup", normalize);
    control.addEventListener("mouseleave", normalize);

    control.addEventListener("touchstart", () => boost(side), { passive: true });
    control.addEventListener("touchend", normalize, { passive: true });
  });

  window.addEventListener("resize", refreshLimit);
  refreshLimit();
  animate();

  window.addEventListener("beforeunload", () => {
    cancelAnimationFrame(rafId);
  });
}

const yearNode = document.getElementById("year");
if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}
