import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, FileText, DollarSign, Calendar, User, Briefcase } from 'lucide-react';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentAdded: (doc: any) => void;
}

export default function AddDocumentModal({ isOpen, onClose, onDocumentAdded }: AddDocumentModalProps) {
  const [formData, setFormData] = useState({
    nom: '',
    type: 'Devis',
    total: 0,
    statut: 'Brouillon',
    date: new Date().toISOString().split('T')[0],
    clientId: ''
  });
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fetch clients
      fetch('/api/clients')
        .then(res => res.json())
        .then(data => setClients(Array.isArray(data) ? data : []))
        .catch(err => console.error("Error fetching clients:", err));

      // Fetch services
      fetch('/api/services')
        .then(res => res.json())
        .then(data => setServices(Array.isArray(data) ? data : []))
        .catch(err => console.error("Error fetching services:", err));
    }
  }, [isOpen]);

  const handleServiceChange = (serviceId: string) => {
    const selectedService = services.find(s => s.id === serviceId);
    if (selectedService) {
      setFormData({
        ...formData,
        nom: selectedService.nom,
        total: selectedService.prixInstallation || 0
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const newDoc = await response.json();
      onDocumentAdded(newDoc);
      setFormData({
        nom: '',
        type: 'Devis',
        total: 0,
        statut: 'Brouillon',
        date: new Date().toISOString().split('T')[0],
        clientId: ''
      });
      onClose();
    } catch (error) {
      console.error("Failed to add document:", error);
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
                <Plus size={16} className="text-neon-green" /> Nouveau Document
              </h2>
              <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Service du Catalogue (Optionnel)</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                  <select 
                    onChange={(e) => handleServiceChange(e.target.value)}
                    className="w-full bg-doulia-midnight border border-doulia-border rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-neon-green transition-colors appearance-none"
                  >
                    <option value="">-- Sélectionner un service --</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id}>{service.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">ID Document / Nom</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                  <input 
                    required
                    type="text" 
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="Ex: DEVIS-2024-001"
                    className="w-full bg-doulia-midnight border border-doulia-border rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-neon-green transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Type</label>
                  <select 
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-doulia-midnight border border-doulia-border rounded-xl py-2 px-4 text-xs focus:outline-none focus:border-neon-green transition-colors appearance-none"
                  >
                    <option value="Devis">Devis</option>
                    <option value="Facture">Facture</option>
                    <option value="Audit">Audit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Statut</label>
                  <select 
                    required
                    value={formData.statut}
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                    className="w-full bg-doulia-midnight border border-doulia-border rounded-xl py-2 px-4 text-xs focus:outline-none focus:border-neon-green transition-colors appearance-none"
                  >
                    <option value="Brouillon">Brouillon</option>
                    <option value="Envoyé">Envoyé</option>
                    <option value="Payé">Payé</option>
                    <option value="Annulé">Annulé</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Montant Total (XAF)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                  <input 
                    required
                    type="number" 
                    value={formData.total}
                    onChange={(e) => setFormData({ ...formData, total: parseFloat(e.target.value) })}
                    className="w-full bg-doulia-midnight border border-doulia-border rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-neon-green transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Client</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                  <select 
                    required
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full bg-doulia-midnight border border-doulia-border rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-neon-green transition-colors appearance-none"
                  >
                    <option value="">Sélectionner un client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Date d'Émission</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                  <input 
                    required
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-doulia-midnight border border-doulia-border rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-neon-green transition-colors"
                  />
                </div>
              </div>

              <button 
                disabled={submitting}
                type="submit"
                className="w-full bg-neon-green text-doulia-midnight py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(50,205,50,0.3)] disabled:opacity-50"
              >
                {submitting ? 'Création en cours...' : 'Créer le Document'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
