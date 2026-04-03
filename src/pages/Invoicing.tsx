import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { FileText, Plus, Search, Download, Filter, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import InvoiceForm from '../components/InvoiceForm';

export default function Invoicing() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/documents');
      const data = await response.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Payé':
        return <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-neon-green/10 text-neon-green px-2 py-1 rounded-md"><CheckCircle size={10}/> Payé</span>;
      case 'Envoyé':
        return <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md"><Clock size={10}/> Envoyé</span>;
      default:
        return <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-gray-500/10 text-gray-400 px-2 py-1 rounded-md"><AlertCircle size={10}/> Brouillon</span>;
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc['Nom']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc['Type']?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black mb-1">Facturation & <span className="text-neon-green">Devis</span></h1>
          <p className="text-xs text-gray-400">Gérez vos documents financiers synchronisés avec Airtable.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchDocs}
            className="bg-white/5 border border-doulia-border text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
            title="Actualiser"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="bg-white/5 border border-doulia-border text-white px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-white/10 transition-colors">
            <Filter size={16} /> Filtrer
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-neon-green text-doulia-midnight px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_15px_rgba(50,205,50,0.2)]"
          >
            <Plus size={16} /> Nouveau Document
          </button>
        </div>
      </header>

      <div className="bg-doulia-card border border-doulia-border rounded-2xl overflow-hidden ai-glow">
        <div className="p-4 border-b border-doulia-border flex justify-between items-center bg-white/5">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-doulia-midnight border border-doulia-border rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-neon-green transition-colors"
            />
          </div>
          <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
            {filteredDocs.length} Documents
          </div>
        </div>

        {loading && documents.length === 0 ? (
          <div className="p-12 text-center text-neon-green animate-pulse font-bold text-xs">Synchronisation...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] uppercase tracking-widest text-gray-500 font-black border-b border-doulia-border">
                  <th className="px-5 py-3">Document</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Montant</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-doulia-border">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-neon-green transition-colors border border-white/10">
                          <FileText size={14} />
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs group-hover:text-neon-green transition-colors">{doc['Nom'] || 'Sans titre'}</p>
                          <p className="text-[10px] text-gray-500">{new Date(doc['Date'] || Date.now()).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-medium text-gray-400">{doc['Type'] || 'Devis'}</span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-mono font-bold text-white text-xs">{(doc['Montant'] || 0).toLocaleString()} <span className="text-[9px] text-gray-500">XAF</span></p>
                    </td>
                    <td className="px-5 py-3">
                      {getStatusBadge(doc['Statut'])}
                    </td>
                    <td className="px-5 py-3">
                      <button className="p-1.5 hover:bg-neon-green/10 rounded-lg text-neon-green transition-colors">
                        <Download size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && filteredDocs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-gray-500 italic text-xs">
                      Aucun document trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <InvoiceForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchDocs} 
      />
    </div>
  );
}
