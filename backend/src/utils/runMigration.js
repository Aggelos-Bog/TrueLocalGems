import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration(migrationFileName) {
  try {
    const migrationPath = path.join(
      __dirname,
      "../../migrations",
      migrationFileName
    );

    console.log(`Reading migration file: ${migrationPath}`);
    const sql = fs.readFileSync(migrationPath, "utf8");

    console.log(`Executing migration: ${migrationFileName}`);
    const result = await db.query(sql);

    console.log("✅ Migration executed successfully!");
    console.log("Result:", result);

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Get migration file name from command line arguments
const migrationFileName = process.argv[2];

if (!migrationFileName) {
  console.error("Usage: node runMigration.js <migration-file-name>");
  process.exit(1);
}

runMigration(migrationFileName);
