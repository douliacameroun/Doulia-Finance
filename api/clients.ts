// api/clients.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import base, { TABLES, mapClient } from '../lib/airtable';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const records = await base(TABLES.CLIENTS).select().all();
    const data = records.map(r => mapClient(r));
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};