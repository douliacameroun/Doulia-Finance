import { VercelRequest, VercelResponse } from '@vercel/node';
import base, { TABLES } from '../lib/airtable';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'GET') {
    try {
      const records = await base(TABLES.DOCUMENTS).select().all();
      return res.json(Array.isArray(records) ? records.map(r => ({ 
        id: r.id, 
        Nom: r.get("ID Document") || "Sans titre",
        Type: r.get("Type") || "Devis",
        Statut: r.get("Statut") || "Brouillon",
        Montant: r.get("Total HT") || 0,
        Date: r.get("Date d'Émission") || r.createdTime,
        Description: r.get("Description") || ""
      })) : []);
    } catch (error: any) {
      console.error("Documents API Error:", error);
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { clientId, type, items, totalHT, date } = req.body;
      console.log("API DOCUMENTS - CREATING:", { clientId, type, itemCount: items?.length });

      // 1. Créer le Document (Facture/Devis) avec la syntaxe sécurisée d'Airtable
      const docRecords = await base(TABLES.DOCUMENTS).create([
        {
          fields: {
            "ID Document": `${type === 'Facture' ? 'FAC' : 'DEV'}-${Date.now()}`,
            "Type": type,
            "Client": [clientId],
            "Statut": "Brouillon",
            "Total HT": Number(totalHT) || 0,
            "Date d'Émission": date || new Date().toISOString().split('T')[0]
          }
        }
      ]);
      
      const docId = docRecords[0].id;
      console.log("DOCUMENT CREATED:", docId);

      // 2. Créer les lignes liées sans utiliser de champs qui n'existent pas dans Airtable
      if (items && items.length > 0) {
        const lineRecords = items.map((item: any, index: number) => {
          const fields: any = {
            "Name": `Ligne ${index + 1} - ${type}`, // Requis par Airtable
            "Lien Document": [docId],
            "Description": item.description + (item.quantity > 1 ? ` (Qté: ${item.quantity})` : ''),
            "Montant Ligne": Number(item.price) * Number(item.quantity)
          };

          if (item.serviceId) fields["Service Standard"] = [item.serviceId];
          if (item.projectId) fields["Projet Sur-Mesure"] = [item.projectId]; 

          return { fields };
        });

        for (let i = 0; i < lineRecords.length; i += 10) {
          await base(TABLES.LIGNES_FACTURATION).create(lineRecords.slice(i, i + 10));
        }
        console.log(`${items.length} lines created`);
      }

      return res.status(200).json({ success: true, id: docId });
    } catch (error: any) {
      console.error("API DOCUMENTS ERROR:", error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}

