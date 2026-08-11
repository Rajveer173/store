import { formatRating } from '../../utils/format';

export function RatingDisplay({ value, count, showBar = true }) {
  const numeric = Number(value ?? 0);
  const percentage = Math.max(0, Math.min(100, (numeric / 5) * 100));

  return (
    <span className="rating-display">
      <span className="rating-value">{formatRating(numeric)}</span>
      {showBar ? (
        <span className="rating-bar" aria-hidden="true">
          <span className="rating-bar-fill" style={{ width: `${percentage}%` }} />
        </span>
      ) : null}
      {count !== undefined ? (
        <span className="rating-count">
          {count} {count === 1 ? 'rating' : 'ratings'}
        </span>
      ) : null}
    </span>
  );
}

export function RatingInput({ value, onSelect, disabled = false, name }) {
  return (
    <div className="rating-input" role="group" aria-label={name ?? 'Select a rating'}>
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          className={`rating-option${value === score ? ' selected' : ''}`}
          onClick={() => onSelect(score)}
          disabled={disabled}
          aria-pressed={value === score}
          aria-label={`Rate ${score} out of 5`}
        >
          {score}
        </button>
      ))}
    </div>
  );
}

export function RatingDistribution({ distribution }) {
  const total = distribution.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <div>
      {[...distribution].reverse().map((entry) => {
        const percentage = total === 0 ? 0 : (entry.count / total) * 100;
        return (
          <div className="distribution-row" key={entry.score}>
            <span className="distribution-label">
              {entry.score} {entry.score === 1 ? 'star' : 'stars'}
            </span>
            <span className="distribution-track">
              <span className="distribution-fill" style={{ width: `${percentage}%` }} />
            </span>
            <span className="distribution-count">{entry.count}</span>
          </div>
        );
      })}
    </div>
  );
}
