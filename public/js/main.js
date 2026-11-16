// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// "Years since" counters, e.g. <span data-years-since="2016">
document.querySelectorAll("[data-years-since]").forEach((el) => {
  el.textContent = new Date().getFullYear() - Number(el.dataset.yearsSince);
});

// Mobile nav toggle
const toggle = document.querySelector(".nav-toggle");
const menu = document.getElementById("nav-menu");

const closeMenu = () => {
  menu.classList.remove("open");
  toggle.setAttribute("aria-expanded", "false");
};

toggle.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});

menu.addEventListener("click", (e) => {
  if (e.target.tagName === "A") closeMenu();
});

// Close on Escape (returning focus to the button) or on a click outside the menu
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menu.classList.contains("open")) {
    closeMenu();
    toggle.focus();
  }
});

document.addEventListener("click", (e) => {
  if (menu.classList.contains("open") && !menu.contains(e.target) && !toggle.contains(e.target)) closeMenu();
});

// Header border once the page is scrolled
const header = document.querySelector(".site-header");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Email link, assembled here so the address isn't in the HTML for scrapers
document.querySelectorAll(".js-email").forEach((el) => {
  const address = `${el.dataset.user}@${el.dataset.domain}`;
  el.href = `mailto:${address}`;
  el.textContent = address;
});

// Highlight the nav link for the section in view
const links = [...menu.querySelectorAll("a")];
const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);

if ("IntersectionObserver" in window) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => navObserver.observe(s));

  // Fade sections in as they scroll into view
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  document.querySelectorAll(".section").forEach((el) => {
    el.classList.add("reveal");
    revealObserver.observe(el);
  });
}
