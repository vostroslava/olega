"use client";
/* eslint-disable @next/next/no-img-element -- Content Studio accepts approved external media URLs. */

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowSquareOut } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { Check } from "@phosphor-icons/react/dist/csr/Check";
import { CaretRight } from "@phosphor-icons/react/dist/csr/CaretRight";
import { File } from "@phosphor-icons/react/dist/csr/File";
import { FloppyDisk } from "@phosphor-icons/react/dist/csr/FloppyDisk";
import { House } from "@phosphor-icons/react/dist/csr/House";
import { ImageSquare } from "@phosphor-icons/react/dist/csr/ImageSquare";
import { Plus } from "@phosphor-icons/react/dist/csr/Plus";
import { X } from "@phosphor-icons/react/dist/csr/X";
import {
  addContentMedia,
  getContentMedia,
  getContentPages,
  publishContentPage,
  saveContentPage,
  type SiteMedia,
  type SitePage,
  type SitePageState,
} from "@/lib/admin-api";
import { assetPath } from "@/lib/site-utils";

type ContentStudioProps = {
  accessToken: string;
  onError: (value: string) => void;
  onNotice: (value: string) => void;
};

const stateLabel: Record<SitePageState, string> = {
  draft: "Черновик",
  review: "На проверке",
  published: "Готово",
};

