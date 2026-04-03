import Airtable from 'airtable';

const base = new Airtable({ 
  apiKey: process.env.AIRTABLE_API_KEY 
}).base('appw5t8naTirx4fE0');

export const TABLES = {
  CLIENTS: "tblhm2PtG3en6ypxF",
  DOCUMENTS: "tblsZalGrCHyVoP9a",
  LIGNES_FACTURATION: "tblq6y5hnbOuecbgC",
  SERVICES: "tblgdIuRWn9v3MDTY",
  PROJETS: "tbl8ttAlGsdbzs6GM",
  SIMULATIONS: "tblXkS1tzQNg9j2c7"
};

// CETTE FONCTION EST LA CLÉ : Elle traduit Airtable vers ton site
export const mapClient = (record: any) => ({
  id: record.id,
  name: record.get("Nom de l'Entreprise") || "Nom Manquant",
  contact: record.get("Contact Clé") || "N/A",
  email: record.get("Email") || "N/A",
  sector: record.get("Secteur") || "Général",
  maturity: record.get("Score de Maturité IA") || 0
});

export default base;