import { getStore } from '@netlify/blobs';

const STORE = 'kz-admin-content';
const INDEX_KEYS = {
  pages: 'index:pages',
  posts: 'index:posts'
};

function clean(s, max = 4000) {
  return String(s == null ? '' : s).replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max);
}

function slugify(s) {
  const base = clean(s, 120).replace(/\s+/g, '-').replace(/[^\p{L}\p{N}\-_]/gu, '');
  return base || `item-${Date.now().toString(36)}`;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

async function readIndex(store, type) {
  const key = INDEX_KEYS[type];
  const idx = await store.get(key, { type: 'json' });
  return Array.isArray(idx) ? idx : [];
}

async function writeIndex(store, type, ids) {
  await store.setJSON(INDEX_KEYS[type], ids);
}

function keyFor(type, id) {
  return `${type}:${id}`;
}

async function listItems(store, type) {
  const ids = await readIndex(store, type);
  const items = await Promise.all(ids.map(async (id) => {
    const item = await store.get(keyFor(type, id), { type: 'json' });
    return item ? { ...item, id } : null;
  }));
  return items.filter(Boolean);
}

function validatePage(payload) {
  const title = clean(payload.title, 160);
  const slug = slugify(payload.slug || payload.title);
  const content = clean(payload.content, 20000);
  if (!title) return { error: 'missing-title' };
  if (!content) return { error: 'missing-content' };
  return {
    ok: true,
    item: {
      title,
      slug,
      content,
      status: clean(payload.status, 20) || 'published',
      updated: new Date().toISOString()
    }
  };
}

function validatePost(payload) {
  const title = clean(payload.title, 160);
  const excerpt = clean(payload.excerpt, 400);
  const body = clean(payload.body, 20000);
  if (!title) return { error: 'missing-title' };
  if (!body) return { error: 'missing-body' };
  return {
    ok: true,
    item: {
      title,
      excerpt,
      body,
      author: clean(payload.author, 120) || 'מנהל',
      updated: new Date().toISOString()
    }
  };
}

export default async (req) => {
  const url = new URL(req.url);
  const type = clean(url.searchParams.get('type'), 20);
  const store = getStore(STORE);

  if (req.method === 'GET') {
    if (type === 'page') {
      const slug = slugify(url.searchParams.get('slug') || '');
      const ids = await readIndex(store, 'pages');
      for (const id of ids) {
        const item = await store.get(keyFor('pages', id), { type: 'json' });
        if (item && item.slug === slug) return json({ ok: true, item: { ...item, id } });
      }
      return json({ ok: false, error: 'not-found' }, 404);
    }
    if (type === 'pages' || type === 'posts') {
      const items = await listItems(store, type);
      return json({ ok: true, items });
    }
    return json({ ok: false, error: 'invalid-type' }, 400);
  }

  if (req.method !== 'POST') {
    return json({ ok: false, error: 'method-not-allowed' }, 405);
  }

  let payload = {};
  try { payload = await req.json(); } catch {
    return json({ ok: false, error: 'invalid-json' }, 400);
  }

  const t = clean(payload.type, 20);
  const action = clean(payload.action, 20);

  if (t !== 'pages' && t !== 'posts') {
    return json({ ok: false, error: 'invalid-type' }, 400);
  }

  if (action === 'create' || action === 'update') {
    const validated = t === 'pages' ? validatePage(payload) : validatePost(payload);
    if (!validated.ok) return json({ ok: false, error: validated.error }, 400);

    const id = clean(payload.id, 80) || `${t.slice(0, -1)}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    const existing = await store.get(keyFor(t, id), { type: 'json' });
    const record = {
      ...(existing || {}),
      ...validated.item,
      id,
      created: existing?.created || new Date().toISOString()
    };
    await store.setJSON(keyFor(t, id), record);

    if (!existing) {
      const ids = await readIndex(store, t);
      ids.push(id);
      await writeIndex(store, t, ids);
    }
    return json({ ok: true, item: record });
  }

  if (action === 'delete') {
    const id = clean(payload.id, 80);
    if (!id) return json({ ok: false, error: 'missing-id' }, 400);
    await store.delete(keyFor(t, id));
    const ids = await readIndex(store, t);
    await writeIndex(store, t, ids.filter((x) => x !== id));
    return json({ ok: true });
  }

  if (action === 'reorder') {
    const order = Array.isArray(payload.order) ? payload.order.map((x) => clean(x, 80)).filter(Boolean) : [];
    const current = await readIndex(store, t);
    const merged = [
      ...order.filter((id) => current.includes(id)),
      ...current.filter((id) => !order.includes(id))
    ];
    await writeIndex(store, t, merged);
    return json({ ok: true, order: merged });
  }

  return json({ ok: false, error: 'invalid-action' }, 400);
};

export const config = { path: '/.netlify/functions/admin-content' };
