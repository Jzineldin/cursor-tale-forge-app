import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Baby, GraduationCap, Users } from 'lucide-react';

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
  const ageOptions = [
    {
      id: '4-6',
      label: 'I\'m 4-6 years old',
      description: 'Simple stories with big pictures and easy words',
      icon: Baby,
      color: 'from-pink-400 to-purple-400',
      features: ['Short sentences', 'Bright colors', 'Simple lessons', 'Friendly characters']
    },
    {
      id: '7-9',
      label: 'I\'m 7-9 years old',
      description: 'Fun adventures with friends and learning',
      icon: GraduationCap,
      color: 'from-blue-400 to-green-400',
      features: ['Friendship stories', 'Basic problem-solving', 'Educational fun', 'Mild adventure']
    },
    {
      id: '10-12',
      label: 'I\'m 10-12 years old',
      description: 'Exciting stories with deeper thinking and STEM',
      icon: Users,
      color: 'from-orange-400 to-red-400',
      features: ['Complex plots', 'STEM concepts', 'Character growth', 'Moral choices']
    }
  ];

  const handleAgeSelect = (ageId: string) => {
    onAgeSelect(ageId);
  };

  const handleNext = () => {
    if (selectedAge) {
      onNext();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-serif">
            Choose Your <span className="text-amber-400">Age Group</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            This helps us create the perfect story just for you! 
            <br />
            <span className="text-amber-300 font-medium">Pick the age group that matches you best.</span>
          </p>
        </div>

        {/* Age Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {ageOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = selectedAge === option.id;
            
            return (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  isSelected 
                    ? 'ring-4 ring-amber-400 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-400' 
                    : 'bg-slate-800/90 border-slate-600 hover:border-amber-400/50 hover:bg-slate-800/95'
                } backdrop-blur-sm shadow-2xl`}
                onClick={() => handleAgeSelect(option.id)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center shadow-lg`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className={`text-xl font-bold ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                    {option.label}
                  </CardTitle>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {option.description}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {option.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-gray-500'}`} />
                        <span className={isSelected ? 'text-amber-200' : 'text-gray-400'}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Next Button */}
        <div className="text-center">
          <Button
            onClick={handleNext}
            disabled={!selectedAge || disabled}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-12 py-4 text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300 hover:scale-105 rounded-2xl"
            size="lg"
          >
            {selectedAge ? (
              <>
                Continue to Story Creation
                <ArrowRight className="ml-3 h-6 w-6" />
              </>
            ) : (
              'Please select your age group'
            )}
          </Button>
          
          {selectedAge && (
            <p className="text-amber-300 text-sm mt-4 font-medium">
              Perfect! We'll create stories perfect for {selectedAge} year olds.
            </p>
          )}
        </div>

        {/* Safety Note */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-green-600/20 border border-green-500/30 rounded-lg px-4 py-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-300 text-sm font-medium">
              All stories are kid-safe and age-appropriate! 🛡️
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgeSelection; 