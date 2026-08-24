const crypto = require('crypto');

const TYPES = new Set(['claim','evidence','critique','proposal','measurement','model_output','decision','supersession']);
const LICENSES = new Set(['CC0-1.0','CC-BY-4.0','CC-BY-SA-4.0','MIT','Apache-2.0']);

function stable(v){
  if(Array.isArray(v)) return '['+v.map(stable).join(',')+']';
  if(v && typeof v === 'object') return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}';
  return JSON.stringify(v);
}
function hashRecord(record){
  const copy={...record}; delete copy.content_hash; delete copy.signature;
  return 'sha256:'+crypto.createHash('sha256').update(stable(copy)).digest('hex');
}
function validateRecord(r){
  const e=[];
  if(!r || typeof r!=='object' || Array.isArray(r)) return ['record must be an object'];
  if(typeof r.id!=='string' || r.id.length<8 || r.id.length>200) e.push('id must be 8..200 chars');
  if(!TYPES.has(r.type)) e.push('invalid type');
  if(typeof r.protocol_version!=='string') e.push('protocol_version required');
  if(!r.created_at || Number.isNaN(Date.parse(r.created_at))) e.push('created_at must be ISO date-time');
  if(!r.author || typeof r.author!=='object' || !['human','agent','organization','collective'].includes(r.author.kind) || !r.author.name) e.push('valid author required');
  if(!r.content || typeof r.content!=='object' || Array.isArray(r.content) || Object.keys(r.content).length===0) e.push('content object required');
  if(!Array.isArray(r.provenance)) e.push('provenance array required');
  if(typeof r.confidence!=='number' || r.confidence<0 || r.confidence>1) e.push('confidence must be 0..1');
  if(typeof r.license!=='string' || !r.license) e.push('license required');
  return e;
}
function env(){
  const url=process.env.SUPABASE_URL; const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key) throw new Error('storage_not_configured');
  return {url:url.replace(/\/$/,''),key};
}
async function sb(path, opts={}){
  const {url,key}=env();
  const res=await fetch(url+'/rest/v1/'+path,{...opts,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:opts.prefer||'return=representation',...(opts.headers||{})}});
  const text=await res.text(); let data=null; try{data=text?JSON.parse(text):null}catch{data=text}
  if(!res.ok){ const er=new Error('storage_error'); er.status=res.status; er.data=data; throw er; }
  return {data,headers:res.headers};
}
function ipOf(req){ return (req.headers['x-forwarded-for']||'unknown').split(',')[0].trim().slice(0,128); }
async function rateLimit(req){
  const ip=ipOf(req); const since=new Date(Date.now()-60_000).toISOString();
  const q=`hc_records?select=id&submitter_ip=eq.${encodeURIComponent(ip)}&ingested_at=gte.${encodeURIComponent(since)}&limit=21`;
  const {data}=await sb(q,{method:'GET'}); if(Array.isArray(data)&&data.length>=20){const e=new Error('rate_limited');e.status=429;throw e;}
  return ip;
}
async function listRecords(query={}){
  let p='hc_records?select=record,content_hash,moderation_state,ingested_at&order=ingested_at.desc&limit=100';
  if(query.type) p+='&type=eq.'+encodeURIComponent(query.type);
  if(query.tag) p+='&tags=cs.'+encodeURIComponent('{'+query.tag+'}');
  const {data}=await sb(p,{method:'GET'}); return (data||[]).map(x=>({...x.record,content_hash:x.content_hash,moderation_state:x.moderation_state,ingested_at:x.ingested_at}));
}
async function getRecord(id){ const {data}=await sb('hc_records?select=record,content_hash,moderation_state,ingested_at&id=eq.'+encodeURIComponent(id)+'&limit=1',{method:'GET'}); if(!data?.length)return null; const x=data[0]; return {...x.record,content_hash:x.content_hash,moderation_state:x.moderation_state,ingested_at:x.ingested_at}; }
async function insertRecord(req, record){
  const errors=validateRecord(record); if(errors.length){const e=new Error('invalid_record');e.status=400;e.data={errors};throw e;}
  const submitter_ip=await rateLimit(req); const content_hash=hashRecord(record); const stored={...record,content_hash};
  const body={id:record.id,type:record.type,tags:record.tags||[],content_hash,record:stored,submitter_ip,moderation_state:'visible'};
  try{ const {data}=await sb('hc_records',{method:'POST',body:JSON.stringify(body)}); return data?.[0]?.record?{...data[0].record,content_hash}:stored; }
  catch(e){ if(e.status===409){e.status=409;e.message='duplicate';} throw e; }
}
function send(res,status,obj){ res.status(status); res.setHeader('Access-Control-Allow-Origin','*'); res.setHeader('Cache-Control','no-store'); res.json(obj); }
function fail(res,e){ const s=e.status|| (e.message==='storage_not_configured'?503:500); send(res,s,{error:e.message,details:e.data||undefined}); }
module.exports={validateRecord,hashRecord,listRecords,getRecord,insertRecord,send,fail};