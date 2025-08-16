exports.handler = async (event) => {
  const qs = event.queryStringParameters || {};
  const wk = qs.weekKey || qs.isoWeek || qs.weekStart;
  if (!wk) return j(400, { ok:false, error:'missing-weekKey' });
  return j(200, { ok:true, data:{} }); // empty week, just to prove routing works
};
function j(status, body){
  return { statusCode: status, headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) };
}
