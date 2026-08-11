export function Button({
  children,
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  disabled = false,
  type = 'button',
  ...rest
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size === 'sm' ? 'btn-sm' : '',
    block ? 'btn-block' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} type={type} disabled={disabled || loading} {...rest}>
      {loading ? (
        <span className={`spinner${variant === 'primary' ? ' spinner-light' : ''}`} />
      ) : null}
      {children}
    </button>
  );
}

export function Card({ children, className = '' }) {
  return <section className={`card ${className}`.trim()}>{children}</section>;
}

export function CardHeader({ title, description, actions }) {
  return (
    <header className="card-header">
      <div>
        <h2 className="card-title">{title}</h2>
        {description ? <p className="card-description">{description}</p> : null}
      </div>
      {actions ? <div className="row">{actions}</div> : null}
    </header>
  );
}

export function CardBody({ children, tight = false }) {
  return <div className={`card-body${tight ? ' tight' : ''}`}>{children}</div>;
}

export function Badge({ children, variant = 'neutral' }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

export function Alert({ children, variant = 'info' }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${variant}`} role={variant === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, hint }) {
  return (
    <article className="stat-card">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {hint ? <p className="stat-hint">{hint}</p> : null}
    </article>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <p className="empty-state-title">{title}</p>
      {description ? <p className="empty-state-text">{description}</p> : null}
    </div>
  );
}

export function LoadingBlock({ label = 'Loading' }) {
  return (
    <div className="loading-block">
      <span className="spinner" /> <span style={{ marginLeft: 8 }}>{label}</span>
    </div>
  );
}
