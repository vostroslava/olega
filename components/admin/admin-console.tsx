"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowClockwise } from "@phosphor-icons/react/dist/csr/ArrowClockwise";
import { ArrowSquareOut } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { Check } from "@phosphor-icons/react/dist/csr/Check";
import { FileText } from "@phosphor-icons/react/dist/csr/FileText";
import { Funnel } from "@phosphor-icons/react/dist/csr/Funnel";
import { LockKey } from "@phosphor-icons/react/dist/csr/LockKey";
import { SignOut } from "@phosphor-icons/react/dist/csr/SignOut";
import { User } from "@phosphor-icons/react/dist/csr/User";
import { UserPlus } from "@phosphor-icons/react/dist/csr/UserPlus";
import { UsersThree } from "@phosphor-icons/react/dist/csr/UsersThree";
import { X } from "@phosphor-icons/react/dist/csr/X";
import {
  bootstrapAdmin,
  createAdminStaff,
  getAdminFileUrl,
  getAdminLead,
  getAdminLeads,
  getAdminMe,
  getAdminStaff,
  leadStatuses,
  type LeadDetail,
  type LeadStatus,
  type LeadSummary,
  type StaffMember,
  updateAdminLeadStatus,
} from "@/lib/admin-api";
import { adminAuthConfigured, getAdminAuthClient } from "@/lib/admin-auth";

const statusLabels: Record<LeadStatus, string> = {
  new: "Новая",
  reviewed: "Просмотрена",
  contacted: "Связались",
  qualified: "В работе",
  won: "Сделка",
  lost: "Не подошло",
  spam: "Спам",
};

function formatDate(value: string, includeTime = true) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("ru-BY", {
    day: "2-digit",
    month: "short",
    hour: includeTime ? "2-digit" : undefined,
    minute: includeTime ? "2-digit" : undefined,
  }).format(date);
}

