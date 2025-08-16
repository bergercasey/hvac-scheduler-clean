// Load week data from Netlify Blobs (store: "weeks")
// GET ?weekKey= OR ?isoWeek= OR ?weekStart=
exports.handler = async (event) => {
  try {
    const qs = event.queryStringParameters || {};
    const weekKey = qs.weekKey || qs.isoWeek || qs.weekStart;
    if (!weekKey) return j(400, { ok:false, error:'missing-weekKey' });

    const { getStore } = await import('@netlify/blobs');
    const store = getStore('weeks');

    const json = await store.get(weekKey, { type: 'json' });
    const data = (json && json.data && typeof json.data === 'object') ? json.data : (json || {});

    return j(200, { ok:true, data });
  } catch (err) {
    console.error('load-week error', err);
    return j(500, { ok:false, error:String(err) });
  }
};
function j(status, obj){
  return { statusCode: status, headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(obj) };
}
