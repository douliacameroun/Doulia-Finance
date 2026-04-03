import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";
import base, { TABLES } from '../lib/airtable';

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { messages } = req.body;
  let apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "") {
    apiKey = process.env.API_KEY;
  }

  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "") {
    console.error("ERREUR : GEMINI_API_KEY est manquante ou invalide.");
    return res.status(500).json({ error: "Clé API Gemini non configurée. Veuillez l'ajouter dans les Secrets de l'AI Studio sous le nom GEMINI_API_KEY." });
  }

  try {
    console.log("DEBUG CHAT - Messages reçus:", messages?.length);
    const ai = new GoogleGenAI({ apiKey });
    
    let cleanedMessages = Array.isArray(messages) ? [...messages] : [];
    if (cleanedMessages.length > 0 && cleanedMessages[0].role === 'model') {
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
};
