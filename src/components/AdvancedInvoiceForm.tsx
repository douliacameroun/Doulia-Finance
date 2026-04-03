import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  FileText, 
  Receipt, 
  Users, 
  ChevronDown, 
  Zap, 
  Briefcase, 
  Calculator,
  CheckCircle2,
  Loader2,
  X
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
}

interface Service {
  id: string;
  nom: string;
  prixInstallation: number;
}

interface Project {
  id: string;
  nom: string;
  prix: number;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  serviceId?: string;
  projectId?: string;
}

interface AdvancedInvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdvancedInvoiceForm({ isOpen, onClose, onSuccess }: AdvancedInvoiceFormProps) {
  const [type, setType] = useState<'Devis' | 'Facture'>('Devis');
  const [clientId, setClientId] = useState('');
  const [items, setItems] = useState<LineItem[]>([
    { id: Math.random().toString(36).substr(2, 9), description: '', quantity: 1, price: 0 }
  ]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (isOpen) {
      // Fetch data
      Promise.all([
        fetch('/api/clients').then(res => res.json()),
        fetch('/api/services').then(res => res.json()),
        fetch('/api/projets').then(res => res.json())
      ]).then(([clientsData, servicesData, projectsData]) => {
        setClients(clientsData);
        setServices(servicesData);
        setProjects(projectsData);
      }).catch(err => console.error("Error fetching form data:", err));
    }
  }, [isOpen]);

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(36).substr(2, 9), description: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, updates: Partial<LineItem>) => {
    setItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleServiceSelect = (id: string, serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      updateItem(id, { 
        description: service.nom, 
        price: service.prixInstallation, 
        serviceId: service.id,
        projectId: undefined 
      });
    }
  };

  const handleProjectSelect = (id: string, projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      updateItem(id, { 
        description: project.nom, 
        price: project.prix, 
        projectId: project.id,
        serviceId: undefined 
      });
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tva = subtotal * 0.1925; // TVA Cameroun 19.25%
  const total = subtotal + tva;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return alert("Veuillez sélectionner un client");
    
    setIsSubmitting(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/documents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          type,
          items,
          totalHT: subtotal,
          date: new Date().toISOString().split('T')[0]
        })
      });

      if (response.ok) {
        setStatus('success');
        setTimeout(() => {
          onSuccess();
          onClose();
          setStatus('idle');
          setItems([{ id: Math.random().toString(36).substr(2, 9), description: '', quantity: 1, price: 0 }]);
          setClientId('');
        }, 1500);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-doulia-dark/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-doulia-card border border-doulia-border w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-doulia-border flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-green/10 flex items-center justify-center text-neon-green border border-neon-green/20">
              {type === 'Devis' ? <FileText size={20} /> : <Receipt size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-black">Nouveau <span className="text-neon-green">{type}</span></h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Génération de document financier</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Top Section: Client & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Users size={12} /> Client
              </label>
              <div className="relative">
                <select 
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  required
                  className="w-full bg-doulia-midnight border border-doulia-border rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-neon-green transition-colors appearance-none"
                >
                  <option value="">Sélectionner un client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                Type de Document
              </label>
              <div className="flex p-1 bg-doulia-midnight border border-doulia-border rounded-xl">
                <button 
                  type="button"
                  onClick={() => setType('Devis')}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${type === 'Devis' ? 'bg-neon-green text-doulia-midnight' : 'text-gray-500 hover:text-white'}`}
                >
                  Devis
                </button>
                <button 
                  type="button"
                  onClick={() => setType('Facture')}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${type === 'Facture' ? 'bg-neon-green text-doulia-midnight' : 'text-gray-500 hover:text-white'}`}
                >
                  Facture
                </button>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Détails des prestations</h3>
              <button 
                type="button"
                onClick={addItem}
                className="text-neon-green text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              >
                <Plus size={14} /> Ajouter une ligne
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="grid grid-cols-12 gap-3 items-end bg-white/5 p-4 rounded-2xl border border-white/5 group"
                >
                  <div className="col-span-12 md:col-span-5 space-y-2">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Description / Service</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input 
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, { description: e.target.value })}
                          placeholder="Description de la prestation"
                          className="w-full bg-doulia-midnight border border-doulia-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-neon-green transition-colors"
                        />
                      </div>
                      <div className="flex gap-1">
                        <select 
                          onChange={(e) => handleServiceSelect(item.id, e.target.value)}
                          className="bg-doulia-midnight border border-doulia-border rounded-lg p-2 text-[10px] focus:outline-none focus:border-neon-green transition-colors w-10 text-center"
                          title="Sélectionner un service standard"
                        >
                          <option value="">⚡</option>
                          {services.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                        </select>
                        <select 
                          onChange={(e) => handleProjectSelect(item.id, e.target.value)}
                          className="bg-doulia-midnight border border-doulia-border rounded-lg p-2 text-[10px] focus:outline-none focus:border-neon-green transition-colors w-10 text-center"
                          title="Sélectionner un projet sur mesure"
                        >
                          <option value="">💼</option>
                          {projects.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-4 md:col-span-2 space-y-2">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Quantité</label>
                    <input 
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
                      className="w-full bg-doulia-midnight border border-doulia-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-neon-green transition-colors text-center"
                    />
                  </div>

                  <div className="col-span-6 md:col-span-3 space-y-2">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Prix Unitaire (FCFA)</label>
                    <input 
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, { price: parseInt(e.target.value) || 0 })}
                      className="w-full bg-doulia-midnight border border-doulia-border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-neon-green transition-colors text-right font-mono"
                    />
                  </div>

                  <div className="col-span-2 md:col-span-2 flex justify-end pb-1">
                    <button 
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="pt-6 border-t border-doulia-border flex flex-col md:flex-row justify-between gap-8">
            <div className="flex-1 max-w-md bg-neon-green/5 p-4 rounded-2xl border border-neon-green/10">
              <div className="flex items-center gap-2 mb-2 text-neon-green">
                <Zap size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Note IA</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed italic">
                "Ce document sera automatiquement synchronisé avec votre base Airtable. Les calculs de TVA sont basés sur le régime fiscal camerounais (19.25%)."
              </p>
            </div>

            <div className="w-full md:w-72 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[9px]">Sous-total HT</span>
                <span className="font-mono font-bold text-white">{subtotal.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[9px]">TVA (19.25%)</span>
                <span className="font-mono font-bold text-white">{tva.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-doulia-border">
                <span className="text-neon-green font-black uppercase tracking-widest text-[10px]">Total TTC</span>
                <span className="text-xl font-black text-white font-mono">{total.toLocaleString()} <span className="text-xs">FCFA</span></span>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-doulia-border bg-white/5 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || !clientId}
            className="bg-neon-green text-doulia-midnight px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(50,205,50,0.2)] disabled:opacity-50 disabled:scale-100"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : status === 'success' ? (
              <CheckCircle2 size={16} />
            ) : (
              <Calculator size={16} />
            )}
            {isSubmitting ? 'Génération...' : status === 'success' ? 'Document Créé !' : `Générer ${type}`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
