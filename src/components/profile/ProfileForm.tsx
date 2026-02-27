'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/buttons';
import { User } from '@/types/user.types';
import { validateName, validatePhone } from '@/lib/utils/validation';

interface ProfileFormProps {
  user: User;
  onSubmit: (data: Partial<User>) => Promise<void>;
  loading?: boolean;
}

export default function ProfileForm({ user, onSubmit, loading }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    displayName: user.displayName || '',
    phoneNumber: user.phoneNumber || '',
    address: user.address || '',
    city: user.city || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    newErrors.displayName = validateName(formData.displayName);
    newErrors.phoneNumber = validatePhone(formData.phoneNumber);

    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value)
    );
    
    setErrors(filteredErrors);
    
    if (Object.keys(filteredErrors).length === 0) {
      await onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="Nombre completo"
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
          error={errors.displayName}
          required
        />

        <Input
          label="Teléfono"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          error={errors.phoneNumber}
          placeholder="+51 987654321"
        />
      </div>

      <Input
        label="Dirección"
        name="address"
        value={formData.address}
        onChange={handleChange}
        error={errors.address}
        placeholder="Calle, número, departamento"
      />

      <Input
        label="Ciudad"
        name="city"
        value={formData.city}
        onChange={handleChange}
        error={errors.city}
        placeholder="Ej: Lima"
      />

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          loading={loading}
        >
          Guardar Cambios
        </Button>
      </div>
    </form>
  );
}