document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 1.75 } });
  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".main-nav");
  const openButton = document.querySelector(".menu-toggle");
  const closeMenu = () => { nav?.classList.remove("is-open"); openButton?.setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; };
  openButton?.addEventListener("click", () => { nav?.classList.add("is-open"); openButton.setAttribute("aria-expanded", "true"); document.body.style.overflow = "hidden"; });
  document.querySelector(".menu-close")?.addEventListener("click", closeMenu);
  document.querySelectorAll(".main-nav a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });
  const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 126);
  updateHeader(); window.addEventListener("scroll", updateHeader, { passive: true });
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reducedMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: .1, rootMargin: "0px 0px -30px" });
    document.querySelectorAll("[data-reveal]").forEach(element => observer.observe(element));
  } else document.querySelectorAll("[data-reveal]").forEach(element => element.classList.add("is-visible"));
  document.querySelectorAll(".faq-list details").forEach(detail => detail.addEventListener("toggle", () => { if (detail.open) document.querySelectorAll(".faq-list details").forEach(other => { if (other !== detail) other.removeAttribute("open"); }); }));
  const year = document.querySelector("#year"); if (year) year.textContent = new Date().getFullYear();
  const hero = document.querySelector(".hero");
  if (hero && !reducedMotion && window.matchMedia("(pointer:fine)").matches) {
    hero.addEventListener("pointermove", event => { const x=(event.clientX/window.innerWidth-.5)*12; const y=(event.clientY/window.innerHeight-.5)*8; document.querySelectorAll("[data-float]").forEach((item,index) => { const f=index?-.55:.7; item.style.translate=`${x*f}px ${y*f}px`; }); });
    hero.addEventListener("pointerleave", () => document.querySelectorAll("[data-float]").forEach(item => item.style.translate="0 0"));
  }
  const form = document.querySelector("#contact-form");
  form?.addEventListener("submit", event => {
    event.preventDefault(); if (!form.reportValidity()) return;
    const data = new FormData(form);
    const subject = `Consulta web - ${data.get("Motivo")} - ${data.get("Nombre")}`;
    const body = ["Hola Dra. Vanesa, quisiera realizar una consulta.","",`Nombre: ${data.get("Nombre")}`,`Email: ${data.get("email")}`,`Teléfono: ${data.get("Teléfono")}`,`Motivo: ${data.get("Motivo")}`,"",`Mensaje: ${data.get("Mensaje")}`].join("\n");
    window.location.href = `mailto:klivanedoc@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
});
