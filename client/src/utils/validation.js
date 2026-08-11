const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const passwordRules = [
  { key: 'length', label: '8 to 16 characters', test: (value) => value.length >= 8 && value.length <= 16 },
  { key: 'uppercase', label: 'At least one uppercase letter', test: (value) => /[A-Z]/.test(value) },
  {
    key: 'special',
    label: 'At least one special character',
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

export function validateName(value) {
  const trimmed = value.trim();
  if (!trimmed) return 'Name is required';
  if (trimmed.length < 20) return `Name must be at least 20 characters (currently ${trimmed.length})`;
  if (trimmed.length > 60) return 'Name must not exceed 60 characters';
  return '';
}

export function validateEmail(value) {
  const trimmed = value.trim();
  if (!trimmed) return 'Email is required';
  if (!EMAIL_RULE.test(trimmed)) return 'Enter a valid email address';
  return '';
}

export function validateAddress(value) {
  const trimmed = value.trim();
  if (!trimmed) return 'Address is required';
  if (trimmed.length > 400) return 'Address must not exceed 400 characters';
  return '';
}

export function validatePassword(value) {
  if (!value) return 'Password is required';
  const failed = passwordRules.find((rule) => !rule.test(value));
  if (!failed) return '';
  if (failed.key === 'length') return 'Password must be 8 to 16 characters';
  return 'Password must include at least one uppercase letter and one special character';
}

export function validateRequired(value, label) {
  return value?.trim() ? '' : `${label} is required`;
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}
