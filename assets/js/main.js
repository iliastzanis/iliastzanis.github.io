const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");
const navLinks = document.querySelectorAll(".nav__link");
const themeButton = document.getElementById("theme-button");
const scrollTopButton = document.getElementById("scroll-top");
const sections = document.querySelectorAll("section[id]");
const allNavLinks = document.querySelectorAll(".nav__menu a.nav__link");

const footerYear = document.getElementById("footer-year");
if (footerYear) footerYear.textContent = new Date().getFullYear();

let isNavigating = false;
let scrollEndTimer = null;

/* ── Scroll-to-top progress ring setup ── */

const RING_R = 19;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R;

if (scrollTopButton) {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("class", "progress-ring");
  svg.setAttribute("viewBox", "0 0 44 44");
  svg.setAttribute("aria-hidden", "true");

  const track = document.createElementNS(svgNS, "circle");
  track.setAttribute("class", "ring-track");
  track.setAttribute("cx", "22");
  track.setAttribute("cy", "22");
  track.setAttribute("r", String(RING_R));

  const fill = document.createElementNS(svgNS, "circle");
  fill.setAttribute("class", "ring-fill");
  fill.setAttribute("cx", "22");
  fill.setAttribute("cy", "22");
  fill.setAttribute("r", String(RING_R));
  fill.style.strokeDasharray = String(RING_CIRCUMFERENCE);
  fill.style.strokeDashoffset = String(RING_CIRCUMFERENCE);

  svg.appendChild(track);
  svg.appendChild(fill);
  scrollTopButton.prepend(svg);
}

function updateScrollTopButton() {
  if (!scrollTopButton) return;

  const scrollY = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;

  scrollTopButton.classList.toggle("show-scroll", scrollY >= 520);

  const fill = scrollTopButton.querySelector(".ring-fill");
  if (fill) {
    fill.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - progress));
  }
}

window.addEventListener("scroll", updateScrollTopButton, { passive: true });
window.addEventListener("load", updateScrollTopButton);

/* ── Mobile menu ── */

function closeMenu() {
  if (!navMenu || !navToggle) return;
  navMenu.classList.remove("show-menu");
  document.body.classList.remove("menu-open");
  navToggle.setAttribute("aria-expanded", "false");
  
  const toggleIcon = navToggle.querySelector("i");
  if (toggleIcon) {
    toggleIcon.className = "bx bx-menu";
  }
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("show-menu");
    document.body.classList.toggle("menu-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    
    const toggleIcon = navToggle.querySelector("i");
    if (toggleIcon) {
      toggleIcon.className = isOpen ? "bx bx-x" : "bx bx-menu";
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      closeMenu();
      isNavigating = true;
      allNavLinks.forEach((nav) => nav.classList.remove("active-link"));
      this.classList.add("active-link");
    });
  });
}

/* ── Active nav link spy ── */

function updateActiveLink() {
  if (isNavigating) return;

  const headerH = document.getElementById("header")?.offsetHeight || 72;
  const scrollY = window.scrollY + headerH + 32;
  const pageBottom =
    window.scrollY + window.innerHeight >= document.body.scrollHeight - 80;

  let activeId = null;

  if (pageBottom) {
    activeId = sections[sections.length - 1]?.getAttribute("id") || null;
  } else {
    sections.forEach((section) => {
      if (section.offsetTop <= scrollY) {
        activeId = section.getAttribute("id");
      }
    });
  }

  if (!activeId || activeId === "home") {
    activeId = "about";
  }

  allNavLinks.forEach((link) => {
    link.classList.toggle(
      "active-link",
      link.getAttribute("href") === `#${activeId}`
    );
  });
}

window.addEventListener(
  "scroll",
  () => {
    if (isNavigating) {
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => {
        isNavigating = false;
        updateActiveLink();
      }, 150);
      return;
    }
    updateActiveLink();
  },
  { passive: true }
);

window.addEventListener("load", updateActiveLink);

/* ── Theme logic ── */

const darkTheme = "dark-theme";
const iconTheme = "bx-sun";

if (document.body.classList.contains(darkTheme)) {
  const icon = themeButton?.querySelector("i");
  if (icon) icon.className = `bx ${iconTheme}`;
}

themeButton?.addEventListener("click", () => {
  document.body.classList.add("theme-transitioning");

  const isDark = document.body.classList.toggle(darkTheme);
  const icon = themeButton.querySelector("i");

  if (icon) {
    icon.className = isDark ? `bx ${iconTheme}` : "bx bx-moon";
  }

  if (isDark) {
    localStorage.removeItem("selected-theme");
  } else {
    localStorage.setItem("selected-theme", "light");
  }

  setTimeout(() => {
    document.body.classList.remove("theme-transitioning");
  }, 420);
});

/* ── Project Filters ── */

const filterButtons = document.querySelectorAll(".project-filter");
const projectCards = document.querySelectorAll(".project-card[data-category]");
let filterTimeouts = [];

projectCards.forEach((card) => {
  card.style.opacity = "1";
  card.style.transform = "translateY(0)";
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.classList.contains("active")) return;

    filterTimeouts.forEach(clearTimeout);
    filterTimeouts = [];

    filterButtons.forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");

    const filter = btn.dataset.filter;
    const visible = Array.from(projectCards).filter(
      (c) => !c.classList.contains("is-hidden")
    );

    visible.forEach((card) => {
      card.style.transition = "opacity 160ms ease, transform 160ms ease";
      card.style.opacity = "0";
      card.style.transform = "translateY(6px)";
    });

    const t1 = setTimeout(() => {
      projectCards.forEach((card) => {
        const match = filter === "all" || card.dataset.category === filter;
        if (match) {
          card.classList.remove("is-hidden");
          card.style.opacity = "0";
          card.style.transform = "translateY(8px)";
        } else {
          card.classList.add("is-hidden");
        }
      });

      void document.body.offsetWidth;

      const t2 = setTimeout(() => {
        projectCards.forEach((card) => {
          if (!card.classList.contains("is-hidden")) {
            card.style.transition =
              "opacity 240ms ease, transform 240ms ease, border-color 240ms ease, box-shadow 240ms ease";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
          }
        });

        setTimeout(() => {
          projectCards.forEach((card) => {
            card.style.transition = "";
            card.style.opacity = "";
            card.style.transform = "";
          });
        }, 250);
      }, 20);
      filterTimeouts.push(t2);
    }, 170);
    filterTimeouts.push(t1);
  });
});

/* ── Secure Email Bot-Defense Engine ── */

const emailBtn = document.getElementById("secure-email");
if (emailBtn) {
  emailBtn.addEventListener("click", () => {
    const user = emailBtn.getAttribute("data-user");
    const domain = emailBtn.getAttribute("data-domain");
    window.location.href = `mailto:${user}@${domain}`;
  });
}

/* ── Clean Interactive Focus Management ── */

document.querySelectorAll(".button, .project-filter, .nav__link, .theme-toggle, .nav__toggle").forEach((btn) => {
  btn.addEventListener("pointerup", function () {
    setTimeout(() => { this.blur(); }, 150);
  });
});