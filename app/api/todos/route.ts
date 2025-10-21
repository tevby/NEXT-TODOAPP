// import db from "@/src";
// import { todos } from "@/src/db/schema";
// import { eq } from "drizzle-orm";
// import jwt from "jsonwebtoken";

// const SECRET = process.env.SECRET!; // replace with env var

// function verify(req: Request) {
//   console.log("1a");
//   const auth = req.headers.get("authorization");
//   console.log("1b");
//   if (!auth) throw new Error("Unauthorized");
//   console.log("1c");
//   console.log(`1d => ${auth}`);
//   const token = auth.split(" ")[1];
//   console.log(`1d => ${token}`);
//   return jwt.verify(token, SECRET) as { userId: number };
// }

// export async function GET(req: Request) {
//   try {
//     console.log("1");
//     const { userId } = verify(req);
//     console.log(`2 => ${userId}`);
//     const list = await db
//       .select()
//       .from(todos)
//       .where(eq(todos.userId, userId))
//       .all();
//     console.log(list);
//     return Response.json(list);
//   } catch {
//     return Response.json({ error: "Unauthorized" }, { status: 401 });
//   }
// }

// export async function POST(req: Request) {
//   try {
//     const { userId } = verify(req);
//     const body = await req.json();
//     const newTodo = { userId, title: body.title, completed: false };
//     await db.insert(todos).values(newTodo).run();
//     return Response.json(newTodo);
//   } catch {
//     return Response.json({ error: "Unauthorized" }, { status: 401 });
//   }
// }

// export async function PUT(req: Request) {
//   const { userId } = verify(req);
//   const body = await req.json();
//   await db
//     .update(todos)
//     .set({ title: body.title, completed: body.completed })
//     .where(eq(todos.id, body.id))
//     .run();
//   return Response.json({ success: true });
// }

// export async function DELETE(req: Request) {
//   const { userId } = verify(req);
//   const { id } = await req.json();
//   await db.delete(todos).where(eq(todos.id, id)).run();
//   return Response.json({ success: true });
// }
import jwt from "jsonwebtoken";
import { todos, nextTodoId } from "@/app/api/_store";

const SECRET = process.env.SECRET ?? "dev-secret-change-me";

function verify(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth) throw new Error("Unauthorized");
  const token = auth.split(" ")[1];
  const payload = jwt.verify(token, SECRET) as { userId: number };
  return payload;
}

export async function GET(req: Request) {
  try {
    const { userId } = verify(req);
    const list = todos.filter(t => t.userId === userId);
    return Response.json(list);
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = verify(req);
    const body = await req.json();
    const newTodo = {
      id: nextTodoId(),
      userId,
      title: String(body.title ?? "").trim(),
      completed: false,
    };
    todos.push(newTodo);
    return Response.json(newTodo);
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(req: Request) {
  try {
    verify(req); // we don't actually need the userId here for global edit
    const body = await req.json() as { id: number; title?: string; completed?: boolean };
    const idx = todos.findIndex(t => t.id === body.id);
    if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });

    todos[idx] = {
      ...todos[idx],
      title: body.title ?? todos[idx].title,
      completed: typeof body.completed === "boolean" ? body.completed : todos[idx].completed,
    };
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(req: Request) {
  try {
    verify(req);
    const { id } = await req.json() as { id: number };
    const idx = todos.findIndex(t => t.id === id);
    if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
    todos.splice(idx, 1);
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}
