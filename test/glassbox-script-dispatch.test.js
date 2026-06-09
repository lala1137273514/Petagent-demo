"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert");
const { EventEmitter } = require("node:events");

const {
  shellQuote,
  buildRunnerCommand,
  buildTerminalAppleScript,
  dispatchScript,
} = require("../src/glassbox-script-dispatch");

function fakeChild() {
  const child = new EventEmitter();
  child.unref = () => {};
  return child;
}

describe("glassbox-script-dispatch", () => {
  it("shellQuote protects single quotes and command separators", () => {
    assert.strictEqual(shellQuote("it's; rm -rf /"), "'it'\\''s; rm -rf /'");
  });

  it("buildRunnerCommand calls one fixed runner with prompt-file, not raw prompt text", () => {
    const cmd = buildRunnerCommand(
      { agent: "codex", cwd: "/work", prompt: "ignored && bad" },
      { runnerPath: "/app/scripts/clawd-demo-dispatch.sh", promptFile: "/tmp/prompt.txt", codexBin: "/Applications/Codex.app/Contents/Resources/codex" }
    );
    assert.match(cmd, /^\/bin\/bash '/);
    assert.match(cmd, /--prompt-file '\/tmp\/prompt\.txt'/);
    assert.match(cmd, /--codex-bin '\/Applications\/Codex\.app\/Contents\/Resources\/codex'/);
    assert.doesNotMatch(cmd, /ignored && bad/);
  });

  it("buildTerminalAppleScript activates Terminal and runs the shell command", () => {
    const lines = buildTerminalAppleScript("echo hello");
    assert.deepStrictEqual(lines, [
      'tell application "Terminal"',
      "activate",
      'do script "echo hello"',
      "end tell",
    ]);
  });

  it("dispatchScript writes the prompt to a temp file and spawns osascript on macOS", () => {
    const writes = [];
    const deps = {
      os: { tmpdir: () => "/tmp" },
      path: require("node:path"),
      fs: { writeFileSync: (file, text, opts) => writes.push({ file, text, opts }) },
    };
    let spawned = null;
    const handle = dispatchScript(
      { agent: "codex", cwd: "/work", prompt: "整理项目；不要乱跑" },
      {
        deps,
        platform: "darwin",
        runnerPath: "/runner.sh",
        codexBin: "/codex",
        spawnFn: (cmd, args, opts) => {
          spawned = { cmd, args, opts };
          return fakeChild();
        },
      }
    );
    assert.strictEqual(writes.length, 1);
    assert.strictEqual(writes[0].text, "整理项目；不要乱跑");
    assert.deepStrictEqual(writes[0].opts, { mode: 0o600 });
    assert.strictEqual(spawned.cmd, "osascript");
    assert.ok(spawned.args.includes("-e"));
    assert.match(spawned.args.join("\n"), /Terminal/);
    assert.match(spawned.args.join("\n"), /--prompt-file/);
    assert.strictEqual(handle.mode, "script");
    assert.strictEqual(handle.cwd, "/work");
    assert.strictEqual(handle.agent, "codex");
  });

  it("refuses empty prompt or missing cwd", () => {
    assert.throws(
      () => dispatchScript({ agent: "codex", cwd: "/work", prompt: " " }, { runnerPath: "/runner.sh" }),
      /empty prompt/
    );
    assert.throws(
      () => dispatchScript({ agent: "codex", cwd: "", prompt: "x" }, { runnerPath: "/runner.sh" }),
      /cwd is required/
    );
  });
});
