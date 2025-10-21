// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import { eq } from "drizzle-orm";
// import db from "@/src";
// import { users } from "@/src/db/schema";

// const SECRET = process.env.SECRET!; // replace with env var

// export async function POST(req: Request) {
//   const { email, password } = await req.json();

//   const user = await db
//     .select()
//     .from(users)
//     .where(eq(users.email, email))
//     .get();
//   if (!user || !(await bcrypt.compare(password, user.password))) {
//     return Response.json(
//       { success: false, message: "Invalid credentials" },
//       { status: 401 }
//     );
//   }

//   const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: "1d" });
//   return Response.json({ success: true, token });
// }
// import bcrypt from "bcrypt"; // or "bcrypt"
// import jwt from "jsonwebtoken";
// import { findUserByEmail } from "@/app/api/_store";


// const SECRET = process.env.SECRET ?? "dev-secret-change-me";

// export async function POST(req: Request) {
//   const { email, password } = await req.json();

//   const user = findUserByEmail(email);
//   if (!user || !(await bcrypt.compare(password, user.password))) {
//     return Response.json({ success: false, message: "Invalid credentials" }, { status: 401 });
//   }

//   const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: "1d" });
//   return Response.json({ success: true, token });
// }
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByEmail } from "@/app/api/_store";

const SECRET = process.env.SECRET ?? "dev-secret-change-me";

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

    const user = findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return Response.json(
        { success: false, message: "Invalid credentials" },
        { 
          status: 401,
          headers: corsHeaders 
        }
      );
    }

    const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: "1d" });
    return Response.json(
      { success: true, token },
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