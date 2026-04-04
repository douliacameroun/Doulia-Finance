import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";
import axios from 'axios';
import base, { TABLES } from '../lib/airtable';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
  
  const airtableKey = process.env.AIRTABLE_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  const tavilyKey = process.env.TAVILY_API_KEY;

  if (!airtableKey) {
    return res.status(500).json({ error: "AIRTABLE_API_KEY non configurée." });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { messages } = req.body;

  if (!geminiKey || geminiKey === "MY_GEMINI_API_KEY" || geminiKey === "") {
    console.error("ERREUR : GEMINI_API_KEY est manquante ou invalide.");
    return res.status(500).json({ error: "Clé API Gemini non configurée. Veuillez l'ajouter dans les Secrets de l'AI Studio sous le nom GEMINI_API_KEY." });
  }

  try {
    console.log("DEBUG CHAT - Messages reçus:", messages?.length);
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    
    let cleanedMessages = Array.isArray(messages) ? [...messages] : [];
    if (cleanedMessages.length > 0 && cleanedMessages[0].role === 'model') {
      cleanedMessages.shift();
    }

    if (cleanedMessages.length === 0) {
      return res.status(200).json({ text: "Bonjour Marc ! Comment puis-je vous aider ?" });
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
        systemInstruction: "Tu es Douly CFO, l'assistant financier expert de DOULIA. Ton rôle est d'analyser les données financières de Marc pour l'aider à piloter son entreprise au Cameroun.",
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
          if (tavilyKey) {
            const searchResponse = await axios.post("https://api.tavily.com/search", {
              api_key: tavilyKey,
              query: query,
              search_depth: "advanced",
              include_answer: true,
              max_results: 5
            });
            toolData = searchResponse.data;
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
          systemInstruction: "Tu es Douly CFO. Analyse les données fournies par l'outil et synthétise-les pour Marc."
        }
      });
      return res.status(200).json({ text: finalResponse.text });
    }

    return res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}