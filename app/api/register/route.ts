import db from "@/src";
import { users } from "@/src/db/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();
  if (existing) {
    return Response.json(
      { success: false, message: "User already exists" },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);
  db.insert(users).values({ email, password: hashed }).run();

  return Response.json({ success: true });
}
