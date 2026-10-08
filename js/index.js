// =========================
// Current Year
// =========================

document.getElementById("year").textContent = new Date().getFullYear();


// =========================
// Navbar Scroll Effect
// =========================

const navbar = document.getElementById("navbar");

function handleNavbarScroll() {
  if (window.scrollY > 30) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
}

window.addEventListener("scroll", handleNavbarScroll);

handleNavbarScroll();


// =========================
// Mobile Navigation
// =========================

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

function setMenuOpen(isOpen) {
  navLinks.classList.toggle("open", isOpen);
  menuToggle.setAttribute("aria-expanded", isOpen);
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  menuToggle.textContent = isOpen ? "×" : "☰";
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    setMenuOpen(!navLinks.classList.contains("open"));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navLinks.classList.contains("open")) {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) {
      setMenuOpen(false);
    }
  });

  navbar.addEventListener("focusout", (event) => {
    if (!navbar.contains(event.relatedTarget)) setMenuOpen(false);
  });

  window.matchMedia("(max-width: 850px)").addEventListener("change", () => {
    setMenuOpen(false);
  });
}


// =========================
// Scroll Reveal
// =========================

const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12
  }
);

revealElements.forEach((element) => {
  revealObserver.observe(element);
});


// =========================
// Active Navigation
// =========================

const sections = document.querySelectorAll("main section[id]");
const navigationLinks = document.querySelectorAll(".nav-links a");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navigationLinks.forEach((link) => {
          link.classList.remove("active");

          if (
            link.getAttribute("href") ===
            "#" + entry.target.id
          ) {
            link.classList.add("active");
          }
        });
      }
    });
  },
  {
    rootMargin: "-35% 0px -55% 0px"
  }
);

sections.forEach((section) => {
  sectionObserver.observe(section);
});


// =========================
// Technology Logo Reveal
// =========================

const skillsGrid = document.querySelector(".skills-grid");

if (skillsGrid) {
  skillsGrid.classList.add("skills-interactive");

  skillsGrid.querySelectorAll(".skill-card").forEach((card) => {
    const toggle = card.querySelector(".skill-toggle");
    const heading = card.querySelector("h3");
    if (!toggle || !heading) return;

    let keepVisible = false;
    toggle.hidden = false;
    toggle.setAttribute("aria-label", `Technology logos for ${heading.textContent}`);

    function showLogos(visible) {
      card.classList.toggle("logos-visible", visible);
      toggle.setAttribute("aria-pressed", String(visible));
      toggle.innerHTML = `${visible ? "Hide" : "Show"} logos <span aria-hidden="true">${visible ? "−" : "+"}</span>`;
    }

    card.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") showLogos(true);
    });
    card.addEventListener("pointerleave", (event) => {
      if (event.pointerType === "mouse" && !keepVisible && !card.contains(document.activeElement)) {
        showLogos(false);
      }
    });
    card.addEventListener("focusin", () => {
      if (toggle.matches(":focus-visible")) showLogos(true);
    });
    card.addEventListener("focusout", (event) => {
      if (!card.contains(event.relatedTarget) && !keepVisible) showLogos(false);
    });
    card.addEventListener("click", () => {
      keepVisible = !card.classList.contains("logos-visible");
      showLogos(keepVisible);
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        keepVisible = false;
        showLogos(false);
      }
    });
  });
}


// =========================
// Smooth Button Interaction
// =========================

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (event) {
    const targetId = this.getAttribute("href");

    if (targetId === "#") {
      return;
    }

    const target = document.querySelector(targetId);

    if (target) {
      event.preventDefault();

      target.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        block: "start"
      });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
  });
});
