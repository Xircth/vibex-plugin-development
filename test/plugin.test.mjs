import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { ROUNDTRIP } from './fixture.mjs';

test('v4 manifest, skill, and gated host-family MCP', () => {
  assert.equal(ROUNDTRIP.manifest.manifestVersion, 4);
  assert.equal(ROUNDTRIP.manifest.apiVersion, '1.0');
  assert.equal(ROUNDTRIP.manifest.id, 'vibex.plugin-development');
  assert.equal(ROUNDTRIP.manifest.publisher, 'vibex');
  assert.equal(ROUNDTRIP.manifest.entrypoints, undefined);
  const kinds = ROUNDTRIP.manifest.integrations.map((item) => item.kind);
  assert.deepEqual(kinds.sort(), ['content.mcp', 'content.skill']);
  assert.equal(ROUNDTRIP.config.devMcp, false);
  assert.match(ROUNDTRIP.readme, /^---\nsummary:/u);
  assert.match(ROUNDTRIP.skill, /runStdioPluginWorker/u);
  assert.match(ROUNDTRIP.skill, /create-skill/u);
  assert.equal(
    ROUNDTRIP.mcp.managedRuntime.kind,
    'hostFamilyBinary',
  );
  assert.equal(ROUNDTRIP.mcp.managedRuntime.binaryId, 'vibex-mcp');
  assert.equal(ROUNDTRIP.mcp.managedRuntime.protocolRevision, '2026-07-28');
});

test('content index paths are listed and skill references exist', () => {
  assert.equal(ROUNDTRIP.index.schemaVersion, 1);
  const paths = ROUNDTRIP.index.items.map((item) => item.path);
  assert.ok(paths.includes('contents/skills/vibex-plugin-development/SKILL.md'));
  assert.ok(
    paths.includes(
      'contents/skills/vibex-plugin-development/references/contract.md',
    ),
  );
  assert.ok(paths.includes('contents/mcps/plugin-dev.json'));
});
