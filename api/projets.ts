import { VercelRequest, VercelResponse } from '@vercel/node';
import base, { TABLES } from '../lib/airtable';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  
  const airtableKey = process.env.AIRTABLE_API_KEY;
  if (!airtableKey) {
    return res.status(500).json({ error: "AIRTABLE_API_KEY non configurée." });
  }
  
  if (req.method === 'GET') {
    try {
      const records = await base(TABLES.PROJETS).select().all();
      const projets = Array.isArray(records) ? records.map(r => ({
        id: r.id,
        nom: r.get("Nom du Projet"),
        categorie: r.get("Catégorie") || "Sur Mesure",
        synthese: r.get("Synthèse") || r.get("Description") || "",
        client: r.get("Clients") || [],
        complexite: r.get("Complexité Technique") || 1,
        gainAnnuel: r.get("Gain Annuel Estimé Client") || 0,
        prix: r.get("Prix Final Proposé") || 0
      })) : [];
      
      return res.status(200).json(projets);
    } catch (error: any) {
      console.error("API PROJETS ERROR:", error);
      return res.status(500).json({ error: error.message, stack: error.stack });
    }
  } else if (req.method === 'POST') {
    try {
      const body = req.body;
      const newRecord = await base(TABLES.PROJETS).create([
        {
          fields: {
            "Nom du Projet": body.name || body.nom,
            "Clients": body.clientId ? [body.clientId] : undefined,
            "Complexité Technique": body.complexity || 1,
            "Gain Annuel Estimé Client": body.annualGain || 0,
            "Prix Final Proposé": body.price || 0
          }
        }
      ]);
      return res.status(201).json(newRecord[0]);
    } catch (error: any) {
      console.error("API PROJETS POST ERROR:", error);
      return res.status(500).json({ error: error.message, stack: error.stack });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}