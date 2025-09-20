import React, { useState } from 'react';
import Button from '../../ui/Button';
import { Profile } from '../../../types';
import { BarChart3, Upload, Check, Plus, X } from 'lucide-react';

interface PitchDeckTractionProps {
  data: Partial<Profile>;
  updateData: (data: Partial<Profile>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const PitchDeckTraction: React.FC<PitchDeckTractionProps> = ({ data, updateData, onNext, onPrev }) => {
  const [formData, setFormData] = useState({
    businessDocuments: data.businessDocuments || [],
    tractionDetails: data.tractionDetails || [],
    balanceSheet: data.balanceSheet || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData(formData);
    onNext();
  };

  const handleFileUpload = (type: 'business' | 'traction' | 'balance') => {
    const fileName = `${type}_document_${Date.now()}.pdf`;
    
    if (type === 'balance') {
      setFormData({
        ...formData,
        balanceSheet: fileName,
      });
    } else if (type === 'business') {
      setFormData({
        ...formData,
        businessDocuments: [...(formData.businessDocuments || []), fileName],
      });
    } else {
      setFormData({
        ...formData,
        tractionDetails: [...(formData.tractionDetails || []), fileName],
      });
    }
  };

  const removeFile = (type: 'business' | 'traction', index: number) => {
    if (type === 'business') {
      const updated = formData.businessDocuments?.filter((_, i) => i !== index) || [];
      setFormData({ ...formData, businessDocuments: updated });
    } else {
      const updated = formData.tractionDetails?.filter((_, i) => i !== index) || [];
      setFormData({ ...formData, tractionDetails: updated });
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-cyan-500/10 rounded-lg">
          <BarChart3 className="h-6 w-6 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Pitch Deck & Traction</h2>
          <p className="text-gray-400">Upload your business documents and traction data</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Business Documents */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Business Documents / Pitch Deck</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleFileUpload('business')}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Document</span>
            </Button>
          </div>
          
          {formData.businessDocuments && formData.businessDocuments.length > 0 ? (
            <div className="space-y-2">
              {formData.businessDocuments.map((doc, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>{doc}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile('business', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No business documents uploaded yet</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleFileUpload('business')}
                className="mt-2"
              >
                Upload First Document
              </Button>
            </div>
          )}
        </div>

        {/* Traction Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Traction Details</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleFileUpload('traction')}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Traction Document</span>
            </Button>
          </div>
          
          {formData.tractionDetails && formData.tractionDetails.length > 0 ? (
            <div className="space-y-2">
              {formData.tractionDetails.map((doc, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>{doc}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile('traction', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No traction documents uploaded yet</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleFileUpload('traction')}
                className="mt-2"
              >
                Upload Traction Data
              </Button>
            </div>
          )}
        </div>

        {/* Balance Sheet */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Balance Sheet</h3>
          <div className="border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300">Upload your latest balance sheet</p>
                <p className="text-sm text-gray-400">Financial statements for the current year</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant={formData.balanceSheet ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => handleFileUpload('balance')}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>{formData.balanceSheet ? 'Replace' : 'Upload'}</span>
                </Button>
                {formData.balanceSheet && (
                  <div className="flex items-center text-green-400 text-sm">
                    <Check className="h-4 w-4 mr-1" />
                    <span>{formData.balanceSheet}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
          <p className="text-sm text-blue-400">
            <strong>Tip:</strong> Upload comprehensive documents that showcase your business model, market traction, and financial health. This helps accelerate the review process.
          </p>
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

export default PitchDeckTraction;