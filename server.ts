import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

// API Handlers
import clientsHandler from "./api/clients";
import documentsHandler from "./api/documents";
import servicesHandler from "./api/services";
import projetsHandler from "./api/projets";
import simulationsHandler from "./api/simulations";
import statsHandler from "./api/stats";
import chatHandler from "./api/chat";
import budgetHandler from "./api/budget";
import airtableCheckHandler from "./api/airtable-check";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createServer() {
  const app = express();
  app.use(express.json());

  // Mount API routes
  app.all("/api/clients", clientsHandler as any);
  app.all("/api/documents", documentsHandler as any);
  app.all("/api/services", servicesHandler as any);
  app.all("/api/projets", projetsHandler as any);
  app.all("/api/simulations", simulationsHandler as any);
  app.all("/api/stats", statsHandler as any);
  app.all("/api/chat", chatHandler as any);
  app.all("/api/budget", budgetHandler as any);
  app.all("/api/airtable-check", airtableCheckHandler as any);

  // VITE MIDDLEWARE (DEV ONLY)
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);

  return app;
}

if (process.env.NODE_ENV !== "production") {
  createServer().then(app => {
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`DOULIA Finance Hub running on http://localhost:${PORT}`);
    });
  });
}

export { createServer };
