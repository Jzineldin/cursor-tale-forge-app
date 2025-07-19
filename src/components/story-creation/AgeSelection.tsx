import React from 'react';
import { useNavigate } from 'react-router-dom';
import { wizardGrad, wizardCard, wizardTitle, wizardSubtitle, wizardBtn } from '@/lib/theme';
import { Baby, GraduationCap, Users } from 'lucide-react';

export interface AgeSelectionProps {
  selectedAge: string;
  onAgeSelect: (age: string) => void;
  onNext: () => void;
  disabled?: boolean;
}

const AgeSelection: React.FC<AgeSelectionProps> = ({
  selectedAge,
  onAgeSelect,
  onNext,
  disabled = false
}) => {
  const navigate = useNavigate();
  
  const ages = [
    { 
      range: '4-6', 
      Icon: Baby, 
      label: 'Little Heroes',
      description: 'Simple stories with big pictures and easy words'
    },
    { 
      range: '7-9', 
      Icon: GraduationCap, 
      label: 'Young Adventurers',
      description: 'Fun adventures with friends and learning'
    },
    { 
      range: '10-12', 
      Icon: Users, 
      label: 'Epic Explorers',
      description: 'Exciting stories with deeper thinking and STEM'
    }
  ];

  const handleAgeSelect = (ageRange: string) => {
    onAgeSelect(ageRange);
    // Auto-navigate to genre selection
    navigate(`/create/genre?age=${ageRange}`);
  };

  return (
    <div className="magical-page-container">
      <div className="magical-content">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="w-full max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12 animate-magical-fade-in">
              <h1 className="fantasy-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                CHOOSE YOUR <span className="text-amber-400">AGE GROUP</span>
              </h1>
              <p className="fantasy-subtitle text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                This helps us create the perfect story just for you! 
                <br />
                <span className="text-amber-300 font-medium">Pick the age group that matches you best.</span>
              </p>
            </div>

            {/* Age Selection Cards - Larger & More Engaging */}
            <div className="relative w-full">
              <div className={wizardGrad + ' absolute inset-0 rounded-3xl blur-xl opacity-30'} />
              <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 text-center">
                  Choose the Age
                </h2>
                <p className="text-gray-300 text-center mb-8 text-lg">
                  So we match the reading level perfectly.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  {ages.map(({ range, Icon, label, description }) => (
                    <button
                      key={range}
                      onClick={() => handleAgeSelect(range)}
                      disabled={disabled}
                      className="flex flex-col items-center p-6 md:p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/15 hover:border-white/20 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg hover:shadow-xl"
                    >
                      <Icon className="w-16 h-16 md:w-20 md:h-20 text-amber-400 group-hover:text-amber-300 transition-colors mb-4" />
                      <p className="mt-2 font-semibold text-white text-lg md:text-xl mb-2">{label}</p>
                      <span className="text-sm md:text-base text-amber-300 mb-3 font-medium">{range} years</span>
                      <p className="text-sm md:text-base text-gray-300 text-center leading-relaxed">{description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgeSelection; 