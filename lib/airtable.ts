import Airtable from 'airtable';

const airtableKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID || 'appw5t8naTirx4fE0';

if (!airtableKey) {
  console.error("ERREUR : AIRTABLE_API_KEY est manquante dans les variables d'environnement.");
}

const base = new Airtable({ 
  apiKey: airtableKey 
}).base(baseId);

export const TABLES = {
  CLIENTS: "tblhm2PtG3en6ypxF",
  DOCUMENTS: "tblsZalGrCHyVoP9a",
  LIGNES_FACTURATION: "tblq6y5hnbOuecbgC",
  SERVICES: "tblgdIuRWn9v3MDTY",
  PROJETS: "tbl8ttAlGsdbzs6GM",
  SIMULATIONS: "tblXkS1tzQNg9j2c7",
  BUDGET: "tblw9TLaxLC6ryP4V"
};

export const mapClient = (record: any) => ({
  id: record.id,
  name: record.get("Nom de l'Entreprise") || "Nom Manquant",
  contact: record.get("Contact Clé") || "N/A",
  email: record.get("Email") || "N/A",
  sector: record.get("Secteur") || "Général",
  maturity: record.get("Score de Maturité IA") || 0
});

export default base;