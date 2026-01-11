import "dotenv/config";
import Database from "better-sqlite3"; 
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";

// 1. Nettoyage du chemin
const connectionString = process.env.DATABASE_URL.replace('file:', '');

// 2. Initialisation du driver SQLite
const sqlite = new Database(connectionString);

// 3. Initialisation de l'adaptateur
// Si PrismaBetterSQLite3 est une classe, on l'instancie
const adapter = new PrismaBetterSQLite3(sqlite);

// 4. Initialisation du client Prisma
const prisma = new PrismaClient({ adapter });

export default prisma;