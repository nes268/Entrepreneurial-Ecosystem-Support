import React, { useState } from 'react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { Profile } from '../../../types';
import { Lightbulb, Plus, X } from 'lucide-react';

interface IncubationDetailsProps {
  data: Partial<Profile>;
  updateData: (data: Partial<Profile>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const IncubationDetails: React.FC<IncubationDetailsProps> = ({ data, updateData, onNext, onPrev }) => {
  const [formData, setFormData] = useState({
    previouslyIncubated: data.previouslyIncubated || false,
    incubatorName: data.incubatorName || '',
    incubatorLocation: data.incubatorLocation || '',
    incubationDuration: data.incubationDuration || '',
    incubatorType: data.incubatorType || '',
    incubationMode: data.incubationMode || 'offline',
    supportsReceived: data.supportsReceived || [''],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filteredSupports = formData.supportsReceived.filter(support => support.trim() !== '');
    updateData({ 
      ...formData, 
      supportsReceived: filteredSupports.length > 0 ? filteredSupports : undefined 
    });
    onNext();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const addSupport = () => {
    setFormData({
      ...formData,
      supportsReceived: [...formData.supportsReceived, ''],
    });
  };

  const removeSupport = (index: number) => {
    const updated = formData.supportsReceived.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      supportsReceived: updated.length > 0 ? updated : [''],
    });
  };

  const updateSupport = (index: number, value: string) => {
    const updated = [...formData.supportsReceived];
    updated[index] = value;
    setFormData({
      ...formData,
      supportsReceived: updated,
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-cyan-500/10 rounded-lg">
          <Lightbulb className="h-6 w-6 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Incubation Details</h2>
          <p className="text-gray-400">Tell us about your incubation experience</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Previously Incubated */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300">
            Have you been incubated previously?
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="previouslyIncubated"
                value="true"
                checked={formData.previouslyIncubated === true}
                onChange={() => setFormData({ ...formData, previouslyIncubated: true })}
                className="mr-2 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-gray-300">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="previouslyIncubated"
                value="false"
                checked={formData.previouslyIncubated === false}
                onChange={() => setFormData({ ...formData, previouslyIncubated: false })}
                className="mr-2 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-gray-300">No</span>
            </label>
          </div>
        </div>

        {/* Show details only if previously incubated */}
        {formData.previouslyIncubated && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Incubator Name"
                name="incubatorName"
                type="text"
                value={formData.incubatorName}
                onChange={handleChange}
                placeholder="Enter incubator name"
              />

              <Input
                label="Incubator Location"
                name="incubatorLocation"
                type="text"
                value={formData.incubatorLocation}
                onChange={handleChange}
                placeholder="City, State, Country"
              />

              <Input
                label="Duration of Incubation"
                name="incubationDuration"
                type="text"
                value={formData.incubationDuration}
                onChange={handleChange}
                placeholder="e.g., 6 months"
              />

              <Input
                label="Type of Incubator"
                name="incubatorType"
                type="text"
                value={formData.incubatorType}
                onChange={handleChange}
                placeholder="e.g., Government, Private, University"
              />
            </div>

            {/* Mode of Incubation */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">Mode of Incubation</label>
              <select
                name="incubationMode"
                value={formData.incubationMode}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {/* Supports Received */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-300">Supports/Benefits Received</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addSupport}
                  className="flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Support</span>
                </Button>
              </div>
              {formData.supportsReceived.map((support, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    type="text"
                    value={support}
                    onChange={(e) => updateSupport(index, e.target.value)}
                    placeholder={`Support/Benefit ${index + 1}`}
                    className="flex-1"
                  />
                  {formData.supportsReceived.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSupport(index)}
                      className="px-3"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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

export default IncubationDetails;