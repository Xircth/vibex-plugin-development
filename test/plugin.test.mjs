import assert from 'node:assert/strict';
import test from 'node:test';

import { ROUNDTRIP } from './fixture.mjs';

test('v4 manifest is skill-only', () => {
  assert.equal(ROUNDTRIP.manifest.manifestVersion, 4);
  assert.equal(ROUNDTRIP.manifest.apiVersion, '1.0');
  assert.equal(ROUNDTRIP.manifest.id, 'vibex.plugin-development');
  assert.equal(ROUNDTRIP.manifest.publisher, 'vibex');
  assert.equal(ROUNDTRIP.manifest.version, '1.1.0');
  assert.equal(ROUNDTRIP.manifest.entrypoints, undefined);
  const kinds = ROUNDTRIP.manifest.integrations.map((item) => item.kind);
  assert.deepEqual(kinds, ['content.skill']);
  assert.equal(ROUNDTRIP.config.devMcp, undefined);
  assert.match(ROUNDTRIP.readme, /^---\nsummary:/u);
});

test('content index lists the current contract references', () => {
  assert.equal(ROUNDTRIP.index.schemaVersion, 1);
  const paths = ROUNDTRIP.index.items.map((item) => item.path);
  assert.deepEqual(paths, [
    'contents/skills/vibex-plugin-development/SKILL.md',
    'contents/skills/vibex-plugin-development/references/contract.md',
    'contents/skills/vibex-plugin-development/references/templates.md',
    'contents/skills/vibex-plugin-development/references/runtime.md',
    'contents/skills/vibex-plugin-development/references/link.md',
  ]);
});

test('skill teaches the current Host authoring path', () => {
  assert.match(ROUNDTRIP.skill, /runStdioPluginWorker/u);
  assert.match(ROUNDTRIP.skill, /create-skill/u);
  assert.match(ROUNDTRIP.skill, /vibex plugin add --dev/u);
  assert.match(ROUNDTRIP.skill, /vibex plugin publish/u);
  assert.match(ROUNDTRIP.skill, /editor-tab/u);
  assert.match(ROUNDTRIP.skill, /artifact\.editor/u);
  assert.match(ROUNDTRIP.skill, /surface\.createSession/u);
  assert.match(ROUNDTRIP.skill, /test --host/u);
  assert.doesNotMatch(ROUNDTRIP.skill, /VIBEX_PLUGIN_DEV_GRANT/u);
  assert.doesNotMatch(ROUNDTRIP.skill, /plugin_dev_link_request/u);
  assert.doesNotMatch(ROUNDTRIP.skill, /pending_confirmation/u);
  assert.doesNotMatch(ROUNDTRIP.skill, /format=javascript-esm/u);
  assert.doesNotMatch(ROUNDTRIP.skill, /--template agent/u);
  assert.doesNotMatch(ROUNDTRIP.skill, /开发 MCP/u);
});

test('readme points authors at the product CLI link path', () => {
  assert.match(ROUNDTRIP.readme, /vibex plugin add --dev/u);
  assert.match(ROUNDTRIP.readme, /vibex plugin publish/u);
  assert.match(ROUNDTRIP.readme, /vibex-plugin toolchain/u);
  assert.match(ROUNDTRIP.readme, /官方分类/u);
  assert.doesNotMatch(ROUNDTRIP.readme, /开发 MCP/u);
  assert.doesNotMatch(ROUNDTRIP.readme, /不能当第三方快照卸掉/u);
});
