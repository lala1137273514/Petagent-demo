"use strict";

// Mock demo scripts for booth / pitch use. These never call an LLM, never spawn
// a shell, and never read secrets. They only generate synthetic supervision
// events that are played through the real HUD / TTS / animation state machine.

const { classifySession, agentLabelOf } = require("./agent-supervisor-semantics");
const { normalize } = require("./glassbox-intent");

const ACTIONS = new Set(["progress", "voice", "orchestra", "show"]);

function routeMockCommand(rawText) {
  const text = String(rawText || "").trim();
  if (!text) return { action: "none", text: "" };
  const norm = normalize(text).toLowerCase();

  if (/(进展|进度|有哪些进程|进程如何|项目进展|项目状态|跑到哪|现在在干嘛|当前会话|session记录|session状态|好了吗)/i.test(norm)) {
    return { action: "progress", text };
  }
  if (/(语音|不用点|不要点|没有app|没app|无app|不打开app|怎么玩agent|口令|voice|免点击)/i.test(norm)) {
    return { action: "voice", text };
  }
  if (/(编排|调度|多agent|多进程|子任务|并行|派活链路|监工链路|orchestra|fanout)/i.test(norm)) {
    return { action: "orchestra", text };
  }
  if (/(表演|动画|状态机|秀一下|演示动画|来一段|show)/i.test(norm)) {
    return { action: "show", text };
  }
  return { action: "none", text };
}

function isVisibleSession(session) {
  return !!session && !session.headless && session.state !== "sleeping" && !session.hiddenFromHud;
}

function orderedVisibleSessions(snapshot) {
  const sessions = Array.isArray(snapshot && snapshot.sessions) ? snapshot.sessions : [];
  const byId = new Map(sessions.map((session) => [session.id, session]));
  const ids = Array.isArray(snapshot && snapshot.orderedIds)
    ? snapshot.orderedIds
    : sessions.map((session) => session.id);
  const ordered = ids.map((id) => byId.get(id)).filter(Boolean);
  const seen = new Set(ordered.map((session) => session.id));
  return ordered.concat(sessions.filter((session) => !seen.has(session.id))).filter(isVisibleSession);
}

function sessionTitle(session) {
  return session.displayTitle || session.sessionTitle || session.id || "未命名会话";
}

function summarizeVisibleSessions(sessions) {
  return sessions.slice(0, 3).map((session) => {
    const sem = classifySession(session);
    const agent = agentLabelOf(session);
    return `${agent}「${sessionTitle(session)}」${sem.phase}${sem.waiting ? "，需要你处理" : ""}`;
  });
}

function fallbackProgressUpdates(cwd) {
  return [
    {
      id: "mock-codex-tests",
      state: "working",
      event: "PreToolUse",
      agentId: "codex",
      sessionTitle: "Codex: 验证派活脚本",
      toolName: "Bash",
      cwd,
    },
    {
      id: "mock-claude-review",
      state: "working",
      event: "PreToolUse",
      agentId: "claude-code",
      sessionTitle: "Claude: 检查 HUD 状态",
      toolName: "Grep",
      cwd,
    },
    {
      id: "mock-confirm",
      state: "notification",
      event: "PermissionRequest",
      agentId: "codex",
      sessionTitle: "Codex: 等待权限",
      toolName: "Bash",
      cwd,
    },
  ];
}

function buildProgressDemo({ query, snapshot, cwd } = {}) {
  const sessions = orderedVisibleSessions(snapshot);
  const realLines = summarizeVisibleSessions(sessions);
  const hasReal = realLines.length > 0;
  const updates = hasReal ? [] : fallbackProgressUpdates(cwd);
  const count = hasReal ? sessions.length : updates.length;
  const report = hasReal
    ? `我看到 ${count} 个会话：${realLines.join("；")}。结论：项目还在推进，我会继续盯等待确认、报错和完成信号。`
    : "我先用 Mock 模拟读取当前项目的 Claude/Codex session 记录：Codex 在跑脚本，Claude 在查 HUD，另一个 Codex 权限在等你确认。";
  const next = hasReal
    ? "下一步建议：先处理等待确认的会话，其余继续跑。"
    : "这就是真实版要做的事：读本项目的 .claude / .codex 会话记录，再把进度讲成人话。";
  return {
    action: "progress",
    label: "项目进展",
    query,
    steps: [
      { phase: "thinking", say: "我来查一下当前有哪些 agent 会话。", holdMs: 520 },
      { phase: "running", say: report, updates, holdMs: 1500 },
      { phase: "done", say: next, holdMs: 900 },
    ],
  };
}

