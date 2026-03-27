const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const mobileCta = document.getElementById("mobile-cta");
const heroShell = document.getElementById("hero-shell");
const requestSection = document.getElementById("request");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    siteNav.classList.toggle("is-open");
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
    });
  });
}

document.getElementById("current-year").textContent = new Date().getFullYear();

const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealElements.forEach((element) => revealObserver.observe(element));

if (mobileCta && heroShell && requestSection) {
  const heroObserver = new IntersectionObserver(
    ([entry]) => {
      if (window.innerWidth > 860) return;
      mobileCta.classList.toggle("is-visible", !entry.isIntersecting);
    },
    { threshold: 0.18 }
  );

  const requestObserver = new IntersectionObserver(
    ([entry]) => {
      if (window.innerWidth > 860) return;
      if (entry.isIntersecting) {
        mobileCta.classList.remove("is-visible");
      }
    },
    { threshold: 0.2 }
  );

  heroObserver.observe(heroShell);
  requestObserver.observe(requestSection);
}

const requestForm = document.getElementById("request-form");
const formNote = document.getElementById("form-note");

if (requestForm && formNote) {
  requestForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(requestForm);
    const name = formData.get("name")?.toString().trim() || "";
    const phone = formData.get("phone")?.toString().trim() || "";
    const product = formData.get("product")?.toString().trim() || "";
    const message = formData.get("message")?.toString().trim() || "";

    const subject = encodeURIComponent(`Заявка на расчёт: ${product || "новый запрос"}`);
    const body = encodeURIComponent(
      [
        "Новая заявка с сайта СтеклоСтройГрупп",
        "",
        `Имя: ${name}`,
        `Телефон: ${phone}`,
        `Тип запроса: ${product || "не указано"}`,
        "",
        "Комментарий:",
        message || "не указан",
      ].join("\n")
    );

    window.location.href = `mailto:info@steklostroygroup.by?subject=${subject}&body=${body}`;
    formNote.textContent =
      "Черновик письма подготовлен. Если почтовый клиент не открылся, используйте info@steklostroygroup.by.";
    formNote.classList.add("is-success");
  });
}
