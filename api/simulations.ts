import { VercelRequest, VercelResponse } from '@vercel/node';
import base, { TABLES } from '../lib/airtable';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const records = await base(TABLES.SIMULATIONS).select().all();
      const simulations = Array.isArray(records) ? records.map(r => ({ 
        id: r.id, 
        "Client Potentiel": r.get("Client Potentiel"),
        "Gain Annuel Total": r.get("Gain Annuel Total") || 0,
        "Temps Libéré": r.get("Temps Libéré") || 0
      })) : [];
      return res.status(200).json(simulations);
    } catch (error: any) {
      console.error("API SIMULATIONS ERROR:", error);
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const body = req.body;
      const newRecord = await base(TABLES.SIMULATIONS).create([
        {
          fields: {
            "Client Potentiel": body.clientName || body.name || "Simulation",
            "Gain Annuel Total": body.annualGain || body['Gain Annuel Total'] || 0,
            "Temps Libéré": body.timeSaved || body['Temps Libéré'] || 0,
            "Client": body.clientId ? [body.clientId] : undefined
          }
        }
      ]);
      return res.status(200).json(newRecord[0]);
    } catch (error: any) {
      console.error("API SIMULATIONS POST ERROR:", error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).send('Method Not Allowed');
  }
}

