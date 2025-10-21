// import "dotenv/config";
import { neon } from '@neondatabase/serverless';
// import { drizzle } from "drizzle-orm/libsql";
import { drizzle } from 'drizzle-orm/neon-http';


// const db = drizzle(process.env.DB_FILE_NAME!);

// const db = drizzle(process.env.DATABASE_URL!);

// export default db;
const sql = neon(process.env.DATABASE_URL!); // Neon connection string
export const db = drizzle(sql);