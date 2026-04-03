import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Users, Mail, Briefcase } from 'lucide-react';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientAdded: (client: any) => void;
}

export default function AddClientModal({ isOpen, onClose, onClientAdded }: AddClientModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    sector: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const newClient = await response.json();
      onClientAdded(newClient);
      setFormData({ name: '', contact: '', email: '', sector: '' });
      onClose();
    } catch (error) {
      console.error("Failed to add client:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-doulia-midnight/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-doulia-card border border-doulia-border rounded-2xl shadow-2xl overflow-hidden ai-glow"
          >
            <div className="p-4 border-b border-doulia-border flex justify-between items-center bg-white/5">
              <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Plus size={16} className="text-neon-green" /> Nouveau Client
              </h2>
              <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Nom de l'entreprise</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: DOULIA SARL"
                    className="w-full bg-doulia-midnight border border-doulia-border rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-neon-green transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Contact Clé</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                  <input 
                    required
                    type="text" 
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="Ex: Marc Bagnack"
                    className="w-full bg-doulia-midnight border border-doulia-border rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-neon-green transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Email Professionnel</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@entreprise.com"
                    className="w-full bg-doulia-midnight border border-doulia-border rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-neon-green transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Secteur d'activité</label>
                <select 
                  required
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full bg-doulia-midnight border border-doulia-border rounded-xl py-2 px-4 text-xs focus:outline-none focus:border-neon-green transition-colors appearance-none"
                >
                  <option value="">Choisir un secteur</option>
                  <option value="Santé">Santé</option>
                  <option value="Droit">Droit</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Industrie">Industrie</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <button 
                disabled={submitting}
                type="submit"
                className="w-full bg-neon-green text-doulia-midnight py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(50,205,50,0.3)] disabled:opacity-50"
              >
                {submitting ? 'Création en cours...' : 'Ajouter le Client'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
