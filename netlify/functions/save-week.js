exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return j(405, { ok:false, error:'method-not-allowed' });
  return j(200, { ok:true, saved: 0 }); // proves POST route works
};
function j(status, body){
  return { statusCode: status, headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) };
}
