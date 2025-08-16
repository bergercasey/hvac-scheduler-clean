const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  try {
    const qs = event.queryStringParameters || {};
    const weekKey = qs.weekKey || qs.isoWeek || qs.weekStart;
    if (!weekKey) return resp(400, { ok:false, error:'missing-weekKey' });

    const store = getStore('weeks');
    const json = await store.get(weekKey, { type: 'json' });
    const data = (json && json.data && typeof json.data === 'object') ? json.data : (json || {});
    return resp(200, { ok:true, data });
  } catch (err) {
    console.error('load-week error', err);
    return resp(500, { ok:false, error:String(err) });
  }
};

function resp(statusCode, body){
  return { statusCode, headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) };
}
