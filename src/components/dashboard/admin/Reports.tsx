import React, { useState, useRef } from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { FileText, Download, Upload, Search, Calendar, BarChart3, TrendingUp, Users, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Report, CreateReportData } from '../../../types';
import { useReports } from '../../../hooks/useReports';

const Reports: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    reports,
    loading,
    error,
    createReport,
    refreshReports
  } = useReports();

  const reportTypes = [
    { 
      type: 'Monthly Report', 
      description: 'Comprehensive monthly summary of all activities',
      icon: Calendar,
      color: 'bg-blue-500'
    },
    { 
      type: 'Analytics Report', 
      description: 'Data-driven insights and trends analysis',
      icon: BarChart3,
      color: 'bg-green-500'
    },
    { 
      type: 'Performance Report', 
      description: 'Startup performance metrics and KPIs',
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    { 
      type: 'Engagement Report', 
      description: 'User and investor engagement statistics',
      icon: Users,
      color: 'bg-orange-500'
    }
  ];

  const filteredReports = reports.filter(report =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateReport = (type: string) => {
    // Logic to generate new report
    console.log('Generating report:', type);
    // Show loading state and then add to reports list
  };

  const downloadReport = (reportId: string, reportName: string) => {
    // Logic to download report
    console.log('Downloading report:', reportId);
    // Create download link or trigger download
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    setUploadError(null);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (!reportName.trim() || !reportType || selectedFiles.length === 0) {
      setUploadError('Please fill in all required fields and select at least one file');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      // Calculate total file size
      const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
      const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };

      // Create report data
      const reportData: CreateReportData = {
        name: reportName.trim(),
        type: reportType,
        dateGenerated: new Date().toISOString().split('T')[0],
        fileSize: formatFileSize(totalSize),
        status: 'ready'
      };

      // Create the report
      await createReport(reportData);

      setUploadSuccess(true);
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadSuccess(false);
        setSelectedFiles([]);
        setReportName('');
        setReportType('');
        resetUploadForm();
      }, 2000);

    } catch (error) {
      setUploadError('Failed to upload report. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setSelectedFiles([]);
    setReportName('');
    setReportType('');
    setUploadError(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    resetUploadForm();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Reports</h1>
            <p className="text-gray-400 mt-1">Generate and manage platform reports</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            <span className="text-gray-400">Loading reports...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports</h1>
          <p className="text-gray-400 mt-1">Generate and manage platform reports</p>
        </div>
        <Button 
          className="flex items-center space-x-2"
          onClick={() => setShowUploadModal(true)}
        >
          <Upload className="h-4 w-4" />
          <span>Upload Report</span>
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-900/20 border-red-500/50">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div>
              <h3 className="text-red-400 font-medium">Error</h3>
              <p className="text-red-300 text-sm mt-1">{error}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refreshReports}
                className="mt-2 text-red-400 hover:text-red-300"
              >
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      )}



      {/* Search */}
      <Card className="p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Reports Table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Recent Reports</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Report Name</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Date Generated</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">File Size</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id} className="border-b border-gray-800 hover:bg-gray-700/20">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-cyan-400" />
                      <span className="text-white">{report.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300">
                      {report.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{report.dateGenerated}</td>
                  <td className="py-3 px-4 text-gray-300">{report.fileSize}</td>
                  <td className="py-3 px-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => downloadReport(report.id, report.name)}
                      className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              {searchTerm ? 'No reports found' : 'No reports available'}
            </h3>
            <p className="text-gray-400 mb-4">
              {searchTerm 
                ? 'Try adjusting your search criteria' 
                : 'Upload your first report to get started'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowUploadModal(true)}>
                Upload First Report
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
        <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Upload Report</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={closeUploadModal}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
          </Button>
        </div>
        
              {uploadSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Upload Successful!</h3>
                  <p className="text-gray-400">Your report has been uploaded successfully.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Report Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Report Name *
                      </label>
                      <Input
                        value={reportName}
                        onChange={(e) => setReportName(e.target.value)}
                        placeholder="Enter report name"
                        disabled={uploading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Report Type *
                      </label>
                      <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        disabled={uploading}
                      >
                        <option value="">Select type</option>
                        <option value="Monthly Report">Monthly Report</option>
                        <option value="Analytics Report">Analytics Report</option>
                        <option value="Performance Report">Performance Report</option>
                        <option value="Engagement Report">Engagement Report</option>
                        <option value="Custom Report">Custom Report</option>
                      </select>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Files *
                    </label>
                    <div
                      className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-300 mb-2">Click to select files or drag and drop</p>
                      <p className="text-sm text-gray-400">PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (Max 10MB each)</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploading}
                      />
                    </div>
                  </div>

                  {/* Selected Files */}
                  {selectedFiles.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-3">Selected Files:</h4>
                      <div className="space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-cyan-400" />
              <div>
                                <p className="text-white text-sm">{file.name}</p>
                                <p className="text-gray-400 text-xs">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              disabled={uploading}
                            >
                              <X className="h-4 w-4 text-red-400" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {uploadError && (
                    <div className="flex items-center space-x-2 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <p className="text-red-300 text-sm">{uploadError}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      onClick={closeUploadModal}
                      disabled={uploading}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpload}
                      disabled={uploading || !reportName.trim() || !reportType || selectedFiles.length === 0}
                      className="flex-1"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        'Upload Report'
                      )}
                    </Button>
              </div>
              </div>
              )}
            </div>
          </Card>
        </div>
      )}

    </div>
  );
};

export default Reports;