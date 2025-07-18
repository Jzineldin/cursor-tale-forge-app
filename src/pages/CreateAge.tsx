import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AgeSelection from '@/components/story-creation/AgeSelection';

const CreateAge: React.FC = () => {
  const [selectedAge, setSelectedAge] = useState<string>('');
  const navigate = useNavigate();

  const handleAgeSelect = (age: string) => {
    setSelectedAge(age);
  };

  const handleNext = () => {
    if (selectedAge) {
      // Navigate to genre selection with age parameter
      navigate(`/create/genre?age=${selectedAge}`);
    }
  };

  return (
    <AgeSelection
      selectedAge={selectedAge}
      onAgeSelect={handleAgeSelect}
      onNext={handleNext}
    />
  );
};

export default CreateAge; 