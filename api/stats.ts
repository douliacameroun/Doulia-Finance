import { VercelRequest, VercelResponse } from '@vercel/node';
import base, { TABLES } from '../lib/airtable';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');
  
  try {
    const [documents, projets, simulations, clients] = await Promise.all([
      base(TABLES.DOCUMENTS).select().all(),
      base(TABLES.PROJETS).select().all(),
      base(TABLES.SIMULATIONS).select().all(),
      base(TABLES.CLIENTS).select().all()
    ]);

    const totalSentQuotes = Array.isArray(documents) ? documents.filter(d => d.get('Type') === 'Devis').length : 0;
    const activeProjects = Array.isArray(projets) ? projets.length : 0;
    const totalROIGains = Array.isArray(simulations) ? simulations.reduce((acc, sim) => {
      const gain = (sim.get('Gain Annuel Total') as number) || 0;
      return acc + gain;
    }, 0) : 0;

    const avgROI = simulations.length > 0 ? totalROIGains / simulations.length : 0;
    const estimatedMRR = activeProjects * 150000;

    const totalRevenue = Array.isArray(documents) ? documents.reduce((acc, doc) => {
      if (doc.get('Statut') === 'Payé' || doc.get('Statut') === 'Accepté') {
        return acc + ((doc.get('Total HT') as number) || 0);
      }
      return acc;
    }, 0) : 0;
    
    const clv = clients.length > 0 ? totalRevenue / clients.length : 0;

    return res.status(200).json({
      totalSentQuotes,
      activeProjects,
      totalROIGains,
      avgROI,
      estimatedMRR,
      clv,
      growth: 15.8,
      cac: 45000
    });
  } catch (error: any) {
    console.error("API STATS ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
}

