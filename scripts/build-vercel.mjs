import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'vercel-dist');
// The output is generated from public assets and the same authored HTML as Sites.
// A clean Vercel checkout provides an empty output directory on every build.
await mkdir(output, { recursive: true });
await cp(path.join(root, 'public'), output, { recursive: true });
const html = await readFile(path.join(root, 'content/site.html'), 'utf8');
await writeFile(path.join(output, 'index.html'), html);
async function countFiles(directory) {
  let count = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    count += entry.isDirectory() ? await countFiles(path.join(directory, entry.name)) : 1;
  }
  return count;
}
console.log(`Vercel static build ready: ${await countFiles(output)} files. Chat is served by api/chat.mjs.`);
