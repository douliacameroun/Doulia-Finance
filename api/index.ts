import { createServer } from '../server.ts';

export default async function handler(req: any, res: any) {
  const app = await createServer();
  return app(req, res);
}
