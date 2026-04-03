import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { RevealInit } from "@/components/ui/reveal-init";
import { CONTACTS } from "@/lib/site-data";

export function PrivacyPage() {
  return (
    <div className="page-shell">
      <SiteHeader />

      <main className="page-main">
        <section className="page-hero section">
          <div className="container page-hero-shell reveal">
            <div className="page-hero-copy">
              <div className="page-breadcrumbs">
                <Link href="/">Главная</Link>
                <span>/</span>
                <span>Политика конфиденциальности</span>
              </div>

              <p className="eyebrow">Юридическая информация</p>
              <h1>Политика конфиденциальности и обработки персональных данных</h1>
              <p className="hero-lead">
                Эта страница описывает, какие данные мы получаем через формы сайта, для чего они
                используются и как можно связаться по вопросам обработки персональных данных.
              </p>
            </div>

            <aside className="page-hero-panel reveal reveal-delay">
              <strong>Оператор данных</strong>
              <ul className="page-highlight-list">
                <li>ООО «СтеклоСтройГрупп»</li>
                <li>{CONTACTS.primaryEmail}</li>
                <li>{CONTACTS.postalAddress}</li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="section">
          <div className="container policy-content reveal">
            <h2>1. Какие данные мы собираем</h2>
            <p>
              Через формы сайта мы можем получать имя, телефон, адрес электронной почты, выбранный
              тип запроса и текст комментария, который пользователь оставляет добровольно.
            </p>

            <h2>2. Для чего используются данные</h2>
            <p>Персональные данные используются только для связи по заявке, расчёта и консультации.</p>
            <ul>
              <li>обратный звонок или ответ на запрос;</li>
              <li>подготовка расчёта, коммерческого предложения или консультации;</li>
              <li>уточнение параметров объекта и состава работ.</li>
            </ul>

            <h2>3. Как обрабатываются данные</h2>
            <p>
              Данные обрабатываются в объёме, необходимом для выполнения запроса пользователя. Мы
              не используем их для нерелевантной рассылки и не передаём третьим лицам без законных
              оснований.
            </p>

            <h2>4. Срок хранения</h2>
            <p>
              Данные хранятся столько, сколько требуется для обработки обращения, исполнения
              договорных обязательств и соблюдения применимого законодательства.
            </p>

            <h2>5. Права пользователя</h2>
            <p>
              Пользователь вправе запросить уточнение, изменение или удаление своих персональных
              данных, а также отозвать согласие на обработку, направив обращение по контактам ниже.
            </p>

            <h2>6. Контакты по вопросам обработки персональных данных</h2>
            <ul>
              <li>email: {CONTACTS.primaryEmail}</li>
              <li>телефон: {CONTACTS.phones[0].label}</li>
              <li>почтовый адрес: {CONTACTS.postalAddress}</li>
            </ul>
          </div>
        </section>
      </main>

      <SiteFooter />
      <RevealInit />
    </div>
  );
}
