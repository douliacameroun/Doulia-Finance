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
    const records = await base(TABLES.BUDGET).select().all();
    
    const budgetData = Array.isArray(records) ? records.map(r => {
      const prevu = Number(r.get("Montant Prévu")) || 0;
      const reel = Number(r.get("Montant Réel")) || 0;
      const ecart = reel - prevu;
      
      return {
        id: r.id,
        designation: r.get("Désignation") || "Inconnu",
        categorie: r.get("Catégorie") || "Général",
        type: r.get("Type") || "Dépense",
        montantPrevu: prevu,
        montantReel: reel,
        ecart: ecart,
        statut: r.get("Statut") || "En attente",
        // Formatted for XAF display
        displayPrevu: `${prevu.toLocaleString('fr-FR')} XAF`,
        displayReel: `${reel.toLocaleString('fr-FR')} XAF`,
        displayEcart: `${ecart.toLocaleString('fr-FR')} XAF`
      };
    }) : [];
    
    return res.status(200).json(budgetData);
  } catch (error: any) {
    console.error("API BUDGET ERROR:", error);
    return res.status(500).json({ error: error.message, stack: error.stack });
  }
}
