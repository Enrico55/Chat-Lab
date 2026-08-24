const {listRecords,insertRecord,send,fail}=require('../_lib/hc');
module.exports=async(req,res)=>{
  if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');res.setHeader('Access-Control-Allow-Headers','content-type,authorization');return res.status(204).end();}
  try{
    if(req.method==='GET') return send(res,200,{records:await listRecords(req.query||{})});
    if(req.method==='POST') return send(res,201,{record:await insertRecord(req,req.body)});
    return send(res,405,{error:'method_not_allowed'});
  }catch(e){return fail(res,e)}
};