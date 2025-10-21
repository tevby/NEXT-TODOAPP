// import db from "@/src";
// import { todos } from "@/src/db/schema";
// import { eq } from "drizzle-orm";
// import jwt from "jsonwebtoken";

// const SECRET = process.env.SECRET!;

// export async function GET(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const auth = req.headers.get("authorization");
//     if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

//     const token = auth.split(" ")[1];
//     const decoded = jwt.verify(token, SECRET) as { userId: number };

//     const todo = await db
//       .select()
//       .from(todos)
//       .where(eq(todos.id, Number(params.id)))
//       .get();

//     if (!todo || todo.userId !== decoded.userId)
//       return Response.json({ error: "Not found" }, { status: 404 });

//     return Response.json(todo);
//   } catch {
//     return Response.json({ error: "Unauthorized" }, { status: 401 });
//   }
// }
import jwt from "jsonwebtoken";
import { todos } from "@/app/api/_store"; // <-- our in-memory store
import { NextRequest } from "next/server";

const SECRET = process.env.SECRET ?? "dev-secret-change-me";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
)  {
  try {
    // Auth header: "Bearer <token>"
    const auth = req.headers.get("authorization");
    if (!auth) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, SECRET) as { userId: number };

    const { id } = await context.params;
    if (Number.isNaN(id)) {
      return Response.json({ error: "Bad id" }, { status: 400 });
    }

    const todo = todos.find(t => t.id === Number(id));
    if (!todo || todo.userId !== decoded.userId) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json(todo);
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}
