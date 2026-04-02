import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Search, Download, Trash2, Eye, 
  Calendar, Clock, Filter, ArrowUpDown, FileStack
} from 'lucide-react';

export default function MyDocuments() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/documents', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDocuments(res.data);
    } catch (err) {
      console.error('Fetch documents error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.templateName?.toLowerCase().includes(search.toLowerCase()) ||
                         doc.fileName?.toLowerCase().includes(search.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'invoice') return matchesSearch && doc.documentType === 'invoice';
    if (filter === 'contract') return matchesSearch && doc.documentType === 'contract';
    return matchesSearch;
  });

  const getTypeColor = (type) => {
    const colors = {
      invoice: 'bg-blue-100 text-blue-700',
      contract: 'bg-purple-100 text-purple-700',
      proposal: 'bg-emerald-100 text-emerald-700',
      default: 'bg-slate-100 text-slate-700'
    };
    return colors[type] || colors.default;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">My Documents</h1>
          <p className="text-slate-500 mt-1">All your generated documents in one place</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Documents</option>
              <option value="invoice">Invoices</option>
              <option value="contract">Contracts</option>
              <option value="proposal">Proposals</option>
            </select>
          </div>
        </div>

        {/* Documents List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <FileStack size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-400">No documents found</p>
            <button
              onClick={() => navigate("/invoice-generate")}
              className="mt-4 text-indigo-600 hover:underline"
            >
              Generate your first document
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocs.map((doc) => (
              <div key={doc._id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                      <FileText size={20} className="text-slate-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{doc.templateName}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(doc.documentType)}`}>
                          {doc.documentType || 'Document'}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition">
                      <Eye size={18} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition">
                      <Download size={18} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}