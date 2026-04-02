import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Plus, Trash2, Move, Copy, Save, Eye, X,
  Type, Hash, Calendar, DollarSign, AlignLeft,
  Image, PenTool, Grid, Check, ChevronDown,
  Bold, Italic, Underline, AlignLeft as AlignLeftIcon,
  AlignCenter, AlignRight, Settings, GripVertical,
  ArrowLeft, Sparkles, Layers, Zap
} from 'lucide-react';

const FIELD_TYPES = [
  { id: 'text', name: 'Text Field', icon: Type, color: 'blue', description: 'Single line text input' },
  { id: 'number', name: 'Number', icon: Hash, color: 'green', description: 'Numeric input' },
  { id: 'date', name: 'Date Picker', icon: Calendar, color: 'purple', description: 'Calendar date selection' },
  { id: 'currency', name: 'Currency', icon: DollarSign, color: 'amber', description: 'Money amount input' },
  { id: 'textarea', name: 'Text Area', icon: AlignLeft, color: 'indigo', description: 'Multi-line text' },
  { id: 'signature', name: 'Signature', icon: PenTool, color: 'pink', description: 'Digital signature' },
  { id: 'image', name: 'Image Upload', icon: Image, color: 'orange', description: 'Image attachment' }
];

export default function TemplateBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [draggedField, setDraggedField] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [template, setTemplate] = useState({
    name: '',
    category: 'custom',
    description: '',
    isPublic: false,
    fields: [],
    cssStyles: '',
    htmlStructure: ''
  });

  useEffect(() => {
    if (id) {
      fetchTemplate();
    } else {
      addDefaultFields();
    }
  }, [id]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplate(res.data);
    } catch (err) {
      console.error('Fetch template error:', err);
      alert('Failed to load template');
      navigate('/templates');
    } finally {
      setLoading(false);
    }
  };

  const addDefaultFields = () => {
    const defaultFields = [
      {
        id: `field_${Date.now()}_1`,
        type: 'text',
        label: 'Client Name',
        placeholder: 'Enter client name',
        required: true,
        defaultValue: '',
        position: 0,
        style: { fontSize: '14px', fontColor: '#000000', fontWeight: 'normal', textAlign: 'left' }
      },
      {
        id: `field_${Date.now()}_2`,
        type: 'date',
        label: 'Date',
        placeholder: 'Select date',
        required: true,
        defaultValue: new Date().toISOString().split('T')[0],
        position: 1,
        style: { fontSize: '14px', fontColor: '#000000', fontWeight: 'normal', textAlign: 'left' }
      },
      {
        id: `field_${Date.now()}_3`,
        type: 'currency',
        label: 'Amount',
        placeholder: 'Enter amount',
        required: true,
        defaultValue: '',
        position: 2,
        style: { fontSize: '14px', fontColor: '#000000', fontWeight: 'normal', textAlign: 'left' }
      }
    ];
    setTemplate(prev => ({ ...prev, fields: defaultFields }));
  };

  const addField = (fieldType) => {
    const newField = {
      id: `field_${Date.now()}_${Math.random()}`,
      type: fieldType.id,
      label: `New ${fieldType.name}`,
      placeholder: `Enter ${fieldType.name.toLowerCase()}`,
      required: false,
      defaultValue: '',
      position: template.fields.length,
      style: {
        fontSize: '14px',
        fontColor: '#000000',
        fontWeight: 'normal',
        textAlign: 'left'
      }
    };
    
    setTemplate({
      ...template,
      fields: [...template.fields, newField]
    });
    setSelectedField(newField.id);
  };

  const updateField = (fieldId, updates) => {
    const updatedFields = template.fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    );
    setTemplate({ ...template, fields: updatedFields });
  };

  const removeField = (fieldId) => {
    if (window.confirm('Remove this field?')) {
      const updatedFields = template.fields.filter(field => field.id !== fieldId);
      updatedFields.forEach((field, idx) => {
        field.position = idx;
      });
      setTemplate({ ...template, fields: updatedFields });
      if (selectedField === fieldId) setSelectedField(null);
    }
  };

  const duplicateField = (fieldId) => {
    const fieldToDuplicate = template.fields.find(f => f.id === fieldId);
    if (fieldToDuplicate) {
      const newField = {
        ...fieldToDuplicate,
        id: `field_${Date.now()}_${Math.random()}`,
        label: `${fieldToDuplicate.label} (Copy)`,
        position: template.fields.length
      };
      setTemplate({
        ...template,
        fields: [...template.fields, newField]
      });
    }
  };

  const handleDragStart = (e, fieldId, index) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ fieldId, index }));
    setDraggedField(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const sourceIndex = data.index;
      
      if (sourceIndex === targetIndex) return;
      
      const reorderedFields = [...template.fields];
      const [removed] = reorderedFields.splice(sourceIndex, 1);
      reorderedFields.splice(targetIndex, 0, removed);
      
      reorderedFields.forEach((field, idx) => {
        field.position = idx;
      });
      
      setTemplate({ ...template, fields: reorderedFields });
      setDraggedField(null);
    } catch (err) {
      console.error('Drop error:', err);
    }
  };

  const moveField = (fieldId, direction) => {
    const index = template.fields.findIndex(f => f.id === fieldId);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= template.fields.length) return;
    
    const reorderedFields = [...template.fields];
    [reorderedFields[index], reorderedFields[newIndex]] = [reorderedFields[newIndex], reorderedFields[index]];
    
    reorderedFields.forEach((field, idx) => {
      field.position = idx;
    });
    
    setTemplate({ ...template, fields: reorderedFields });
  };

  const saveTemplate = async () => {
    if (!template.name.trim()) {
      alert('Please enter a template name');
      return;
    }
    
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const url = id 
        ? `http://localhost:5000/api/templates/${id}`
        : 'http://localhost:5000/api/templates';
      const method = id ? 'put' : 'post';
      
      await axios({
        method,
        url,
        data: template,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(id ? 'Template updated!' : 'Template created!');
      navigate('/templates');
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const getFieldIcon = (type) => {
    const fieldType = FIELD_TYPES.find(ft => ft.id === type);
    if (fieldType) {
      const Icon = fieldType.icon;
      return <Icon size={14} />;
    }
    return <Type size={14} />;
  };

  const getFieldColor = (type) => {
    const fieldType = FIELD_TYPES.find(ft => ft.id === type);
    return fieldType?.color || 'slate';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="text-indigo-400 animate-pulse" size={24} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-4 rounded-full shadow-lg"
        >
          <Layers size={24} />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row h-screen">
        {/* Left Sidebar - Field Types (Desktop) */}
        <div className={`fixed lg:relative lg:flex lg:w-80 bg-white border-r border-slate-200 flex-col z-40 transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } lg:translate-x-0 w-80 h-full`}>
          <div className="p-5 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-slate-800">Field Types</h2>
              <p className="text-xs text-slate-400 mt-1">Click to add fields</p>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {FIELD_TYPES.map(field => {
              const Icon = field.icon;
              const colorClass = `bg-${field.color}-50 text-${field.color}-600`;
              return (
                <button
                  key={field.id}
                  onClick={() => {
                    addField(field);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition group"
                >
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-slate-700">{field.name}</p>
                    <p className="text-xs text-slate-400">{field.description}</p>
                  </div>
                  <Plus size={14} className="text-slate-400 opacity-0 group-hover:opacity-100" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/templates')}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                  <input
                    type="text"
                    value={template.name}
                    onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                    placeholder="Template Name"
                    className="text-lg sm:text-xl font-bold text-slate-800 bg-transparent border-none focus:outline-none focus:ring-0 w-full"
                  />
                  <input
                    type="text"
                    value={template.description}
                    onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                    placeholder="Template Description"
                    className="text-xs sm:text-sm text-slate-500 bg-transparent border-none focus:outline-none focus:ring-0 w-full mt-1"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <select
                  value={template.category}
                  onChange={(e) => setTemplate({ ...template, category: e.target.value })}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value="invoice">Invoice</option>
                  <option value="contract">Contract</option>
                  <option value="proposal">Proposal</option>
                  <option value="business">Business</option>
                  <option value="legal">Legal</option>
                  <option value="personal">Personal</option>
                  <option value="custom">Custom</option>
                </select>
                
                <label className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={template.isPublic}
                    onChange={(e) => setTemplate({ ...template, isPublic: e.target.checked })}
                    className="rounded"
                  />
                  <span className="hidden sm:inline">Public</span>
                </label>
                
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50 transition"
                >
                  <Eye size={16} />
                  <span className="hidden sm:inline">{previewMode ? 'Edit' : 'Preview'}</span>
                </button>
                
                <button
                  onClick={saveTemplate}
                  disabled={saving}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg text-sm flex items-center gap-2 hover:shadow-lg transition disabled:opacity-50"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Canvas */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {previewMode ? (
              <TemplatePreview template={template} />
            ) : (
              <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 sm:px-6 py-4 text-white">
                    <h3 className="font-semibold text-sm sm:text-base">{template.name || 'Untitled Template'}</h3>
                    <p className="text-slate-300 text-xs sm:text-sm mt-1">{template.description || 'No description'}</p>
                  </div>
                  
                  <div className="p-4 sm:p-6">
                    {template.fields.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Grid size={32} className="text-slate-300" />
                        </div>
                        <p className="text-slate-400">No fields added yet</p>
                        <p className="text-xs text-slate-300 mt-1">Click on field types to add them</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {template.fields.map((field, index) => (
                          <div
                            key={field.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, field.id, index)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index)}
                            className={`group relative bg-white border-2 rounded-lg p-3 sm:p-4 transition-all cursor-move ${
                              selectedField === field.id 
                                ? 'border-indigo-400 shadow-lg' 
                                : 'border-slate-200 hover:border-indigo-300'
                            }`}
                            onClick={() => setSelectedField(field.id)}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                              <div className="cursor-grab active:cursor-grabbing self-start">
                                <GripVertical size={20} className="text-slate-400" />
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <div className={`p-1.5 bg-${getFieldColor(field.type)}-100 rounded`}>
                                    {getFieldIcon(field.type)}
                                  </div>
                                  <input
                                    type="text"
                                    value={field.label}
                                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                                    className="font-medium text-slate-700 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-none text-sm"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  {field.required && (
                                    <span className="text-xs text-red-500">*</span>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                                  <input
                                    type="text"
                                    value={field.placeholder}
                                    onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                    placeholder="Placeholder"
                                    className="text-sm text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200 focus:outline-none focus:border-indigo-500"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs text-slate-500 flex items-center gap-1">
                                      <input
                                        type="checkbox"
                                        checked={field.required}
                                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                        className="rounded"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                      Required
                                    </label>
                                  </div>
                                  
                                  <div className="flex gap-1">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); moveField(field.id, 'up'); }}
                                      disabled={index === 0}
                                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                    >
                                      ↑
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); moveField(field.id, 'down'); }}
                                      disabled={index === template.fields.length - 1}
                                      className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                    >
                                      ↓
                                    </button>
                                  </div>
                                </div>
                                
                                {selectedField === field.id && (
                                  <div className="mt-3 pt-3 border-t border-slate-100">
                                    <p className="text-xs font-medium text-slate-500 mb-2">Style Settings</p>
                                    <div className="flex flex-wrap gap-3">
                                      <select
                                        value={field.style?.textAlign || 'left'}
                                        onChange={(e) => updateField(field.id, { 
                                          style: { ...field.style, textAlign: e.target.value } 
                                        })}
                                        className="text-xs border border-slate-200 rounded px-2 py-1"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <option value="left">Left</option>
                                        <option value="center">Center</option>
                                        <option value="right">Right</option>
                                      </select>
                                      
                                      <input
                                        type="color"
                                        value={field.style?.fontColor || '#000000'}
                                        onChange={(e) => updateField(field.id, { 
                                          style: { ...field.style, fontColor: e.target.value } 
                                        })}
                                        className="w-8 h-8 rounded border border-slate-200"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition self-end sm:self-start">
                                <button
                                  onClick={(e) => { e.stopPropagation(); duplicateField(field.id); }}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-indigo-50"
                                >
                                  <Copy size={14} />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
                                  className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Preview Component
function TemplatePreview({ template }) {
  const [formData, setFormData] = useState({});

  const getInputComponent = (field) => {
    const value = formData[field.id] || field.defaultValue || '';
    const style = field.style || {};

    const inputStyle = {
      fontSize: style.fontSize,
      color: style.fontColor,
      fontWeight: style.fontWeight,
      textAlign: style.textAlign
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            rows={4}
            style={inputStyle}
          />
        );
      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
            <input
              type="number"
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
              className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              style={inputStyle}
            />
          </div>
        );
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            style={inputStyle}
          />
        );
      default:
        return (
          <input
            type={field.type === 'number' ? 'number' : 'text'}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            style={inputStyle}
          />
        );
    }
  };

  const handleGenerate = () => {
    alert('Document generation feature coming soon!');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 sm:px-6 py-4 text-white">
          <h3 className="text-lg sm:text-xl font-bold">{template.name || 'Untitled Template'}</h3>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">{template.description}</p>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="space-y-5">
            {template.fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {getInputComponent(field)}
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
            <button
              onClick={handleGenerate}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
            >
              Generate Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}