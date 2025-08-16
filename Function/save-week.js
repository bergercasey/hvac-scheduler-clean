// Save week data into Netlify Blobs (store: "weeks")
// Accepts POST JSON:
//   { weekKey: "2025-W33", data: { "Mon:01:job": "...", "Mon:01:pto": true, ... } }
// Also accepts: { isoWeek, data } OR { weekStart, data }
// Or flat Mon:DD:* keys at top level (plus weekKey/isoWeek/weekStart)
exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return j(405, { ok:false, error:'method-not-allowed' });
    }
    let body;
    try { body = JSON.parse(event.body || '{}'); }
    catch { return j(400, { ok:false, error:'invalid-json' }); }

    const weekKey = body.weekKey || body.isoWeek || body.weekStart;
    if (!weekKey) return j(400, { ok:false, error:'missing-weekKey', need:'weekKey or isoWeek or weekStart' });

    // nested or flat
    let data = (body.data && typeof body.data === 'object') ? body.data : null;
    if (!data) {
      data = {};
      for (const [k, v] of Object.entries(body)) {
        if (/^(Mon|Tue|Wed|Thu|Fri):\d{2}:(job|helper|pto|helperPto)$/.test(k)) data[k] = v;
      }
    }
    if (!data || Object.keys(data).length === 0) {
      return j(400, { ok:false, error:'missing-week-data' });
    }

    // ESM import works in CJS functions when called inside the handler
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('weeks');
    await store.set(weekKey, JSON.stringify({ ok:true, data }), {
      metadata: { contentType: 'application/json' }
    });

    return j(200, { ok:true, saved:Object.keys(data).length, weekKey });
  } catch (err) {
    console.error('save-week error', err);
    return j(500, { ok:false, error:String(err) });
  }
};
function j(statusCode, obj){
  return { statusCode, headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(obj) };
}
