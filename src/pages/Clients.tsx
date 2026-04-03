import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import ClientsTable from '../components/ClientsTable';
import AddClientModal from '../components/AddClientModal';

export default function Clients() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      const data = await response.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleClientAdded = (newClient: any) => {
    setClients((prev) => [newClient, ...prev]);
  };

  const filteredClients = clients.filter(client => 
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.sector?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black mb-1">Gestion <span className="text-neon-green">Clients</span></h1>
          <p className="text-xs text-gray-400">Gérez votre base de données clients synchronisée avec Airtable.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-neon-green text-doulia-midnight px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_15px_rgba(50,205,50,0.2)]"
        >
          <Plus size={16} /> Nouveau Client
        </button>
      </header>

      <div className="bg-doulia-card border border-doulia-border rounded-2xl overflow-hidden ai-glow">
        <div className="p-4 border-b border-doulia-border flex justify-between items-center bg-white/5">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input 
              type="text" 
              placeholder="Rechercher un client..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-doulia-midnight border border-doulia-border rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-neon-green transition-colors"
            />
          </div>
          <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
            {filteredClients.length} Clients affichés
          </div>
        </div>

        <ClientsTable clients={filteredClients} loading={loading} />
      </div>

      <AddClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onClientAdded={handleClientAdded} 
      />
    </div>
  );
}
