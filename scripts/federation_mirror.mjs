#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const source = (process.env.HC_SOURCE || process.argv[2] || 'https://humanitycommons.org').replace(/\/$/, '');
const outDir = process.env.HC_OUT || process.argv[3] || 'mirror';

function fail(message) {
  console.error(message);
  process.exit(1);
}

async function getJson(url) {
  const r = await fetch(url, { headers: { accept: 'application/json' } });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} for ${url}`);
  return r.json();
}

function validateRecord(r) {
  const errors = [];
  if (!r || typeof r !== 'object') errors.push('record is not an object');
  if (!r?.id) errors.push('missing id');
  if (!r?.type) errors.push('missing type');
  if (!r?.content_hash || !/^sha256:[a-f0-9]{64}$/i.test(r.content_hash)) errors.push('missing/invalid content_hash');
  if (!r?.author?.kind || !r?.author?.name) errors.push('missing author');
  if (!Array.isArray(r?.provenance)) errors.push('missing provenance array');
  if (typeof r?.confidence !== 'number') errors.push('missing confidence');
  if (!r?.license) errors.push('missing license');
  return errors;
}

const discovered = await getJson(`${source}/.well-known/humanity-commons.json`).catch(e => fail(`Discovery failed: ${e.message}`));
if (!discovered?.api?.records) fail('Discovery document does not advertise a records endpoint');

const listPayload = await getJson(discovered.api.records).catch(e => fail(`Record list failed: ${e.message}`));
const records = Array.isArray(listPayload) ? listPayload : (listPayload.records || []);

await fs.mkdir(path.join(outDir, 'records'), { recursive: true });
const manifest = {
  source,
  protocol: discovered.protocol || 'HCP',
  protocol_version: discovered.protocol_version || null,
  mirrored_at: new Date().toISOString(),
  count: 0,
  records: []
};

const seenHashes = new Set();
const seenIds = new Map();
let conflicts = 0;

for (const record of records) {
  const errors = validateRecord(record);
  if (errors.length) {
    console.warn(`Skipping invalid record ${record?.id || '<unknown>'}: ${errors.join(', ')}`);
    continue;
  }

  if (seenHashes.has(record.content_hash)) continue;
  seenHashes.add(record.content_hash);

  if (seenIds.has(record.id) && seenIds.get(record.id) !== record.content_hash) {
    conflicts += 1;
    console.warn(`ID/hash conflict: ${record.id}`);
  }
  seenIds.set(record.id, record.content_hash);

  const safeName = record.content_hash.replace(':', '_') + '.json';
  await fs.writeFile(path.join(outDir, 'records', safeName), JSON.stringify({
    transport: { source_peer: source, first_seen_at: new Date().toISOString() },
    record
  }, null, 2) + '\n');

  manifest.records.push({ id: record.id, content_hash: record.content_hash, file: `records/${safeName}` });
}

manifest.count = manifest.records.length;
manifest.conflicts = conflicts;
await fs.writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

console.log(JSON.stringify({ ok: true, source, mirrored: manifest.count, conflicts, outDir }, null, 2));