function buildVoiceDemo({ query, cwd } = {}) {
  return {
    action: "voice",
    label: "语音交互",
    query,
    steps: [
      {
        phase: "thinking",
        say: "Mock：你不用打开 App，也不用找按钮，直接问我“它卡在哪了”。",
        updates: [{ id: "mock-voice-route", state: "thinking", event: "UserPromptSubmit", agentId: "claude-code", sessionTitle: "语音语义路由", cwd }],
        holdMs: 900,
      },
      {
        phase: "dispatching",
        say: "我把这句话路由成监工查询，而不是派一个新任务。",
        updates: [{ id: "mock-voice-route", state: "working", event: "PreToolUse", agentId: "claude-code", sessionTitle: "语音语义路由", toolName: "RouteIntent", cwd }],
        holdMs: 1000,
      },
      {
        phase: "running",
        say: "等待的三十秒里，我会解释它在等什么、谁在执行、需不需要你确认。",
        updates: [{ id: "mock-voice-route", state: "working", event: "PreToolUse", agentId: "claude-code", sessionTitle: "语音语义路由", toolName: "ReadSessionLog", cwd }],
        holdMs: 1300,
      },
      { phase: "done", say: "这就是无 App 操作：说话就是按钮，桌宠负责翻译和监工。", holdMs: 900 },
    ],
  };
}

function buildOrchestraDemo({ query, cwd } = {}) {
  return {
    action: "orchestra",
    label: "Agent 编排",
    query,
    steps: [
      {
        phase: "dispatching",
        say: "Mock：我把一个大需求拆成三个子任务。",
        updates: [
          { id: "mock-orchestra", state: "juggling", event: "SubagentStart", agentId: "claude-code", sessionTitle: "主控：拆任务", toolName: "Task", cwd, repeat: 3 },
        ],
        holdMs: 1000,
      },
      {
        phase: "running",
        say: "Codex 跑验证，Claude 做审查，Cursor 查 UI 风险；我只给你报重点。",
        updates: [
          { id: "mock-codex-verify", state: "working", event: "PreToolUse", agentId: "codex", sessionTitle: "验证脚本", toolName: "Bash", cwd },
          { id: "mock-claude-review", state: "working", event: "PreToolUse", agentId: "claude-code", sessionTitle: "代码审查", toolName: "Grep", cwd },
          { id: "mock-cursor-ui", state: "thinking", event: "AfterAgentThought", agentId: "cursor-agent", sessionTitle: "UI 风险扫描", cwd },
        ],
        holdMs: 1600,
      },
      {
        phase: "confirming",
        say: "如果其中一个要写文件，我会把确认请求顶出来，不让它悄悄跑。",
        updates: [{ id: "mock-codex-verify", state: "notification", event: "PermissionRequest", agentId: "codex", sessionTitle: "验证脚本", toolName: "Bash", cwd }],
        holdMs: 1200,
      },
      { phase: "done", say: "编排结束：你看到的是 Agent 群，而不是一坨黑盒等待。", holdMs: 900 },
    ],
  };
}

function buildShowDemo({ query, cwd } = {}) {
  return {
    action: "show",
    label: "动画表演",
    query,
    steps: [
      { phase: "thinking", say: "Mock：思考态，先规划。", updates: [{ id: "mock-show", state: "thinking", event: "UserPromptSubmit", agentId: "claude-code", sessionTitle: "动画状态机", cwd }], holdMs: 850 },
      { phase: "running", say: "检查态，读日志和跑测试。", updates: [{ id: "mock-show", state: "working", event: "PreToolUse", agentId: "claude-code", sessionTitle: "动画状态机", toolName: "Grep", cwd }], holdMs: 850 },
      { phase: "running", say: "执行态，写入或构建。", updates: [{ id: "mock-show", state: "working", event: "PreToolUse", agentId: "claude-code", sessionTitle: "动画状态机", toolName: "Bash", cwd }], holdMs: 850 },
      { phase: "dispatching", say: "子任务态，进入编排。", updates: [{ id: "mock-show", state: "juggling", event: "SubagentStart", agentId: "claude-code", sessionTitle: "动画状态机", toolName: "Task", cwd, repeat: 2 }], holdMs: 850 },
      { phase: "capturing", say: "压缩态，清扫上下文。", updates: [{ id: "mock-show", state: "sweeping", event: "PreCompact", agentId: "claude-code", sessionTitle: "动画状态机", cwd }], holdMs: 900 },
      { phase: "error", say: "报错态会明确提醒，而不是静默失败。", updates: [{ id: "mock-show", state: "error", event: "PostToolUseFailure", agentId: "claude-code", sessionTitle: "动画状态机", toolName: "Bash", cwd }], holdMs: 950 },
      { phase: "done", say: "完成态，总结给你听。", updates: [{ id: "mock-show", state: "attention", event: "Stop", agentId: "claude-code", sessionTitle: "动画状态机", cwd }], holdMs: 900 },
    ],
  };
}

function buildMockDemo(action, opts = {}) {
  const safeAction = ACTIONS.has(action) ? action : "progress";
  if (safeAction === "voice") return buildVoiceDemo(opts);
  if (safeAction === "orchestra") return buildOrchestraDemo(opts);
  if (safeAction === "show") return buildShowDemo(opts);
  return buildProgressDemo(opts);
}

module.exports = {
  ACTIONS,
  routeMockCommand,
  orderedVisibleSessions,
  summarizeVisibleSessions,
  buildMockDemo,
};
