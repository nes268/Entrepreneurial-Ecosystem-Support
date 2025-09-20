import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProgressBar from '../ui/ProgressBar';
import PersonalInfo from './steps/PersonalInfo';
import EnterpriseInfo from './steps/EnterpriseInfo';
import IncubationDetails from './steps/IncubationDetails';
import Documentation from './steps/Documentation';
import PitchDeckTraction from './steps/PitchDeckTraction';
import FundingInfo from './steps/FundingInfo';
import { Profile } from '../../types';
import { Building2 } from 'lucide-react';

const ProfileWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<Partial<Profile>>({});
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const totalSteps = 6;

  const updateProfileData = (stepData: Partial<Profile>) => {
    setProfileData(prev => ({ ...prev, ...stepData }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete profile
      updateUser({ profileComplete: true });
      navigate('/dashboard');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfo data={profileData} updateData={updateProfileData} onNext={nextStep} />;
      case 2:
        return <EnterpriseInfo data={profileData} updateData={updateProfileData} onNext={nextStep} onPrev={prevStep} />;
      case 3:
        return <IncubationDetails data={profileData} updateData={updateProfileData} onNext={nextStep} onPrev={prevStep} />;
      case 4:
        return <Documentation data={profileData} updateData={updateProfileData} onNext={nextStep} onPrev={prevStep} />;
      case 5:
        return <PitchDeckTraction data={profileData} updateData={updateProfileData} onNext={nextStep} onPrev={prevStep} />;
      case 6:
        return <FundingInfo data={profileData} updateData={updateProfileData} onNext={nextStep} onPrev={prevStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Building2 className="h-8 w-8 text-cyan-400" />
            <h1 className="text-3xl font-bold text-white">Profile Setup</h1>
          </div>
          <p className="text-gray-300">Complete your profile to access the dashboard</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar current={currentStep} total={totalSteps} />
        </div>

        {/* Step Content */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default ProfileWizard;