import { VercelRequest, VercelResponse } from '@vercel/node';
import base, { TABLES } from '../lib/airtable';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const records = await base(TABLES.CLIENTS).select({ maxRecords: 1 }).all();
    return res.status(200).json({ 
      status: "ok", 
      message: "Connexion Airtable réussie", 
      count: records.length 
    });
  } catch (error: any) {
    return res.status(500).json({ 
      status: "error", 
      message: "Échec de la connexion Airtable", 
      error: error.message 
    });
  }
}

