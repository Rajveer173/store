import { useEffect, useState } from 'react';
import { api, extractError } from '../../api/client';
import { Modal } from '../../components/ui/Modal';
import { SelectField, TextAreaField, TextField } from '../../components/ui/Field';
import { Alert, Button } from '../../components/ui/Primitives';
import { PasswordChecklist } from '../../components/ui/PasswordChecklist';
import { ROLES, ROLE_LABELS } from '../../constants/roles';
import {
  hasErrors,
  validateAddress,
  validateEmail,
  validateName,
  validatePassword,
} from '../../utils/validation';

const INITIAL_FORM = {
  name: '',
  email: '',
  address: '',
  password: '',
  role: ROLES.USER,
};

const ROLE_OPTIONS = [
  { value: ROLES.USER, label: ROLE_LABELS[ROLES.USER] },
  { value: ROLES.OWNER, label: ROLE_LABELS[ROLES.OWNER] },
  { value: ROLES.ADMIN, label: ROLE_LABELS[ROLES.ADMIN] },
];

export function AddUserModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(INITIAL_FORM);
      setErrors({});
      setFormError('');
    }
  }, [open]);

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
      const { data } = await api.post('/admin/users', {
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        password: form.password,
        role: form.role,
      });
      onCreated(data);
    } catch (error) {
      const { message, fieldErrors } = extractError(error);
      setErrors((previous) => ({ ...previous, ...fieldErrors }));
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Add new user"
      description="Create an administrator, customer or store owner account."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={submitting}>
            Create user
          </Button>
        </>
      }
    >
      <Alert variant="error">{formError}</Alert>

      <form onSubmit={handleSubmit} noValidate>
        <TextField
          label="Name"
          value={form.name}
          onChange={updateField('name')}
          error={errors.name}
          hint={`Between 20 and 60 characters (${form.name.trim().length} entered)`}
          maxLength={60}
          placeholder="Full legal name"
        />
        <TextField
          label="Email"
          type="email"
          value={form.email}
          onChange={updateField('email')}
          error={errors.email}
          placeholder="user@example.com"
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
        <SelectField
          label="Role"
          value={form.role}
          onChange={updateField('role')}
          options={ROLE_OPTIONS}
          error={errors.role}
        />
        <div className="field">
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={updateField('password')}
            error={errors.password}
            maxLength={16}
            autoComplete="new-password"
            placeholder="Set an initial password"
          />
          <PasswordChecklist value={form.password} />
        </div>
      </form>
    </Modal>
  );
}
