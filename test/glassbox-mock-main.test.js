"use strict";

const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const main = fs.readFileSync(path.join(__dirname, "..", "src", "main.js"), "utf8");

function extractInputSubmitHandler() {
  const start = main.indexOf('ipcMain.on("glassbox-input-submit"');
  const end = main.indexOf('ipcMain.on("glassbox-input-close"', start);
  assert.ok(start >= 0 && end > start, "input submit handler should exist");
  return main.slice(start, end);
}

test("main wires glassbox mock demo playback", () => {
  assert.match(main, /require\("\.\/glassbox-mock-demo"\)/);
  assert.match(main, /function runGlassboxMockDemo/);
  assert.match(main, /function playGlassboxMockScript/);
  assert.match(main, /function glassboxMockStepHoldMs/);
  assert.match(main, /speechFloor/);
  assert.match(main, /_state\.updateSession/);
});

test("input submit routes demoAction before remote handling", () => {
  const handler = extractInputSubmitHandler();
  assert.match(handler, /demoAction/);
  assert.match(handler, /runGlassboxMockDemo\(demoAction,\s*text\)/);
  assert.match(handler, /!targetAgent && runGlassboxMockDemo\(null,\s*text\)/);
  assert.match(handler, /glassboxRemote\.dispatchToAgent/);
});
