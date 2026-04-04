import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  AlertCircle, 
  CheckCircle2, 
  Filter,
  ArrowUpDown,
  Search,
  PieChart as PieChartIcon,
  BarChart3
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface BudgetItem {
  id: string;
  designation: string;
  categorie: string;
  type: 'Revenu' | 'Dépense';
  montantPrevu: number;
  montantReel: number;
  ecart: number;
  statut: string;
  displayPrevu: string;
  displayReel: string;
  displayEcart: string;
}

export default function BudgetPage() {
  const [budget, setBudget] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Revenu' | 'Dépense'>('All');

  useEffect(() => {
    fetchBudget();
  }, []);

  const fetchBudget = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/budget');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur serveur: ${response.status}`);
      }
      const data = await response.json();
      setBudget(data);
    } catch (err: any) {
      console.error("Error fetching budget:", err);
      setError(err.message || "Une erreur est survenue lors de la récupération du budget.");
    } finally {
      setLoading(false);
    }
  };

  const totalRevenus = budget
    .filter(item => item.type === 'Revenu')
    .reduce((acc, item) => acc + item.montantReel, 0);

  const totalDepenses = budget
    .filter(item => item.type === 'Dépense')
    .reduce((acc, item) => acc + item.montantReel, 0);

  const soldeNet = totalRevenus - totalDepenses;

  const filteredBudget = budget.filter(item => {
    const matchesSearch = item.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.categorie.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  // Prepare data for charts
  const chartData = Array.from(new Set(budget.map(item => item.categorie))).map(cat => {
    const catItems = budget.filter(item => item.categorie === cat);
    return {
      name: cat,
      prevu: catItems.reduce((acc, item) => acc + item.montantPrevu, 0),
      reel: catItems.reduce((acc, item) => acc + item.montantReel, 0)
    };
  });

  const pieData = Array.from(new Set(budget.filter(i => i.type === 'Dépense').map(item => item.categorie))).map(cat => {
    return {
      name: cat,
      value: budget.filter(item => item.categorie === cat && item.type === 'Dépense')
                   .reduce((acc, item) => acc + item.montantReel, 0)
    };
  });

  const COLORS = ['#00C9A7', '#1E3A8A', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-doulia-lime"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-8 text-center">
        <div className="p-4 bg-red-400/10 rounded-full text-red-400">
          <AlertCircle size={48} />
        </div>
        <h2 className="text-2xl font-bold text-white">Erreur de chargement</h2>
        <p className="text-gray-400 max-w-md">{error}</p>
        <button 
          onClick={fetchBudget}
          className="px-6 py-2 bg-doulia-lime text-doulia-dark font-bold rounded-xl hover:bg-doulia-lime/90 transition-all"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Gestion Budgétaire</h1>
          <p className="text-gray-400 mt-1">Suivi rigoureux des flux financiers DOULIA</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchBudget}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-sm font-medium"
          >
            Actualiser
          </button>
        </div>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 p-6 rounded-2xl"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Revenus</p>
              <h3 className="text-2xl font-bold mt-1 text-doulia-lime">
                {totalRevenus.toLocaleString('fr-FR')} XAF
              </h3>
            </div>
            <div className="p-2 bg-doulia-lime/10 rounded-lg text-doulia-lime">
              <TrendingUp size={20} />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 p-6 rounded-2xl"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Dépenses</p>
              <h3 className="text-2xl font-bold mt-1 text-red-400">
                {totalDepenses.toLocaleString('fr-FR')} XAF
              </h3>
            </div>
            <div className="p-2 bg-red-400/10 rounded-lg text-red-400">
              <TrendingDown size={20} />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 p-6 rounded-2xl"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-400">Solde Net</p>
              <h3 className={`text-2xl font-bold mt-1 ${soldeNet >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                {soldeNet.toLocaleString('fr-FR')} XAF
              </h3>
            </div>
            <div className="p-2 bg-blue-400/10 rounded-lg text-blue-400">
              <Wallet size={20} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 border border-white/10 p-6 rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={18} className="text-doulia-lime" />
            <h3 className="text-lg font-semibold">Prévu vs Réel par Catégorie</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #ffffff10', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="prevu" name="Prévu" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reel" name="Réel" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 p-6 rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon size={18} className="text-doulia-lime" />
            <h3 className="text-lg font-semibold">Répartition des Dépenses</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #ffffff10', borderRadius: '8px' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Budget Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher une désignation ou catégorie..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-doulia-lime/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
              <button 
                onClick={() => setFilterType('All')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${filterType === 'All' ? 'bg-doulia-lime text-doulia-dark' : 'text-gray-400 hover:text-white'}`}
              >
                Tous
              </button>
              <button 
                onClick={() => setFilterType('Revenu')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${filterType === 'Revenu' ? 'bg-doulia-lime text-doulia-dark' : 'text-gray-400 hover:text-white'}`}
              >
                Revenus
              </button>
              <button 
                onClick={() => setFilterType('Dépense')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${filterType === 'Dépense' ? 'bg-doulia-lime text-doulia-dark' : 'text-gray-400 hover:text-white'}`}
              >
                Dépenses
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Désignation</th>
                <th className="px-6 py-4 font-semibold">Catégorie</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold text-right">Prévu</th>
                <th className="px-6 py-4 font-semibold text-right">Réel</th>
                <th className="px-6 py-4 font-semibold text-right">Écart</th>
                <th className="px-6 py-4 font-semibold text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredBudget.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{item.designation}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-400 text-sm">{item.categorie}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      item.type === 'Revenu' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm">
                    {item.displayPrevu}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm">
                    {item.displayReel}
                  </td>
                  <td className={`px-6 py-4 text-right font-mono text-sm ${
                    item.ecart > 0 ? 'text-red-400' : item.ecart < 0 ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {item.ecart > 0 ? '+' : ''}{item.displayEcart}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      {item.statut === 'Validé' ? (
                        <CheckCircle2 size={18} className="text-doulia-lime" />
                      ) : (
                        <AlertCircle size={18} className="text-orange-400" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
