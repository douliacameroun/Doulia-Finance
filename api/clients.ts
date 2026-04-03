import { VercelRequest, VercelResponse } from '@vercel/node';
import base, { TABLES, mapClient } from '../lib/airtable';

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === 'GET') {
    try {
      const records = await base(TABLES.CLIENTS).select().all();
      res.json(Array.isArray(records) ? records.map(r => mapClient(r)) : []);
    } catch (error: any) {
      console.error('Clients API Error:', error);
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const body = req.body;
      const newRecord = await base(TABLES.CLIENTS).create([
        {
          fields: {
            "Nom de l'Entreprise": body.name || body.nom,
            "Contact Clé": body.contact,
            "Email": body.email,
            "Secteur": body.sector || body.secteur,
            "Score de Maturité IA": body.maturity || 0
          }
        }
      ]);
      res.json(mapClient(newRecord[0]));
    } catch (error: any) {
      console.error('Error creating client:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
};
