"use strict";

const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "..", "src", "glassbox-input.html"), "utf8");

test("glassbox input exposes direct Claude/Codex send buttons", () => {
  assert.match(html, /id="sendClaude"/);
  assert.match(html, /id="sendCodex"/);
  assert.match(html, /submit\("claude"\)/);
  assert.match(html, /submit\("codex"\)/);
});

test("glassbox input exposes demo mock buttons", () => {
  for (const id of ["mockProgress", "mockVoice", "mockOrchestra", "mockShow"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /submitDemo\("progress"/);
  assert.match(html, /submitDemo\("voice"/);
  assert.match(html, /submitDemo\("orchestra"/);
  assert.match(html, /submitDemo\("show"/);
});

test("glassbox input sends targetAgent in the submit payload", () => {
  assert.match(html, /targetAgent:\s*targetAgent\s*\|\|\s*""/);
  assert.match(html, /glassbox-input-submit/);
});

test("glassbox input sends demoAction in mock payloads", () => {
  assert.match(html, /demoAction/);
  assert.match(html, /glassbox-input-submit",\s*\{\s*text:\s*t,\s*demoAction\s*\}/);
});
