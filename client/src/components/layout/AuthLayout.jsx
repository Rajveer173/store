const HIGHLIGHTS = [
  {
    title: 'Verified store directory',
    text: 'Every store on the platform is registered and maintained by an administrator.',
  },
  {
    title: 'Ratings from real customers',
    text: 'Submit a score from one to five and update it whenever your experience changes.',
  },
  {
    title: 'Insight for store owners',
    text: 'Owners track their average score and see exactly who left each rating.',
  },
];

export function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <aside className="auth-aside">
        <div>
          <p className="auth-aside-brand">Store Ratings</p>
          <h1 className="auth-aside-headline">A single platform for store feedback</h1>
          <p className="auth-aside-copy">
            One account, three roles. Administrators manage the directory, customers rate the stores
            they visit, and owners follow the results.
          </p>

          <div className="auth-aside-list">
            {HIGHLIGHTS.map((highlight, index) => (
              <div className="auth-aside-item" key={highlight.title}>
                <span className="auth-aside-index">{index + 1}</span>
                <div>
                  <p className="auth-aside-item-title">{highlight.title}</p>
                  <p className="auth-aside-item-text">{highlight.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="auth-aside-footer">Store Ratings Platform</p>
      </aside>

      <main className="auth-main">
        <div className="auth-card">{children}</div>
      </main>
    </div>
  );
}
