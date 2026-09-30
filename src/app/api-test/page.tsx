'use client';
/**
 * /api-test — developer page (not linked anywhere). Calls every PHP endpoint through the
 * /api proxy and shows the HTTP status + raw JSON, so you can confirm each one works.
 */
import { useState } from 'react';
import { parseLoose, SESSION_TOKEN } from '@/lib/php';
import { useAuth } from '@/store/auth';

type Ep = { path: string; method: 'GET' | 'POST'; auth: boolean; params: Record<string, unknown> };

const ENDPOINTS: Ep[] = [
  { path: 'auth/register.php', method: 'POST', auth: false, params: { name: 'Test User', email: 'test@example.com', phone: '9999999999', password: 'secret123' } },
  { path: 'auth/login.php', method: 'POST', auth: false, params: { email: 'test@example.com', password: 'secret123' } },
  { path: 'auth/profile.php', method: 'GET', auth: true, params: {} },
  { path: 'categories/list.php', method: 'GET', auth: false, params: {} },
  { path: 'products/list.php', method: 'GET', auth: false, params: { limit: 20 } },
  { path: 'products/single.php', method: 'GET', auth: false, params: { id: 1 } },
  { path: 'reviews/add.php', method: 'POST', auth: true, params: { product_id: 1, rating: 5, comment: 'Very fresh' } },
  { path: 'cart/add.php', method: 'POST', auth: true, params: { product_id: 1, quantity: 1 } },
  { path: 'cart/list.php', method: 'GET', auth: true, params: {} },
  { path: 'cart/update.php', method: 'POST', auth: true, params: { cart_id: 1, quantity: 2 } },
  { path: 'cart/remove.php', method: 'POST', auth: true, params: { cart_id: 1 } },
  { path: 'wishlist/add.php', method: 'POST', auth: true, params: { product_id: 1 } },
  { path: 'wishlist/list.php', method: 'GET', auth: true, params: {} },
  { path: 'wishlist/check.php', method: 'GET', auth: true, params: { product_id: 1 } },
  { path: 'wishlist/remove.php', method: 'POST', auth: true, params: { product_id: 1 } },
  { path: 'addresses/add.php', method: 'POST', auth: true, params: { full_name: 'Test User', phone: '9999999999', address_line1: '12 Ring Road', city: 'Surat', state: 'Gujarat', pincode: '395003', is_default: 1 } },
  { path: 'addresses/list.php', method: 'GET', auth: true, params: {} },
  { path: 'addresses/delete.php', method: 'POST', auth: true, params: { address_id: 1 } },
  { path: 'orders/create.php', method: 'POST', auth: true, params: { address_id: 1, payment_method: 'cod' } },
  { path: 'orders/list.php', method: 'GET', auth: true, params: {} },
  { path: 'orders/details.php', method: 'GET', auth: true, params: { order_id: 1 } },
  { path: 'orders/cancel.php', method: 'POST', auth: true, params: { order_id: 1, reason: 'test' } },
  { path: 'coupons/offers.php', method: 'GET', auth: false, params: {} },
  { path: 'coupons/validate.php', method: 'POST', auth: false, params: { code: 'WELCOME10', subtotal: 600 } },
  { path: 'enquiries/add.php', method: 'POST', auth: false, params: { type: 'CONTACT', name: 'Test', email: 'test@example.com', message: 'Hello' } },
  // admin (sign in with the admin account first)
  { path: 'admin/me.php', method: 'GET', auth: true, params: {} },
  { path: 'admin/dashboard.php', method: 'GET', auth: true, params: {} },
  { path: 'admin/orders.php', method: 'GET', auth: true, params: { page: 1 } },
  { path: 'admin/orders.php', method: 'POST', auth: true, params: { action: 'update_status', order_id: 1, status: 'confirmed' } },
  { path: 'admin/products.php', method: 'GET', auth: true, params: {} },
  { path: 'admin/categories.php', method: 'GET', auth: true, params: {} },
  { path: 'admin/coupons.php', method: 'GET', auth: true, params: {} },
  { path: 'admin/coupons.php', method: 'POST', auth: true, params: { action: 'add', code: 'WELCOME10', type: 'percent', value: 10, min_order: 299, description: '10% off your first order' } },
  { path: 'admin/enquiries.php', method: 'GET', auth: true, params: {} },
  { path: 'admin/users.php', method: 'GET', auth: true, params: { page: 1 } },
];

const key = (e: Ep) => `${e.method} ${e.path}`;

