
import React from 'react';

const AdminHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-white mb-2 font-serif">
        ✨ Tale Forge Admin Panel
      </h1>
      <p className="text-purple-200 text-lg">
        Comprehensive AI system management, monitoring, and diagnostics
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
          API Monitoring
        </span>
        <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
          Model Management
        </span>
        <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">
          System Logs
        </span>
        <span className="px-3 py-1 bg-orange-600 text-white text-sm rounded-full">
          Cost Tracking
        </span>
        <span className="px-3 py-1 bg-red-600 text-white text-sm rounded-full">
          Health Monitoring
        </span>
      </div>
    </div>
  );
};

export default AdminHeader;
