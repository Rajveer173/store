import { passwordRules } from '../../utils/validation';

export function PasswordChecklist({ value }) {
  return (
    <div className="password-checklist">
      {passwordRules.map((rule) => (
        <span key={rule.key} className={`password-rule${rule.test(value) ? ' met' : ''}`}>
          {rule.label}
        </span>
      ))}
    </div>
  );
}
