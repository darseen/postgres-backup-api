import express, { type Request, type Response } from "express";
import { spawn } from "node:child_process";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is missing.");
  process.exit(1);
}

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (req: Request, res: Response) => {
  const secretToken = process.env.SECRET_TOKEN;

  if (secretToken) {
    const providedToken =
      req.query.token ||
      (req.headers.authorization || "").replace("Bearer ", "");

    if (providedToken !== secretToken) {
      console.warn(`Unauthorized access attempt from ${req.ip}`);
      return res.status(401).json({
        error: { message: "Unauthorized" },
      });
    }
  } else {
    console.warn(
      `Warning: SECRET_TOKEN is not set. Proceeding without authentication for ${req.ip}`,
    );
  }

  console.log("Starting pg_dump...");

  const proc = spawn("pg_dump", [
    "-d",
    process.env.DATABASE_URL!,
    "--no-password",
    "-Fc",
  ]);

  const date = new Date().toLocaleDateString().replaceAll("/", "-");
  const filename = `dump-${date}.backup`;
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  proc.stdout.pipe(res);

  proc.stderr.on("data", (data) => {
    console.error(`[pg_dump message]: ${data.toString().trim()}`);
  });

  proc.on("close", (code) => {
    if (code !== 0) {
      console.error(`pg_dump failed with exit code ${code}`);
      if (!res.headersSent) {
        res
          .status(500)
          .json({ error: { message: "Database backup process failed." } });
      }
    } else {
      console.log(`Backup completed successfully.`);
    }
  });

  req.on("close", () => {
    if (!proc.killed && proc.exitCode === null) {
      console.log("Client disconnected early. Terminating pg_dump...");
      proc.kill();
    }
  });
});

app.listen(Number(PORT), "::", () => {
  console.log(`Postgres Backup Service running on port ${PORT}`);
  console.log(`Endpoint: GET /`);
  if (!process.env.SECRET_TOKEN) {
    console.warn(
      `SECURITY WARNING: No SECRET_TOKEN provided. Your database is publicly downloadable.`,
    );
  } else {
    console.log(
      `Security enabled. Token required via an authorization header or ?token=<token> query parameter.`,
    );
  }
});
