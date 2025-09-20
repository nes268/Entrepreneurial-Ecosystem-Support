import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Target, TrendingUp, DollarSign, Edit, Plus, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { useFunding } from '../../context/FundingContext';

const Fundraising: React.FC = () => {
  const { 
    fundingStages, 
    currentStage, 
    totalTargetAmount, 
    totalRaisedAmount,
    updateStageProgress,
    completeStage,
    setCurrentStage,
    updateFundingAmounts
  } = useFunding();

  const [activeTab, setActiveTab] = useState(currentStage);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    targetAmount: '',
    raisedAmount: '',
    progress: ''
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'current':
        return <Clock className="h-5 w-5 text-blue-400" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-600"></div>;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-400';
      case 'current':
        return 'bg-blue-400';
      default:
        return 'bg-gray-600';
    }
  };

  const handleTabClick = (stageId: string) => {
    setActiveTab(stageId);
    const stage = fundingStages.find(s => s.id === stageId);
    if (stage) {
      setEditData({
        targetAmount: stage.targetAmount?.toString() || '',
        raisedAmount: stage.raisedAmount?.toString() || '',
        progress: stage.progress.toString()
      });
    }
  };

  const handleEditStage = (stageId: string) => {
    setEditingStage(stageId);
    const stage = fundingStages.find(s => s.id === stageId);
    if (stage) {
      setEditData({
        targetAmount: stage.targetAmount?.toString() || '',
        raisedAmount: stage.raisedAmount?.toString() || '',
        progress: stage.progress.toString()
      });
    }
    setShowEditForm(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    if (editingStage) {
      const targetAmount = parseInt(editData.targetAmount) || 0;
      const raisedAmount = parseInt(editData.raisedAmount) || 0;
      const progress = parseInt(editData.progress) || 0;

      updateFundingAmounts(targetAmount, raisedAmount);
      updateStageProgress(editingStage, progress, raisedAmount);
      
      if (progress >= 100) {
        completeStage(editingStage);
      }
    }
    setShowEditForm(false);
    setEditingStage(null);
  };

  const handleCancel = () => {
    setShowEditForm(false);
    setEditingStage(null);
  };

  const currentStageData = fundingStages.find(stage => stage.id === activeTab);
  const progressPercentage = currentStageData ? (currentStageData.raisedAmount || 0) / (currentStageData.targetAmount || 1) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Fundraising Dashboard</h1>
        <p className="text-gray-400 mt-1">Track your funding journey and progress across all stages</p>
      </div>

      {/* Funding Stages Tabs */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-cyan-400" />
            Funding Stages
          </h2>
          <div className="text-sm text-gray-400">
            {fundingStages.filter(s => s.status === 'completed').length}/{fundingStages.length} completed
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {fundingStages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => handleTabClick(stage.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === stage.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600'
              }`}
            >
              {getStatusIcon(stage.status)}
              <span className="font-medium">{stage.name}</span>
              {stage.status === 'current' && <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>}
            </button>
          ))}
        </div>

        {/* Active Tab Content */}
        {currentStageData && (
          <div className="space-y-6">
            {/* Stage Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                <div className="text-2xl font-bold text-white mb-1">
                  ${((currentStageData.raisedAmount || 0) / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-gray-400">Amount Raised</div>
              </div>
              <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                <div className="text-2xl font-bold text-cyan-400 mb-1">
                  ${((currentStageData.targetAmount || 0) / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-gray-400">Target Amount</div>
              </div>
              <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                <div className="text-2xl font-bold text-emerald-400 mb-1">
                  {currentStageData.progress}%
                </div>
                <div className="text-sm text-gray-400">Progress</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">{currentStageData.name} Stage Progress</span>
                <span className="text-gray-400">
                  ${(currentStageData.raisedAmount || 0).toLocaleString()} / ${(currentStageData.targetAmount || 0).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-700 ${getProgressColor(currentStageData.status)}`}
                  style={{ width: `${Math.min(currentStageData.progress, 100)}%` }}
                />
              </div>
            </div>

            {/* Stage Description and Actions */}
            <div className="flex items-center justify-between p-4 bg-gray-700/20 rounded-lg">
              <div>
                <h3 className="text-lg font-medium text-white mb-1">{currentStageData.name}</h3>
                <p className="text-gray-400 text-sm">{currentStageData.description}</p>
                {currentStageData.date && (
                  <p className="text-xs text-gray-500 mt-1">Completed: {currentStageData.date}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleEditStage(currentStageData.id)}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
                {currentStageData.status === 'current' && currentStageData.progress >= 100 && (
                  <Button 
                    onClick={() => completeStage(currentStageData.id)}
                    size="sm"
                    className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Complete</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Edit Form Modal */}
      {showEditForm && editingStage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Edit {fundingStages.find(s => s.id === editingStage)?.name} Stage
              </h3>
              <button 
                onClick={handleCancel}
                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Target Amount ($)</label>
                <input 
                  type="number"
                  name="targetAmount"
                  value={editData.targetAmount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter target amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Amount Raised ($)</label>
                <input 
                  type="number"
                  name="raisedAmount"
                  value={editData.raisedAmount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter amount raised"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Progress (%)</label>
                <input 
                  type="number"
                  name="progress"
                  value={editData.progress}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter progress percentage"
                />
              </div>

              <div className="flex space-x-3">
                <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Fundraising;