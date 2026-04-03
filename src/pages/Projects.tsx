import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Briefcase, Search, Filter, Plus, Zap, Shield, BarChart3, Clock, CheckCircle, MoreVertical } from 'lucide-react';

interface Project {
  id: string;
  nom: string;
  categorie: string;
  synthese: string;
  client: string[];
  complexite: number;
  gainAnnuel: number;
  prix: number;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/projets')
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching projects:", err);
        setLoading(false);
      });
  }, []);

  const filteredProjects = projects.filter(p => 
    p.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categorie?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black mb-1">Projets <span className="text-neon-green">Sur Mesure</span></h1>
          <p className="text-xs text-gray-400">Développements spécifiques et intégrations IA pour vos besoins uniques.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white/5 border border-doulia-border text-white px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-white/10 transition-colors">
            <Filter size={16} /> Filtrer
          </button>
          <button className="bg-neon-green text-doulia-midnight px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_15px_rgba(50,205,50,0.2)]">
            <Plus size={16} /> Nouveau Projet
          </button>
        </div>
      </header>

      <div className="bg-doulia-card border border-doulia-border rounded-2xl overflow-hidden ai-glow">
        <div className="p-4 border-b border-doulia-border flex justify-between items-center bg-white/5">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input 
              type="text" 
              placeholder="Rechercher un projet..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-doulia-midnight border border-doulia-border rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-neon-green transition-colors"
            />
          </div>
          <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
            {filteredProjects.length} Projets
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-neon-green animate-pulse font-bold text-xs uppercase tracking-widest">
            Synchronisation des projets...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] uppercase tracking-widest text-gray-500 font-black border-b border-doulia-border">
                  <th className="px-5 py-3">Projet</th>
                  <th className="px-5 py-3">Catégorie</th>
                  <th className="px-5 py-3">Synthèse</th>
                  <th className="px-5 py-3">Complexité</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-doulia-border">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-neon-green transition-colors border border-white/10">
                          <Briefcase size={14} />
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs group-hover:text-neon-green transition-colors">{project.nom || 'Projet Sans Nom'}</p>
                          <p className="text-[10px] text-gray-500">{(project.prix || 0).toLocaleString()} XAF</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-medium text-gray-400 bg-white/5 px-2 py-1 rounded-md border border-white/5">{project.categorie || 'Sur Mesure'}</span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-[10px] text-gray-400 max-w-xs line-clamp-1 italic">
                        {project.synthese || "Analyse et implémentation d'une solution d'IA personnalisée."}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div 
                            key={star} 
                            className={`w-1.5 h-1.5 rounded-full ${star <= (project.complexite || 1) ? 'bg-neon-green shadow-[0_0_5px_rgba(50,205,50,0.5)]' : 'bg-white/10'}`} 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <button className="p-1.5 hover:bg-neon-green/10 rounded-lg text-neon-green transition-colors">
                        <MoreVertical size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-gray-500 italic text-xs">
                      Aucun projet trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
