const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return resp(405, { ok:false, error:'method-not-allowed' });
    }
    let body;
    try { body = JSON.parse(event.body || '{}'); }
    catch { return resp(400, { ok:false, error:'invalid-json' }); }

    const weekKey = body.weekKey || body.isoWeek || body.weekStart;
    if (!weekKey) return resp(400, { ok:false, error:'missing-weekKey', need:'weekKey or isoWeek or weekStart' });

    let data = (body.data && typeof body.data === 'object') ? body.data : null;
    if (!data) {
      data = {};
      for (const [k, v] of Object.entries(body)) {
        if (/^(Mon|Tue|Wed|Thu|Fri):\d{2}:(job|helper|pto|helperPto)$/.test(k)) data[k] = v;
      }
    }
    if (!data || Object.keys(data).length === 0) {
      return resp(400, { ok:false, error:'missing-week-data' });
    }

    const store = getStore('weeks');
    await store.set(weekKey, JSON.stringify({ ok:true, data }), {
      metadata: { contentType: 'application/json' }
    });

    return resp(200, { ok:true, saved:Object.keys(data).length, weekKey });
  } catch (err) {
    console.error('save-week error', err);
    return resp(500, { ok:false, error:String(err) });
  }
};

function resp(statusCode, body){
  return { statusCode, headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) };
}
