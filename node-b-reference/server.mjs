import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = Number(process.env.PORT || 8787);
const UPSTREAM = process.env.HC_UPSTREAM || 'https://humanitycommons.org';
const DATA_DIR = process.env.HC_DATA_DIR || './data';
const SYNC_MS = Number(process.env.HC_SYNC_MS || 300000);
const NODE_NAME = process.env.HC_NODE_NAME || 'independent-node-b';

fs.mkdirSync(DATA_DIR, { recursive: true });
const recordsFile = path.join(DATA_DIR, 'records.json');
const conflictsFile = path.join(DATA_DIR, 'conflicts.json');

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}
function canonicalRecord(x) { return x?.record ?? x; }
function hashOf(x) { return x?.content_hash ?? canonicalRecord(x)?.content_hash ?? null; }
function idOf(x) { return canonicalRecord(x)?.id ?? x?.id ?? null; }

async function sync() {
  const res = await fetch(`${UPSTREAM}/api/v1/records`, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`upstream ${res.status}`);
  const body = await res.json();
  const incoming = Array.isArray(body) ? body : (body.records || []);
  const current = readJson(recordsFile, []);
  const conflicts = readJson(conflictsFile, []);
  const byId = new Map(current.map(x => [idOf(x), x]).filter(([id]) => id));

  for (const item of incoming) {
    const id = idOf(item);
    if (!id) continue;
    const existing = byId.get(id);
    if (!existing) {
      byId.set(id, item);
      continue;
    }
    const oldHash = hashOf(existing);
    const newHash = hashOf(item);
    if (oldHash && newHash && oldHash !== newHash) {
      conflicts.push({ id, existing_hash: oldHash, incoming_hash: newHash, seen_at: new Date().toISOString() });
    }
  }

  writeJson(recordsFile, [...byId.values()]);
  writeJson(conflictsFile, conflicts.slice(-1000));
  return { mirrored: byId.size, conflicts: conflicts.length };
}

let lastSync = null;
let lastError = null;
async function syncSafe() {
  try { lastSync = { at: new Date().toISOString(), ...(await sync()) }; lastError = null; }
  catch (e) { lastError = String(e?.message || e); }
}

function send(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' });
  res.end(JSON.stringify(body, null, 2));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const records = readJson(recordsFile, []);

  if (url.pathname === '/api/v1/health') return send(res, 200, {
    status: 'ready', node: NODE_NAME, role: 'independent-mirror', upstream: UPSTREAM,
    mirrored_records: records.length, last_sync: lastSync, last_error: lastError
  });

  if (url.pathname === '/api/v1/records') return send(res, 200, { records });

  if (url.pathname.startsWith('/api/v1/records/')) {
    const id = decodeURIComponent(url.pathname.slice('/api/v1/records/'.length));
    const found = records.find(x => idOf(x) === id);
    return found ? send(res, 200, found) : send(res, 404, { error: 'not_found', id });
  }

  if (url.pathname === '/.well-known/humanity-commons.json') return send(res, 200, {
    protocol: 'Humanity Commons', role: 'independent-mirror', node: NODE_NAME,
    upstream: UPSTREAM, read_api: '/api/v1/records', health: '/api/v1/health',
    federation: 'pull-mirror', moderation: 'local', execution_authority: false
  });

  if (url.pathname === '/conflicts') return send(res, 200, { conflicts: readJson(conflictsFile, []) });
  return send(res, 404, { error: 'not_found' });
});

await syncSafe();
setInterval(syncSafe, SYNC_MS).unref();
server.listen(PORT, () => console.log(`Humanity Commons Node B reference listening on ${PORT}`));
