"use strict";

const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const renderer = fs.readFileSync(path.join(__dirname, "..", "src", "glassbox-hud-renderer.js"), "utf8");
const main = fs.readFileSync(path.join(__dirname, "..", "src", "main.js"), "utf8");

function extractButtonBlock() {
  const match = renderer.match(/const BUTTONS = \[([\s\S]*?)\];/);
  assert.ok(match, "BUTTONS block should exist");
  return match[1];
}

function extractHudActionHandler() {
  const start = main.indexOf('ipcMain.on("glassbox-hud-action"');
  const end = main.indexOf('ipcMain.on("glassbox-hud-interactive"', start);
  assert.ok(start >= 0 && end > start, "HUD action handler should exist");
  return main.slice(start, end);
}

test("HUD action toolbar exposes distinct demo actions", () => {
  const block = extractButtonBlock();
  const ids = Array.from(block.matchAll(/id:\s*"([^"]+)"/g)).map((m) => m[1]);
  assert.deepStrictEqual(ids, [
    "chat",
    "terminal",
    "folder",
    "screenshot",
    "quota",
    "dashboard",
    "settings",
  ]);
});

test("HUD no longer duplicates LLM/TTS/ASR setting shortcuts", () => {
  const block = extractButtonBlock();
  for (const id of ["llm", "tts", "asr"]) {
    assert.doesNotMatch(block, new RegExp(`id:\\s*"${id}"`));
  }
});

test("main process handles every HUD quick action", () => {
  const handler = extractHudActionHandler();
  for (const id of ["chat", "terminal", "folder", "screenshot", "quota", "dashboard", "settings"]) {
    assert.match(handler, new RegExp(`case "${id}"`));
  }
  assert.match(main, /function openGlassboxTerminal/);
  assert.match(main, /function openGlassboxFolder/);
  assert.match(main, /function captureHudScreenshot/);
});

