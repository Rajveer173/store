import { useState } from 'react';
import { api, extractError } from '../api/client';
import { TextField } from '../components/ui/Field';
import { Alert, Button, Card, CardBody, CardHeader } from '../components/ui/Primitives';
import { PasswordChecklist } from '../components/ui/PasswordChecklist';
import { hasErrors, validatePassword, validateRequired } from '../utils/validation';

const INITIAL_FORM = { currentPassword: '', newPassword: '', confirmPassword: '' };

export function ChangePasswordPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateField = (key) => (value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: '' }));
    setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSuccess('');

    const nextErrors = {
      currentPassword: validateRequired(form.currentPassword, 'Current password'),
      newPassword: validatePassword(form.newPassword),
      confirmPassword:
        form.confirmPassword !== form.newPassword ? 'Passwords do not match' : '',
    };
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSubmitting(true);
    try {
      await api.patch('/auth/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm(INITIAL_FORM);
      setSuccess('Your password has been updated successfully.');
    } catch (error) {
      const { message, fieldErrors } = extractError(error);
      setErrors((previous) => ({ ...previous, ...fieldErrors }));
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1 className="page-title">Change password</h1>
          <p className="page-subtitle">
            Choose a strong password that you do not use on any other service.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 560 }}>
        <Card>
          <CardHeader
            title="Password details"
            description="You will stay signed in on this device after the change."
          />
          <CardBody>
            <Alert variant="error">{formError}</Alert>
            <Alert variant="success">{success}</Alert>

            <form onSubmit={handleSubmit} noValidate>
              <TextField
                label="Current password"
                type="password"
                value={form.currentPassword}
                onChange={updateField('currentPassword')}
                error={errors.currentPassword}
                autoComplete="current-password"
              />
              <div className="field">
                <TextField
                  label="New password"
                  type="password"
                  value={form.newPassword}
                  onChange={updateField('newPassword')}
                  error={errors.newPassword}
                  autoComplete="new-password"
                  maxLength={16}
                />
                <PasswordChecklist value={form.newPassword} />
              </div>
              <TextField
                label="Confirm new password"
                type="password"
                value={form.confirmPassword}
                onChange={updateField('confirmPassword')}
                error={errors.confirmPassword}
                autoComplete="new-password"
                maxLength={16}
              />
              <Button type="submit" loading={submitting}>
                Update password
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
