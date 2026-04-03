import React from 'react';
import { Users, Mail, Phone, MapPin } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  contact: string;
  email: string;
  sector: string;
}

interface ClientsTableProps {
  clients: Client[];
  loading: boolean;
}

export default function ClientsTable({ clients, loading }: ClientsTableProps) {
  if (loading) {
    return (
      <div className="p-12 text-center text-neon-green animate-pulse font-bold text-xs">
        Synchronisation avec Airtable...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[9px] uppercase tracking-widest text-gray-500 font-black border-b border-doulia-border">
            <th className="px-5 py-3">Nom / Entreprise</th>
            <th className="px-5 py-3">Contact Clé</th>
            <th className="px-5 py-3">Secteur</th>
            <th className="px-5 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-doulia-border">
          {clients.map((client) => (
            <tr key={client.id} className="hover:bg-white/5 transition-colors group">
              <td className="px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-neon-green/10 flex items-center justify-center text-neon-green font-bold text-xs border border-neon-green/20">
                    {client.name?.charAt(0) || <Users size={14} />}
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs group-hover:text-neon-green transition-colors">{client.name}</p>
                    <p className="text-[10px] text-gray-500">{client.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                  <Users size={10} className="text-neon-green" /> {client.contact}
                </div>
              </td>
              <td className="px-5 py-3">
                <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/5 border border-doulia-border text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                  {client.sector}
                </div>
              </td>
              <td className="px-5 py-3">
                <button className="text-[10px] font-black text-neon-green hover:underline uppercase tracking-widest">Détails</button>
              </td>
            </tr>
          ))}
          {clients.length === 0 && (
            <tr>
              <td colSpan={4} className="px-5 py-12 text-center text-gray-500 italic text-xs">
                Aucun client trouvé dans Airtable.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
