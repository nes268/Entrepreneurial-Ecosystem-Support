import React, { useState } from 'react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { Profile } from '../../../types';
import { Building2, Plus, X } from 'lucide-react';

interface EnterpriseInfoProps {
  data: Partial<Profile>;
  updateData: (data: Partial<Profile>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const sectors = [
  'HealthTech', 'EdTech', 'FinTech', 'AgriTech', 'FoodTech', 'RetailTech',
  'PropTech', 'LogisTech', 'CleanTech', 'BioTech', 'DeepTech', 'Gaming',
  'E-commerce', 'B2B SaaS'
];

const EnterpriseInfo: React.FC<EnterpriseInfoProps> = ({ data, updateData, onNext, onPrev }) => {
  const [formData, setFormData] = useState({
    startupName: data.startupName || '',
    entityType: data.entityType || '',
    applicationType: data.applicationType || 'innovation',
    founderName: data.founderName || '',
    coFounderNames: data.coFounderNames || [''],
    sector: data.sector || '',
    linkedinProfile: data.linkedinProfile || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.startupName) newErrors.startupName = 'Startup name is required';
    if (!formData.entityType) newErrors.entityType = 'Entity type is required';
    if (!formData.founderName) newErrors.founderName = 'Founder name is required';
    if (!formData.sector) newErrors.sector = 'Sector selection is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const filteredCoFounders = formData.coFounderNames.filter(name => name.trim() !== '');
    updateData({ ...formData, coFounderNames: filteredCoFounders });
    onNext();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addCoFounder = () => {
    setFormData({
      ...formData,
      coFounderNames: [...formData.coFounderNames, ''],
    });
  };

  const removeCoFounder = (index: number) => {
    const updated = formData.coFounderNames.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      coFounderNames: updated.length > 0 ? updated : [''],
    });
  };

  const updateCoFounder = (index: number, value: string) => {
    const updated = [...formData.coFounderNames];
    updated[index] = value;
    setFormData({
      ...formData,
      coFounderNames: updated,
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-cyan-500/10 rounded-lg">
          <Building2 className="h-6 w-6 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Enterprise Information</h2>
          <p className="text-gray-400">Tell us about your startup</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Startup Name"
            name="startupName"
            type="text"
            value={formData.startupName}
            onChange={handleChange}
            error={errors.startupName}
            placeholder="Enter startup name"
          />

          <Input
            label="Entity Type"
            name="entityType"
            type="text"
            value={formData.entityType}
            onChange={handleChange}
            error={errors.entityType}
            placeholder="e.g., Private Limited, LLP"
          />

          <Input
            label="Founder Name"
            name="founderName"
            type="text"
            value={formData.founderName}
            onChange={handleChange}
            error={errors.founderName}
            placeholder="Enter founder name"
          />

          <Input
            label="LinkedIn Profile"
            name="linkedinProfile"
            type="url"
            value={formData.linkedinProfile}
            onChange={handleChange}
            placeholder="LinkedIn profile URL"
          />
        </div>

        {/* Application Type */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300">Application Type</label>
          <div className="grid grid-cols-2 gap-3">
            {(['innovation', 'incubation'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, applicationType: type })}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  formData.applicationType === type
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                    : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="text-sm font-medium capitalize">{type}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sector Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300">Select Sector</label>
          <select
            name="sector"
            value={formData.sector}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Choose a sector</option>
            {sectors.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
          {errors.sector && <p className="text-sm text-red-400">{errors.sector}</p>}
        </div>

        {/* Co-founders */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-300">Co-founder Names (Optional)</label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addCoFounder}
              className="flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add Co-founder</span>
            </Button>
          </div>
          {formData.coFounderNames.map((name, index) => (
            <div key={index} className="flex space-x-2">
              <Input
                type="text"
                value={name}
                onChange={(e) => updateCoFounder(index, e.target.value)}
                placeholder={`Co-founder ${index + 1} name`}
                className="flex-1"
              />
              {formData.coFounderNames.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCoFounder(index)}
                  className="px-3"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onPrev}>
            Previous
          </Button>
          <Button type="submit" variant="primary">
            Next Step
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EnterpriseInfo;