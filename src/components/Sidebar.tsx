import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calculator, Users, Receipt, Settings, LogOut, TrendingUp, Briefcase, Box } from 'lucide-react';
import { motion } from 'motion/react';

export default function Sidebar() {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de Bord', path: '/' },
    { icon: Calculator, label: 'Simulateur ROI', path: '/simulateur' },
    { icon: Users, label: 'Gestion Clients', path: '/clients' },
    { icon: Receipt, label: 'Facturation & Devis', path: '/facturation' },
    { icon: Box, label: 'Catalogue Services', path: '/services' },
    { icon: Briefcase, label: 'Projets Sur Mesure', path: '/projets' },
  ];

  return (
    <aside className="w-56 bg-doulia-card border-r border-doulia-border flex flex-col h-screen sticky top-0 ai-glow">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <img 
            src="https://i.postimg.cc/Y0nJdHW3/DOULIA_LOGO.jpg" 
            alt="DOULIA" 
            className="w-8 h-8 rounded-lg shadow-lg border border-neon-green/20"
            referrerPolicy="no-referrer"
          />
          <h1 className="font-black text-base tracking-tighter">
            DOULIA <span className="text-neon-green">FINANCE</span>
          </h1>
        </div>

        <nav className="space-y-0.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all
                ${isActive 
                  ? 'bg-neon-green/10 text-neon-green border border-neon-green/20 shadow-[0_0_15px_rgba(50,205,50,0.1)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'}
              `}
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 space-y-3">
        <div className="bg-neon-green/5 p-3 rounded-xl border border-neon-green/10">
          <p className="text-[8px] uppercase tracking-widest text-neon-green font-black mb-1">IA SYSTÈME</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse" />
            <span className="text-[10px] text-white font-bold">Airtable Sync Active</span>
          </div>
        </div>
        
        <button className="flex items-center gap-2.5 px-3 py-2 w-full text-xs font-bold text-gray-500 hover:text-white transition-colors">
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
