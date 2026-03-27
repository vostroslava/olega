"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const revealSelectors = ".reveal";
const assetBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function assetPath(path: string) {
  return `${assetBasePath}${path}`;
}

export function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileCtaVisible, setMobileCtaVisible] = useState(false);

  useEffect(() => {
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>(revealSelectors));

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

    const hero = document.getElementById("hero-shell");
    const request = document.getElementById("request");

    if (hero && request) {
      const heroObserver = new IntersectionObserver(
        ([entry]) => {
          if (window.innerWidth > 860) return;
          setMobileCtaVisible(!entry.isIntersecting);
        },
        { threshold: 0.18 }
      );

      const requestObserver = new IntersectionObserver(
        ([entry]) => {
          if (window.innerWidth > 860) return;
          if (entry.isIntersecting) setMobileCtaVisible(false);
        },
        { threshold: 0.2 }
      );

      heroObserver.observe(hero);
      requestObserver.observe(request);

      return () => {
        revealObserver.disconnect();
        heroObserver.disconnect();
        requestObserver.disconnect();
      };
    }

    return () => {
      revealObserver.disconnect();
    };
  }, []);

  return (
    <>
      <div className="page-shell">
        <header className="site-header">
          <div className="topbar">
            <div className="container topbar-inner">
              <p>Могилёв · монтаж и поставка по всей Беларуси</p>
              <div className="topbar-links">
                <a href="tel:+375333000818">+375 33 300 08 18</a>
                <a href="mailto:info@steklostroygroup.by">info@steklostroygroup.by</a>
              </div>
            </div>
          </div>

          <div className="container header-inner">
            <a className="brand" href="#top" aria-label="СтеклоСтройГрупп">
              <span className="brand-mark">ССГ</span>
              <span className="brand-copy">
                <strong>СтеклоСтройГрупп</strong>
                <small>Окна, фасады, витражи, панорамное остекление</small>
              </span>
            </a>

            <button
              className="menu-toggle"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="site-nav"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>

            <nav className={`site-nav ${menuOpen ? "is-open" : ""}`} id="site-nav">
              <a href="#products" onClick={() => setMenuOpen(false)}>
                Продукция
              </a>
              <a href="#projects" onClick={() => setMenuOpen(false)}>
                Проекты
              </a>
              <a href="#services" onClick={() => setMenuOpen(false)}>
                Как работаем
              </a>
              <a href="#partners" onClick={() => setMenuOpen(false)}>
                Партнёрам
              </a>
              <a href="#contacts" onClick={() => setMenuOpen(false)}>
                Контакты
              </a>
              <a className="nav-cta" href="#request" onClick={() => setMenuOpen(false)}>
                Получить расчёт
              </a>
            </nav>
          </div>
        </header>

        <main id="top">
          <section className="hero section">
            <div className="container">
              <div className="hero-shell reveal" id="hero-shell">
                <div className="hero-copy">
                  <p className="eyebrow">Собственное производство ПВХ и алюминиевых систем</p>
                  <h1>Фасады и окна, которые работают десятилетиями</h1>
                  <p className="hero-lead">
                    Проектируем, производим и монтируем светопрозрачные конструкции под ключ:
                    окна ПВХ, алюминиевые системы, фасады, витражи и панорамное остекление для
                    частных и коммерческих объектов.
                  </p>

                  <div className="hero-actions">
                    <a className="button button-primary" href="#request">
                      Получить расчёт
                    </a>
                    <a className="button button-secondary" href="#projects">
                      Смотреть проекты
                    </a>
                  </div>

                  <ul className="hero-proof">
                    <li>Более 15 лет опыта</li>
                    <li>Замер за 24 часа</li>
                    <li>Гарантия 3 года и сервисное сопровождение</li>
                  </ul>
                </div>

                <div className="hero-media">
                  <Image
                    src={assetPath("/assets/hero-architecture.svg")}
                    alt="Современный дом с панорамным остеклением и алюминиевыми фасадными системами"
                    fill
                    priority
                    sizes="(max-width: 860px) 100vw, 56vw"
                  />
                  <article className="hero-note">
                    <span>Производство и монтаж по всей Беларуси</span>
                    <strong>Окна, двери, витражи, фасады и зимние сады</strong>
                  </article>
                </div>
              </div>

              <div className="trust-bar reveal reveal-delay">
                <article>
                  <strong>15+ лет</strong>
                  <span>в производстве и монтаже</span>
                </article>
                <article>
                  <strong>ISO 9001:2015</strong>
                  <span>сертифицированные процессы</span>
                </article>
                <article>
                  <strong>Вся Беларусь</strong>
                  <span>доставка и выезд на объект</span>
                </article>
                <article>
                  <strong>Собственное бюро</strong>
                  <span>проектирование и нестандартные решения</span>
                </article>
              </div>
            </div>
          </section>

          <section className="section intro">
            <div className="container intro-grid">
              <div className="section-heading reveal">
                <p className="eyebrow">Что делает новый макет сильнее</p>
                <h2>Сайт выглядит как уверенный производитель, а не как шаблонный каталог</h2>
              </div>

              <div className="intro-list">
                <article className="intro-card reveal">
                  <span>01</span>
                  <h3>Один доминирующий CTA на экран</h3>
                  <p>
                    Важное действие читается сразу: расчёт, заявка, просмотр кейсов. Никакой
                    борьбы одинаково ярких кнопок.
                  </p>
                </article>
                <article className="intro-card reveal reveal-delay">
                  <span>02</span>
                  <h3>Архитектурная подача без холодного luxury</h3>
                  <p>
                    Тёплый фон, графит, бронзовый акцент, реальные объекты и факты, которые
                    понятны локальному рынку.
                  </p>
                </article>
                <article className="intro-card reveal reveal-delay-2">
                  <span>03</span>
                  <h3>Доверие строится через конкретику</h3>
                  <p>
                    Опыт, география, кейсы, сертификация, монтаж, реквизиты и понятный путь до
                    контакта.
                  </p>
                </article>
              </div>
            </div>
          </section>

          <section className="section products" id="products">
            <div className="container">
              <div className="section-heading reveal">
                <p className="eyebrow">Продукция</p>
                <h2>Ключевые направления, с которых начинается знакомство с компанией</h2>
                <p>
                  На первом уровне клиент должен быстро найти нужное направление, понять его задачу
                  и перейти к конкретной услуге.
                </p>
              </div>

              <div className="product-grid">
                {[
                  {
                    visual: "product-visual-window",
                    tag: "Частные дома и квартиры",
                    title: "Окна ПВХ",
                    text: "Энергоэффективные решения для жилых объектов с акцентом на тепло и шумоизоляцию.",
                    link: "Получить расчёт",
                    href: "#request",
                  },
                  {
                    visual: "product-visual-aluminium",
                    tag: "Для домов и коммерции",
                    title: "Алюминиевые системы",
                    text: "Современные окна и двери для проектов, где важны геометрия, долговечность и дизайн.",
                    link: "Подробнее",
                    href: "#request",
                  },
                  {
                    visual: "product-visual-facade",
                    tag: "Коммерческие объекты",
                    title: "Фасады и витражи",
                    text: "Фасадное остекление, атриумы и витражные конструкции для ТЦ, офисов и медцентров.",
                    link: "Смотреть кейсы",
                    href: "#projects",
                  },
                  {
                    visual: "product-visual-panoramic",
                    tag: "Частные и mixed-use объекты",
                    title: "Панорамное остекление",
                    text: "Большие светопрозрачные плоскости для домов, террас, салонов и входных групп.",
                    link: "Подобрать решение",
                    href: "#request",
                  },
                  {
                    visual: "product-visual-entrance",
                    tag: "Офисы и общественные пространства",
                    title: "Перегородки и входные группы",
                    text: "Потоки людей, свет и визуальная чистота в одном конструктиве.",
                    link: "Для партнёров",
                    href: "#partners",
                  },
                  {
                    visual: "product-visual-garden",
                    tag: "Нестандартные проекты",
                    title: "Зимние сады и нестандартные решения",
                    text: "Индивидуальные проекты с визуализацией, подбором систем и монтажом под объект.",
                    link: "Обсудить проект",
                    href: "#request",
                  },
                ].map((item) => (
                  <article className="product-card reveal" key={item.title}>
                    <div className={`product-visual ${item.visual}`} />
                    <p className="card-tag">{item.tag}</p>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                    <a href={item.href}>{item.link}</a>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="section standards">
            <div className="container standards-shell reveal">
              <div className="standards-copy">
                <p className="eyebrow">Почему выбирают нас</p>
                <h2>Полный цикл с инженерным контролем, а не просто изготовление конструкций</h2>
                <p>
                  Собственное производство, конструкторское бюро, монтажные бригады и сервис после
                  сдачи объекта. Именно это и должен показывать сайт.
                </p>
              </div>

              <div className="standards-grid">
                {[
                  ["Собственное производство", "Гибкость под нестандартные решения и контроль качества на каждом этапе."],
                  ["Конструкторское бюро", "Подбор узлов, проектирование, согласование и визуализация конструкций."],
                  ["Монтаж любой сложности", "От коттеджей до торговых комплексов и медицинских объектов."],
                  ["Сервис и сопровождение", "Компания остаётся на связи после сдачи объекта, а не исчезает после монтажа."],
                ].map(([title, text]) => (
                  <article key={title}>
                    <strong>{title}</strong>
                    <p>{text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="section projects" id="projects">
            <div className="container">
              <div className="section-heading reveal">
                <p className="eyebrow">Проекты</p>
                <h2>Кейсы, которые дают ощущение масштаба и реальной компетенции</h2>
                <p>
                  В макете кейсы показаны как крупные объектные карточки, а не как мелкий список
                  без визуальной ценности.
                </p>
              </div>

              <div className="project-grid">
                {[
                  {
                    image: assetPath("/assets/case-avenue.svg"),
                    alt: "ТЦ Авеню с фасадным остеклением",
                    tag: "Торговый объект",
                    title: "ТЦ «Авеню»",
                    text: "Фасадное и атриумное остекление, внутренние стеклянные двери и витражи для комплекса площадью 8 000 м².",
                    note: "Фасад, атриум, витражи",
                  },
                  {
                    image: assetPath("/assets/case-euromedica.svg"),
                    alt: "Медицинский центр с современным остеклением",
                    tag: "Медицинский комплекс",
                    title: "МЦ «Евромедика»",
                    text: "Фасады, витражи и внутренние перегородки для современного медицинского центра с акцентом на чистую геометрию и свет.",
                    note: "2019–2020 · алюминий и стекло",
                  },
                  {
                    image: assetPath("/assets/case-arbat.svg"),
                    alt: "ТЦ Арбат с витражными вставками и фасадным остеклением",
                    tag: "Коммерческая недвижимость",
                    title: "ТЦ «Арбат»",
                    text: "Современный торговый объект с фасадом, внутренними галереями и витражными вставками площадью 4 500 м².",
                    note: "Фасад, витражи, внутренние перегородки",
                  },
                ].map((item) => (
                  <article className="project-card reveal" key={item.title}>
                    <div className="project-image">
                      <Image src={item.image} alt={item.alt} fill sizes="(max-width: 1180px) 100vw, 33vw" />
                    </div>
                    <div className="project-body">
                      <p className="card-tag">{item.tag}</p>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                      <strong>{item.note}</strong>
                    </div>
                  </article>
                ))}
              </div>

              <div className="quote-banner reveal">
                <p>
                  Сайт должен показывать не просто конструкции, а масштаб объектов и то, как
                  компания справляется с ними под ключ.
                </p>
              </div>
            </div>
          </section>

          <section className="section services" id="services">
            <div className="container process-shell">
              <div className="section-heading reveal">
                <p className="eyebrow">Как работаем</p>
                <h2>Процесс должен выглядеть простым и управляемым для клиента</h2>
              </div>

              <div className="process-grid">
                {[
                  ["01", "Замер и консультация", "Выезд на объект, фиксация задачи, предварительные рекомендации и формат проекта."],
                  ["02", "Проектирование", "Подбор системы, узлов, конфигурации, согласование конструктивных решений и бюджета."],
                  ["03", "Производство", "Изготовление конструкций на собственных мощностях с контролем качества и сроков."],
                  ["04", "Монтаж и герметизация", "Соблюдение нормативов, точная установка, финишная проверка и сдача объекта."],
                  ["05", "Сервис после сдачи", "Гарантийное и постгарантийное обслуживание, чтобы эксплуатация была спокойной."],
                ].map(([step, title, text]) => (
                  <article className="process-card reveal" key={step}>
                    <span>{step}</span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="section partners" id="partners">
            <div className="container partners-shell">
              <div className="section-heading reveal">
                <p className="eyebrow">Партнёрам</p>
                <h2>Отдельная B2B-подача для застройщиков, дилеров, архитекторов и подрядчиков</h2>
                <p>
                  Этот блок нужен, чтобы сайт не говорил только с частным клиентом. Он должен быть
                  понятен и для бизнеса.
                </p>
              </div>

              <div className="partners-grid">
                {[
                  ["Гибкие условия сотрудничества", "Партнёрские цены, поддержка по расчётам и понятная коммуникация на старте проекта."],
                  ["Техническая и маркетинговая поддержка", "Помощь по конструктиву, совместный брендинг, подготовка материалов и участие в тендерах."],
                  ["Стабильные сроки производства", "Когда сайт обещает сроки, за этим должно стоять реальное производство и контроль исполнения."],
                ].map(([title, text]) => (
                  <article className="partner-card reveal" key={title}>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="section faq">
            <div className="container faq-shell">
              <div className="section-heading reveal">
                <p className="eyebrow">FAQ</p>
                <h2>В макете сразу закрываем главные вопросы до звонка менеджеру</h2>
              </div>

              <div className="faq-list">
                {[
                  [
                    "Какие объекты вы берёте в работу?",
                    "Частные дома, квартиры, офисы, торговые центры, медцентры и административные объекты.",
                  ],
                  [
                    "Вы работаете только по Могилёву?",
                    "Нет. Компания выполняет выезд, доставку и монтаж по всей Беларуси.",
                  ],
                  [
                    "Есть ли гарантия и обслуживание после монтажа?",
                    "Да. На сайте это должно быть зафиксировано как сильный доверительный аргумент: гарантия 3 года и сервисное сопровождение.",
                  ],
                  [
                    "Можно ли сделать нестандартный проект?",
                    "Да. Для этого на сайте отдельно подчёркивается наличие собственного конструкторского бюро и проектирования под объект.",
                  ],
                ].map(([question, answer], index) => (
                  <details className={`faq-item reveal ${index % 3 === 1 ? "reveal-delay" : index % 3 === 2 ? "reveal-delay-2" : ""}`} key={question}>
                    <summary>{question}</summary>
                    <p>{answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <section className="section request" id="request">
            <div className="container request-shell">
              <div className="request-copy reveal">
                <p className="eyebrow">Получить расчёт</p>
                <h2>Форма должна быть короткой, понятной и не пугать количеством полей</h2>
                <p>
                  Для первой версии достаточно получить имя, телефон, тип запроса и короткое
                  описание объекта. Всё лишнее добирает менеджер в следующем касании.
                </p>

                <div className="contact-stack">
                  <a href="tel:+375333000818">+375 33 300 08 18</a>
                  <a href="tel:+375296345086">+375 29 634 50 86</a>
                  <a href="mailto:info@steklostroygroup.by">info@steklostroygroup.by</a>
                </div>

                <div className="request-facts">
                  <span>Могилёв · пер. Коммунистический, 2, оф. 5</span>
                  <span>Замер за 24 часа</span>
                </div>
              </div>

              <RequestForm />
            </div>
          </section>
        </main>

        <footer className="site-footer" id="contacts">
          <div className="container footer-grid">
            <div>
              <p className="eyebrow">Контакты</p>
              <h2>СтеклоСтройГрупп</h2>
              <p>Производство и монтаж светопрозрачных конструкций в Республике Беларусь.</p>
            </div>

            <div className="footer-column">
              <h3>Связаться</h3>
              <a href="tel:+375333000818">+375 33 300 08 18</a>
              <a href="tel:+375296345086">+375 29 634 50 86</a>
              <a href="mailto:Steklostroi2024@mail.ru">Steklostroi2024@mail.ru</a>
              <a href="mailto:info@steklostroygroup.by">info@steklostroygroup.by</a>
              <a href="mailto:marketing@steklostroygroup.by">marketing@steklostroygroup.by</a>
            </div>

            <div className="footer-column">
              <h3>Адреса и реквизиты</h3>
              <p>Почтовый адрес: г. Могилёв, пер. Коммунистический, д. 2, оф. 5, 212030</p>
              <p>Юридический адрес: Могилёвский район, д. Брыли, ул. Юбилейная, 18, 212032</p>
              <p>Банк: ААТ «БНБ-Банк», БИК: BLNBBY2X, УНП: 791356349</p>
            </div>
          </div>

          <div className="container footer-bottom">
            <p>© {new Date().getFullYear()} ООО «СтеклоСтройГрупп». Все права защищены.</p>
          </div>
        </footer>

        <div className={`mobile-cta ${mobileCtaVisible ? "is-visible" : ""}`} id="mobile-cta">
          <a className="button button-primary button-full" href="#request">
            Получить расчёт
          </a>
        </div>
      </div>
    </>
  );
}

function RequestForm() {
  const [note, setNote] = useState(
    "После нажатия откроется почтовый клиент с готовым черновиком письма."
  );
  const [noteSuccess, setNoteSuccess] = useState(false);

  return (
    <form
      className="request-form reveal reveal-delay"
      onSubmit={(event) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
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
        setNote(
          "Черновик письма подготовлен. Если почтовый клиент не открылся, используйте info@steklostroygroup.by."
        );
        setNoteSuccess(true);
      }}
    >
      <label>
        <span>Имя</span>
        <input type="text" name="name" placeholder="Как к вам обращаться" required />
      </label>
      <label>
        <span>Телефон</span>
        <input type="tel" name="phone" placeholder="+375 __ ___ __ __" required />
      </label>
      <label>
        <span>Тип запроса</span>
        <select name="product" defaultValue="Окна ПВХ">
          <option value="Окна ПВХ">Окна ПВХ</option>
          <option value="Алюминиевые системы">Алюминиевые системы</option>
          <option value="Фасады и витражи">Фасады и витражи</option>
          <option value="Панорамное остекление">Панорамное остекление</option>
          <option value="Партнёрский запрос">Партнёрский запрос</option>
        </select>
      </label>
      <label>
        <span>Комментарий</span>
        <textarea
          name="message"
          rows={4}
          placeholder="Например: частный дом, входная группа, фасад, офис, ориентировочные сроки"
        />
      </label>

      <button className="button button-primary button-full" type="submit">
        Отправить заявку
      </button>
      <p className={`form-note ${noteSuccess ? "is-success" : ""}`}>{note}</p>
    </form>
  );
}
