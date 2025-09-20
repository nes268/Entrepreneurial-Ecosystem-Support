import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Presentation as PresentationChart, Download, Upload, Eye, Edit, FileText } from 'lucide-react';

const PitchDeck: React.FC = () => {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [uploadedDecks, setUploadedDecks] = useState<any[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDeck, setEditingDeck] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    template: '',
    description: ''
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const templates = [
    {
      id: 'msme',
      name: 'MSME Format',
      description: 'Standardized format for MSME registration and government programs',
      slides: 12,
      color: 'bg-blue-500'
    },
    {
      id: 'ivp',
      name: 'IVP Format',
      description: 'Investor-focused presentation template with financial projections',
      slides: 15,
      color: 'bg-emerald-500'
    },
    {
      id: 'readiness',
      name: 'Investment Readiness',
      description: 'Comprehensive template for Series A and beyond fundraising',
      slides: 20,
      color: 'bg-purple-500'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const processFile = (file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid file format (PDF, PPT, PPTX)');
      return;
    }

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB');
      return;
    }

    const newDeck = {
      id: Date.now().toString(),
      name: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
      template: 'Custom Upload',
      lastModified: new Date().toISOString().split('T')[0],
      status: 'Draft',
      fileSize: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      fileType: file.type
    };
    setUploadedDecks([...uploadedDecks, newDeck]);
    setShowUploadForm(false);
    showMessage('Pitch deck uploaded successfully!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleCreateFromTemplate = () => {
    if (!formData.name || !activeTemplate) {
      alert('Please provide a deck name');
      return;
    }

    const template = templates.find(t => t.id === activeTemplate);
    const newDeck = {
      id: Date.now().toString(),
      name: formData.name,
      template: template?.name || 'Custom',
      lastModified: new Date().toISOString().split('T')[0],
      status: 'Draft',
      description: formData.description
    };
    
    setUploadedDecks([...uploadedDecks, newDeck]);
    setFormData({ name: '', template: '', description: '' });
    setShowCreateForm(false);
    setActiveTemplate(null);
    showMessage('Pitch deck created successfully!');
  };

  const handleEditDeck = (deck: any) => {
    setEditingDeck(deck);
    setFormData({
      name: deck.name,
      template: deck.template,
      description: deck.description || ''
    });
    setShowCreateForm(true);
  };

  const handleUpdateDeck = () => {
    if (!editingDeck || !formData.name) {
      alert('Please provide a deck name');
      return;
    }

    setUploadedDecks(prev => prev.map(deck => 
      deck.id === editingDeck.id 
        ? { ...deck, name: formData.name, description: formData.description, lastModified: new Date().toISOString().split('T')[0] }
        : deck
    ));
    
    setFormData({ name: '', template: '', description: '' });
    setEditingDeck(null);
    setShowCreateForm(false);
    showMessage('Pitch deck updated successfully!');
  };

  const handleDeleteDeck = (deckId: string) => {
    if (confirm('Are you sure you want to delete this pitch deck?')) {
      setUploadedDecks(prev => prev.filter(deck => deck.id !== deckId));
      showMessage('Pitch deck deleted successfully!');
    }
  };

  const showMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const resetForm = () => {
    setFormData({ name: '', template: '', description: '' });
    setEditingDeck(null);
    setShowUploadForm(false);
    setShowCreateForm(false);
  };

  const handleStatusUpdate = (deckId: string, newStatus: string) => {
    setUploadedDecks(prev => prev.map(deck => 
      deck.id === deckId 
        ? { ...deck, status: newStatus, lastModified: new Date().toISOString().split('T')[0] }
        : deck
    ));
    showMessage(`Deck status updated to ${newStatus}`);
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showUploadForm) {
        setShowUploadForm(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showUploadForm]);

  if (activeTemplate && !showCreateForm) {
    const template = templates.find(t => t.id === activeTemplate);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => setActiveTemplate(null)}>
            ← Back to Templates
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Create Pitch Deck</h1>
            <p className="text-gray-400 mt-1">Using {template?.name} template</p>
          </div>
        </div>

        <Card className="p-6">
          <div className="text-center py-12">
            <PresentationChart className="h-24 w-24 text-cyan-400 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-white mb-4">Template Selected: {template?.name}</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              This template includes {template?.slides} pre-designed slides with {template?.description.toLowerCase()}.
            </p>
            
            <div className="space-y-4 max-w-sm mx-auto">
              <Button className="w-full" onClick={() => setShowCreateForm(true)}>
                Create Deck from Template
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setActiveTemplate(null)}>
                Choose Different Template
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (showCreateForm) {
    const template = templates.find(t => t.id === activeTemplate);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={resetForm}>
            ← Back to Templates
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {editingDeck ? 'Edit Pitch Deck' : 'Create New Deck'}
            </h1>
            <p className="text-gray-400 mt-1">
              {editingDeck ? 'Update your pitch deck details' : `Using ${template?.name} template`}
            </p>
          </div>
        </div>

        <Card className="p-6 max-w-2xl">
          <form onSubmit={(e) => {
            e.preventDefault();
            editingDeck ? handleUpdateDeck() : handleCreateFromTemplate();
          }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Deck Name *</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter deck name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea 
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Brief description of your pitch deck"
              />
            </div>

            {!editingDeck && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Template</label>
                <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${template?.color} rounded flex items-center justify-center`}>
                      <PresentationChart className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{template?.name}</h4>
                      <p className="text-sm text-gray-400">{template?.description}</p>
                      <p className="text-xs text-gray-500">{template?.slides} slides included</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {editingDeck ? 'Update Deck' : 'Create Deck'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-emerald-900/20 border border-emerald-500/50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-emerald-400">✓</span>
            <span className="text-emerald-300">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Pitch Deck</h1>
          <p className="text-gray-400 mt-1">Create and manage your startup presentations</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowUploadForm(true)} className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Upload Deck</span>
          </Button>
        </div>
      </div>

      {/* Upload Form Popup Modal */}
      {showUploadForm && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUploadForm(false);
            }
          }}
        >
          <Card className="p-6 max-w-md w-full relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Upload Pitch Deck</h3>
              <button 
                onClick={() => setShowUploadForm(false)} 
                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive 
                    ? 'border-cyan-400 bg-cyan-900/20' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-300 mb-2">
                  {dragActive ? 'Drop your file here' : 'Drag and drop your file here'}
                </p>
                <p className="text-sm text-gray-400 mb-4">or</p>
                <label className="inline-block">
                  <input 
                    type="file" 
                    accept=".pdf,.pptx,.ppt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button variant="outline" className="cursor-pointer">
                    Browse Files
                  </Button>
                </label>
              </div>
              <p className="text-xs text-gray-400 text-center">
                Supported formats: PDF, PPTX, PPT (Max 50MB)
              </p>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setShowUploadForm(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Templates */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Pre-defined Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="p-6" hover>
              <div className="text-center">
                <div className={`w-16 h-16 ${template.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <PresentationChart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{template.description}</p>
                <div className="flex items-center justify-center text-sm text-gray-300 mb-6">
                  <FileText className="h-4 w-4 mr-1" />
                  <span>{template.slides} slides</span>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => setActiveTemplate(template.id)}
                >
                  Use Template
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* My Pitch Decks */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white mb-6">My Pitch Decks</h2>
        
        {uploadedDecks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Deck Name</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Template</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Last Modified</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {uploadedDecks.map((deck) => (
                  <tr key={deck.id} className="border-b border-gray-800 hover:bg-gray-700/20">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <PresentationChart className="h-5 w-5 text-cyan-400" />
                        <span className="text-white">{deck.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{deck.template}</td>
                    <td className="py-3 px-4 text-gray-300">{deck.lastModified}</td>
                    <td className="py-3 px-4">
                      <select 
                        value={deck.status}
                        onChange={(e) => handleStatusUpdate(deck.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border-0 bg-transparent cursor-pointer ${
                          deck.status === 'Complete' 
                            ? 'bg-emerald-900/30 text-emerald-400' 
                            : 'bg-blue-900/30 text-blue-400'
                        }`}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Review">Review</option>
                        <option value="Complete">Complete</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                          title="View Deck"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditDeck(deck)}
                          className="p-1 text-gray-400 hover:text-cyan-400 transition-colors"
                          title="Edit Deck"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-1 text-gray-400 hover:text-emerald-400 transition-colors"
                          title="Download Deck"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteDeck(deck.id)}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete Deck"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <PresentationChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No pitch decks yet</h3>
            <p className="text-gray-400 mb-6">Create your first pitch deck using our templates or upload an existing one</p>
            <div className="flex space-x-3 justify-center">
              <Button onClick={() => setActiveTemplate('msme')}>
                Create from Template
              </Button>
              <Button variant="outline" onClick={() => setShowUploadForm(true)}>
                Upload Deck
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Tips */}
      <Card className="p-6 bg-gradient-to-r from-cyan-900/20 to-teal-900/20 border-cyan-500/20">
        <h3 className="text-lg font-semibold text-cyan-400 mb-3">💡 Pitch Deck Tips</h3>
        <ul className="text-sm text-gray-300 space-y-2">
          <li>• Keep slides concise - aim for 10-15 slides maximum</li>
          <li>• Start with a compelling problem statement</li>
          <li>• Clearly articulate your unique value proposition</li>
          <li>• Include realistic financial projections</li>
          <li>• End with a clear ask and use of funds</li>
        </ul>
      </Card>
    </div>
  );
};

export default PitchDeck;