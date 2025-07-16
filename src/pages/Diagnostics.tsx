
import SystemDiagnostics from '@/components/SystemDiagnostics';

const Diagnostics = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            System Diagnostics
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Troubleshoot and diagnose issues with your story generation application
          </p>
        </div>
        
        <SystemDiagnostics />
      </div>
    </div>
  );
};

export default Diagnostics;
