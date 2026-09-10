import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

// Detect Vercel or serverless environment where filesystem is read-only
const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT ||
  process.env.NETLIFY
);

let databaseUrl = process.env.DATABASE_URL;

// On Serverless platforms (Vercel), root filesystem (/var/task) is read-only.
// SQLite must reside in /tmp to allow read & write access.
if (isServerless && (!databaseUrl || databaseUrl.startsWith("file:"))) {
  const tmpDbPath = path.join("/tmp", "dev.db");

  try {
    if (!fs.existsSync(tmpDbPath)) {
      const candidatePaths = [
        path.join(process.cwd(), "prisma", "dev.db"),
        path.join(process.cwd(), "dev.db"),
        path.resolve("./prisma/dev.db"),
        path.resolve("./dev.db"),
      ];

      const sourceDb = candidatePaths.find((p) => {
        try {
          return fs.existsSync(p) && fs.statSync(p).size > 0;
        } catch {
          return false;
        }
      });

      if (sourceDb) {
        const tmpDir = path.dirname(tmpDbPath);
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true });
        }
        fs.copyFileSync(sourceDb, tmpDbPath);
        try {
          fs.chmodSync(tmpDbPath, 0o666);
        } catch {
          // Ignore on environments without chmod support
        }
        console.log(`[LifeOS Prisma] Seeded SQLite database copied from ${sourceDb} to ${tmpDbPath}`);
      } else {
        console.warn("[LifeOS Prisma] Seeded dev.db template not found in candidates:", candidatePaths);
      }
    }
  } catch (copyErr) {
    console.error("[LifeOS Prisma] Failed to prepare SQLite in /tmp:", copyErr);
  }

  databaseUrl = `file:${tmpDbPath}`;
  process.env.DATABASE_URL = databaseUrl;
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

