"use client";
/* eslint-disable @next/next/no-img-element -- CMS preview supports approved external media. */

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowSquareOut } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { Check } from "@phosphor-icons/react/dist/csr/Check";
import { Copy } from "@phosphor-icons/react/dist/csr/Copy";
import { Eye } from "@phosphor-icons/react/dist/csr/Eye";
import { EyeSlash } from "@phosphor-icons/react/dist/csr/EyeSlash";
import { File } from "@phosphor-icons/react/dist/csr/File";
import { FloppyDisk } from "@phosphor-icons/react/dist/csr/FloppyDisk";
import { Gear } from "@phosphor-icons/react/dist/csr/Gear";
import { ImageSquare } from "@phosphor-icons/react/dist/csr/ImageSquare";
import { Plus } from "@phosphor-icons/react/dist/csr/Plus";
import { ShareNetwork } from "@phosphor-icons/react/dist/csr/ShareNetwork";
import { Trash } from "@phosphor-icons/react/dist/csr/Trash";
import { X } from "@phosphor-icons/react/dist/csr/X";
import {
  addContentMedia,
  createContentBlock,
  createContentPage,
  deleteContentBlock,
  deleteContentPage,
  duplicateContentPage,
  getContentBlocks,
  getContentMedia,
  getContentNavigation,
  getContentPages,
  getContentSettings,
  publishContentPage,
  saveContentBlock,
  saveContentBlockOrder,
  saveContentNavigation,
  saveContentPage,
  saveContentSetting,
  type SiteBlock,
  type SiteBlockType,
  type SiteMedia,
  type SiteNavigationItem,
  type SitePage,
  type SiteSetting,
} from "@/lib/admin-api";
import { assetPath } from "@/lib/site-utils";

type ContentStudioProps = { accessToken: string; onError: (value: string) => void; onNotice: (value: string) => void };
type StudioMode = "pages" | "media" | "navigation" | "settings";
type InspectorTab = "content" | "seo" | "social";

const blockTypes: Array<{ value: SiteBlockType; label: string }> = [
  { value: "hero", label: "Первый экран" }, { value: "text", label: "Текстовый блок" }, { value: "image", label: "Изображение" },
  { value: "cards", label: "Карточки" }, { value: "projects", label: "Проекты" }, { value: "technology", label: "Технологии" },
  { value: "faq", label: "Вопросы и ответы" }, { value: "quote", label: "Форма расчёта" }, { value: "cta", label: "Призыв к действию" },
];

const asText = (value: unknown) => typeof value === "string" ? value : "";
const contentMediaPath = (value: string) => value.startsWith("/") ? assetPath(value) : value;
const blockTypeLabel = (type: SiteBlockType) => blockTypes.find((item) => item.value === type)?.label ?? type;

function seoScore(page: SitePage) {
  return [page.page_title.length >= 35 && page.page_title.length <= 65, page.meta_description.length >= 100 && page.meta_description.length <= 170, Boolean(page.canonical_path), Boolean(page.og_title || page.page_title), Boolean(page.og_image_url || page.hero_image_url), page.is_indexable].filter(Boolean).length;
}

