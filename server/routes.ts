import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import testRoutes from "./routes/testRoutes";
import simpleTestRoutes from "./simple-test-api";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Test system routes (using simple in-memory version for now)
  app.use("/api/tests", simpleTestRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
