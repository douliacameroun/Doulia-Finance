import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Zap, 
  Calculator, 
  Save, 
  FilePlus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  BarChart3
} from 'lucide-react';

// --- COMPOSANTS INTERNES ---

const StatCard = ({ label, value, icon: Icon, trend, positive, isLoading }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-doulia-card border border-doulia-border p-4 rounded-xl relative overflow-hidden group ai-glow"
  >
    <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
      <Icon size={48} className="text-neon-green" />
    </div>
    <div className="flex items-center gap-2 mb-2">
      <div className="w-8 h-8 rounded-lg bg-neon-green/10 flex items-center justify-center text-neon-green border border-neon-green/20">
        <Icon size={16} />
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</span>
    </div>
    {isLoading ? (
      <div className="h-8 w-3/4 bg-white/5 animate-pulse rounded-lg mb-1"></div>
    ) : (
      <div className="text-xl font-black text-white mb-0.5">{value}</div>
    )}
    <div className={`flex items-center gap-1 text-[10px] font-bold ${positive ? 'text-neon-green' : 'text-red-400'}`}>
      {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {trend} <span className="text-gray-500 font-normal ml-1">vs mois dernier</span>
    </div>
  </motion.div>
);

export default function Dashboard() {
  const [stats, setStats] = useState<any>({
    totalSentQuotes: 0,
    activeProjects: 0,
    totalROIGains: 0,
    avgROI: 0,
    estimatedMRR: 0,
    clv: 0,
    cac: 0,
    growth: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // ROI Simulator State
  const [inputs, setInputs] = useState({
    employees: 5,
    hourlyRate: 2500,
    repetitiveHours: 2,
    missedLeads: 10,
    leadValue: 50000,
  });

  const [results, setResults] = useState({
    timeGain: 0,
    leadGain: 0,
    annualGain: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    // Calcul ROI
    const monthlyTimeGain = inputs.employees * inputs.repetitiveHours * 20 * inputs.hourlyRate;
    const monthlyLeadGain = inputs.missedLeads * inputs.leadValue * 0.3; // On suppose 30% de conversion récupérée
    const annual = (monthlyTimeGain + monthlyLeadGain) * 12;

    setResults({
      timeGain: monthlyTimeGain,
      leadGain: monthlyLeadGain,
      annualGain: annual,
    });
  }, [inputs]);

  const handleSaveSimulation = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const response = await fetch('/api/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'clientName': `Simulation Dashboard - ${new Date().toLocaleDateString()}`,
          'annualGain': results.annualGain,
          'timeSaved': inputs.employees * inputs.repetitiveHours * 20 * 12, // Heures par an
        }),
      });

      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTransformToQuote = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'nom': `DEVIS-${Date.now()}`, // ID Document
          'type': 'Devis',
          'total': results.annualGain * 0.1, // 10% du gain estimé comme prix du service
          'statut': 'Brouillon',
          'date': new Date().toISOString().split('T')[0],
        }),
      });

      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-neon-green">Système DOULIA v2.0</span>
          </div>
          <h1 className="text-2xl font-black mb-1">DOULIA <span className="text-neon-green">Finance Hub</span></h1>
          <p className="text-xs text-gray-400">Pilotage financier et optimisation de rentabilité en temps réel.</p>
        </div>
        <div className="text-right">
          <div className="text-[8px] uppercase tracking-widest font-black text-gray-500 mb-0.5">Dernière Sync Airtable</div>
          <div className="flex items-center gap-1.5 text-neon-green font-mono text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse"></div>
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </header>

      {/* --- TOP CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard 
          label="Devis Envoyés" 
          value={(stats.totalSentQuotes || 0).toString()}
          icon={FileText}
          trend="+12%"
          positive={true}
          isLoading={isLoading}
        />
        <StatCard 
          label="Projets en cours" 
          value={(stats.activeProjects || 0).toString()}
          icon={Zap}
          trend="+5%"
          positive={true}
          isLoading={isLoading}
        />
        <StatCard 
          label="Estimation Gains ROI" 
          value={`${(stats.totalROIGains || 0).toLocaleString('fr-FR')} FCFA`}
          icon={TrendingUp}
          trend="+18.5%"
          positive={true}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          label="MRR (Revenu Récurrent)" 
          value={`${(stats.estimatedMRR || 0).toLocaleString('fr-FR')} FCFA`}
          icon={DollarSign}
          trend="+8.2%"
          positive={true}
          isLoading={isLoading}
        />
        <StatCard 
          label="CLV (Valeur Client)" 
          value={`${(stats.clv || 0).toLocaleString('fr-FR')} FCFA`}
          icon={Users}
          trend="+4.1%"
          positive={true}
          isLoading={isLoading}
        />
        <StatCard 
          label="CAC (Coût Acquisition)" 
          value={`${(stats.cac || 0).toLocaleString('fr-FR')} FCFA`}
          icon={ArrowDownRight}
          trend="-2.5%"
          positive={true}
          isLoading={isLoading}
        />
        <StatCard 
          label="ROI Moyen Client" 
          value={`${(stats.avgROI || 0).toLocaleString('fr-FR')} FCFA`}
          icon={BarChart3}
          trend="+15.8%"
          positive={true}
          isLoading={isLoading}
        />
      </div>

      {/* --- ROI SIMULATOR (CENTER) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-doulia-card border border-doulia-border rounded-2xl p-6 ai-glow">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-neon-green/10 flex items-center justify-center text-neon-green border border-neon-green/20">
              <Calculator size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black">Simulateur de <span className="text-neon-green">ROI</span></h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Optimisation de la rentabilité opérationnelle</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-300">Nombre d'employés</label>
                  <span className="text-neon-green font-black text-xs">{inputs.employees}</span>
                </div>
                <input 
                  type="range" min="1" max="100" value={inputs.employees}
                  onChange={(e) => setInputs({...inputs, employees: parseInt(e.target.value)})}
                  className="w-full h-1 bg-doulia-midnight rounded-lg appearance-none cursor-pointer accent-neon-green"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-300">Coût horaire moyen (FCFA)</label>
                  <span className="text-neon-green font-black text-xs">{inputs.hourlyRate.toLocaleString('fr-FR')}</span>
                </div>
                <input 
                  type="range" min="1000" max="50000" step="500" value={inputs.hourlyRate}
                  onChange={(e) => setInputs({...inputs, hourlyRate: parseInt(e.target.value)})}
                  className="w-full h-1 bg-doulia-midnight rounded-lg appearance-none cursor-pointer accent-neon-green"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-300">Heures répétitives / jour / employé</label>
                  <span className="text-neon-green font-black text-xs">{inputs.repetitiveHours}h</span>
                </div>
                <input 
                  type="range" min="0.5" max="8" step="0.5" value={inputs.repetitiveHours}
                  onChange={(e) => setInputs({...inputs, repetitiveHours: parseFloat(e.target.value)})}
                  className="w-full h-1 bg-doulia-midnight rounded-lg appearance-none cursor-pointer accent-neon-green"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-300">Prospects manqués / mois</label>
                  <span className="text-neon-green font-black text-xs">{inputs.missedLeads}</span>
                </div>
                <input 
                  type="range" min="0" max="200" value={inputs.missedLeads}
                  onChange={(e) => setInputs({...inputs, missedLeads: parseInt(e.target.value)})}
                  className="w-full h-1 bg-doulia-midnight rounded-lg appearance-none cursor-pointer accent-neon-green"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-300">Valeur d'un prospect (FCFA)</label>
                  <span className="text-neon-green font-black text-xs">{inputs.leadValue.toLocaleString('fr-FR')}</span>
                </div>
                <input 
                  type="range" min="5000" max="1000000" step="5000" value={inputs.leadValue}
                  onChange={(e) => setInputs({...inputs, leadValue: parseInt(e.target.value)})}
                  className="w-full h-1 bg-doulia-midnight rounded-lg appearance-none cursor-pointer accent-neon-green"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Sidebar */}
        <div className="bg-neon-green text-doulia-midnight rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden ai-glow">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <TrendingUp size={80} />
          </div>
          
          <div>
            <h3 className="text-[10px] uppercase tracking-widest font-black opacity-60 mb-6">Résultats de l'Analyse</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold opacity-60 mb-0.5">Gain de Temps (Mensuel)</p>
                <p className="text-lg font-black">{(results.timeGain || 0).toLocaleString('fr-FR')} FCFA</p>
              </div>
              <div>
                <p className="text-[10px] font-bold opacity-60 mb-0.5">Récupération CA (Mensuel)</p>
                <p className="text-lg font-black">{(results.leadGain || 0).toLocaleString('fr-FR')} FCFA</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-[10px] uppercase tracking-widest font-black opacity-60 mb-1">Gain Annuel Potentiel</p>
            <div className="text-2xl font-black leading-none mb-4">
              {(results.annualGain || 0).toLocaleString('fr-FR')} <span className="text-sm">FCFA</span>
            </div>
            
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleSaveSimulation}
                disabled={isSaving}
                className="w-full bg-doulia-midnight text-white py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                Sauvegarder Simulation
              </button>
              
              <button 
                onClick={handleTransformToQuote}
                disabled={isSaving}
                className="w-full bg-white text-doulia-midnight py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={14} /> : <FilePlus size={14} />}
                Transformer en Devis
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- STATUS NOTIFICATIONS --- */}
      <AnimatePresence>
        {saveStatus !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 right-8 p-4 rounded-2xl flex items-center gap-3 shadow-2xl z-50 ${
              saveStatus === 'success' ? 'bg-neon-green text-doulia-dark' : 'bg-red-500 text-white'
            }`}
          >
            {saveStatus === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <span className="font-black">
              {saveStatus === 'success' ? 'Synchronisation Airtable réussie !' : 'Erreur de synchronisation.'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