export function ContentStudio({ accessToken, onError, onNotice }: ContentStudioProps) {
  const [mode, setMode] = useState<StudioMode>("pages");
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("content");
  const [pages, setPages] = useState<SitePage[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("/");
  const [draft, setDraft] = useState<SitePage | null>(null);
  const [blocks, setBlocks] = useState<SiteBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [media, setMedia] = useState<SiteMedia[]>([]);
  const [navigation, setNavigation] = useState<SiteNavigationItem[]>([]);
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addType, setAddType] = useState<SiteBlockType>("text");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaAlt, setMediaAlt] = useState("");
  const [newPageOpen, setNewPageOpen] = useState(false);
  const [newPageSlug, setNewPageSlug] = useState("");
  const [newPageLabel, setNewPageLabel] = useState("");

  const selectedPage = useMemo(() => pages.find((page) => page.slug === selectedSlug) ?? pages[0] ?? null, [pages, selectedSlug]);
  const selectedBlock = useMemo(() => blocks.find((block) => block.id === selectedBlockId) ?? blocks[0] ?? null, [blocks, selectedBlockId]);
  const visibleBlocks = useMemo(() => blocks.filter((block) => block.is_visible).sort((a, b) => a.position - b.position), [blocks]);
  const heroBlock = visibleBlocks.find((block) => block.block_type === "hero") ?? visibleBlocks[0] ?? null;
  const heroData = heroBlock?.data ?? {};

  const loadPage = useCallback(async (slug: string, nextPages: SitePage[]) => {
    const candidates = nextPages;
    const page = candidates.find((item) => item.slug === slug) ?? candidates[0] ?? null;
    if (!page) return;
    const nextBlocks = await getContentBlocks(accessToken, page.slug);
    setSelectedSlug(page.slug); setDraft(page); setBlocks(nextBlocks); setSelectedBlockId(nextBlocks[0]?.id ?? "");
  }, [accessToken]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [nextPages, nextNavigation, nextSettings] = await Promise.all([getContentPages(accessToken), getContentNavigation(accessToken), getContentSettings(accessToken)]);
      setPages(nextPages); setNavigation(nextNavigation); setSettings(nextSettings);
      await loadPage(selectedSlug, nextPages);
    } catch (error) { onError(error instanceof Error ? error.message : "Не удалось загрузить CMS."); }
    finally { setLoading(false); }
  }, [accessToken, loadPage, onError, selectedSlug]);

  useEffect(() => { void loadAll(); }, [loadAll]);
  useEffect(() => { if (mode === "media" && !media.length) void getContentMedia(accessToken).then(setMedia).catch((error) => onError(error.message)); }, [accessToken, media.length, mode, onError]);

  const updateDraft = <Key extends keyof SitePage>(key: Key, value: SitePage[Key]) => setDraft((current) => current ? { ...current, [key]: value } : current);
  const updateBlock = (key: string, value: unknown) => setBlocks((current) => current.map((block) => block.id === selectedBlock?.id ? { ...block, data: { ...block.data, [key]: value } } : block));

  const savePage = async (publish = false) => {
    if (!draft) return; setSaving(true); onError("");
    try {
      const saved = await saveContentPage(accessToken, draft);
      const finalPage = publish ? await publishContentPage(accessToken, saved.slug) : saved;
      setPages((current) => current.map((page) => page.id === finalPage.id ? finalPage : page)); setDraft(finalPage);
      onNotice(publish ? "Страница опубликована и ревизия зафиксирована" : "Настройки страницы сохранены");
    } catch (error) { onError(error instanceof Error ? error.message : "Не удалось сохранить страницу."); }
    finally { setSaving(false); }
  };

  const saveBlock = async () => {
    if (!selectedBlock) return; setSaving(true);
    try {
      const saved = await saveContentBlock(accessToken, selectedBlock);
      setBlocks((current) => current.map((block) => block.id === saved.id ? saved : block)); setDraft((current) => current ? { ...current, state: "draft" } : current); onNotice("Блок сохранён");
    } catch (error) { onError(error instanceof Error ? error.message : "Не удалось сохранить блок."); }
    finally { setSaving(false); }
  };

  const addBlock = async () => {
    if (!draft) return; setSaving(true);
    try { const created = await createContentBlock(accessToken, { slug: draft.slug, blockType: addType, label: blockTypeLabel(addType) }); setBlocks((current) => [...current, created]); setDraft((current) => current ? { ...current, state: "draft" } : current); setSelectedBlockId(created.id); onNotice("Блок добавлен"); }
    catch (error) { onError(error instanceof Error ? error.message : "Не удалось добавить блок."); }
    finally { setSaving(false); }
  };

  const removeBlock = async () => {
    if (!selectedBlock || !confirm(`Удалить блок «${selectedBlock.label}»?`)) return;
    try { await deleteContentBlock(accessToken, selectedBlock.id); const next = blocks.filter((block) => block.id !== selectedBlock.id); setBlocks(next); setDraft((current) => current ? { ...current, state: "draft" } : current); setSelectedBlockId(next[0]?.id ?? ""); onNotice("Блок удалён"); }
    catch (error) { onError(error instanceof Error ? error.message : "Не удалось удалить блок."); }
  };

  const moveBlock = async (direction: -1 | 1) => {
    if (!selectedBlock || !draft) return; const ordered = [...blocks].sort((a, b) => a.position - b.position); const index = ordered.findIndex((block) => block.id === selectedBlock.id); const target = ordered[index + direction]; if (!target) return;
    const reordered = [...ordered]; reordered[index] = target; reordered[index + direction] = selectedBlock;
    try { await saveContentBlockOrder(accessToken, draft.slug, reordered.map((block) => block.id)); setBlocks(reordered.map((block, position) => ({ ...block, position: position * 10 }))); setDraft((current) => current ? { ...current, state: "draft" } : current); onNotice("Порядок блоков сохранён"); }
    catch (error) { onError(error instanceof Error ? error.message : "Не удалось изменить порядок блоков."); }
  };

  const createPage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true);
    try { const page = await createContentPage(accessToken, { slug: newPageSlug.startsWith("/") ? newPageSlug : `/${newPageSlug}/`, navigationLabel: newPageLabel }); const next = [...pages, page].sort((a, b) => a.navigation_order - b.navigation_order); setPages(next); setNewPageOpen(false); setNewPageSlug(""); setNewPageLabel(""); await loadPage(page.slug, next); onNotice("Новая страница создана как черновик"); }
    catch (error) { onError(error instanceof Error ? error.message : "Не удалось создать страницу."); }
    finally { setSaving(false); }
  };

  const addMedia = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!mediaUrl.trim()) return; try { const item = await addContentMedia(accessToken, { sourceUrl: mediaUrl.trim(), altText: mediaAlt.trim() }); setMedia((current) => [item, ...current]); setMediaUrl(""); setMediaAlt(""); onNotice("Материал добавлен в медиатеку"); } catch (error) { onError(error instanceof Error ? error.message : "Не удалось добавить материал."); } };
  const saveNavigation = async () => { try { await saveContentNavigation(accessToken, navigation); onNotice("Меню сохранено"); } catch (error) { onError(error instanceof Error ? error.message : "Не удалось сохранить меню."); } };
  const saveSetting = async (setting: SiteSetting) => { try { const next = await saveContentSetting(accessToken, setting.setting_key, setting.setting_value); setSettings((current) => current.map((item) => item.setting_key === next.setting_key ? next : item)); onNotice("Настройки сайта сохранены"); } catch (error) { onError(error instanceof Error ? error.message : "Не удалось сохранить настройки."); } };

  if (loading || !draft || !selectedPage) return <div className="content-studio-loading">Загружаем редактор сайта…</div>;
  const score = seoScore(draft);

  return <section className="cms-studio" aria-label="Редактор сайта">
    <header className="cms-topbar"><div><h1>Редактор сайта</h1><p>{draft.navigation_label} · <span>{draft.state === "published" ? "Опубликовано" : "Черновик"}</span></p></div><div className="cms-topbar-actions"><label>Страница<select value={draft.slug} onChange={(event) => void loadPage(event.target.value, pages)}>{pages.map((page) => <option value={page.slug} key={page.id}>{page.navigation_label}</option>)}</select></label><button type="button" onClick={() => setNewPageOpen(true)}><Plus size={17} />Новая страница</button><a href={assetPath(draft.slug)} target="_blank" rel="noreferrer"><ArrowSquareOut size={17} />Открыть</a></div></header>
    <nav className="cms-mode-nav" aria-label="Разделы CMS">{([['pages','Страницы'],['media','Медиа'],['navigation','Навигация'],['settings','Настройки']] as Array<[StudioMode,string]>).map(([value,label]) => <button type="button" key={value} className={mode === value ? "is-active" : ""} onClick={() => setMode(value)}>{value === "media" ? <ImageSquare size={17} /> : value === "navigation" ? <ShareNetwork size={17} /> : value === "settings" ? <Gear size={17} /> : <File size={17} />}{label}</button>)}</nav>
    {mode === "pages" ? <div className="cms-editor-grid">
      <aside className="cms-structure"><header><span>Структура страницы</span><div><select value={addType} onChange={(event) => setAddType(event.target.value as SiteBlockType)} aria-label="Тип нового блока">{blockTypes.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select><button type="button" onClick={() => void addBlock()} disabled={saving} aria-label="Добавить блок"><Plus size={17} /></button></div></header><div className="cms-block-list">{[...blocks].sort((a,b) => a.position-b.position).map((block) => <button type="button" key={block.id} className={block.id === selectedBlock?.id ? "is-selected" : ""} onClick={() => setSelectedBlockId(block.id)}><span className="cms-drag">⋮⋮</span><span><strong>{block.label}</strong><small>{blockTypeLabel(block.block_type)}</small></span>{block.is_visible ? <Eye size={17} /> : <EyeSlash size={17} />}</button>)}</div><p>Выберите блок — справа откроются его контент и параметры.</p></aside>
      <section className="cms-preview"><header><span>{selectedBlock?.label || "Предпросмотр"}</span><span>Live preview</span></header><div className="cms-preview-canvas">{heroData.imageUrl ? <img src={contentMediaPath(asText(heroData.imageUrl))} alt="" /> : null}<div><small>{asText(heroData.eyebrow) || "СтеклоСтройГрупп"}</small><h2>{asText(heroData.heading) || draft.hero_title || draft.navigation_label}</h2><p>{asText(heroData.body) || draft.hero_lead || draft.meta_description}</p>{asText(heroData.ctaLabel) ? <button type="button">{asText(heroData.ctaLabel)}</button> : null}</div></div><div className="cms-preview-sections">{visibleBlocks.filter((block) => block.id !== heroBlock?.id).map((block) => <article key={block.id}><small>{blockTypeLabel(block.block_type)}</small><strong>{asText(block.data.heading) || block.label}</strong><p>{asText(block.data.body).slice(0, 140) || "Наполните блок в инспекторе справа."}</p></article>)}</div></section>
      <aside className="cms-inspector"><nav>{([['content','Контент'],['seo','SEO'],['social','Соцсети']] as Array<[InspectorTab,string]>).map(([value,label]) => <button type="button" className={inspectorTab === value ? "is-active" : ""} onClick={() => setInspectorTab(value)} key={value}>{label}</button>)}</nav>
        {inspectorTab === "content" && selectedBlock ? <div className="cms-inspector-fields"><div className="cms-inspector-heading"><span>{blockTypeLabel(selectedBlock.block_type)}</span><div><button type="button" onClick={() => void moveBlock(-1)} aria-label="Переместить выше">↑</button><button type="button" onClick={() => void moveBlock(1)} aria-label="Переместить ниже">↓</button><button type="button" onClick={() => void removeBlock()} aria-label="Удалить блок"><Trash size={16} /></button></div></div><label><span>Название блока</span><input value={selectedBlock.label} onChange={(event) => setBlocks((current) => current.map((block) => block.id === selectedBlock.id ? { ...block, label: event.target.value } : block))} /></label><label className="cms-switch"><input type="checkbox" checked={selectedBlock.is_visible} onChange={(event) => setBlocks((current) => current.map((block) => block.id === selectedBlock.id ? { ...block, is_visible: event.target.checked } : block))} /><span>Показывать блок на сайте</span></label><label><span>Надзаголовок</span><input value={asText(selectedBlock.data.eyebrow)} onChange={(event) => updateBlock("eyebrow", event.target.value)} /></label><label><span>Заголовок</span><textarea value={asText(selectedBlock.data.heading)} rows={3} onChange={(event) => updateBlock("heading", event.target.value)} /></label><label><span>Текст</span><textarea value={asText(selectedBlock.data.body)} rows={6} onChange={(event) => updateBlock("body", event.target.value)} /></label><label><span>Текст CTA</span><input value={asText(selectedBlock.data.ctaLabel)} onChange={(event) => updateBlock("ctaLabel", event.target.value)} /></label><label><span>Ссылка CTA</span><input value={asText(selectedBlock.data.ctaHref)} onChange={(event) => updateBlock("ctaHref", event.target.value)} placeholder="/raschet/" /></label><label><span>Изображение</span><input value={asText(selectedBlock.data.imageUrl)} onChange={(event) => updateBlock("imageUrl", event.target.value)} placeholder="/assets/... или https://" /></label><label><span>Alt-текст</span><input value={asText(selectedBlock.data.imageAlt)} onChange={(event) => updateBlock("imageAlt", event.target.value)} /></label><button className="cms-save-block" type="button" onClick={() => void saveBlock()} disabled={saving}><FloppyDisk size={17} />Сохранить блок</button></div> : null}
        {inspectorTab === "seo" ? <div className="cms-inspector-fields"><div className="cms-seo-score"><span>SEO-готовность</span><strong>{score}/6</strong></div><label><span>Title</span><input value={draft.page_title} onChange={(event) => updateDraft("page_title", event.target.value)} /></label><label><span>Meta description</span><textarea rows={4} value={draft.meta_description} onChange={(event) => updateDraft("meta_description", event.target.value)} /></label><label><span>Canonical URL</span><input value={draft.canonical_path} onChange={(event) => updateDraft("canonical_path", event.target.value)} /></label><label><span>Schema</span><select value={draft.schema_type} onChange={(event) => updateDraft("schema_type", event.target.value as SitePage["schema_type"])}>{["WebPage","Service","CollectionPage","ContactPage","AboutPage"].map((value) => <option key={value}>{value}</option>)}</select></label><label><span>Robots</span><select value={draft.seo_robots} onChange={(event) => updateDraft("seo_robots", event.target.value as SitePage["seo_robots"])}><option>index,follow</option><option>noindex,follow</option><option>noindex,nofollow</option></select></label><label><span>OG title</span><input value={draft.og_title ?? ""} onChange={(event) => updateDraft("og_title", event.target.value || null)} /></label><label><span>OG description</span><textarea rows={3} value={draft.og_description ?? ""} onChange={(event) => updateDraft("og_description", event.target.value || null)} /></label><label><span>OG image</span><input value={draft.og_image_url ?? ""} onChange={(event) => updateDraft("og_image_url", event.target.value || null)} /></label><div className="cms-inline"><label><span>Sitemap priority</span><input type="number" min="0" max="1" step="0.1" value={draft.sitemap_priority} onChange={(event) => updateDraft("sitemap_priority", Number(event.target.value))} /></label><label><span>Change frequency</span><select value={draft.sitemap_change_frequency} onChange={(event) => updateDraft("sitemap_change_frequency", event.target.value as SitePage["sitemap_change_frequency"])}>{["daily","weekly","monthly","yearly"].map((value) => <option key={value}>{value}</option>)}</select></label></div><label className="cms-switch"><input type="checkbox" checked={draft.is_indexable} onChange={(event) => updateDraft("is_indexable", event.target.checked)} /><span>Разрешить индексацию</span></label></div> : null}
        {inspectorTab === "social" ? <div className="cms-inspector-fields"><label><span>Название страницы для меню</span><input value={draft.navigation_label} onChange={(event) => updateDraft("navigation_label", event.target.value)} /></label><label><span>Шаблон страницы</span><select value={draft.template_key} onChange={(event) => updateDraft("template_key", event.target.value as SitePage["template_key"])}>{["home","audience","projects","production","contacts","landing","article"].map((value) => <option key={value}>{value}</option>)}</select></label><label><span>Twitter card</span><select value={draft.twitter_card} onChange={(event) => updateDraft("twitter_card", event.target.value as SitePage["twitter_card"])}><option>summary_large_image</option><option>summary</option></select></label><label className="cms-switch"><input type="checkbox" checked={draft.is_in_navigation} onChange={(event) => updateDraft("is_in_navigation", event.target.checked)} /><span>Показывать в навигации</span></label><label><span>Порядок в меню</span><input type="number" value={draft.navigation_order} onChange={(event) => updateDraft("navigation_order", Number(event.target.value))} /></label><button className="cms-danger-button" type="button" onClick={() => void duplicateContentPage(accessToken, { sourceSlug: draft.slug, slug: `${draft.slug.replace(/\/$/, "")}-copy/`, navigationLabel: `${draft.navigation_label} — копия` }).then(async (page) => { const next = [...pages, page]; setPages(next); await loadPage(page.slug, next); onNotice("Создана копия страницы"); }).catch((error) => onError(error.message))}><Copy size={17} />Дублировать страницу</button>{draft.slug !== "/" ? <button className="cms-danger-button is-delete" type="button" onClick={() => { if (confirm(`Удалить «${draft.navigation_label}»?`)) void deleteContentPage(accessToken, draft.slug).then(async () => { const next = pages.filter((page) => page.id !== draft.id); setPages(next); await loadPage("/", next); onNotice("Страница удалена"); }).catch((error) => onError(error.message)); }}><Trash size={17} />Удалить страницу</button> : null}</div> : null}
      </aside>
    </div> : null}
    {mode === "media" ? <section className="cms-utility"><header><div><h2>Медиатека</h2><p>Добавляйте утверждённые изображения, видео и документы, затем используйте их в блоках.</p></div></header><form className="cms-media-form" onSubmit={addMedia}><label><span>URL файла</span><input value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} placeholder="/assets/... или https://" required /></label><label><span>Alt-текст</span><input value={mediaAlt} onChange={(event) => setMediaAlt(event.target.value)} placeholder="Что изображено" /></label><button type="submit"><Plus size={17} />Добавить</button></form><div className="cms-media-grid">{media.map((item) => <article key={item.id}>{item.kind === "image" ? <img src={contentMediaPath(item.source_url)} alt={item.alt_text} /> : <ImageSquare size={30} />}<strong>{item.alt_text || "Без alt-текста"}</strong><small>{item.source_url}</small></article>)}</div></section> : null}
    {mode === "navigation" ? <section className="cms-utility"><header><div><h2>Навигация</h2><p>Управляйте главным меню сайта. Порядок строк станет порядком ссылок.</p></div><button type="button" className="cms-save-block" onClick={() => void saveNavigation()}><FloppyDisk size={17} />Сохранить меню</button></header><div className="cms-navigation-list">{navigation.map((item, index) => <article key={item.id}><span>{String(index + 1).padStart(2,"0")}</span><input value={item.label} onChange={(event) => setNavigation((current) => current.map((row) => row.id === item.id ? { ...row, label: event.target.value } : row))} /><input value={item.href} onChange={(event) => setNavigation((current) => current.map((row) => row.id === item.id ? { ...row, href: event.target.value } : row))} /><label className="cms-switch"><input type="checkbox" checked={item.is_visible} onChange={(event) => setNavigation((current) => current.map((row) => row.id === item.id ? { ...row, is_visible: event.target.checked } : row))} /><span>Видно</span></label></article>)}</div></section> : null}
    {mode === "settings" ? <section className="cms-utility"><header><div><h2>Общие настройки</h2><p>Контакты, соцсети, бренд и дефолтные SEO-параметры сайта.</p></div></header><div className="cms-settings-grid">{settings.map((setting) => <article key={setting.setting_key}><h3>{({brand:"Бренд",contacts:"Контакты",social:"Соцсети",default_seo:"SEO по умолчанию",analytics:"Аналитика"} as Record<string,string>)[setting.setting_key] || setting.setting_key}</h3>{Object.entries(setting.setting_value).map(([key,value]) => <label key={key}><span>{key}</span><input value={asText(value)} onChange={(event) => setSettings((current) => current.map((row) => row.setting_key === setting.setting_key ? { ...row, setting_value: { ...row.setting_value, [key]: event.target.value } } : row))} /></label>)}<button type="button" onClick={() => void saveSetting(settings.find((item) => item.setting_key === setting.setting_key) ?? setting)}><FloppyDisk size={16} />Сохранить</button></article>)}</div></section> : null}
    <footer className="cms-publish-bar"><span><Check size={17} />Черновик можно сохранить отдельно от публикации</span><div><button type="button" onClick={() => void savePage(false)} disabled={saving}><FloppyDisk size={17} />Сохранить страницу</button><button type="button" className="is-publish" onClick={() => void savePage(true)} disabled={saving}>Опубликовать</button></div></footer>
    {newPageOpen ? <div className="cms-dialog-backdrop" onMouseDown={() => setNewPageOpen(false)} role="presentation"><form className="cms-dialog" onSubmit={createPage} onMouseDown={(event) => event.stopPropagation()}><header><div><h2>Новая страница</h2><p>Создаётся как черновик с первым экраном.</p></div><button type="button" onClick={() => setNewPageOpen(false)} aria-label="Закрыть"><X size={18} /></button></header><label><span>Название</span><input value={newPageLabel} onChange={(event) => setNewPageLabel(event.target.value)} required /></label><label><span>Адрес</span><input value={newPageSlug} onChange={(event) => setNewPageSlug(event.target.value)} placeholder="/novaya-stranitsa/" required /></label><button type="submit" className="is-publish" disabled={saving}>Создать страницу</button></form></div> : null}
  </section>;
}
