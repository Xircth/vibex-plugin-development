import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function readJson(rel) {
  return JSON.parse(readFileSync(join(root, rel), 'utf8'));
}

export const ROUNDTRIP = {
  manifest: readJson('.vibex-plugin/plugin.json'),
  index: readJson('.vibex-plugin/content.index.json'),
  config: readJson('config.json'),
  skill: readFileSync(
    join(
      root,
      'contents/skills/vibex-plugin-development/SKILL.md',
    ),
    'utf8',
  ),
  readme: readFileSync(join(root, 'README.md'), 'utf8'),
};
