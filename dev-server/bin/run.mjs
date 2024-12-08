import path from 'node:path';
import fs from 'node:fs/promises';

import { build } from 'esbuild';

const PACKAGE_DIR_PATH = `${process.env.PROJECT_CWD}/dev-server`;

const PACKAGE_JSON_PATH = path.resolve(PACKAGE_DIR_PATH, './package.json');
const TEMP_DIR_PATH = path.resolve(PACKAGE_DIR_PATH, './__temp');
const SCRIPT_ENTRY_PATH = path.resolve(PACKAGE_DIR_PATH, './bin/cli.ts');

const TRANSPILED_SCRIPT_PATH = path.resolve(
  PACKAGE_DIR_PATH,
  './__temp/cli.js'
);

(async () => {
  try {
    const pkgJson = JSON.parse(
      (await fs.readFile(PACKAGE_JSON_PATH)).toString()
    );

    await build({
      entryPoints: [SCRIPT_ENTRY_PATH],
      outdir: TEMP_DIR_PATH,
      bundle: true,
      write: true,
      platform: 'node',
      target: 'node16',
      format: 'esm',
      external: Object.keys({
        ...pkgJson.dependencies,
        ...pkgJson.devDependencies,
      }),
    });

    (await import(TRANSPILED_SCRIPT_PATH)).cli();
  } catch (e) {
    console.error(e);
  }
})();
