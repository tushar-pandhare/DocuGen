import React, { useState } from 'react';

export default function TemplatePreview({ template }) {
  const [formData, setFormData] = useState({});
  
  const handleChange = (fieldId, value) => {
    setFormData({ ...formData, [fieldId]: value });
  };
  
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 text-white">
        <h3 className="text-xl font-bold">{template.name}</h3>
        <p className="text-slate-300 text-sm mt-1">{template.description}</p>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {template.fields.map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              
              {field.type === 'textarea' ? (
                <textarea
                  placeholder={field.placeholder}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                />
              ) : field.type === 'currency' ? (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                  <input
                    type="number"
                    placeholder={field.placeholder}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ) : field.type === 'date' ? (
                <input
                  type="date"
                  value={formData[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <input
                  type={field.type === 'number' ? 'number' : 'text'}
                  placeholder={field.placeholder}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>
          ))}
        </div>
        
        <button className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition">
          Generate Document
        </button>
      </div>
    </div>
  );
}