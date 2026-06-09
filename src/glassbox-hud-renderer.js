"use strict";

// Pet-adjacent HUD renderer: three compact cards (agent status, usage, actions).
// Input stays outside the HUD; the toolbar is reserved for distinct quick actions.

const { ipcRenderer } = require("electron");
const { formatPct, formatCountdown, usageColor } = require("./quota");
const { classifySession, agentLabelOf } = require("./agent-supervisor-semantics");

const hud = document.getElementById("hud");
const statusDot = document.getElementById("statusDot");
const statusAgent = document.getElementById("statusAgent");
const statusPhase = document.getElementById("statusPhase");
const statusDetail = document.getElementById("statusDetail");
const statusRecent = document.getElementById("statusRecent");
const statusChip = document.getElementById("statusChip");
const statusStack = document.getElementById("statusStack");
const usageMeta = document.getElementById("usageMeta");
const usageGrid = document.getElementById("usageGrid");
const toolbar = document.getElementById("toolbar");
const demoToolbar = document.getElementById("demoToolbar");
let hudInteractive = null;

const ICONS = {
  chat: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 9h8"/><path d="M8 13h5"/></svg>`,
  terminal: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3"/><path d="M13 15h4"/></svg>`,
  folder: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
  screenshot: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8V6a2 2 0 0 1 2-2h2"/><path d="M16 4h2a2 2 0 0 1 2 2v2"/><path d="M20 16v2a2 2 0 0 1-2 2h-2"/><path d="M8 20H6a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/></svg>`,
  dashboard: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v5H4z"/><path d="M4 14h7v5H4z"/><path d="M15 14h5v5h-5z"/></svg>`,
  quota: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16v-5"/><path d="M12 16V8"/><path d="M16 16v-3"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.04.04a2 2 0 1 1-2.83 2.83l-.04-.04a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 1 1-4 0v-.08a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.87.34l-.04.04a2 2 0 1 1-2.83-2.83l.04-.04A1.7 1.7 0 0 0 4.6 15 1.7 1.7 0 0 0 3.08 14H3a2 2 0 1 1 0-4h.08A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.04-.04a2 2 0 1 1 2.83-2.83l.04.04A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3.08V3a2 2 0 1 1 4 0v.08A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.87-.34l.04-.04a2 2 0 1 1 2.83 2.83l-.04.04A1.7 1.7 0 0 0 19.4 9c.25.58.83.96 1.46 1H21a2 2 0 1 1 0 4h-.08A1.7 1.7 0 0 0 19.4 15z"/></svg>`,
};

const BUTTONS = [
  { id: "chat", icon: ICONS.chat, tip: "输入 / 派活" },
  { id: "terminal", icon: ICONS.terminal, tip: "打开终端" },
  { id: "folder", icon: ICONS.folder, tip: "打开项目文件夹" },
  { id: "screenshot", icon: ICONS.screenshot, tip: "截图并复制路径" },
  { id: "quota", icon: ICONS.quota, tip: "刷新用量" },
  { id: "dashboard", icon: ICONS.dashboard, tip: "会话总览" },
  { id: "settings", icon: ICONS.settings, tip: "设置" },
];

const DEMO_BUTTONS = [
  { id: "mock-progress", label: "进展", tip: "Mock：询问项目 / Agent 会话进展" },
  { id: "mock-voice", label: "语音流", tip: "Mock：演示无 App、语音即按钮" },
  { id: "mock-orchestra", label: "编排", tip: "Mock：演示多 Agent 编排" },
  { id: "mock-show", label: "表演", tip: "Mock：演示 Clawd 动画状态机" },
];

for (const b of BUTTONS) {
  const el = document.createElement("button");
  el.className = "hud-btn";
  el.type = "button";
  el.title = b.tip;
  el.setAttribute("aria-label", b.tip);
  el.innerHTML = b.icon;
  el.addEventListener("click", () => ipcRenderer.send("glassbox-hud-action", b.id));
  toolbar.appendChild(el);
}

for (const b of DEMO_BUTTONS) {
  const el = document.createElement("button");
  el.className = "demo-action-btn";
  el.type = "button";
  el.title = b.tip;
  el.setAttribute("aria-label", b.tip);
  el.textContent = b.label;
  el.addEventListener("click", () => ipcRenderer.send("glassbox-hud-action", b.id));
  demoToolbar.appendChild(el);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function isHudSession(session) {
  return !!session && !session.headless && session.state !== "sleeping" && !session.hiddenFromHud;
}

function titleFor(session) {
  return session.displayTitle || session.sessionTitle || session.id || "";
}

function sessionLineTitle(session, sem) {
  const title = titleFor(session);
  const agent = agentLabelOf(session);
  if (title && title !== session.id) return `${agent} · ${title}`;
  return `${agent} · ${sem.phase}`;
}

function renderSessionStack(sessions) {
  if (!statusStack) return;
  if (!Array.isArray(sessions) || sessions.length === 0) {
    statusStack.innerHTML = "";
    return;
  }
  const maxVisible = sessions.length > 3 ? 2 : 3;
  const visible = sessions.slice(0, maxVisible);
  const rows = visible.map((session) => {
    const sem = classifySession(session);
    const title = sessionLineTitle(session, sem);
    return `<div class="session-line" title="${escapeHtml(`${title} · ${sem.detail} · ${sem.recent}`)}">
      <i class="session-dot ${escapeHtml(sem.dot || "quiet")}"></i>
      <span class="session-title">${escapeHtml(title)}</span>
      <span class="session-state">${escapeHtml(sem.chip || sem.kind)}</span>
    </div>`;
  });
  if (sessions.length > visible.length) {
    rows.push(`<div class="session-line" title="${escapeHtml(`还有 ${sessions.length - visible.length} 个会话`)}">
      <i class="session-dot quiet"></i>
      <span class="session-title">${escapeHtml(`还有 ${sessions.length - visible.length} 个会话`)}</span>
      <span class="session-state">more</span>
    </div>`);
  }
  statusStack.innerHTML = rows.join("");
}

function orderedHudSessions(snapshot) {
  const sessions = Array.isArray(snapshot && snapshot.sessions) ? snapshot.sessions : [];
  const byId = new Map(sessions.map((session) => [session.id, session]));
  const ids = Array.isArray(snapshot && snapshot.orderedIds)
    ? snapshot.orderedIds
    : sessions.map((session) => session.id);
  const ordered = ids.map((id) => byId.get(id)).filter(Boolean);
  const seen = new Set(ordered.map((session) => session.id));
  return ordered.concat(sessions.filter((session) => !seen.has(session.id))).filter(isHudSession);
}

function renderStatus(payload) {
  const snapshot = payload && payload.sessionSnapshot ? payload.sessionSnapshot : null;
  const sessions = orderedHudSessions(snapshot);
  const current = sessions[0] || null;
  const sem = classifySession(current);

  statusDot.className = `status-dot ${sem.dot || "quiet"}`;
  if (!current) {
    statusAgent.textContent = "Clawd";
    statusPhase.textContent = sem.phase;
    statusDetail.textContent = sem.detail;
    statusRecent.textContent = sem.recent;
    statusChip.textContent = sem.chip;
    renderSessionStack([]);
    return;
  }

  const more = sessions.length > 1 ? ` · ${sessions.length} 个会话` : "";
  const agent = `${agentLabelOf(current)}${more}`;
  const title = titleFor(current) || agent;
  statusAgent.textContent = agent;
  statusAgent.title = title;
  statusPhase.textContent = sem.phase;
  statusPhase.title = sem.phase;
  statusDetail.textContent = sem.detail;
  statusDetail.title = sem.detail;
  statusRecent.textContent = sem.recent;
  statusRecent.title = `${title} · ${sem.recent}`;
  statusChip.textContent = sem.chip;
  statusChip.title = sem.animation;
  renderSessionStack(sessions);
}

function windowByKey(windows, key) {
  return windows.find((w) => w.key === key) || null;
}

function usageWindowRowHtml(service, label, w) {
  if (!w) return "";
  const pct = Math.max(0, Math.min(100, w.utilization));
  const reset = formatCountdown(w.resetsAt, Date.now());
  const meta = `${formatPct(w.utilization)}${reset ? ` · ${reset}` : ""}`;
  return `<div class="usage-row">
    <span class="usage-name">${escapeHtml(service)}</span>
    <span class="usage-window">${escapeHtml(label)}</span>
    <span class="usage-bar ${usageColor(w.utilization)}"><i style="width:${pct}%"></i></span>
    <span class="usage-meta" title="${escapeHtml(meta)}">${escapeHtml(formatPct(w.utilization))}</span>
  </div>`;
}

function renderUsage(u) {
  if (!u || u.status === "loading") {
    usageMeta.textContent = "加载中";
    usageGrid.innerHTML = `<div class="usage-note">正在读取已登录服务...</div>`;
    return;
  }

  const rows = [];
  if (u.status === "ok" || u.status === "stale") {
    const windows = Array.isArray(u.windows) ? u.windows : [];
    rows.push(
      usageWindowRowHtml("Claude", "5 小时", windowByKey(windows, "five_hour")),
      usageWindowRowHtml("Claude", "7 天", windowByKey(windows, "seven_day")),
      usageWindowRowHtml("Claude", "Opus", windowByKey(windows, "seven_day_opus")),
      usageWindowRowHtml("Claude", "Sonnet", windowByKey(windows, "seven_day_sonnet")),
    );
    if (u.status === "stale") rows.push(`<div class="usage-note">Claude 刷新失败，显示上次数据</div>`);
  }

  const codex = u.codex || null;
  const codexWindows = Array.isArray(codex && codex.windows) ? codex.windows : [];
  if (codex && (codex.status === "ok" || codex.status === "stale") && codexWindows.length > 0) {
    for (const window of codexWindows) {
      rows.push(usageWindowRowHtml("Codex", window.label || "额度", window));
    }
    if (codex.status === "stale") rows.push(`<div class="usage-note">Codex 刷新失败，显示上次数据</div>`);
  } else if (codex && codex.status && codex.status !== "not_logged_in") {
    const codexText = (codex.message || "已登录").replace(" · 暂无本地额度百分比", "");
    const codexMeta = codex.status === "expired" ? "过期"
      : codex.status === "error" ? "失败"
      : "OK";
    rows.push(`<div class="usage-row usage-row-static">
      <span class="usage-name">Codex</span>
      <span class="usage-window">本地</span>
      <span class="usage-note">${escapeHtml(codexText)}</span>
      <span class="usage-meta">${escapeHtml(codexMeta)}</span>
    </div>`);
  }

  const filtered = rows.filter(Boolean);
  if (filtered.length > 0) {
    usageMeta.textContent = `${filtered.length} 项`;
    usageGrid.innerHTML = filtered.join("");
    return;
  }

  usageMeta.textContent = "无已登录";
  const msg = u.status === "expired" ? "Claude 登录已过期"
    : u.status === "error" ? `刷新失败：${u.message || "接口错误"}`
    : "未检测到已登录服务";
  usageGrid.innerHTML = `<div class="usage-note">${escapeHtml(msg)}</div>`;
}

function setHudInteractive(on) {
  const next = !!on;
  if (hudInteractive === next) return;
  hudInteractive = next;
  ipcRenderer.send("glassbox-hud-interactive", next);
}

function updateInteractiveFromPoint(event) {
  const target = event && event.target;
  const interactiveTarget = target && target.closest
    ? target.closest("button, [role=\"button\"], .hud-btn, .demo-action-btn")
    : null;
  setHudInteractive(!!interactiveTarget);
}

document.documentElement.addEventListener("mouseenter", () => ipcRenderer.send("glassbox-hud-hover", true));
document.documentElement.addEventListener("mousemove", updateInteractiveFromPoint, true);
document.documentElement.addEventListener("pointermove", updateInteractiveFromPoint, true);
document.documentElement.addEventListener("pointerdown", updateInteractiveFromPoint, true);
document.documentElement.addEventListener("click", () => {
  setTimeout(() => setHudInteractive(false), 180);
}, true);
document.documentElement.addEventListener("mouseleave", () => {
  setHudInteractive(false);
  ipcRenderer.send("glassbox-hud-hover", false);
});

ipcRenderer.on("glassbox-hud-show", () => hud.classList.add("show"));
ipcRenderer.on("glassbox-hud-hide", () => {
  setHudInteractive(false);
  hud.classList.remove("show");
});
ipcRenderer.on("glassbox-hud-context", (_e, payload) => renderStatus(payload));
ipcRenderer.on("glassbox-hud-usage", (_e, u) => renderUsage(u));