const schemaOptions = ["WebPage", "Service", "CollectionPage", "ContactPage", "AboutPage"] as const;

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("ru-BY", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

function seoScore(page: SitePage) {
  const checks = [
    page.page_title.length >= 35 && page.page_title.length <= 65,
    page.meta_description.length >= 100 && page.meta_description.length <= 170,
    Boolean(page.canonical_path),
    Boolean(page.hero_title),
    Boolean(page.hero_image_url),
  ];
  return checks.filter(Boolean).length;
}

function contentMediaPath(value: string) {
  return value.startsWith("/") ? assetPath(value) : value;
}

export function ContentStudio({ accessToken, onError, onNotice }: ContentStudioProps) {
  const [pages, setPages] = useState<SitePage[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("/");
  const [draft, setDraft] = useState<SitePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [media, setMedia] = useState<SiteMedia[]>([]);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaAlt, setMediaAlt] = useState("");

  const selectedPage = useMemo(() => pages.find((page) => page.slug === selectedSlug) ?? pages[0] ?? null, [pages, selectedSlug]);

  useEffect(() => {
    const load = async () => {
      try {
        const nextPages = await getContentPages(accessToken);
        setPages(nextPages);
        const current = nextPages.find((page) => page.slug === selectedSlug) ?? nextPages[0] ?? null;
        setSelectedSlug(current?.slug ?? "");
        setDraft(current);
      } catch (error) {
        onError(error instanceof Error ? error.message : "Не удалось загрузить Content Studio.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [accessToken, onError, selectedSlug]);

  const selectPage = (page: SitePage) => {
    setSelectedSlug(page.slug);
    setDraft(page);
  };

  const updateDraft = <Key extends keyof SitePage>(key: Key, value: SitePage[Key]) => {
    setDraft((current) => current ? { ...current, [key]: value } : current);
  };

  const persist = async (publish = false) => {
    if (!draft) return;
    setSaving(true);
    onError("");
    try {
      const saved = await saveContentPage(accessToken, draft);
      const next = publish ? await publishContentPage(accessToken, saved.slug) : saved;
      setPages((current) => current.map((page) => page.id === next.id ? next : page));
      setDraft(next);
      onNotice(publish ? "Опубликованная версия зафиксирована" : "Черновик сохранён");
    } catch (error) {
      onError(error instanceof Error ? error.message : "Не удалось сохранить страницу.");
    } finally {
      setSaving(false);
    }
  };

  const openMedia = async () => {
    setMediaOpen(true);
    setMediaLoading(true);
    onError("");
    try {
      setMedia(await getContentMedia(accessToken));
    } catch (error) {
      onError(error instanceof Error ? error.message : "Не удалось загрузить медиатеку.");
    } finally {
      setMediaLoading(false);
    }
  };

  const addMedia = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!mediaUrl.trim()) return;
    setMediaLoading(true);
    try {
      const created = await addContentMedia(accessToken, { sourceUrl: mediaUrl.trim(), altText: mediaAlt.trim() });
      setMedia((current) => [created, ...current]);
      setMediaUrl("");
      setMediaAlt("");
      onNotice("Материал добавлен в медиатеку");
    } catch (error) {
      onError(error instanceof Error ? error.message : "Не удалось добавить материал.");
    } finally {
      setMediaLoading(false);
    }
  };

  if (loading || !draft || !selectedPage) return <div className="content-studio-loading">Загружаем Content Studio…</div>;

  const score = seoScore(draft);
  const seoReady = score === 5;

  return (
    <section className="content-studio" aria-label="Content Studio">
      <header className="content-studio-heading">
        <div>
          <p className="admin-kicker">Content Studio</p>
          <h1>Страницы и поиск</h1>
          <p>Управление страницами сайта и SEO-настройками.</p>
        </div>
        <button className="content-media-trigger" type="button" onClick={() => void openMedia()}><ImageSquare size={18} />Медиатека</button>
      </header>

      <div className="content-studio-grid">
        <aside className="content-page-list" aria-label="Страницы сайта">
          <div className="content-list-caption"><span>Страницы сайта</span><span>SEO-готовность</span></div>
          {pages.map((page) => {
            const pageScore = seoScore(page);
            return <button className={`content-page-row ${page.slug === selectedPage.slug ? "is-selected" : ""}`} type="button" key={page.id} onClick={() => selectPage(page)}>
              <span className="content-page-icon">{page.slug === "/" ? <House size={19} /> : <File size={18} />}</span>
              <span className="content-page-copy"><strong>{page.navigation_label}</strong><small>{page.slug}</small></span>
              <span className={`content-page-seo ${pageScore === 5 ? "is-ready" : ""}`}><i />{pageScore === 5 ? "Готово" : `${pageScore}/5`}</span>
              <span className="content-page-arrow"><CaretRight size={18} /></span>
            </button>;
          })}
        </aside>

        <div className="content-page-editor">
          <section className="content-preview-panel" aria-label="Предпросмотр страницы">
            <header><span>Превью страницы</span><a href={assetPath(draft.slug)} target="_blank" rel="noreferrer" aria-label="Открыть страницу"><ArrowSquareOut size={17} /></a></header>
            <div className="content-preview-frame">
              {/* Hero media can be an external published asset, so it is intentionally rendered without Next image optimization. */}
              {draft.hero_image_url ? <img src={contentMediaPath(draft.hero_image_url)} alt="" /> : null}
              <div className="content-preview-overlay">
                <span>СтеклоСтройГрупп</span>
                <strong>{draft.hero_title || draft.navigation_label}</strong>
                <p>{draft.hero_lead || draft.meta_description}</p>
                <a href={assetPath("/raschet/")}>Рассчитать проект</a>
              </div>
            </div>
          </section>

          <form className="content-page-form" onSubmit={(event) => { event.preventDefault(); void persist(false); }}>
            <div className="content-section-title"><span>SEO-настройки страницы</span><small>{score} из 5 проверок</small></div>
            <label><span>Title <em>{draft.page_title.length}/65</em></span><input value={draft.page_title} onChange={(event) => updateDraft("page_title", event.target.value)} maxLength={160} /></label>
            <label><span>Description <em>{draft.meta_description.length}/170</em></span><textarea value={draft.meta_description} onChange={(event) => updateDraft("meta_description", event.target.value)} maxLength={320} rows={2} /></label>
            <label><span>Canonical URL</span><input value={draft.canonical_path} onChange={(event) => updateDraft("canonical_path", event.target.value)} maxLength={180} /></label>
            <div className="content-inline-fields">
              <label><span>Schema-разметка</span><select value={draft.schema_type} onChange={(event) => updateDraft("schema_type", event.target.value as SitePage["schema_type"])}>{schemaOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
              <div className={`content-schema-state ${seoReady ? "is-ready" : ""}`}><Check size={16} />{seoReady ? "Структура готова" : "Нужно доработать"}</div>
            </div>
            <details className="content-hero-details">
              <summary><span>Первый экран</span><small>Редактируемые поля</small></summary>
              <div>
                <label><span>Заголовок</span><input value={draft.hero_title ?? ""} onChange={(event) => updateDraft("hero_title", event.target.value || null)} maxLength={180} /></label>
                <label><span>Короткое описание</span><textarea value={draft.hero_lead ?? ""} onChange={(event) => updateDraft("hero_lead", event.target.value || null)} maxLength={480} rows={2} /></label>
                <label><span>Адрес главного изображения</span><input value={draft.hero_image_url ?? ""} onChange={(event) => updateDraft("hero_image_url", event.target.value || null)} placeholder="/assets/... или https://" maxLength={2000} /></label>
              </div>
            </details>
            <footer className="content-publish-bar">
              <span><i className={draft.state === "published" ? "is-published" : ""} />{stateLabel[draft.state]} · обновлено {formatUpdatedAt(draft.updated_at)}</span>
              <div><button type="submit" disabled={saving}><FloppyDisk size={18} />Сохранить черновик</button><button type="button" className="content-publish-button" onClick={() => void persist(true)} disabled={saving}>Опубликовать</button></div>
            </footer>
          </form>
        </div>
      </div>

      {mediaOpen ? <div className="content-media-backdrop" onMouseDown={() => setMediaOpen(false)} role="presentation"><section className="content-media-panel" role="dialog" aria-modal="true" aria-label="Медиатека" onMouseDown={(event) => event.stopPropagation()}><header><div><p className="admin-kicker">Content Studio</p><h2>Медиатека</h2></div><button type="button" onClick={() => setMediaOpen(false)} aria-label="Закрыть"><X size={19} /></button></header><form onSubmit={addMedia}><label><span>URL изображения, видео или документа</span><input value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} placeholder="https:// или /assets/..." required /></label><label><span>Alt-текст</span><input value={mediaAlt} onChange={(event) => setMediaAlt(event.target.value)} placeholder="Что изображено" maxLength={240} /></label><button type="submit" disabled={mediaLoading}><Plus size={18} />Добавить материал</button></form><div className="content-media-list">{mediaLoading && !media.length ? <p>Загружаем материалы…</p> : media.length ? media.map((item) => <div key={item.id}><ImageSquare size={18} /><span><strong>{item.alt_text || "Без alt-текста"}</strong><small>{item.source_url}</small></span></div>) : <p>Медиатека пока пуста. Добавьте первый материал.</p>}</div></section></div> : null}
    </section>
  );
}
