import { VercelRequest, VercelResponse } from '@vercel/node';
import base, { TABLES } from '../lib/airtable';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const records = await base(TABLES.CLIENTS).select({ maxRecords: 1 }).all();
    res.status(200).json({ 
      status: "ok", 
      message: "Connexion Airtable réussie", 
      count: records.length 
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: "error", 
      message: "Échec de la connexion Airtable", 
      error: error.message 
    });
  }
};
