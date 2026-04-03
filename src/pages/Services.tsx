import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Box, Search, Filter, Plus, Zap, Shield, BarChart3, Clock } from 'lucide-react';

interface Service {
  id: string;
  nom: string;
  prixInstallation: number;
  maintenance: number;
  description: string;
  categorie: string;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        setServices(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching services:", err);
        setLoading(false);
      });
  }, []);

  const filteredServices = services.filter(s => 
    s.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.categorie?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black mb-1">Catalogue <span className="text-neon-green">Services</span></h1>
          <p className="text-xs text-gray-400">Solutions d'IA et d'automatisation pour l'excellence opérationnelle.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white/5 border border-doulia-border text-white px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-white/10 transition-colors">
            <Filter size={16} /> Filtrer
          </button>
        </div>
      </header>

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
        <input 
          type="text" 
          placeholder="Rechercher un service..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-doulia-card border border-doulia-border rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-neon-green transition-colors ai-glow"
        />
      </div>

      {loading ? (
        <div className="p-12 text-center text-neon-green animate-pulse font-bold text-xs uppercase tracking-widest">
          Chargement du catalogue...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-doulia-card border border-doulia-border rounded-2xl p-6 hover:border-neon-green/50 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Box size={64} />
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-neon-green/10 flex items-center justify-center text-neon-green border border-neon-green/20">
                  {index % 3 === 0 ? <Zap size={20} /> : index % 3 === 1 ? <Shield size={20} /> : <BarChart3 size={20} />}
                </div>
                <div>
                  <h3 className="font-black text-white text-sm group-hover:text-neon-green transition-colors">{service.nom}</h3>
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">{service.categorie}</span>
                </div>
              </div>

              <p className="text-[11px] text-gray-400 mb-6 line-clamp-3 leading-relaxed">
                {service.description || "Solution d'intelligence artificielle sur mesure pour optimiser vos processus métiers et accroître votre rentabilité."}
              </p>

              <div className="space-y-3 pt-4 border-t border-doulia-border">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Installation</span>
                  <span className="font-mono font-black text-white text-xs">{(service.prixInstallation || 0).toLocaleString()} <span className="text-[9px] text-gray-500">XAF</span></span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Maintenance / mois</span>
                  <span className="font-mono font-black text-neon-green text-xs">{(service.maintenance || 0).toLocaleString()} <span className="text-[9px] text-gray-500">XAF</span></span>
                </div>
              </div>

              <button className="w-full mt-6 bg-white/5 border border-doulia-border text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neon-green hover:text-doulia-midnight hover:border-neon-green transition-all">
                Détails de l'offre
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredServices.length === 0 && (
        <div className="p-12 text-center bg-doulia-card border border-doulia-border rounded-2xl">
          <p className="text-gray-500 text-xs italic">Aucun service ne correspond à votre recherche.</p>
        </div>
      )}
    </div>
  );
}
