import { useEffect, useState } from 'react';
import { api, extractError } from '../../api/client';
import { Modal } from '../../components/ui/Modal';
import { SelectField, TextAreaField, TextField } from '../../components/ui/Field';
import { Alert, Button } from '../../components/ui/Primitives';
import { hasErrors, validateAddress, validateEmail, validateName } from '../../utils/validation';

const INITIAL_FORM = { name: '', email: '', address: '', ownerId: '' };

export function AddStoreModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [owners, setOwners] = useState([]);

  useEffect(() => {
    if (!open) return;

    setForm(INITIAL_FORM);
    setErrors({});
    setFormError('');

    api
      .get('/admin/owners')
      .then(({ data }) => setOwners(data.data ?? []))
      .catch(() => setOwners([]));
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
    };
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSubmitting(true);
    try {
      const { data } = await api.post('/admin/stores', {
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        ownerId: form.ownerId === '' ? null : Number(form.ownerId),
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

  const ownerOptions = [
    { value: '', label: 'No owner assigned' },
    ...owners.map((owner) => ({ value: String(owner.id), label: `${owner.name} (${owner.email})` })),
  ];

  return (
    <Modal
      open={open}
      title="Add new store"
      description="Register a store and optionally assign an existing store owner."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={submitting}>
            Create store
          </Button>
        </>
      }
    >
      <Alert variant="error">{formError}</Alert>

      <form onSubmit={handleSubmit} noValidate>
        <TextField
          label="Store name"
          value={form.name}
          onChange={updateField('name')}
          error={errors.name}
          hint={`Between 20 and 60 characters (${form.name.trim().length} entered)`}
          maxLength={60}
          placeholder="Registered trading name"
        />
        <TextField
          label="Store email"
          type="email"
          value={form.email}
          onChange={updateField('email')}
          error={errors.email}
          placeholder="contact@store.com"
        />
        <TextAreaField
          label="Address"
          value={form.address}
          onChange={updateField('address')}
          error={errors.address}
          hint={`Maximum 400 characters (${form.address.trim().length} entered)`}
          maxLength={400}
          placeholder="Shop number, street, city, state and postal code"
        />
        <SelectField
          label="Store owner"
          value={form.ownerId}
          onChange={updateField('ownerId')}
          options={ownerOptions}
          error={errors.ownerId}
          hint="Only users with the store owner role can be assigned."
        />
      </form>
    </Modal>
  );
}
