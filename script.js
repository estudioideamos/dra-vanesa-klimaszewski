document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } });

  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".main-nav");
  const openButton = document.querySelector(".menu-toggle");
  const closeButton = document.querySelector(".menu-close");
  const navLinks = document.querySelectorAll(".main-nav a");

  const closeMenu = () => {
    nav?.classList.remove("is-open");
    openButton?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };
  const openMenu = () => {
    nav?.classList.add("is-open");
    openButton?.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };

  openButton?.addEventListener("click", openMenu);
  closeButton?.addEventListener("click", closeMenu);
  navLinks.forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });

  const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 32);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();
});
