import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calculator, Zap, TrendingUp, Save, FileText, ArrowRight, Info } from 'lucide-react';

export default function Simulator() {
  const [inputs, setInputs] = useState({
    employees: 10,
    hourlyRate: 5000,
    lostHours: 3,
    missedLeads: 5,
    leadValue: 100000,
  });

  const [results, setResults] = useState({
    timeSavings: 0,
    recoveredRevenue: 0,
    annualGain: 0,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Economie Temps = Employés * Heures Perdues * Coût Horaire * 20 jours * 12 mois
    const timeSavings = inputs.employees * inputs.lostHours * inputs.hourlyRate * 20 * 12;
    // Revenu Récupéré = Prospects Manqués * Valeur Prospect * 12 mois
    const recoveredRevenue = inputs.missedLeads * inputs.leadValue * 12;
    
    setResults({
      timeSavings,
      recoveredRevenue,
      annualGain: timeSavings + recoveredRevenue,
    });
  }, [inputs]);

  const handleGenerateQuote = async () => {
    setIsSaving(true);
    try {
      // 1. Sauvegarde simulation
      await fetch('/api/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'clientName': `Simulation ROI - ${new Date().toLocaleDateString()}`,
          'annualGain': results.annualGain,
          'timeSaved': inputs.employees * inputs.lostHours * 20 * 12, // Heures par an
        }),
      });

      // 2. Création record dans TABLE_DOCUMENTS (Devis)
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'nom': `DEVIS-${Date.now()}`, // ID Document
          'type': 'Devis',
          'total': results.annualGain * 0.1, // Exemple de montant
          'statut': 'Brouillon',
          'date': new Date().toISOString().split('T')[0],
        }),
      });

      alert('Devis généré avec succès dans Airtable !');
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la génération du devis.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-black mb-1">Simulateur de <span className="text-neon-green">ROI</span></h1>
        <p className="text-xs text-gray-400">Calculez l'impact financier de l'automatisation DOULIA sur votre structure.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-doulia-card border border-doulia-border p-6 rounded-2xl space-y-8 ai-glow">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Zap className="text-neon-green" size={18} /> 
              Variables Opérationnelles
            </h2>

            <div className="space-y-8">
              <SliderInput 
                label="Nombre d'employés"
                value={inputs.employees}
                min={1} max={500}
                unit=""
                onChange={(v) => setInputs({...inputs, employees: v})}
              />
              <SliderInput 
                label="Coût horaire moyen (XAF)"
                value={inputs.hourlyRate}
                min={1000} max={100000} step={500}
                unit="XAF"
                onChange={(v) => setInputs({...inputs, hourlyRate: v})}
              />
              <SliderInput 
                label="Heures perdues / jour / employé"
                value={inputs.lostHours}
                min={0} max={8} step={0.5}
                unit="h"
                onChange={(v) => setInputs({...inputs, lostHours: v})}
              />
              <SliderInput 
                label="Prospects manqués / mois"
                value={inputs.missedLeads}
                min={0} max={100}
                unit=""
                onChange={(v) => setInputs({...inputs, missedLeads: v})}
              />
              <SliderInput 
                label="Valeur moyenne d'un prospect (XAF)"
                value={inputs.leadValue}
                min={10000} max={1000000} step={10000}
                unit="XAF"
                onChange={(v) => setInputs({...inputs, leadValue: v})}
              />
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neon-green p-6 rounded-2xl text-doulia-midnight shadow-[0_0_30px_rgba(50,205,50,0.15)] ai-glow"
          >
            <p className="text-[10px] uppercase tracking-widest font-black opacity-60 mb-1">Gain Annuel Potentiel</p>
            <div className="text-3xl font-black leading-none mb-3">
              {(results.annualGain || 0).toLocaleString()} <span className="text-sm">XAF</span>
            </div>
            <div className="h-1 bg-doulia-midnight/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-doulia-midnight"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1 }}
              />
            </div>
          </motion.div>

          <div className="bg-doulia-card border border-doulia-border p-5 rounded-2xl space-y-3 ai-glow">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs">Économie de Temps</span>
              <span className="font-bold text-neon-green text-xs">+{results.timeSavings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs">Revenu Récupéré</span>
              <span className="font-bold text-neon-green text-xs">+{results.recoveredRevenue.toLocaleString()}</span>
            </div>
            <div className="pt-3 border-t border-doulia-border">
              <button 
                onClick={handleGenerateQuote}
                disabled={isSaving}
                className="w-full bg-white text-doulia-midnight font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-neon-green transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Génération...' : 'Générer Devis'}
                <FileText size={16} />
              </button>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-2">
            <Info className="text-blue-400 shrink-0" size={16} />
            <p className="text-[10px] text-blue-200/70 leading-relaxed">
              Ces calculs sont basés sur les standards de productivité DOULIA et la fiscalité OHADA en vigueur au Cameroun.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SliderInput({ label, value, min, max, step = 1, unit, onChange }: any) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <label className="text-xs font-medium text-gray-400">{label}</label>
        <div className="text-lg font-black text-white">
          {value.toLocaleString()} <span className="text-[10px] text-neon-green ml-1">{unit}</span>
        </div>
      </div>
      <input 
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-doulia-midnight rounded-lg appearance-none cursor-pointer accent-neon-green"
      />
    </div>
  );
}
