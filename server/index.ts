import { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import { pool } from "./db.js";

let express: typeof import("express");
let app: import("express").Express;

(async () => {
  try {
    console.log("🧠 Initializing Express…");
    const expressModule = await import("express");
    const expressFn = (expressModule as any).default || expressModule;
    express = expressFn;
    app = expressFn();

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    console.log("🔌 Middleware mounted");

    // 🛠️ API logging
    app.use((req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      const path = req.path;
      let capturedJsonResponse: Record<string, any> | undefined;

      const originalJson: (...args: any[]) => Response = res.json;
      res.json = function (body: any, ...args: any[]) {
        capturedJsonResponse = body;
        return originalJson.apply(this, [body, ...args]);
      };

      res.on("finish", () => {
        if (path.startsWith("/api") || path === "/ping-db") {
          const duration = Date.now() - start;
          let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
          if (capturedJsonResponse) {
            logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
          }
          if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
          log(logLine);
        }
      });

      next();
    });

    // 🧪 Ping route
    app.get("/ping-db", async (req: Request, res: Response) => {
      try {
        const result = await pool.query("SELECT NOW()");
        res.json({ time: result.rows[0].now });
      } catch (err) {
        console.error("❌ Database connection failed:", err);
        res.status(500).send("Database connection failed");
      }
    });

    console.log("📦 Registering routes…");

    await registerRoutes(app);
    console.log("✅ Routes registered");

    // 🧯 Error handler
    app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
      const status = (err as any).status || 500;
      const message = (err as any).message || "Internal Server Error";
      res.status(status).json({ message });
      console.error("❌ Server error:", err);
    });

    const port = parseInt(process.env.PORT || "5000", 10);
    const host = process.env.HOST || "0.0.0.0"; // ✅ Ensures Railway traffic works

    const server = app.listen(port, host, () => {
      log(`✅ Server is live at http://${host}:${port}`);
      console.log(`🚀 Listening on ${host}:${port}`);
    });

    if (app.get("env") === "development") {
      console.log("🛠️ Development mode detected — running Vite setup");
      await setupVite(app, server);
      console.log("⚙️ Vite setup complete");
    } else {
      console.log("🚀 Production mode detected — mounting static routes");

      const distPath = path.resolve(__dirname, "../dist");
      const assetsPath = path.resolve(__dirname, "../dist/public/assets");

      app.use("/assets", express.static(assetsPath));
      console.log("🗂️ Assets route mounted");

      app.use(express.static(distPath));
      console.log("🧱 Serving static frontend from:", distPath);

      app.get("*", (_req: Request, res: Response) => {
        console.log("🔁 Wildcard route triggered — serving index.html");
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

  } catch (error) {
    console.error("🔥 Fatal error during boot:", error);
    process.exit(1);
  }
})();