function formatSize(value: number) {
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} КБ`;
  return `${(value / (1024 * 1024)).toFixed(1)} МБ`;
}

function eventLabel(event: LeadDetail["lead_events"][number]) {
  if (event.kind === "created") return "Заявка зафиксирована";
  if (event.kind === "status_changed") {
    return `Статус: ${event.from_status ? statusLabels[event.from_status] : "—"} → ${event.to_status ? statusLabels[event.to_status] : "—"}`;
  }
  if (event.kind === "notification_sent") return "Уведомление отправлено";
  return "Уведомление не отправлено";
}

function EmptyInspector() {
  return (
    <div className="admin-empty-inspector">
      <span className="admin-kicker">01 / Входящие</span>
      <h2>Выберите заявку</h2>
      <p>Здесь появится точный контекст клиента, материалы и история работы команды.</p>
    </div>
  );
}

export function AdminConsole() {
  const [loginMode, setLoginMode] = useState<"admin" | "staff">("admin");
  const [login, setLogin] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const [leads, setLeads] = useState<LeadSummary[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedLead, setSelectedLead] = useState<LeadDetail | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);
  const [teamOpen, setTeamOpen] = useState(false);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<StaffMember[]>([]);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPassword, setNewStaffPassword] = useState("");

  const loadLeads = useCallback(async (token: string, selectedStatus: LeadStatus | "all") => {
    setItemsLoading(true);
    setError("");
    try {
      const result = await getAdminLeads(token, selectedStatus);
      setLeads(result.leads);
      setSelectedId((current) => current && result.leads.some((lead) => lead.id === current) ? current : (result.leads[0]?.id ?? ""));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить заявки.");
    } finally {
      setItemsLoading(false);
    }
  }, []);

  const openLead = useCallback(async (token: string, leadId: string) => {
    setSelectedId(leadId);
    setSelectedLead(null);
    setError("");
    try {
      setSelectedLead(await getAdminLead(token, leadId));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Не удалось открыть заявку.");
    }
  }, []);

  useEffect(() => {
    if (!adminAuthConfigured) {
      setAuthLoading(false);
      return;
    }

    const client = getAdminAuthClient();
    const start = async () => {
      const { data } = await client.auth.getSession();
      setAccessToken(data.session?.access_token ?? "");
      setAccountEmail(data.session?.user.email ?? "");
      setAuthLoading(false);
    };
    void start();

    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      setAccessToken(session?.access_token ?? "");
      setAccountEmail(session?.user.email ?? "");
      setAuthLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (accessToken) void loadLeads(accessToken, filter);
  }, [accessToken, filter, loadLeads]);

  useEffect(() => {
    if (!accessToken) {
      setCurrentStaff(null);
      return;
    }
    const loadProfile = async () => {
      try {
        setCurrentStaff(await getAdminMe(accessToken));
      } catch (profileError) {
        setError(profileError instanceof Error ? profileError.message : "Не удалось проверить права доступа.");
      }
    };
    void loadProfile();
  }, [accessToken]);

  useEffect(() => {
    if (accessToken && selectedId) void openLead(accessToken, selectedId);
  }, [accessToken, openLead, selectedId]);

  const visibleLabel = useMemo(() => filter === "all" ? "Все заявки" : statusLabels[filter], [filter]);

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if ((loginMode === "admin" ? !login.trim() : !email.trim()) || !password) return;
    setLoginLoading(true);
    setError("");
    try {
      const authEmail = loginMode === "admin"
        ? await bootstrapAdmin(login.trim(), password)
        : email.trim().toLowerCase();
      const { error: signInError } = await getAdminAuthClient().auth.signInWithPassword({
        email: authEmail,
        password,
      });
      if (signInError) throw signInError;
      setPassword("");
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : "Не удалось войти.");
    } finally {
      setLoginLoading(false);
    }
  };

  const signOut = async () => {
    await getAdminAuthClient().auth.signOut();
    setLeads([]);
    setSelectedId("");
    setSelectedLead(null);
    setNotice("");
    setCurrentStaff(null);
    setTeamOpen(false);
  };

  const openTeam = async () => {
    if (!accessToken || currentStaff?.role !== "admin") return;
    setTeamOpen(true);
    setTeamLoading(true);
    setError("");
    try {
      setTeamMembers(await getAdminStaff(accessToken));
    } catch (teamError) {
      setError(teamError instanceof Error ? teamError.message : "Не удалось загрузить команду.");
    } finally {
      setTeamLoading(false);
    }
  };

  const addStaffMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) return;
    setTeamLoading(true);
    setError("");
    try {
      const created = await createAdminStaff(accessToken, {
        fullName: newStaffName.trim(),
        email: newStaffEmail.trim(),
        password: newStaffPassword,
      });
      setTeamMembers((current) => [...current, created]);
      setNewStaffName("");
      setNewStaffEmail("");
      setNewStaffPassword("");
      setNotice("Сотрудник добавлен");
    } catch (staffError) {
      setError(staffError instanceof Error ? staffError.message : "Не удалось добавить сотрудника.");
    } finally {
      setTeamLoading(false);
    }
  };

  const changeStatus = async (status: LeadStatus) => {
    if (!accessToken || !selectedLead || selectedLead.status === status) return;
    setSavingStatus(true);
    setError("");
    try {
      const updated = await updateAdminLeadStatus(accessToken, selectedLead.id, status);
      setSelectedLead(updated);
      setLeads((current) => current.map((lead) => lead.id === updated.id ? { ...lead, ...updated } : lead));
      setNotice("Статус сохранён");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Не удалось обновить статус.");
    } finally {
      setSavingStatus(false);
    }
  };

  const openFile = async (fileId: string) => {
    if (!accessToken || !selectedLead) return;
    setError("");
    try {
      const url = await getAdminFileUrl(accessToken, selectedLead.id, fileId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (fileError) {
      setError(fileError instanceof Error ? fileError.message : "Не удалось открыть файл.");
    }
  };

  if (!adminAuthConfigured) {
    return (
      <main className="admin-login-shell">
        <section className="admin-auth-panel admin-auth-panel--setup">
          <span className="admin-brand-mark" aria-hidden="true" />
          <span className="admin-kicker">Защищённый контур</span>
          <h1>Админка ещё не подключена</h1>
          <p>Публичные ключи авторизации не добавлены в сборку. Заявки остаются закрытыми: браузер не получает доступа к базе напрямую.</p>
          <code>NEXT_PUBLIC_SUPABASE_URL · NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>
        </section>
      </main>
    );
  }

  if (authLoading) {
    return <main className="admin-login-shell"><p className="admin-loading-copy">Проверяем защищённую сессию…</p></main>;
  }

  if (!accessToken) {
    return (
      <main className="admin-login-shell">
        <form className="admin-auth-panel" onSubmit={signIn}>
          <span className="admin-brand-mark" aria-hidden="true" />
          <span className="admin-kicker">СтеклоСтройГрупп / CRM</span>
          <h1>{loginMode === "admin" ? "Вход администратора" : "Вход сотрудника"}</h1>
          <p>{loginMode === "admin" ? "Управление заявками и командой." : "Используйте доступ, который выдал администратор."}</p>
          <div className="admin-login-mode" role="group" aria-label="Тип входа">
            <button className={loginMode === "admin" ? "is-active" : ""} type="button" onClick={() => setLoginMode("admin")}>Администратор</button>
            <button className={loginMode === "staff" ? "is-active" : ""} type="button" onClick={() => setLoginMode("staff")}>Сотрудник</button>
          </div>
          {loginMode === "admin" ? <label><span>Логин</span><input value={login} onChange={(event) => setLogin(event.target.value)} autoComplete="username" required /></label> : <label><span>Почта</span><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required /></label>}
          <label>
            <span>Пароль</span>
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required />
          </label>
          {error ? <p className="admin-message admin-message--error"><X size={15} />{error}</p> : null}
          <button className="admin-primary-button" type="submit" disabled={loginLoading}>
            <LockKey size={18} />{loginLoading ? "Проверяем…" : "Войти"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <aside className="admin-rail">
        <Link className="admin-logo" href="/" aria-label="На сайт СтеклоСтройГрупп">
          <span className="admin-brand-mark" aria-hidden="true" />
          <span>СтеклоСтройГрупп</span>
        </Link>
        <div className="admin-rail-label">Операции</div>
        <a className="admin-rail-link admin-rail-link--active" href="#leads"><FileText size={18} />Заявки</a>
        {currentStaff?.role === "admin" ? <button className="admin-rail-link admin-rail-button" type="button" onClick={() => void openTeam()}><UsersThree size={18} />Команда</button> : null}
        <div className="admin-rail-foot">
          <span><User size={16} />{currentStaff?.full_name || (currentStaff?.role === "admin" ? "Администратор" : accountEmail)}</span>
          <button type="button" onClick={signOut}><SignOut size={17} />Выйти</button>
        </div>
      </aside>

      <section className="admin-workspace" id="leads">
        <header className="admin-topbar">
          <div>
            <span className="admin-kicker">Контур заявок</span>
            <h1>Входящие</h1>
          </div>
          <div className="admin-topbar-actions">
            {notice ? <span className="admin-message admin-message--success"><Check size={15} />{notice}</span> : null}
            <button className="admin-icon-button" type="button" onClick={() => void loadLeads(accessToken, filter)} disabled={itemsLoading} aria-label="Обновить заявки"><ArrowClockwise size={18} /></button>
          </div>
        </header>

        <div className="admin-content-grid">
          <section className="admin-list-pane">
            <div className="admin-list-toolbar">
              <span>{visibleLabel}</span>
              <label className="admin-filter"><Funnel size={15} /><select value={filter} onChange={(event) => setFilter(event.target.value as LeadStatus | "all")} aria-label="Фильтр статуса"><option value="all">Все</option>{leadStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label>
            </div>
            <div className="admin-list-head"><span>Клиент</span><span>Объект</span><span>Статус</span></div>
            <div className="admin-lead-list">
              {itemsLoading && leads.length === 0 ? <p className="admin-list-empty">Загружаем контур…</p> : null}
              {!itemsLoading && leads.length === 0 ? <p className="admin-list-empty">Заявок пока нет. Новые обращения с сайта появятся здесь.</p> : null}
              {leads.map((lead) => (
                <button className={`admin-lead-row ${lead.id === selectedId ? "is-selected" : ""}`} type="button" key={lead.id} onClick={() => setSelectedId(lead.id)}>
                  <span><strong>{lead.name}</strong><small>{formatDate(lead.created_at)}</small></span>
                  <span>{lead.object_type || "Не указан"}</span>
                  <span className={`admin-status admin-status--${lead.status}`}>{statusLabels[lead.status]}</span>
                </button>
              ))}
            </div>
          </section>

          <aside className="admin-inspector">
            {selectedLead ? (
              <div className="admin-inspector-inner">
                <div className="admin-inspector-heading"><div><span className="admin-kicker">Заявка / {selectedLead.id.slice(0, 8)}</span><h2>{selectedLead.name}</h2><p>{formatDate(selectedLead.created_at)} · {selectedLead.source}</p></div><span className={`admin-status admin-status--${selectedLead.status}`}>{statusLabels[selectedLead.status]}</span></div>
                <section className="admin-detail-section"><span className="admin-section-label">Статус работы</span><div className="admin-status-control"><select value={selectedLead.status} onChange={(event) => void changeStatus(event.target.value as LeadStatus)} disabled={savingStatus}>{leadStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select>{savingStatus ? <span>Сохраняем…</span> : null}</div></section>
                <section className="admin-detail-section admin-contact-grid"><a href={`tel:${selectedLead.phone}`}>{selectedLead.phone}</a>{selectedLead.email ? <a href={`mailto:${selectedLead.email}`}>{selectedLead.email}</a> : <span>Почта не указана</span>}</section>
                <section className="admin-detail-section"><span className="admin-section-label">Задача клиента</span><dl className="admin-facts"><div><dt>Объект</dt><dd>{selectedLead.object_type || "Не указан"}</dd></div><div><dt>Материал</dt><dd>{selectedLead.material || "Нужна консультация"}</dd></div>{selectedLead.size_notes ? <div><dt>Размеры</dt><dd>{selectedLead.size_notes}</dd></div> : null}</dl>{selectedLead.message ? <p className="admin-message-copy">{selectedLead.message}</p> : null}</section>
                <section className="admin-detail-section"><span className="admin-section-label">Материалы</span>{selectedLead.lead_files.length ? <div className="admin-file-list">{selectedLead.lead_files.map((file) => <button type="button" key={file.id} onClick={() => void openFile(file.id)}><FileText size={18} /><span><strong>{file.original_name}</strong><small>{formatSize(file.byte_size)} · {file.mime_type}</small></span><ArrowSquareOut size={16} /></button>)}</div> : <p className="admin-muted">Клиент не приложил файл.</p>}</section>
                {selectedLead.lead_ai_reviews.length ? <section className="admin-detail-section"><span className="admin-section-label">Разбор AI</span><p className="admin-message-copy">{selectedLead.lead_ai_reviews[0].summary}</p></section> : null}
                <section className="admin-detail-section"><span className="admin-section-label">Журнал</span><ol className="admin-timeline">{selectedLead.lead_events.map((event) => <li key={event.id}><span /><div><strong>{eventLabel(event)}</strong><small>{formatDate(event.created_at)}</small></div></li>)}</ol></section>
              </div>
            ) : <EmptyInspector />}
          </aside>
        </div>
        {error ? <div className="admin-toast admin-message admin-message--error"><X size={15} />{error}</div> : null}
        {teamOpen && currentStaff?.role === "admin" ? (
          <div className="admin-team-backdrop" role="presentation" onMouseDown={() => setTeamOpen(false)}>
            <section className="admin-team-panel" role="dialog" aria-modal="true" aria-label="Управление командой" onMouseDown={(event) => event.stopPropagation()}>
              <header><div><span className="admin-kicker">Полный доступ</span><h2>Команда</h2></div><button type="button" onClick={() => setTeamOpen(false)} aria-label="Закрыть"><X size={19} /></button></header>
              <form onSubmit={addStaffMember}>
                <label><span>Имя сотрудника</span><input value={newStaffName} onChange={(event) => setNewStaffName(event.target.value)} placeholder="Иван Петров" /></label>
                <label><span>Рабочая почта</span><input value={newStaffEmail} onChange={(event) => setNewStaffEmail(event.target.value)} type="email" placeholder="team@company.by" required /></label>
                <label><span>Временный пароль</span><input value={newStaffPassword} onChange={(event) => setNewStaffPassword(event.target.value)} type="password" minLength={10} required /></label>
                <button className="admin-primary-button" type="submit" disabled={teamLoading}><UserPlus size={18} />Добавить сотрудника</button>
              </form>
              <div className="admin-team-list"><span className="admin-section-label">Доступы</span>{teamLoading && !teamMembers.length ? <p className="admin-muted">Загружаем команду…</p> : teamMembers.map((member) => <div key={member.id}><span><strong>{member.full_name || (member.role === "admin" ? "Администратор" : member.email)}</strong><small>{member.role === "admin" ? "Системный доступ без email-входа" : member.email}</small></span><span className={`admin-status admin-status--${member.role === "admin" ? "won" : "qualified"}`}>{member.role === "admin" ? "Администратор" : "Сотрудник"}</span></div>)}</div>
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}
