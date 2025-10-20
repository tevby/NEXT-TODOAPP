import db from "@/src";
import { todos } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

const SECRET = process.env.SECRET!; // replace with env var

function verify(req: Request) {
  console.log("1a");
  const auth = req.headers.get("authorization");
  console.log("1b");
  if (!auth) throw new Error("Unauthorized");
  console.log("1c");
  console.log(`1d => ${auth}`);
  const token = auth.split(" ")[1];
  console.log(`1d => ${token}`);
  return jwt.verify(token, SECRET) as { userId: number };
}

export async function GET(req: Request) {
  try {
    console.log("1");
    const { userId } = verify(req);
    console.log(`2 => ${userId}`);
    const list = await db
      .select()
      .from(todos)
      .where(eq(todos.userId, userId))
      .all();
    console.log(list);
    return Response.json(list);
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = verify(req);
    const body = await req.json();
    const newTodo = { userId, title: body.title, completed: false };
    await db.insert(todos).values(newTodo).run();
    return Response.json(newTodo);
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(req: Request) {
  const { userId } = verify(req);
  const body = await req.json();
  await db
    .update(todos)
    .set({ title: body.title, completed: body.completed })
    .where(eq(todos.id, body.id))
    .run();
  return Response.json({ success: true });
}

export async function DELETE(req: Request) {
  const { userId } = verify(req);
  const { id } = await req.json();
  await db.delete(todos).where(eq(todos.id, id)).run();
  return Response.json({ success: true });
}
