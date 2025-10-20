"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        console.log(token);
        if (token) {
            router.replace("/todos");
        }
    }, [router]);

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
            <h1 className="text-4xl font-bold mb-4">Welcome to TodoApp ✅</h1>
            <p className="text-gray-600 mb-8">
                Organize your tasks efficiently — simple, secure, and local.
            </p>

            <div className="flex gap-4">
                <button
                    onClick={() => router.push("/login")}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Login
                </button>
                <button
                    onClick={() => router.push("/register")}
                    className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                >
                    Register
                </button>
            </div>
        </main>
    );
}


//jacob3@gmail.com
//Jacob3@1
