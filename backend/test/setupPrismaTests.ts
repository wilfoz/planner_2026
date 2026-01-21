import { execFileSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

function parseDotEnv(content: string): Record<string, string> {
  const env: Record<string, string> = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    env[key] = value;
  }
  return env;
}

export function setupPrismaTests() {
  const nodeBin = process.execPath;
  const prismaCli = join(process.cwd(), 'node_modules', 'prisma', 'build', 'index.js');
  const schemaPath = join(
    process.cwd(),
    'src',
    'shared',
    'infrastructure',
    'database',
    'prisma',
    'schema.prisma',
  );

  const envFilePath = join(process.cwd(), '.env.test');
  const fileEnv = parseDotEnv(readFileSync(envFilePath, 'utf8'));
  const env = { ...process.env, ...fileEnv };

  beforeAll(() => {
    execFileSync(nodeBin, [prismaCli, 'migrate', 'deploy', '--schema', schemaPath], {
      stdio: 'inherit',
      env,
    });
  }, 120_000);
}

