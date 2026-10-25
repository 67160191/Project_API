require("dotenv").config();
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function runMigrations() {
  console.log("=================================================");
  console.log("🚀 Starting Database Migrations (Week 14 Script)");
  console.log("=================================================");
  console.log(`📡 Connecting to MySQL server at ${process.env.DB_HOST || "localhost"}...`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "12345",
      multipleStatements: true,
      charset: "utf8mb4",
    });

    console.log("✅ Successfully connected to MySQL server.");

    const migrationsDir = path.join(__dirname, "..", "migrations");
    if (!fs.existsSync(migrationsDir)) {
      console.error("❌ Migrations directory not found.");
      process.exit(1);
    }

    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    console.log(`📦 Found ${migrationFiles.length} migration file(s):`, migrationFiles);

    for (const file of migrationFiles) {
      console.log(`\n⏳ Running migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf-8");

      await connection.query(sql);
      console.log(`✅ Applied migration: ${file}`);
    }

    console.log("\n🎉 All database migrations applied successfully!\n");
  } catch (err) {
    console.error("\n❌ Migration failed:");
    if (err.code === "ECONNREFUSED") {
      console.error(
        "   [Connection Refused] Could not connect to MySQL at " +
          (process.env.DB_HOST || "localhost") +
          ". Please ensure MySQL is running (e.g. XAMPP/Docker/MySQL Service)."
      );
    } else {
      console.error("   Error details:", err.message);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigrations();
