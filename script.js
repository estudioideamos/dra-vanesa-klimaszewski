document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 1.75 } });
  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".main-nav");
  const openButton = document.querySelector(".menu-toggle");
  let closeTimer;
  const closeMenu = () => {
    if (!nav?.classList.contains("is-open")) return;
    window.clearTimeout(closeTimer);
    nav.classList.remove("is-open");
    nav.classList.add("is-closing");
    openButton?.classList.remove("is-open");
    openButton?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
    closeTimer = window.setTimeout(() => { nav.classList.remove("is-closing"); document.body.style.overflow = ""; }, 580);
  };
  openButton?.addEventListener("click", () => {
    if (nav?.classList.contains("is-open")) { closeMenu(); return; }
    window.clearTimeout(closeTimer);
    nav?.classList.remove("is-closing");
    nav?.classList.add("is-open");
    openButton.classList.add("is-open");
    openButton.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
    document.body.style.overflow = "hidden";
  });
  document.querySelectorAll(".main-nav a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });
  const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 126);
  updateHeader(); window.addEventListener("scroll", updateHeader, { passive: true });
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const initSmoothWheel = () => {
    if (reducedMotion || !window.matchMedia("(pointer: fine)").matches) return;

    let currentY = window.scrollY;
    let targetY = currentY;
    let frameId = 0;
    let isAnimating = false;

    const maxScrollY = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const stopAnimation = () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
      isAnimating = false;
      currentY = window.scrollY;
      targetY = currentY;
    };

    const canScrollInside = (target, deltaY) => {
      let element = target instanceof Element ? target : null;
      while (element && element !== document.body) {
        const { overflowY } = window.getComputedStyle(element);
        const isScrollable = /auto|scroll/.test(overflowY) && element.scrollHeight > element.clientHeight + 1;
        if (isScrollable) {
          const canMoveUp = deltaY < 0 && element.scrollTop > 0;
          const canMoveDown = deltaY > 0 && element.scrollTop + element.clientHeight < element.scrollHeight - 1;
          if (canMoveUp || canMoveDown) return true;
        }
        element = element.parentElement;
      }
      return false;
    };

    const animateScroll = () => {
      const distance = targetY - currentY;
      if (Math.abs(distance) < 0.45) {
        currentY = targetY;
        window.scrollTo(0, currentY);
        frameId = 0;
        isAnimating = false;
        return;
      }

      currentY += distance * 0.085;
      window.scrollTo(0, currentY);
      frameId = window.requestAnimationFrame(animateScroll);
    };

    window.addEventListener("wheel", event => {
      if (
        event.defaultPrevented ||
        event.ctrlKey ||
        document.body.classList.contains("menu-open") ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
        canScrollInside(event.target, event.deltaY)
      ) return;

      event.preventDefault();
      if (!isAnimating) {
        currentY = window.scrollY;
        targetY = currentY;
      }

      const deltaUnit = event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 18
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? window.innerHeight
          : 1;
      const normalizedDelta = clamp(event.deltaY * deltaUnit, -180, 180);
      targetY = clamp(targetY + normalizedDelta * 0.62, 0, maxScrollY());
      isAnimating = true;
      if (!frameId) frameId = window.requestAnimationFrame(animateScroll);
    }, { passive: false });

    window.addEventListener("resize", () => {
      targetY = clamp(targetY, 0, maxScrollY());
    }, { passive: true });
    window.addEventListener("pointerdown", stopAnimation, { passive: true });
    window.addEventListener("hashchange", stopAnimation);
    document.addEventListener("keydown", event => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) stopAnimation();
    });
  };

  initSmoothWheel();
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
  if (form) {
    const submitButton = form.querySelector('button[type="submit"]');
    const status = form.querySelector("#form-status");
    const startedAt = form.querySelector('input[name="form_started_at"]');
    const resetStartedAt = () => { if (startedAt) startedAt.value = String(Date.now()); };
    const buildEmailFallback = data => {
      const subject = `Consulta web - ${data.get("Motivo")} - ${data.get("Nombre")}`;
      const body = ["Hola Dra. Vanesa, quisiera realizar una consulta.","",`Nombre: ${data.get("Nombre")}`,`Email: ${data.get("email")}`,`Teléfono: ${data.get("Teléfono")}`,`Motivo: ${data.get("Motivo")}`,"",`Mensaje: ${data.get("Mensaje")}`].join("\n");
      const recipient = data.get("Motivo") === "Recetas particulares"
        ? "pedidoreceta@gmail.com"
        : "klivanedoc@gmail.com";
      return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };
    const showStatus = (message, type, fallbackUrl = "") => {
      if (!status) return;
      status.className = `form-status ${type ? `is-${type}` : ""}`;
      status.textContent = message;
      if (fallbackUrl) {
        const link = document.createElement("a");
        link.href = fallbackUrl;
        link.textContent = "Enviar por email";
        status.append(" ", link);
      }
    };
    resetStartedAt();
    form.addEventListener("submit", async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const fallbackUrl = buildEmailFallback(data);
      const endpoint = form.dataset.endpoint;
      if (!endpoint) { window.location.href = fallbackUrl; return; }
      submitButton?.setAttribute("aria-busy", "true");
      if (submitButton) submitButton.disabled = true;
      showStatus("Enviando tu consulta…", "loading");
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 12000);
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" },
          signal: controller.signal
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.ok) throw new Error(result.message || "No se pudo enviar la consulta.");
        form.reset();
        resetStartedAt();
        showStatus(result.message || "Tu consulta fue enviada correctamente.", "success");
      } catch (error) {
        const message = error instanceof Error && error.message !== "Failed to fetch"
          ? error.message
          : "No pudimos enviar la consulta automáticamente.";
        showStatus(message, "error", fallbackUrl);
      } finally {
        window.clearTimeout(timeout);
        submitButton?.removeAttribute("aria-busy");
        if (submitButton) submitButton.disabled = false;
      }
    });
  }
});
