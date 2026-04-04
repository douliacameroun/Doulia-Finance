// api/clients.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import base, { TABLES, mapClient } from '../lib/airtable';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  
  const airtableKey = process.env.AIRTABLE_API_KEY;
  if (!airtableKey) {
    return res.status(500).json({ error: "AIRTABLE_API_KEY non configurée." });
  }
  
  if (req.method === 'GET') {
    try {
      const records = await base(TABLES.CLIENTS).select().all();
      const data = records.map(r => mapClient(r));
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, contact, email, sector, maturity } = req.body;
      const newRecord = await base(TABLES.CLIENTS).create([{
        fields: {
          "Nom de l'Entreprise": name,
          "Contact Clé": contact,
          "Email": email,
          "Secteur": sector,
          "Score de Maturité IA": maturity || 0
        }
      }]);
      return res.status(201).json(mapClient(newRecord[0]));
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}

