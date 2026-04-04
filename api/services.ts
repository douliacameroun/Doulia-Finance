import { VercelRequest, VercelResponse } from '@vercel/node';
import base, { TABLES } from '../lib/airtable';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  
  const airtableKey = process.env.AIRTABLE_API_KEY;
  if (!airtableKey) {
    return res.status(500).json({ error: "AIRTABLE_API_KEY non configurée." });
  }
  
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    const records = await base(TABLES.SERVICES).select().all();
    const services = Array.isArray(records) ? records.map(r => ({
      id: r.id,
      nom: r.get("Nom du Service"),
      prixInstallation: r.get("Prix Installation") || 0,
      maintenance: r.get("Maintenance Mensuelle") || 0,
      description: r.get("Résumé du Service") || "",
      categorie: r.get("Catégorie de Service") || ""
    })) : [];
    
    return res.status(200).json(services);
  } catch (error: any) {
    console.error("API SERVICES ERROR:", error);
    return res.status(500).json({ error: error.message, stack: error.stack });
  }
}