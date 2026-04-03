import base, { TABLES } from '../lib/airtable'; // 🔴 Suppression du ".ts"

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
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
          // On ajoute la quantité à la description car tu n'as pas de colonne Quantité
          "Description": item.description + (item.quantity > 1 ? ` (Qté: ${item.quantity})` : ''),
          // On multiplie directement ici car la colonne "Montant Ligne" attend le prix total de la ligne
          "Montant Ligne": Number(item.price) * Number(item.quantity)
        };

        // Ajout des liens uniquement s'ils existent (évite les erreurs undefined)
        if (item.serviceId) fields["Service Standard"] = [item.serviceId];
        // Note: Si dans Airtable la colonne s'écrit "Projet Sur Mesure" (sans tiret), supprime le tiret ici.
        if (item.projectId) fields["Projet Sur-Mesure"] = [item.projectId]; 

        return { fields };
      });

      // Airtable create supporte max 10 records par appel
      for (let i = 0; i < lineRecords.length; i += 10) {
        await base(TABLES.LIGNES_FACTURATION).create(lineRecords.slice(i, i + 10));
      }
      console.log(`${items.length} lines created`);
    }

    res.status(200).json({ success: true, id: docId });
  } catch (error: any) {
    console.error("API DOCUMENTS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
}