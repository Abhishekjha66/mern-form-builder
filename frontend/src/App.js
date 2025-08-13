import React, { useState } from 'react';
import FormEditor from './FormEditor';
import FormPreview from './FormPreview';

// Main App component
export default function App() {
  const [page, setPage] = useState('editor');
  const [formId, setFormId] = useState(null);

  // Simple state-based routing
  const renderPage = () => {
    switch (page) {
      case 'editor':
        return <FormEditor onFormSaved={setFormId} onNavigateToPreview={() => setPage('preview')} />;
      case 'preview':
        return <FormPreview formId={formId} />;
      default:
        return <FormEditor onFormSaved={setFormId} onNavigateToPreview={() => setPage('preview')} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setPage('editor')}
          className="px-4 py-2 rounded-full font-semibold text-lg transition duration-300"
        >
          Editor
        </button>
        <button
          onClick={() => setPage('preview')}
          disabled={!formId} // Disable if no form has been saved yet
          className={`px-4 py-2 rounded-full font-semibold text-lg transition duration-300 ${!formId ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-100'}`}
        >
          Preview Form
        </button>
      </div>
      {renderPage()}
    </div>
  );
}
