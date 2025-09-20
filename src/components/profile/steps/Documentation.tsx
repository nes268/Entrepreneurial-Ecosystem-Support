import React, { useState } from 'react';
import Button from '../../ui/Button';
import { Profile } from '../../../types';
import { FileText, Upload, Check } from 'lucide-react';

interface DocumentationProps {
  data: Partial<Profile>;
  updateData: (data: Partial<Profile>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const Documentation: React.FC<DocumentationProps> = ({ data, updateData, onNext, onPrev }) => {
  const [formData, setFormData] = useState({
    aadhaarDoc: data.aadhaarDoc || '',
    incorporationCert: data.incorporationCert || '',
    msmeCert: data.msmeCert || '',
    dpiitCert: data.dpiitCert || '',
    mouPartnership: data.mouPartnership || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.aadhaarDoc) {
      setErrors({ aadhaarDoc: 'Aadhaar document is mandatory' });
      return;
    }

    updateData(formData);
    onNext();
  };

  const handleFileUpload = (field: keyof typeof formData) => {
    // Simulate file upload
    const fileName = `${field}_${Date.now()}.pdf`;
    setFormData({
      ...formData,
      [field]: fileName,
    });
  };

  const documents = [
    {
      key: 'aadhaarDoc' as const,
      label: 'Aadhaar Card',
      required: true,
      description: 'Upload your Aadhaar card (PDF or Image)',
    },
    {
      key: 'incorporationCert' as const,
      label: 'Incorporation Certificate',
      required: false,
      description: 'Company incorporation certificate',
    },
    {
      key: 'msmeCert' as const,
      label: 'MSME Certificate',
      required: false,
      description: 'MSME registration certificate',
    },
    {
      key: 'dpiitCert' as const,
      label: 'DPIIT Certificate',
      required: false,
      description: 'DPIIT recognition certificate',
    },
    {
      key: 'mouPartnership' as const,
      label: 'MoU/Partnership',
      required: false,
      description: 'Partnership agreements or MoUs',
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-cyan-500/10 rounded-lg">
          <FileText className="h-6 w-6 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Documentation Upload</h2>
          <p className="text-gray-400">Upload your required documents</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.key} className="border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium text-white">{doc.label}</h3>
                  {doc.required && <span className="text-red-400 text-sm">*Required</span>}
                </div>
                {formData[doc.key] && (
                  <div className="flex items-center text-green-400 text-sm">
                    <Check className="h-4 w-4 mr-1" />
                    Uploaded
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-400 mb-3">{doc.description}</p>
              
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant={formData[doc.key] ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => handleFileUpload(doc.key)}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>{formData[doc.key] ? 'Replace File' : 'Upload File'}</span>
                </Button>
                
                {formData[doc.key] && (
                  <span className="text-sm text-gray-300">{formData[doc.key]}</span>
                )}
              </div>
              
              {errors[doc.key] && (
                <p className="text-sm text-red-400 mt-2">{errors[doc.key]}</p>
              )}
            </div>
          ))}
        </div>

        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
          <p className="text-sm text-yellow-400">
            <strong>Note:</strong> Aadhaar document upload is mandatory. All other documents are optional but recommended for faster processing.
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

export default Documentation;