import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import base, { TABLES, mapClient } from "./src/lib/airtable.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createServer() {
  const app = express();
  app.use(express.json());
  
  console.log("CLÉ API AIRTABLE UTILISÉE:", process.env.AIRTABLE_API_KEY?.substring(0, 7));

  // --- TEST DE CONNEXION AIRTABLE ---
  const testConnexion = async () => {
    try {
      const records = await base(TABLES.CLIENTS).select({ maxRecords: 1 }).firstPage();
      if (records.length > 0) {
        console.log('✅ TEST CONNEXION RÉUSSI !');
        console.log('TEST CONNEXION:', records[0].fields);
      } else {
        console.log('⚠️ TEST CONNEXION: Aucun enregistrement trouvé dans la table Clients.');
      }
    } catch (error: any) {
      console.error('❌ TEST CONNEXION ÉCHOUÉ:', error.message);
    }
  };

  testConnexion();

  // Helper pour nettoyer les objets avant envoi à Airtable
  const cleanFields = (fields: any) => {
    const cleaned: any = {};
    Object.keys(fields).forEach(key => {
      if (fields[key] !== undefined && fields[key] !== null && fields[key] !== "") {
        cleaned[key] = fields[key];
      }
    });
    return cleaned;
  };

  // --- API ROUTES ---

  // Route de test de connexion Airtable (Manuelle)
  app.get("/api/airtable-check", async (req, res) => {
    try {
      const records = await base(TABLES.CLIENTS).select({ maxRecords: 1 }).firstPage();
      if (records.length > 0) {
        res.json({ 
          status: "ok", 
          message: "Connexion Airtable réussie", 
          fields: records[0].fields 
        });
      } else {
        res.json({ status: "warn", message: "Aucun enregistrement trouvé" });
      }
    } catch (error: any) {
      console.error("CRITICAL AIRTABLE ERROR:", error);
      res.status(500).json({ 
        status: "error", 
        message: error.message, 
        code: error.error,
        statusCode: error.statusCode 
      });
    }
  });

  // Route pour récupérer les statistiques globales (ERP Style)
  app.get("/api/stats", async (req, res) => {
    try {
      // Récupération sécurisée des documents
      let documents: any = [];
      try {
        documents = await base(TABLES.DOCUMENTS).select().all();
      } catch (e) {
        console.error("Error fetching documents for stats:", e);
      }
      
      // Récupération sécurisée des simulations
      let simulations: any = [];
      try {
        simulations = await base(TABLES.SIMULATIONS).select().all();
      } catch (e) {
        console.error("Error fetching simulations for stats:", e);
      }
      
      // 1. Total Devis Envoyés
      const totalSentQuotes = Array.isArray(documents) ? documents.filter(doc => {
        const type = doc.get('Type');
        const status = doc.get('Statut');
        return (type === 'Devis' || type === 'Audit') && status === 'Envoyé';
      }).length : 0;

      // 2. Projets en cours
      const activeProjects = Array.isArray(documents) ? documents.filter(doc => {
        const status = doc.get('Statut');
        return status === 'En cours' || status === 'Accepté';
      }).length : 0;

      // 3. Estimation Gains ROI
      const totalROIGains = Array.isArray(simulations) ? simulations.reduce((acc, sim) => {
        const gain = (sim.get('Gain Annuel Total') as number) || 0;
        return acc + gain;
      }, 0) : 0;

      const avgROI = simulations.length > 0 ? totalROIGains / simulations.length : 0;

      // 4. MRR (Monthly Recurring Revenue) - Basé sur les maintenances estimées
      // On simule ici une logique métier : chaque projet actif génère environ 150k de maintenance
      const estimatedMRR = activeProjects * 150000;

      // 5. CLV (Customer Lifetime Value)
      const totalRevenue = Array.isArray(documents) ? documents.reduce((acc, doc) => {
        if (doc.get('Statut') === 'Payé' || doc.get('Statut') === 'Accepté') {
          return acc + ((doc.get('Total HT') as number) || 0);
        }
        return acc;
      }, 0) : 0;
      
      let clients: any = [];
      try {
        clients = await base(TABLES.CLIENTS).select().all();
      } catch (e) {}

      const clv = clients.length > 0 ? totalRevenue / clients.length : 0;

      res.json({
        totalSentQuotes,
        activeProjects,
        totalROIGains,
        avgROI,
        estimatedMRR,
        clv,
        growth: 15.8,
        cac: 45000 // Placeholder CAC
      });
    } catch (error: any) {
      console.error("Stats API Global Error:", error);
      res.json({ totalSentQuotes: 0, activeProjects: 0, totalROIGains: 0, growth: 0 });
    }
  });

  // Route pour les clients
  app.get("/api/clients", async (req, res) => {
    try {
      const records = await base(TABLES.CLIENTS).select().all();
      res.json(Array.isArray(records) ? records.map(r => mapClient(r)) : []);
    } catch (error: any) {
      console.error("Clients API Error:", error);
      res.json([]);
    }
  });

  // Route pour créer un client
  app.post("/api/clients", async (req, res) => {
    try {
      const body = req.body;
      console.log("DEBUG POST CLIENT - BODY:", body);
      
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
      
      console.log("SUCCESS: Client created in Airtable");
      res.json(mapClient(newRecord[0]));
    } catch (error: any) {
      console.error("DETAILED AIRTABLE ERROR (CLIENT):", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Route pour les documents
  app.get("/api/documents", async (req, res) => {
    try {
      const records = await base(TABLES.DOCUMENTS).select().all();
      res.json(Array.isArray(records) ? records.map(r => ({ 
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
      res.json([]);
    }
  });

  // Route pour les simulations
  app.get("/api/simulations", async (req, res) => {
    try {
      const records = await base(TABLES.SIMULATIONS).select().all();
      res.json(Array.isArray(records) ? records.map(r => ({ 
        id: r.id, 
        "Client Potentiel": r.get("Client Potentiel"),
        "Gain Annuel Total": r.get("Gain Annuel Total") || 0,
        "Temps Libéré": r.get("Temps Libéré") || 0
      })) : []);
    } catch (error: any) {
      console.error("Simulations API Error:", error);
      res.json([]);
    }
  });
  // Route pour sauvegarder une simulation ROI
  app.post("/api/simulations", async (req, res) => {
    try {
      const body = req.body;
      console.log("DEBUG POST SIMULATION - BODY:", body);

      const newRecord = await base(TABLES.SIMULATIONS).create([
        {
          fields: {
            "Client Potentiel": body.clientName || body.name || "Simulation",
            "Gain Annuel Total": body.annualGain || body['Gain Annuel Total'] || 0,
            "Temps Libéré": body.timeSaved || body['Temps Libéré'] || 0,
            "Client": body.clientId ? [body.clientId] : undefined
          }
        }
      ]);
      
      console.log("SUCCESS: Simulation created in Airtable");
      res.json(newRecord[0]);
    } catch (error: any) {
      console.error("DETAILED AIRTABLE ERROR (SIMULATION):", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Route pour créer un document (devis/audit)
  app.post("/api/documents", async (req, res) => {
    try {
      const body = req.body;
      console.log("DEBUG POST DOCUMENT - BODY:", body);

      const newRecord = await base(TABLES.DOCUMENTS).create([
        {
          fields: {
            "ID Document": body.nom || body.Nom || `DOC-${Date.now()}`,
            "Type": body.type || "Devis",
            "Statut": body.statut || body.status || "Brouillon",
            "Total HT": body.total || body.Montant || 0,
            "Date d'Émission": body.date || new Date().toISOString().split('T')[0],
            "Client": body.clientId ? [body.clientId] : undefined
          }
        }
      ]);
      
      console.log("SUCCESS: Document created in Airtable");
      const r = newRecord[0];
      res.json({
        id: r.id,
        Nom: r.get("ID Document"),
        Type: r.get("Type"),
        Statut: r.get("Statut"),
        Montant: r.get("Total HT"),
        Date: r.get("Date d'Émission"),
        Description: r.get("Description") || ""
      });
    } catch (error: any) {
      console.error("DETAILED AIRTABLE ERROR (DOCUMENT):", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Route pour les services
  app.get("/api/services", async (req, res) => {
    try {
      const records = await base(TABLES.SERVICES).select().all();
      res.json(Array.isArray(records) ? records.map(r => ({
        id: r.id,
        nom: r.get("Nom du Service"),
        prixInstallation: r.get("Prix Installation") || 0,
        maintenance: r.get("Maintenance Mensuelle") || 0,
        description: r.get("Résumé du Service") || "",
        categorie: r.get("Catégorie de Service") || ""
      })) : []);
    } catch (error: any) {
      console.error("Services API Error:", error);
      res.json([]);
    }
  });

  // Route pour les projets
  app.get("/api/projets", async (req, res) => {
    try {
      const records = await base(TABLES.PROJETS).select().all();
      res.json(Array.isArray(records) ? records.map(r => ({
        id: r.id,
        nom: r.get("Nom du Projet"),
        categorie: r.get("Catégorie") || "Sur Mesure",
        synthese: r.get("Synthèse") || r.get("Description") || "",
        client: r.get("Clients") || [],
        complexite: r.get("Complexité Technique") || 1,
        gainAnnuel: r.get("Gain Annuel Estimé Client") || 0,
        prix: r.get("Prix Final Proposé") || 0
      })) : []);
    } catch (error: any) {
      console.error("Projets API Error:", error);
      res.json([]);
    }
  });

  // Route pour les projets (POST)
  app.post("/api/projets", async (req, res) => {
    try {
      const body = req.body;
      console.log("DEBUG POST PROJET - BODY:", body);
      
      const newRecord = await base(TABLES.PROJETS).create([
        {
          fields: {
            "Nom du Projet": body.name || body.nom,
            "Clients": body.clientId ? [body.clientId] : undefined,
            "Complexité Technique": body.complexity || 1,
            "Gain Annuel Estimé Client": body.annualGain || 0,
            "Prix Final Proposé": body.price || 0
          }
        }
      ]);
      
      console.log("SUCCESS: Projet created in Airtable");
      res.json(newRecord[0]);
    } catch (error: any) {
      console.error("DETAILED AIRTABLE ERROR (PROJET):", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Route Chat avec Douly CFO
  app.post("/api/chat", async (req, res) => {
    const { messages } = req.body;
    let apiKey = process.env.GEMINI_API_KEY;

    // Sécurité : Éviter d'utiliser le placeholder par défaut
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "") {
      // Fallback vers process.env.API_KEY si disponible
      apiKey = process.env.API_KEY;
    }

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "") {
      console.error("ERREUR : GEMINI_API_KEY est manquante ou invalide.");
      return res.status(500).json({ error: "Clé API Gemini non configurée. Veuillez l'ajouter dans les Secrets de l'AI Studio sous le nom GEMINI_API_KEY." });
    }

    try {
      console.log("DEBUG CHAT - Messages reçus:", messages.length);
      const ai = new GoogleGenAI({ apiKey });
      
      // Nettoyage des messages pour Gemini
      // S'assurer que l'historique commence par un message 'user'
      let cleanedMessages = [...messages];
      if (cleanedMessages.length > 0 && cleanedMessages[0].role === 'model') {
        console.log("DEBUG CHAT - Suppression du message de bienvenue du modèle");
        cleanedMessages.shift();
      }

      if (cleanedMessages.length === 0) {
        return res.json({ text: "Bonjour Marc ! Comment puis-je vous aider ?" });
      }
      const getCatalogue = {
        name: "getCatalogue",
        description: "Récupère le catalogue des services DOULIA.",
        parameters: { type: Type.OBJECT, properties: {} }
      };

      const getClients = {
        name: "getClients",
        description: "Récupère la liste des clients de DOULIA.",
        parameters: { type: Type.OBJECT, properties: {} }
      };

      const getDocuments = {
        name: "getDocuments",
        description: "Récupère la liste des documents (devis, factures).",
        parameters: { type: Type.OBJECT, properties: {} }
      };

      const webSearch = {
        name: "webSearch",
        description: "Effectue une recherche sur le web pour obtenir des informations récentes ou externes (fiscalité, actualités, etc.).",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: {
              type: Type.STRING,
              description: "La requête de recherche."
            }
          },
          required: ["query"]
        }
      };

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: cleanedMessages,
        config: {
          systemInstruction: "Tu es Douly CFO, l'assistant financier expert de DOULIA. Ton rôle est d'analyser les données financières de Marc pour l'aider à piloter son entreprise au Cameroun. Tu as accès aux tables Airtable (Clients, ROI, Documents, Facturation) et à une recherche web via Tavily pour des infos externes. RÈGLES DE RÉPONSE : 1. Tu DOIS répondre à TOUTES les questions de l'utilisateur de manière exhaustive. 2. Si une question concerne les données de l'entreprise (clients, devis, catalogue), utilise les outils Airtable. 3. Si une question nécessite des informations externes, récentes ou web (fiscalité, actualités, tendances), utilise l'outil webSearch. 4. Mets les TITRES et MOTS CLÉS en GRAS en utilisant la syntaxe __mot__. 5. INTERDICTION FORMELLE d'utiliser des balises HTML. 6. INTERDICTION d'utiliser les caractères spéciaux suivants : # (dièse), * (astérisque). 7. Sois ultra-professionnel, précis et encourageant. 8. Tes réponses doivent être aérées et faciles à lire.",
          tools: [{ functionDeclarations: [getCatalogue, getClients, getDocuments, webSearch] }]
        }
      });

      // Gestion des appels de fonctions
      if (response.functionCalls && response.functionCalls.length > 0) {
        const call = response.functionCalls[0];
        let toolData: any = null;

        try {
          if (call.name === "getCatalogue") {
            const records = await base(TABLES.SERVICES).select().all();
            toolData = records.map(r => r.fields);
          } else if (call.name === "getClients") {
            const records = await base(TABLES.CLIENTS).select().all();
            toolData = records.map(r => r.fields);
          } else if (call.name === "getDocuments") {
            const records = await base(TABLES.DOCUMENTS).select().all();
            toolData = records.map(r => r.fields);
          } else if (call.name === "webSearch") {
            const query = (call.args as any).query;
            const tavilyKey = process.env.TAVILY_API_KEY;
            if (tavilyKey) {
              const searchResponse = await fetch("https://api.tavily.com/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  api_key: tavilyKey,
                  query: query,
                  search_depth: "advanced",
                  include_answer: true,
                  max_results: 5
                })
              });
              toolData = await searchResponse.json();
            } else {
              toolData = { error: "TAVILY_API_KEY is missing in environment variables." };
            }
          }
        } catch (toolError: any) {
          console.error(`Error executing tool ${call.name}:`, toolError);
          toolData = { error: toolError.message };
        }
        
        // Synthèse par Gemini : Tavily/Airtable -> Gemini -> Utilisateur
        const finalResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            ...cleanedMessages,
            { role: "model", parts: [{ functionCall: call }] },
            { 
              role: "user", 
              parts: [{ 
                functionResponse: { 
                  name: call.name, 
                  response: { result: toolData } 
                } 
              }] 
            }
          ],
          config: {
            systemInstruction: "Tu es Douly CFO. Analyse les données fournies par l'outil et synthétise-les pour Marc. RÈGLES : 1. Réponds de manière complète. 2. Utilise __gras__ pour les titres. 3. Pas de # ou * ou HTML. 4. Ton pro et aéré."
          }
        });
        return res.json({ text: finalResponse.text });
      }

      res.json({ text: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- VITE MIDDLEWARE (DEV ONLY) ---
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    // Local production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return app;
}

// Start server locally
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  createServer().then(app => {
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`DOULIA Finance Hub running on http://localhost:${PORT}`);
    });
  });
}
