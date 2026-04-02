// pages/TestPDF.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Download, Loader2, CheckCircle, XCircle, FileText } from 'lucide-react';

export default function TestPDF() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testPDF = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login first');
        setLoading(false);
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/invoice/test-pdf', {
        headers: { 
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });
      
      // Check if response is a PDF
      const contentType = response.headers['content-type'];
      if (contentType === 'application/pdf') {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        
        // Check if PDF is valid (at least 100 bytes)
        if (blob.size < 100) {
          throw new Error('PDF file is too small, might be invalid');
        }
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'test-invoice.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        setResult({
          success: true,
          message: 'PDF generated successfully!',
          size: (blob.size / 1024).toFixed(2) + ' KB'
        });
      } else {
        // Try to parse as JSON error
        const text = await response.data.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.error || errorData.details || 'Unknown error');
      }
      
    } catch (err) {
      console.error('Test PDF error:', err);
      setError(err.message || 'Failed to generate test PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full mb-4">
            <FileText size={16} className="text-indigo-600" />
            <span className="text-sm font-medium text-indigo-600">PDF Test Tool</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-3">
            Test PDF <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Generation</span>
          </h1>
          <p className="text-slate-500">
            Click the button below to generate a test invoice PDF
          </p>
        </div>

        {/* Test Button Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText size={32} className="text-indigo-600" />
            </div>
            
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Test Invoice PDF
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              This will generate a sample invoice with test data to verify PDF generation is working correctly.
            </p>
            
            <button
              onClick={testPDF}
              disabled={loading}
              className={`px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mx-auto transition-all ${
                loading 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg transform hover:scale-105'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Generate Test PDF
                </>
              )}
            </button>
          </div>
          
          {/* Result Message */}
          {result && (
            <div className="border-t border-slate-100 p-4 bg-green-50">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-green-600" />
                <div>
                  <p className="text-green-700 font-medium">{result.message}</p>
                  <p className="text-green-600 text-sm">File size: {result.size}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="border-t border-slate-100 p-4 bg-red-50">
              <div className="flex items-center gap-3">
                <XCircle size={20} className="text-red-600" />
                <div>
                  <p className="text-red-700 font-medium">Error</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-xl p-5 border border-blue-100">
          <h3 className="font-semibold text-blue-800 mb-2">📋 Test Information</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• This test uses sample invoice data</li>
            <li>• Generated PDF should open in your PDF viewer</li>
            <li>• If PDF doesn't open, check server logs for errors</li>
            <li>• Make sure you're logged in before testing</li>
          </ul>
        </div>
        
        {/* Debug Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            API Endpoint: <code className="bg-slate-100 px-2 py-1 rounded">GET /api/invoice/test-pdf</code>
          </p>
        </div>
      </div>
    </div>
  );
}