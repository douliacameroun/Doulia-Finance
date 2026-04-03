import { VercelRequest, VercelResponse } from '@vercel/node';
import base, { TABLES } from '../lib/airtable';

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');
  
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
    
    res.status(200).json(services);
  } catch (error: any) {
    console.error("API SERVICES ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
