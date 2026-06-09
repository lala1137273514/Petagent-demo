"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert");

const {
  routeMockCommand,
  orderedVisibleSessions,
  summarizeVisibleSessions,
  buildMockDemo,
} = require("../src/glassbox-mock-demo");

describe("glassbox-mock-demo routing", () => {
  it("routes progress, voice, orchestra, and animation mock commands", () => {
    assert.strictEqual(routeMockCommand("这个项目进展如何？").action, "progress");
    assert.strictEqual(routeMockCommand("不用打开 App 怎么玩 Agent？").action, "voice");
    assert.strictEqual(routeMockCommand("演示一下多 Agent 编排").action, "orchestra");
    assert.strictEqual(routeMockCommand("来一段动画状态机表演").action, "show");
    assert.strictEqual(routeMockCommand("帮我写 README").action, "none");
  });
});

describe("glassbox-mock-demo progress script", () => {
  it("summarizes visible real sessions when a snapshot is available", () => {
    const snapshot = {
      orderedIds: ["s2", "s1"],
      sessions: [
        {
          id: "s1",
          agentId: "claude-code",
          state: "working",
          badge: "running",
          displayTitle: "HUD 修复",
          currentTool: "Grep",
          lastEvent: { rawEvent: "PreToolUse" },
        },
        {
          id: "s2",
          agentId: "codex",
          state: "idle",
          badge: "done",
          displayTitle: "测试",
          lastEvent: { rawEvent: "Stop" },
        },
        { id: "hidden", headless: true, state: "working" },
      ],
    };

    const visible = orderedVisibleSessions(snapshot);
    assert.deepStrictEqual(visible.map((s) => s.id), ["s2", "s1"]);
    assert.ok(summarizeVisibleSessions(visible).some((line) => /Codex/.test(line)));

    const script = buildMockDemo("progress", { snapshot, cwd: "/demo", query: "进展如何" });
    assert.strictEqual(script.action, "progress");
    assert.strictEqual(script.steps[1].updates.length, 0);
    assert.match(script.steps[1].say, /我看到 2 个会话/);
  });

  it("falls back to synthetic sessions when there is no snapshot", () => {
    const script = buildMockDemo("progress", { snapshot: { sessions: [] }, cwd: "/demo" });
    assert.ok(script.steps[1].updates.length >= 2);
    assert.match(script.steps[1].say, /Mock 模拟读取/);
    assert.ok(script.steps[2].say.includes(".claude"));
    assert.ok(script.steps[2].say.includes(".codex"));
  });
});

describe("glassbox-mock-demo scripts", () => {
  it("all scripts contain playable phases and positive holds", () => {
    for (const action of ["progress", "voice", "orchestra", "show"]) {
      const script = buildMockDemo(action, { cwd: "/demo" });
      assert.strictEqual(script.action, action);
      assert.ok(script.steps.length >= 3, action);
      for (const step of script.steps) {
        assert.strictEqual(typeof step.phase, "string");
        assert.ok(Number.isFinite(step.holdMs) && step.holdMs > 0);
      }
    }
  });
});
