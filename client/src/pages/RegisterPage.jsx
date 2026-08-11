import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { TextAreaField, TextField } from '../components/ui/Field';
import { Alert, Button } from '../components/ui/Primitives';
import { PasswordChecklist } from '../components/ui/PasswordChecklist';
import { useAuth } from '../context/AuthContext';
import { extractError } from '../api/client';
import { ROLE_HOME_PATH } from '../constants/roles';
import {
  hasErrors,
  validateAddress,
  validateEmail,
  validateName,
  validatePassword,
} from '../utils/validation';

const INITIAL_FORM = { name: '', email: '', address: '', password: '' };

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
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
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
      password: validatePassword(form.password),
    };
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSubmitting(true);
    try {
      const user = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        password: form.password,
      });
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
      <h1 className="auth-card-title">Create your account</h1>
      <p className="auth-card-subtitle">
        Register as a customer to browse stores and submit your ratings.
      </p>

      <Alert variant="error">{formError}</Alert>

      <form onSubmit={handleSubmit} noValidate>
        <TextField
          label="Full name"
          value={form.name}
          onChange={updateField('name')}
          error={errors.name}
          hint={`Between 20 and 60 characters (${form.name.trim().length} entered)`}
          autoComplete="name"
          maxLength={60}
          placeholder="Enter your full legal name"
        />
        <TextField
          label="Email address"
          type="email"
          value={form.email}
          onChange={updateField('email')}
          error={errors.email}
          autoComplete="email"
          placeholder="you@example.com"
        />
        <TextAreaField
          label="Address"
          value={form.address}
          onChange={updateField('address')}
          error={errors.address}
          hint={`Maximum 400 characters (${form.address.trim().length} entered)`}
          maxLength={400}
          placeholder="House number, street, city, state and postal code"
        />
        <div className="field">
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={updateField('password')}
            error={errors.password}
            autoComplete="new-password"
            maxLength={16}
            placeholder="Create a password"
          />
          <PasswordChecklist value={form.password} />
        </div>
        <Button type="submit" block loading={submitting}>
          Create account
        </Button>
      </form>

      <p className="auth-footer-note">
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
