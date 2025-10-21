import "dotenv/config";
// import { drizzle } from "drizzle-orm/libsql";
import { drizzle } from 'drizzle-orm/neon-http';


// const db = drizzle(process.env.DB_FILE_NAME!);

const db = drizzle(process.env.DATABASE_URL!);

export default db;
