import React, { useState, useEffect } from 'react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { Profile } from '../../../types';
import { User } from 'lucide-react';

interface PersonalInfoProps {
  data: Partial<Profile>;
  updateData: (data: Partial<Profile>) => void;
  onNext: () => void;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ data, updateData, onNext }) => {
  const [formData, setFormData] = useState({
    fullName: data.fullName || '',
    email: data.email || '',
    phoneNumber: data.phoneNumber || '',
    location: data.location || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.location) newErrors.location = 'Location is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateData(formData);
    onNext();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-cyan-500/10 rounded-lg">
          <User className="h-6 w-6 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Personal Information</h2>
          <p className="text-gray-400">Tell us about yourself</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Full Name"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            placeholder="Enter your full name"
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Enter your email"
          />

          <Input
            label="Phone Number"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            error={errors.phoneNumber}
            placeholder="Enter your phone number"
          />

          <Input
            label="Location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
            error={errors.location}
            placeholder="City, State, Country"
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary">
            Next Step
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInfo;