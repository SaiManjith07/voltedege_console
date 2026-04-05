import { Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const pillars = [
  {
    title: 'Catalog & inventory',
    body: 'Product and SKU master data, serial buckets, transfers, purchase orders, and near–real-time stock visibility across regions.',
  },
  {
    title: 'Sales & omnichannel',
    body: 'Checkout, billing, returns and refunds, supervisor approvals, and offline POS with idempotent sync when connectivity returns.',
  },
  {
    title: 'BI & operations',
    body: 'Store performance, margin analysis, shrinkage trends, and campaign effectiveness — decision-ready views for HQ and regions.',
  },
  {
    title: 'Agentic AI (governed)',
    body: 'Demand signals, replenishment suggestions, anomaly-aware transaction review, and conversational queries with audit trails and access limits.',
  },
];

const roles = [
  'Headquarters Admin',
  'Regional Manager',
  'Store Supervisor',
  'Sales Associate',
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="ve-landing ve-landing--loading">
        <p className="ve-landing__loading-text">Loading…</p>
      </div>
    );
  }
  if (user) return <Navigate to="/app" replace />;

  return (
    <div className="ve-landing">
      <div className="ve-landing__bg" aria-hidden />
      <header className="ve-landing__nav">
        <Link to="/" className="ve-landing__brand">
          <span className="ve-landing__logo" aria-hidden />
          <span>
            <strong>VoltEdge</strong> Retail
          </span>
        </Link>
        <nav className="ve-landing__nav-actions">
          <a href="#platform" className="ve-landing__nav-link">
            Platform
          </a>
          <a href="#roles" className="ve-landing__nav-link">
            Roles
          </a>
          <Link to="/login" className="ve-btn ve-landing__cta-nav">
            Sign in
          </Link>
        </nav>
      </header>

      <main>
        <section className="ve-hero" aria-labelledby="ve-hero-title">
          <p className="ve-hero__eyebrow">Omnichannel store operations</p>
          <h1 id="ve-hero-title" className="ve-hero__title">
            One platform for electronics retail — from shelf to headquarters
          </h1>
          <p className="ve-hero__lead">
            Secure, role-based operations for a fast-growing regional chain: <strong>84 stores</strong> across{' '}
            <strong>3 countries</strong>, with hybrid cloud deployment, intermittent-store sync, and observability
            built in.
          </p>
          <div className="ve-hero__actions">
            <Link to="/login" className="ve-btn ve-hero__btn-primary">
              Open operations console
            </Link>
            <a href="#platform" className="ve-btn ve-hero__btn-secondary">
              Explore capabilities
            </a>
          </div>
          <ul className="ve-hero__stats" aria-label="Scale at a glance">
            <li>
              <span className="ve-hero__stat-value">84</span>
              <span className="ve-hero__stat-label">Stores</span>
            </li>
            <li>
              <span className="ve-hero__stat-value">3</span>
              <span className="ve-hero__stat-label">Countries</span>
            </li>
            <li>
              <span className="ve-hero__stat-value">7</span>
              <span className="ve-hero__stat-label">Core services</span>
            </li>
            <li>
              <span className="ve-hero__stat-value">RBAC</span>
              <span className="ve-hero__stat-label">+ audit logs</span>
            </li>
          </ul>
        </section>

        <section id="platform" className="ve-section ve-section--features">
          <h2 className="ve-section__title">End-to-end retail workflows</h2>
          <p className="ve-section__intro">
            Microservices behind a single API gateway: catalog, inventory, sales, replenishment, analytics, AI, and
            notifications — backed by PostgreSQL and designed for peak-season traffic and multi-region scale.
          </p>
          <div className="ve-feature-grid">
            {pillars.map((p) => (
              <article key={p.title} className="ve-feature-card">
                <h3 className="ve-feature-card__title">{p.title}</h3>
                <p className="ve-feature-card__body">{p.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="roles" className="ve-section">
          <h2 className="ve-section__title">Built for every layer of the org</h2>
          <p className="ve-section__intro">
            JWT authentication with fine-grained roles. Every sensitive action is traceable for compliance and
            operational review.
          </p>
          <ul className="ve-roles-strip">
            {roles.map((r) => (
              <li key={r} className="ve-roles-strip__item">
                {r}
              </li>
            ))}
          </ul>
        </section>

        <section className="ve-section ve-section--cta">
          <div className="ve-cta-card">
            <h2 className="ve-cta-card__title">Try the VoltEdge Retail prototype</h2>
            <p className="ve-cta-card__text">
              Use seeded demo accounts to walk through dashboards, POS, low-stock alerts, BI views, and offline sync.
            </p>
            <Link to="/login" className="ve-btn ve-cta-card__btn">
              Sign in to console
            </Link>
          </div>
        </section>
      </main>

      <footer className="ve-landing__footer">
        <p>
          VoltEdge Retail — electronics store operations demo. Hybrid-ready architecture with human-in-the-loop AI
          guardrails.
        </p>
      </footer>
    </div>
  );
}
