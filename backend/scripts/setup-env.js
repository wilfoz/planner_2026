/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

function ensureEnvFile(targetName, exampleName) {
  const targetPath = path.join(process.cwd(), targetName);
  const examplePath = path.join(process.cwd(), exampleName);

  if (fs.existsSync(targetPath)) {
    // Ensure common Windows/Docker connectivity (IPv4).
    const current = fs.readFileSync(targetPath, 'utf8');
    const patched = current.replaceAll('@localhost:', '@127.0.0.1:');
    if (patched !== current) {
      fs.writeFileSync(targetPath, patched);
      console.log(`[env] Patched ${targetName} (localhost -> 127.0.0.1)`);
    }
    return;
  }
  if (!fs.existsSync(examplePath)) {
    console.warn(`[env] Missing template ${exampleName}, skipping ${targetName}`);
    return;
  }

  fs.copyFileSync(examplePath, targetPath);
  console.log(`[env] Created ${targetName} from ${exampleName}`);
}

ensureEnvFile('.env.development', 'env.development.example');
ensureEnvFile('.env.test', 'env.test.example');
ensureEnvFile('.env', 'env.example');