type Result = { status: number; ms: number; ok: boolean; body: string };

export default function ApiTest() {
  const { token, user } = useAuth();
  const [params, setParams] = useState<Record<string, string>>(() => Object.fromEntries(ENDPOINTS.map((e) => [key(e), JSON.stringify(e.params, null, 2)])));
  const [results, setResults] = useState<Record<string, Result | 'loading'>>({});
  const [format, setFormat] = useState<'json' | 'form'>(process.env.NEXT_PUBLIC_API_BODY_FORMAT === 'form' ? 'form' : 'json');

  async function run(ep: Ep) {
    setResults((r) => ({ ...r, [key(ep)]: 'loading' }));
    let p: Record<string, unknown>;
    try {
      p = JSON.parse(params[key(ep)] || '{}');
    } catch {
      setResults((r) => ({ ...r, [key(ep)]: { status: 0, ms: 0, ok: false, body: 'Params are not valid JSON.' } }));
      return;
    }
    if (ep.auth && user?.id && p.user_id === undefined) p.user_id = user.id;
    const flat = Object.fromEntries(Object.entries(p).map(([k, v]) => [k, String(v)]));
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (token && token !== SESSION_TOKEN) headers.Authorization = `Bearer ${token}`;
    let url = `/api/${ep.path}`;
    let body: string | undefined;
    if (ep.method === 'GET') url += `?${new URLSearchParams(flat)}`;
    else if (format === 'json') {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(p);
    } else {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      body = new URLSearchParams(flat).toString();
    }
    const t0 = performance.now();
    try {
      const res = await fetch(url, { method: ep.method, headers, body, cache: 'no-store' });
      const text = await res.text();
      const json = parseLoose(text);
      const ok = res.ok && json !== undefined && json?.success !== false && json?.status !== false && json?.status !== 'error';
      setResults((r) => ({ ...r, [key(ep)]: { status: res.status, ms: Math.round(performance.now() - t0), ok, body: json !== undefined ? JSON.stringify(json, null, 2) : text || '(empty)' } }));
    } catch (e) {
      setResults((r) => ({ ...r, [key(ep)]: { status: 0, ms: 0, ok: false, body: String(e) } }));
    }
  }

  return (
    <div className="container-x max-w-5xl py-12">
      <h1 className="text-5xl font-medium">API check</h1>
      <p className="mt-2 text-muted">
        {user ? `Signed in as ${user.email} (user_id ${user.id || '—'}).` : 'Sign in on /account first to test cart, wishlist, address and order endpoints.'}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={async () => {
            for (const ep of ENDPOINTS.filter((e) => e.method === 'GET' && (!e.auth || user))) await run(ep);
          }}
          className="rounded-full bg-maroon px-5 py-2.5 text-sm font-medium text-cream"
        >
          Run all read endpoints
        </button>
        <label className="flex items-center gap-2 text-sm">
          POST body as
          <select value={format} onChange={(e) => setFormat(e.target.value as 'json' | 'form')} className="input h-10 w-auto py-0">
            <option value="json">JSON (php://input)</option>
            <option value="form">Form ($_POST)</option>
          </select>
        </label>
      </div>
      <ul className="mt-8 space-y-4">
        {ENDPOINTS.map((ep) => {
          const r = results[key(ep)];
          return (
            <li key={key(ep)} className="card p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded bg-sand px-2 py-0.5 text-xs font-bold">{ep.method}</span>
                <code className="font-semibold">{ep.path}</code>
                {ep.auth && <span className="text-xs text-muted">needs sign-in</span>}
                {r && r !== 'loading' && <span className={r.ok ? 'text-sm font-semibold text-leaf-deep' : 'text-sm font-semibold text-red-700'}>{r.status || 'network error'} · {r.ms} ms · {r.ok ? 'OK' : 'FAILED'}</span>}
                <button onClick={() => run(ep)} disabled={r === 'loading'} className="ml-auto rounded-full border border-maroon/30 px-4 py-1.5 text-sm text-maroon">
                  {r === 'loading' ? 'Running…' : 'Run'}
                </button>
              </div>
              <textarea aria-label={`${ep.path} params`} className="input mt-3 font-mono text-xs" rows={Math.min(7, (params[key(ep)] || '').split('\n').length)} value={params[key(ep)]} onChange={(e) => setParams({ ...params, [key(ep)]: e.target.value })} />
              {r && r !== 'loading' && <pre className="mt-3 max-h-72 overflow-auto rounded-xl bg-ink p-3 text-xs text-cream">{r.body}</pre>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
