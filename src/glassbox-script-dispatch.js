"use strict";

// Demo dispatch backend: open a visible terminal and run one controlled script.
//
// The LLM never chooses a shell command. It only produces the semantic decision
// and refined prompt; this module writes that prompt to a private temp file and
// asks Terminal to run the bundled runner with fixed flags.

function shellQuote(value) {
  return `'${String(value == null ? "" : value).replace(/'/g, "'\\''")}'`;
}

function appleScriptString(value) {
  return JSON.stringify(String(value == null ? "" : value));
}

function defaultSpawn(cmd, args, spawnOpts) {
  return require("node:child_process").spawn(cmd, args, spawnOpts);
}

function defaultDeps() {
  const fs = require("node:fs");
  const os = require("node:os");
  const path = require("node:path");
  return { fs, os, path };
}

function writePromptFile(prompt, opts = {}) {
  const deps = opts.deps || defaultDeps();
  const tmp = opts.tmpdir || deps.os.tmpdir();
  const name = `clawd-dispatch-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`;
  const file = deps.path.join(tmp, name);
  deps.fs.writeFileSync(file, String(prompt || ""), { mode: 0o600 });
  return file;
}

function buildRunnerCommand(plan = {}, opts = {}) {
  const promptFile = opts.promptFile || "";
  const runnerPath = opts.runnerPath || "";
  const cwd = plan.cwd || "";
  const agent = plan.agent || opts.defaultAgent || "codex";
  if (!runnerPath) throw new Error("glassbox-script-dispatch: runnerPath is required");
  if (!promptFile) throw new Error("glassbox-script-dispatch: promptFile is required");
  const parts = [
    "/bin/bash",
    shellQuote(runnerPath),
    "--cwd", shellQuote(cwd),
    "--agent", shellQuote(agent),
    "--prompt-file", shellQuote(promptFile),
  ];
  if (opts.codexBin) parts.push("--codex-bin", shellQuote(opts.codexBin));
  if (opts.claudeBin) parts.push("--claude-bin", shellQuote(opts.claudeBin));
  return parts.join(" ");
}

function buildTerminalAppleScript(shellCommand) {
  const cmd = appleScriptString(shellCommand);
  return [
    'tell application "Terminal"',
    "activate",
    `do script ${cmd}`,
    "end tell",
  ];
}

function dispatchScript(plan = {}, opts = {}) {
  const prompt = String(plan.prompt || "").trim();
  if (!prompt) {
    throw new Error("glassbox-script-dispatch: empty prompt - refusing blind dispatch");
  }
  if (!plan.cwd) {
    throw new Error("glassbox-script-dispatch: cwd is required");
  }

  const promptFile = writePromptFile(prompt, opts);
  const shellCommand = buildRunnerCommand(plan, { ...opts, promptFile });
  const spawnFn = opts.spawnFn || defaultSpawn;
  let command;
  let args;
  let spawnOpts;

  if ((opts.platform || process.platform) === "darwin") {
    command = "osascript";
    args = buildTerminalAppleScript(shellCommand).flatMap((line) => ["-e", line]);
    spawnOpts = { windowsHide: true, stdio: "ignore", detached: false };
  } else {
    command = "/bin/bash";
    args = [opts.runnerPath, "--cwd", plan.cwd, "--agent", plan.agent || "codex", "--prompt-file", promptFile];
    if (opts.codexBin) args.push("--codex-bin", opts.codexBin);
    if (opts.claudeBin) args.push("--claude-bin", opts.claudeBin);
    spawnOpts = { windowsHide: true, stdio: "ignore", detached: false };
  }

  const child = spawnFn(command, args, spawnOpts);
  const swallow = () => {};
  if (child && typeof child.on === "function") child.on("error", swallow);
  if (child && typeof child.unref === "function") child.unref();

  return {
    command,
    args,
    cwd: plan.cwd,
    mode: "script",
    sessionId: plan.sessionId || null,
    agent: plan.agent || "codex",
    promptFile,
    child,
    onError(cb) {
      if (child && typeof child.on === "function") child.on("error", cb);
    },
  };
}

module.exports = {
  shellQuote,
  appleScriptString,
  writePromptFile,
  buildRunnerCommand,
  buildTerminalAppleScript,
  dispatchScript,
};
