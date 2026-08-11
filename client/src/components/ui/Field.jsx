import { useId } from 'react';

export function TextField({
  label,
  value,
  onChange,
  error,
  hint,
  type = 'text',
  optional = false,
  ...rest
}) {
  const id = useId();

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
        {optional ? <span className="field-optional"> (optional)</span> : null}
      </label>
      <input
        id={id}
        className={`input${error ? ' has-error' : ''}`}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        {...rest}
      />
      {error ? <span className="field-error">{error}</span> : null}
      {!error && hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}

export function TextAreaField({ label, value, onChange, error, hint, rows = 3, ...rest }) {
  const id = useId();

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        className={`textarea${error ? ' has-error' : ''}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        {...rest}
      />
      {error ? <span className="field-error">{error}</span> : null}
      {!error && hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}

export function SelectField({ label, value, onChange, options, error, hint, ...rest }) {
  const id = useId();

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className={`select${error ? ' has-error' : ''}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="field-error">{error}</span> : null}
      {!error && hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}
