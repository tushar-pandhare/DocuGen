import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, Grid, List, Plus, FileText, Star, 
  Eye, Copy, Trash2, Share2, Globe,
  TrendingUp, Clock, X, Layers, Edit3, ExternalLink,
  ArrowLeft, Sparkles, Zap, Shield, Award, Filter,
  Menu, CheckCircle, AlertCircle
} from 'lucide-react';

export default function TemplateLibrary() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [search, category, sort]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view templates');
        setLoading(false);
        return;
      }

      const res = await axios.get('http://localhost:5000/api/templates', {
        params: { search, category, sort, limit: 50 },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTemplates(res.data.templates || []);
    } catch (err) {
      console.error('Fetch templates error:', err);
      setError(err.response?.data?.error || 'Failed to load templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/templates/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchTemplates();
      } catch (err) {
        alert('Failed to delete template');
      }
    }
  };

  const shareTemplate = async (id) => {
    const email = prompt('Enter email to share with:');
    if (email) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(`http://localhost:5000/api/templates/${id}/share`, 
          { email, permission: 'view' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Template shared successfully!');
      } catch (err) {
        alert('Failed to share template');
      }
    }
  };

  const likeTemplate = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/templates/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTemplates();
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const duplicateTemplate = async (template) => {
    try {
      const token = localStorage.getItem('token');
      const duplicateData = {
        name: `${template.name} (Copy)`,
        category: template.category,
        description: template.description,
        fields: template.fields,
        isPublic: false
      };
      await axios.post('http://localhost:5000/api/templates', duplicateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTemplates();
      alert('Template duplicated successfully!');
    } catch (err) {
      alert('Failed to duplicate template');
    }
  };

  const useTemplate = (templateId) => {
    navigate(`/templates/use/${templateId}`);
  };

  const editTemplate = (templateId) => {
    navigate(`/templates/edit/${templateId}`);
  };

  const openPreview = (template) => {
    setPreviewTemplate(template);
    setShowPreviewModal(true);
  };

  const categories = [
    { id: 'all', name: 'All', icon: Grid, color: 'indigo' },
    { id: 'invoice', name: 'Invoices', icon: FileText, color: 'blue' },
    { id: 'contract', name: 'Contracts', icon: FileText, color: 'purple' },
    { id: 'proposal', name: 'Proposals', icon: FileText, color: 'emerald' },
    { id: 'business', name: 'Business', icon: FileText, color: 'amber' },
    { id: 'legal', name: 'Legal', icon: FileText, color: 'red' },
    { id: 'personal', name: 'Personal', icon: FileText, color: 'pink' }
  ];

  const templatesList = Array.isArray(templates) ? templates : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header with Back Button and New Template Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition group w-fit"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Layers size={16} className="text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-slate-600">Template Library</span>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 sm:px-5 py-2 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition transform hover:scale-105 w-full sm:w-auto justify-center"
            >
              <Plus size={18} />
              New Template
            </button>
          </div>
        </div>

        {/* Hero Section - Hidden on mobile */}
        <div className="hidden sm:block text-center mb-8 lg:mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 rounded-full mb-5 shadow-sm">
            <Sparkles size={14} className="text-white" />
            <span className="text-xs font-medium text-white">Template Library</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-3">
            Create & Manage <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Templates</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base">
            Design, save, and reuse document templates for invoices, contracts, proposals and more
          </p>
        </div>

        {/* Mobile Hero - Simple */}
        <div className="sm:hidden text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Template Library</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your document templates</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            {/* Desktop Filters */}
            <div className="hidden sm:flex gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="all">All Categories</option>
                <option value="invoice">Invoices</option>
                <option value="contract">Contracts</option>
                <option value="proposal">Proposals</option>
                <option value="business">Business</option>
                <option value="legal">Legal</option>
                <option value="personal">Personal</option>
              </select>
              
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="name">Name A-Z</option>
              </select>
              
              <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 transition ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 transition ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
            
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="sm:hidden flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-xl bg-white"
            >
              <Filter size={16} />
              Filters
            </button>
          </div>
          
          {/* Mobile Filters Dropdown */}
          {showMobileFilters && (
            <div className="sm:hidden mt-3 pt-3 border-t border-slate-100 space-y-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="all">All Categories</option>
                <option value="invoice">Invoices</option>
                <option value="contract">Contracts</option>
                <option value="proposal">Proposals</option>
                <option value="business">Business</option>
                <option value="legal">Legal</option>
                <option value="personal">Personal</option>
              </select>
              
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="name">Name A-Z</option>
              </select>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 py-2 rounded-xl transition ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}
                >
                  <Grid size={16} className="inline mr-1" /> Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 py-2 rounded-xl transition ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}
                >
                  <List size={16} className="inline mr-1" /> List
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Categories Tabs - Horizontal Scroll on Mobile */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-custom -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map(cat => {
            const Icon = cat.icon;
            const colorClasses = {
              indigo: 'hover:bg-indigo-50 hover:text-indigo-600',
              blue: 'hover:bg-blue-50 hover:text-blue-600',
              purple: 'hover:bg-purple-50 hover:text-purple-600',
              emerald: 'hover:bg-emerald-50 hover:text-emerald-600',
              amber: 'hover:bg-amber-50 hover:text-amber-600',
              red: 'hover:bg-red-50 hover:text-red-600',
              pink: 'hover:bg-pink-50 hover:text-pink-600'
            };
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  category === cat.id
                    ? `bg-${cat.color}-100 text-${cat.color}-700 shadow-sm`
                    : `bg-white text-slate-600 border border-slate-200 ${colorClasses[cat.color]}`
                }`}
              >
                <Icon size={14} className="inline mr-1.5" />
                {cat.name}
              </button>
            );
          })}
        </div>
        
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-red-600">
              <X size={18} />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchTemplates}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        )}
        
        {/* Templates Grid/List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="text-indigo-400 animate-pulse" size={24} />
              </div>
            </div>
          </div>
        ) : templatesList.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Layers size={36} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No templates found</p>
            <p className="text-slate-400 text-sm mt-1">Create your first template to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-5 px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
            >
              Create Template
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {templatesList.map(template => (
              <TemplateCard
                key={template._id}
                template={template}
                onDelete={deleteTemplate}
                onShare={shareTemplate}
                onLike={likeTemplate}
                onDuplicate={duplicateTemplate}
                onEdit={editTemplate}
                onUse={useTemplate}
                onPreview={openPreview}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {templatesList.map(template => (
              <TemplateListItem
                key={template._id}
                template={template}
                onDelete={deleteTemplate}
                onShare={shareTemplate}
                onLike={likeTemplate}
                onDuplicate={duplicateTemplate}
                onEdit={editTemplate}
                onUse={useTemplate}
                onPreview={openPreview}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Preview Modal */}
      {showPreviewModal && previewTemplate && (
        <PreviewModal
          template={previewTemplate}
          onClose={() => setShowPreviewModal(false)}
          onUse={() => {
            setShowPreviewModal(false);
            useTemplate(previewTemplate._id);
          }}
          onEdit={() => {
            setShowPreviewModal(false);
            editTemplate(previewTemplate._id);
          }}
        />
      )}
      
      {/* Create Template Modal */}
      {showCreateModal && (
        <CreateTemplateModal
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchTemplates}
        />
      )}
    </div>
  );
}

// Template Card Component
function TemplateCard({ template, onDelete, onShare, onLike, onDuplicate, onEdit, onUse, onPreview }) {
  const [showMenu, setShowMenu] = useState(false);
  
  const getCategoryColor = (category) => {
    const colors = {
      invoice: 'bg-blue-100 text-blue-700',
      contract: 'bg-purple-100 text-purple-700',
      proposal: 'bg-emerald-100 text-emerald-700',
      business: 'bg-amber-100 text-amber-700',
      legal: 'bg-red-100 text-red-700',
      personal: 'bg-pink-100 text-pink-700'
    };
    return colors[category] || 'bg-slate-100 text-slate-700';
  };
  
  if (!template) return null;
  
  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
      <div className="relative h-36 sm:h-40 md:h-44 bg-gradient-to-br from-indigo-100 to-violet-100 overflow-hidden">
        <div className="flex items-center justify-center h-full">
          <div className="w-12 h-12 bg-white/50 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <FileText size={24} className="text-indigo-400" />
          </div>
        </div>
        
        <div className="absolute top-2 right-2">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm hover:bg-white transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-10">
                <button
                  onClick={() => { onEdit(template._id); setShowMenu(false); }}
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                >
                  <Edit3 size={14} /> Edit
                </button>
                <button
                  onClick={() => { onDuplicate(template); setShowMenu(false); }}
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                >
                  <Copy size={14} /> Duplicate
                </button>
                <button
                  onClick={() => { onShare(template._id); setShowMenu(false); }}
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                >
                  <Share2 size={14} /> Share
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  onClick={() => { onDelete(template._id); setShowMenu(false); }}
                  className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
        
        {template.isPublic && (
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
            <Globe size={10} /> Public
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-slate-800 truncate flex-1 text-sm sm:text-base">{template.name || 'Untitled'}</h3>
          <button 
            onClick={() => onLike(template._id)}
            className="flex items-center gap-1 ml-2 hover:scale-110 transition flex-shrink-0"
          >
            <Star size={14} className={`${template.likes > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
            <span className="text-xs text-slate-500">{template.likes || 0}</span>
          </button>
        </div>
        
        <p className="text-xs text-slate-400 mb-3 line-clamp-2 min-h-[32px]">{template.description || 'No description'}</p>
        
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(template.category)}`}>
            {template.category || 'custom'}
          </span>
          
          <div className="flex gap-1">
            <button 
              onClick={() => onPreview(template)}
              className="px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
              title="Preview"
            >
              <Eye size={12} className="inline mr-1" /> Preview
            </button>
            <button 
              onClick={() => onUse(template._id)}
              className="px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
            >
              Use
            </button>
          </div>
        </div>
        
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'Unknown'}
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp size={10} />
            {template.usageCount || 0} uses
          </span>
        </div>
      </div>
    </div>
  );
}

// Template List Item Component
function TemplateListItem({ template, onDelete, onShare, onLike, onDuplicate, onEdit, onUse, onPreview }) {
  const getCategoryColor = (category) => {
    const colors = {
      invoice: 'bg-blue-100 text-blue-700',
      contract: 'bg-purple-100 text-purple-700',
      proposal: 'bg-emerald-100 text-emerald-700',
      business: 'bg-amber-100 text-amber-700',
      legal: 'bg-red-100 text-red-700',
      personal: 'bg-pink-100 text-pink-700'
    };
    return colors[category] || 'bg-slate-100 text-slate-700';
  };
  
  if (!template) return null;
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText size={18} className="text-indigo-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-800 truncate text-sm sm:text-base">{template.name || 'Untitled'}</h3>
              {template.isPublic && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Globe size={10} /> Public
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(template.category)}`}>
                {template.category || 'custom'}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock size={10} />
                {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'Unknown'}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <TrendingUp size={10} />
                {template.usageCount || 0} uses
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-end sm:justify-start gap-1">
          <button 
            onClick={() => onLike(template._id)}
            className="p-2 text-slate-400 hover:text-amber-500 transition rounded-lg hover:bg-amber-50"
            title="Like"
          >
            <Star size={16} className={template.likes > 0 ? 'fill-amber-400 text-amber-400' : ''} />
          </button>
          <button 
            onClick={() => onPreview(template)}
            className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
            title="Preview"
          >
            <Eye size={16} />
          </button>
          <button 
            onClick={() => onUse(template._id)}
            className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
          >
            Use
          </button>
          <button 
            onClick={() => onEdit(template._id)}
            className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
          >
            <Edit3 size={16} />
          </button>
          <button 
            onClick={() => onDuplicate(template)}
            className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition"
          >
            <Copy size={16} />
          </button>
          <button 
            onClick={() => onShare(template._id)}
            className="p-2 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition"
          >
            <Share2 size={16} />
          </button>
          <button 
            onClick={() => onDelete(template._id)}
            className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Preview Modal Component
function PreviewModal({ template, onClose, onUse, onEdit }) {
  const getCategoryColor = (category) => {
    const colors = {
      invoice: 'bg-blue-100 text-blue-700',
      contract: 'bg-purple-100 text-purple-700',
      proposal: 'bg-emerald-100 text-emerald-700',
      business: 'bg-amber-100 text-amber-700',
      legal: 'bg-red-100 text-red-700',
      personal: 'bg-pink-100 text-pink-700'
    };
    return colors[category] || 'bg-slate-100 text-slate-700';
  };

  const fields = template.fields || [];
  const filledCount = fields.filter(f => f.defaultValue).length;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{template.name}</h2>
              <p className="text-indigo-100 text-sm mt-0.5">Template Preview</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition text-white">
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          {/* Template Info */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(template.category)}`}>
                {template.category || 'custom'}
              </span>
              {template.isPublic && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Globe size={10} /> Public Template
                </span>
              )}
            </div>
            <p className="text-slate-600 text-sm">{template.description || 'No description provided'}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                Created: {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'Unknown'}
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp size={12} />
                Used: {template.usageCount || 0} times
              </span>
              <span className="flex items-center gap-1">
                <Star size={12} />
                {template.likes || 0} likes
              </span>
            </div>
          </div>
          
          {/* Fields Overview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <FileText size={18} className="text-indigo-500" />
              Template Fields
            </h3>
            <div className="space-y-2">
              {fields.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl">
                  <p className="text-slate-400">No fields defined in this template</p>
                </div>
              ) : (
                fields.map((field, idx) => (
                  <div key={field.id} className="bg-slate-50 rounded-xl p-3 flex items-center justify-between hover:bg-slate-100 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-indigo-500">{idx + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{field.label}</p>
                        <p className="text-xs text-slate-400">Type: {field.type}</p>
                      </div>
                    </div>
                    {field.required && (
                      <span className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} /> Required
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-indigo-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-indigo-600">{fields.length}</p>
              <p className="text-xs text-slate-600">Total Fields</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-emerald-600">{fields.filter(f => f.required).length}</p>
              <p className="text-xs text-slate-600">Required Fields</p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-white transition"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 border border-indigo-200 rounded-xl text-indigo-600 hover:bg-indigo-50 transition flex items-center gap-2"
          >
            <Edit3 size={16} />
            Edit Template
          </button>
          <button
            onClick={onUse}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2"
          >
            <Sparkles size={16} />
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
}

// Create Template Modal Component
function CreateTemplateModal({ onClose, onCreated }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [templateData, setTemplateData] = useState({
    name: '',
    category: 'custom',
    description: '',
    isPublic: false
  });
  
  const handleCreateAndBuild = async () => {
    if (!templateData.name.trim()) {
      alert('Please enter a template name');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/templates', templateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      navigate(`/templates/edit/${res.data._id}`);
      onClose();
    } catch (err) {
      alert('Failed to create template');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md sm:max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-violet-600">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Create New Template</h2>
            <p className="text-indigo-100 text-xs sm:text-sm mt-0.5">Start with basic information</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
          <div className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Template Name *</label>
              <input
                type="text"
                value={templateData.name}
                onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="e.g., Professional Invoice"
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
              <select
                value={templateData.category}
                onChange={(e) => setTemplateData({ ...templateData, category: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="invoice">📄 Invoice</option>
                <option value="contract">📑 Contract</option>
                <option value="proposal">📊 Proposal</option>
                <option value="business">💼 Business</option>
                <option value="legal">⚖️ Legal</option>
                <option value="personal">👤 Personal</option>
                <option value="custom">✨ Custom</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
              <textarea
                value={templateData.description}
                onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition"
                rows={3}
                placeholder="Describe what this template is used for..."
              />
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={templateData.isPublic}
                  onChange={(e) => setTemplateData({ ...templateData, isPublic: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-sm font-medium text-slate-700">Make this template public</span>
                  <p className="text-xs text-slate-500 mt-0.5">Anyone can view and use this template</p>
                </div>
              </label>
            </div>
          </div>
        </div>
        
        <div className="px-5 sm:px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateAndBuild}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Edit3 size={16} />
            )}
            Create & Build
          </button>
        </div>
      </div>
    </div>
  );
}