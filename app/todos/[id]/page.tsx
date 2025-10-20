"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Todo {
    id: number;
    title: string;
    completed: boolean;
    userId: number;
}

export default function TodoDetailsPage() {
    const [todo, setTodo] = useState<Todo | null>(null);
    const router = useRouter();
    const params = useParams();


    useEffect(() => {
        const token = localStorage.getItem("token");
        async function loadTodo() {
            const res = await fetch(`/api/todos/${params.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setTodo(await res.json());
            else router.push("/login");
        }
        loadTodo();
    }, [params.id]);

    if (!todo) return <p className="text-center mt-20">Loading...</p>;

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">{todo.title}</div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-start space-x-4">
                    <input
                        type="checkbox"
                        checked={todo.completed}
                        readOnly
                        className="mt-1 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div className="flex-1">
                        <h1
                            className={`text-xl font-semibold ${todo.completed ? "text-gray-500 line-through" : "text-gray-900"
                                }`}
                        >
                            {todo.title}
                        </h1>

                        <div className="mt-2">
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${todo.completed
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                    }`}
                            >
                                {todo.completed ? "Completed" : "Pending"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <button
                onClick={() => router.back()}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none hover:*: focus:text-gray-800 transition-colors duration-200"
            >
                <p>Previous</p>
            </button>
        </div>
    );


}
