// import db from "@/src";
// import { users } from "@/src/db/schema";
// import bcrypt from "bcrypt";
// import { eq } from "drizzle-orm";

// export async function POST(req: Request) {
//   const { email, password } = await req.json();

//   const existing = await db
//     .select()
//     .from(users)
//     .where(eq(users.email, email))
//     .get();
//   if (existing) {
//     return Response.json(
//       { success: false, message: "User already exists" },
//       { status: 400 }
//     );
//   }

//   const hashed = await bcrypt.hash(password, 10);
//   db.insert(users).values({ email, password: hashed }).run();

//   return Response.json({ success: true });
// }
// import bcrypt from "bcrypt"; // or "bcrypt"
// import { users, findUserByEmail, nextUserId } from "@/app/api/_store";

// export async function POST(req: Request) {
//   const { email, password } = await req.json();

//   if (!email || !password) {
//     return Response.json({ success: false, message: "Email & password required" }, { status: 400 });
//   }

//   const existing = findUserByEmail(email);
//   if (existing) {
//     return Response.json({ success: false, message: "User already exists" }, { status: 400 });
//   }

//   const hashed = await bcrypt.hash(password, 10);
//   const newUser = { id: nextUserId(), email, password: hashed };
//   users.push(newUser);

//   return Response.json({ success: true });
// }
import bcrypt from "bcrypt";
import { users, findUserByEmail, nextUserId } from "@/app/api/_store";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow all origins, or specify 'http://localhost:5173'
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request (CORS preflight)
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json(
        { success: false, message: "Email & password required" },
        { 
          status: 400,
          headers: corsHeaders 
        }
      );
    }

    const existing = findUserByEmail(email);
    if (existing) {
      return Response.json(
        { success: false, message: "User already exists" },
        { 
          status: 400,
          headers: corsHeaders 
        }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = { id: nextUserId(), email, password: hashed };
    users.push(newUser);

    return Response.json(
      { success: true },
      { headers: corsHeaders }
    );
  } catch (error) {
    return Response.json(
      { success: false, message: "Server error" },
      { 
        status: 500,
        headers: corsHeaders 
      }
    );
  }
}