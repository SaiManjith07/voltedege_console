import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { apiRequest, getApiBase, getStoredAccessToken, type ApiUser } from './lib/api';
import { enqueueOfflineOrder, listPendingOrders, removePendingOrder } from './lib/offlineOrderQueue';
import LandingPage from './LandingPage';
import './index.css';

const qc = new QueryClient();
const DEMO_STORE = 'd1111111-1111-1111-1111-111111111303';
const DEMO_SKU_BUDS = 'p1111111-1111-1111-1111-111111111603';

function Login() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('sales@voltedge.retail');
  const [password, setPassword] = useState('Password123!');
  const [err, setErr] = useState('');

  if (loading) return <p style={{ color: 'var(--ve-text-muted)', padding: 24 }}>Loading…</p>;
  if (user) return <Navigate to="/app" replace />;

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    border: '1px solid var(--ve-border)',
    background: 'var(--ve-bg-elevated)',
    color: 'var(--ve-text)',
  };

  return (
    <div className="ve-shell ve-card" style={{ maxWidth: 420, margin: '2rem auto' }}>
      <p style={{ margin: '0 0 12px' }}>
        <Link to="/" style={{ color: 'var(--ve-text-subtle)', fontSize: 14, textDecoration: 'none' }}>
          ← Back to home
        </Link>
      </p>
      <h1 style={{ color: 'var(--ve-text)', marginTop: 0 }}>Sign in</h1>
      <p style={{ color: 'var(--ve-text-muted)' }}>VoltEdge Retail operations console</p>
      <label style={{ display: 'block', color: 'var(--ve-text-secondary)', marginBottom: 8 }}>Email</label>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ ...inputStyle, marginBottom: 12 }}
      />
      <label style={{ display: 'block', color: 'var(--ve-text-secondary)', marginBottom: 8 }}>Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ ...inputStyle, marginBottom: 16 }}
      />
      {err && <p style={{ color: 'var(--ve-danger)' }}>{err}</p>}
      <button
        type="button"
        onClick={async () => {
          setErr('');
          try {
            await login(email, password);
            navigate('/app', { replace: true });
          } catch (e) {
            setErr(e instanceof Error ? e.message : 'Login failed');
          }
        }}
        className="ve-btn"
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, var(--ve-electric), var(--ve-electric-deep))',
          color: '#f8fafc',
          fontWeight: 600,
          border: 'none',
        }}
      >
        Sign in
      </button>
      <p style={{ color: 'var(--ve-text-subtle)', fontSize: 13, marginTop: 16 }}>
        Demo: sales@voltedge.retail / Password123!
      </p>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        background: 'var(--ve-surface-card)',
        border: '1px solid var(--ve-border)',
        padding: 16,
        borderRadius: 12,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <div style={{ color: 'var(--ve-text-muted)', fontSize: 13 }}>{title}</div>
      <div style={{ color: 'var(--ve-text)', fontSize: 24, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function PosPanel({
  storeId,
  offline,
  setOffline,
  onQueued,
}: {
  storeId: string;
  offline: boolean;
  setOffline: (v: boolean) => void;
  onQueued: () => void;
}) {
  const [msg, setMsg] = useState('');

  const submit = async () => {
    const body = {
      store_id: storeId,
      payment_mode: 'upi' as const,
      discount_amount: 0,
      channel: 'in_store' as const,
      items: [{ product_id: DEMO_SKU_BUDS, quantity: 1, unit_price: 8999, tax_rate: 18 }],
      client_mutation_id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `m-${Date.now()}`,
    };
    setMsg('');
    if (offline) {
      const localId = await enqueueOfflineOrder(body as unknown as Record<string, unknown>);
      setMsg(`Queued offline (${localId})`);
      onQueued();
      return;
    }
    try {
      const res = await fetch(`${getApiBase()}/orders/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getStoredAccessToken()}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(JSON.stringify(data));
      setMsg(`Order ${(data as { order_number?: string }).order_number || 'placed'}`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Checkout failed');
    }
  };

  return (
    <section
      style={{
        marginTop: 32,
        background: 'var(--ve-surface-card)',
        border: '1px solid var(--ve-border)',
        padding: 20,
        borderRadius: 12,
      }}
    >
      <h2 style={{ color: 'var(--ve-text)', marginTop: 0 }}>In-store POS (wearables demo)</h2>
      <label style={{ color: 'var(--ve-text-secondary)', display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="checkbox" checked={offline} onChange={(e) => setOffline(e.target.checked)} />
        Offline mode — queue sale; sync when back online (IndexedDB)
      </label>
      <button
        type="button"
        className="ve-btn"
        onClick={submit}
        style={{
          marginTop: 12,
          background: 'linear-gradient(135deg, var(--ve-electric), var(--ve-electric-deep))',
          color: '#f8fafc',
          border: 'none',
          fontWeight: 600,
        }}
      >
        Sell 1× SonicBuds Pro
      </button>
      {msg && <p style={{ color: 'var(--ve-success-soft)' }}>{msg}</p>}
    </section>
  );
}

function roleLabel(role: string) {
  const m: Record<string, string> = {
    headquarters_admin: 'Headquarters Admin',
    regional_manager: 'Regional Manager',
    store_supervisor: 'Store Supervisor',
    sales_associate: 'Sales Associate',
  };
  return m[role] || role;
}

type MarginBi = { skus?: Array<Record<string, unknown>> };
type ShrinkBi = { total_shrinkage_units?: number; by_movement_type?: Array<Record<string, unknown>> };
type CampaignBi = { campaigns?: Array<Record<string, unknown>> };
type RegionalBi = { stores?: Array<Record<string, unknown>>; total_revenue?: number };

function BiInsights({ user, storeId }: { user: ApiUser; storeId: string }) {
  const token = !!getStoredAccessToken();
  const mgr = ['headquarters_admin', 'regional_manager', 'store_supervisor'].includes(user.role);

  const margin = useQuery({
    queryKey: ['bi-margin', storeId],
    queryFn: () => apiRequest<MarginBi>(`/analytics/bi/margin/${storeId}?days=30`),
    enabled: token && mgr,
  });

  const shrink = useQuery({
    queryKey: ['bi-shrink', storeId],
    queryFn: () => apiRequest<ShrinkBi>(`/analytics/bi/shrinkage/${storeId}?days=30`),
    enabled: token && mgr,
  });

  const campaigns = useQuery({
    queryKey: ['bi-campaigns'],
    queryFn: () => apiRequest<CampaignBi>(`/analytics/bi/campaign-effectiveness?days=90`),
    enabled: token && user.role === 'headquarters_admin',
  });

  const regional = useQuery({
    queryKey: ['bi-regional', user.region_id],
    queryFn: () => apiRequest<RegionalBi>(`/analytics/bi/regional/${user.region_id}?days=30`),
    enabled: token && user.role === 'regional_manager' && !!user.region_id,
  });

  if (!mgr && user.role !== 'headquarters_admin') return null;

  return (
    <section style={{ marginTop: 32 }} className="ve-card">
      <h2 style={{ color: 'var(--ve-text)', marginTop: 0 }}>BI — margin, shrinkage &amp; campaigns</h2>
      <p style={{ color: 'var(--ve-text-muted)', fontSize: 14 }}>
        Case-study dashboards: estimated margin by SKU, shrinkage proxy from stock movements, promotional attribution.
      </p>
      <div className="ve-bi-grid">
        {margin.data?.skus && margin.data.skus.length > 0 && (
          <div>
            <h3 style={{ color: 'var(--ve-text-secondary)', fontSize: 15 }}>Top margin SKUs (30d)</h3>
            <ul style={{ color: 'var(--ve-text-muted)', fontSize: 13, paddingLeft: 18, margin: '8px 0 0' }}>
              {margin.data.skus.slice(0, 5).map((row) => (
                <li key={String(row.sku)}>
                  {String(row.sku)} — margin {String(row.margin_percent ?? '—')}%
                </li>
              ))}
            </ul>
          </div>
        )}
        {shrink.data && (
          <div>
            <h3 style={{ color: 'var(--ve-text-secondary)', fontSize: 15 }}>Shrinkage (30d)</h3>
            <p style={{ color: 'var(--ve-text-muted)', margin: '8px 0 0' }}>
              Total units out: <strong style={{ color: 'var(--ve-text)' }}>{shrink.data.total_shrinkage_units ?? 0}</strong>
            </p>
          </div>
        )}
        {campaigns.data?.campaigns && (
          <div>
            <h3 style={{ color: 'var(--ve-text-secondary)', fontSize: 15 }}>Campaign effectiveness</h3>
            <ul style={{ color: 'var(--ve-text-muted)', fontSize: 13, paddingLeft: 18, margin: '8px 0 0' }}>
              {campaigns.data.campaigns.map((c) => (
                <li key={String(c.code)}>
                  {String(c.name)} — {String(c.order_count)} orders, {String(c.attributed_revenue)} revenue
                </li>
              ))}
            </ul>
          </div>
        )}
        {regional.data?.stores && (
          <div>
            <h3 style={{ color: 'var(--ve-text-secondary)', fontSize: 15 }}>Regional store performance</h3>
            <p style={{ color: 'var(--ve-text-muted)', margin: '8px 0 0' }}>
              Revenue (30d): <strong style={{ color: 'var(--ve-text)' }}>{String(regional.data.total_revenue ?? 0)}</strong>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();
  const storeId = user?.store_id || DEMO_STORE;

  const dash = useQuery({
    queryKey: ['dash', storeId],
    queryFn: () => apiRequest<Record<string, unknown>>(`/analytics/dashboard/${storeId}`),
    enabled: !!getStoredAccessToken(),
  });

  const alerts = useQuery({
    queryKey: ['alerts', storeId],
    queryFn: () => apiRequest<Array<Record<string, unknown>>>(`/alerts/${storeId}`),
    enabled: !!getStoredAccessToken(),
  });

  const [offline, setOffline] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  const refreshQueueMsg = () => {
    listPendingOrders().then((p) =>
      setSyncMsg(p.length ? `${p.length} offline sale(s) queued for sync` : ''),
    );
  };

  useEffect(() => {
    refreshQueueMsg();
  }, []);

  const syncQueue = async () => {
    const token = getStoredAccessToken();
    if (!token) return;
    const pending = await listPendingOrders();
    for (const row of pending) {
      const res = await fetch(`${getApiBase()}/orders/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(row.payload),
      });
      if (res.ok) await removePendingOrder(row.id);
    }
    refreshQueueMsg();
    void dash.refetch();
  };

  return (
    <div className="ve-shell">
      <header className="ve-header">
        <div>
          <h1 style={{ color: 'var(--ve-text)', margin: 0, fontSize: 'clamp(1.25rem, 5vw, 1.75rem)' }}>Store operations hub</h1>
          <p style={{ color: 'var(--ve-text-muted)', margin: '4px 0 0' }}>
            {user?.name} · {roleLabel(user?.role || '')} · electronics retail
          </p>
        </div>
        <button
          type="button"
          className="ve-btn"
          onClick={logout}
          style={{
            border: '1px solid var(--ve-border-bright)',
            background: 'transparent',
            color: 'var(--ve-text)',
          }}
        >
          Log out
        </button>
      </header>

      <section
        style={{
          marginTop: 24,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
          gap: 16,
        }}
      >
        <Metric title="Store sales today" value={String(dash.data?.today_revenue ?? '—')} />
        <Metric title="Orders today" value={String(dash.data?.transaction_count ?? '—')} />
        <Metric title="SKUs below reorder" value={String(dash.data?.low_stock_skus ?? '—')} />
      </section>

      {user && <BiInsights user={user} storeId={storeId} />}

      <section style={{ marginTop: 32 }}>
        <h2 style={{ color: 'var(--ve-text)' }}>Inventory &amp; lifecycle alerts</h2>
        <ul style={{ color: 'var(--ve-text-secondary)', paddingLeft: 20 }}>
          {(alerts.data || []).map((a) => (
            <li key={String(a.id)}>{String(a.message)}</li>
          ))}
          {!alerts.data?.length && <li>No active alerts</li>}
        </ul>
      </section>

      <PosPanel storeId={storeId} offline={offline} setOffline={setOffline} onQueued={refreshQueueMsg} />

      {syncMsg && <p style={{ color: 'var(--ve-volt)', marginTop: 16 }}>{syncMsg}</p>}
      <button
        type="button"
        className="ve-btn"
        onClick={() => void syncQueue()}
        style={{
          marginTop: 8,
          background: 'var(--ve-success)',
          color: 'var(--ve-success-text)',
          border: 'none',
          fontWeight: 600,
        }}
      >
        Sync offline sales
      </button>
    </div>
  );
}

function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <p style={{ color: 'var(--ve-text-muted)', padding: 24 }}>Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/app"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
