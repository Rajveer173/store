import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { TextField } from '../components/ui/Field';
import { Alert, Button } from '../components/ui/Primitives';
import { useAuth } from '../context/AuthContext';
import { extractError } from '../api/client';
import { ROLE_HOME_PATH } from '../constants/roles';
import { validateEmail, validateRequired, hasErrors } from '../utils/validation';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateField = (key) => (value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const nextErrors = {
      email: validateEmail(form.email),
      password: validateRequired(form.password, 'Password'),
    };
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSubmitting(true);
    try {
      const user = await login({ email: form.email.trim(), password: form.password });
      navigate(ROLE_HOME_PATH[user.role] ?? '/', { replace: true });
    } catch (error) {
      const { message, fieldErrors } = extractError(error);
      setErrors((previous) => ({ ...previous, ...fieldErrors }));
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="auth-card-title">Sign in</h1>
      <p className="auth-card-subtitle">
        Use your registered email address to access the platform.
      </p>

      <Alert variant="error">{formError}</Alert>

      <form onSubmit={handleSubmit} noValidate>
        <TextField
          label="Email address"
          type="email"
          value={form.email}
          onChange={updateField('email')}
          error={errors.email}
          autoComplete="email"
          placeholder="you@example.com"
        />
        <TextField
          label="Password"
          type="password"
          value={form.password}
          onChange={updateField('password')}
          error={errors.password}
          autoComplete="current-password"
          placeholder="Enter your password"
        />
        <Button type="submit" block loading={submitting}>
          Sign in
        </Button>
      </form>

      <p className="auth-footer-note">
        Do not have an account? <Link to="/register">Create one</Link>
      </p>
    </AuthLayout>
  );
}
