import base, { TABLES } from '../lib/airtable'; // 🔴 Suppression absolue de l'extension ".ts"

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');
  
  try {
    const records = await base(TABLES.CLIENTS).select().all();
    const clients = Array.isArray(records) ? records.map(r => ({
      id: r.id,
      name: r.get("Nom de l'Entreprise") || "Nom Manquant",
      contact: r.get("Contact Clé") || "N/A",
      email: r.get("Email") || "N/A",
      sector: r.get("Secteur") || "Général",
      maturity: r.get("Score de Maturité IA") || 0
    })) : [];
    
    res.status(200).json(clients);
  } catch (error: any) {
    console.error("API CLIENTS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
}