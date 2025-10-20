import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import db from "@/src";
import { users } from "@/src/db/schema";

const SECRET = process.env.SECRET!; // replace with env var

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return Response.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 }
    );
  }

  const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: "1d" });
  return Response.json({ success: true, token });
}
