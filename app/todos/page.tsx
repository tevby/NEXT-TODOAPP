"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface Todo {
    id: number;
    title: string;
    completed: boolean;
}

export default function TodosPage() {
    const [todoList, setTodoList] = useState<Todo[]>([]);
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending">("all");

    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState("");

    const editTodo = async (todoId: number) => {
        if (editingId === todoId) {

            await fetch("/api/todos", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title: editTitle }),
            });
            setTodoList((prev) =>
                prev.map((todo) =>
                    todo.id === todoId ? { ...todo, title: editTitle } : todo
                )
            );
            setEditingId(null);
            setEditTitle("");
            // await fetchTodos()
        } else {
            const todoToEdit = todoList.find((todo) => todo.id === todoId);
            if (todoToEdit) {
                setEditTitle(todoToEdit.title);
                setEditingId(todoId);
            }
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditTitle("");
    };



    async function fetchTodos() {
        console.log(`a==> ${token}`)
        const res = await fetch("/api/todos", {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log(res);
        setTodoList(await res.json());
    }

    async function addTodo() {
        await fetch("/api/todos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title }),
        });
        setTitle("");
        fetchTodos();
    }

    async function toggleTodo(id: number, completed: boolean) {
        await fetch("/api/todos", {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ id, completed }),
        });
        fetchTodos();
    }

    async function deleteTodo(id: number) {
        await fetch("/api/todos", {
            method: "DELETE",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ id }),
        });
        fetchTodos();
    }

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) return;

        setToken(storedToken);

        fetch("/api/todos", {
            headers: {
                Authorization: `Bearer ${storedToken}`,
            },
        })
            .then((res) => res.json())
            .then(setTodoList);
    }, []);


    const filtered = (todoList ?? []).filter((t) =>
        statusFilter === "all" ? true : statusFilter === "completed" ? t.completed : !t.completed
    );

    const filteredTodos = useMemo(() => {
        return todoList.filter((todo) => {
            const matchesSearch = todo.title
                .toLowerCase()
                .includes(search.toLowerCase());
            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "completed" && todo.completed) ||
                (statusFilter === "pending" && !todo.completed);

            return matchesSearch && matchesStatus;
        });
    }, [todoList, search, statusFilter]);

    async function logout() {
        localStorage.removeItem("token")
        router.push(`/login`);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);


        try {
            await fetch("/api/todos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title }),
            });
            setTitle("");
            fetchTodos();
        } catch (error) {
            console.error("Error creating ", error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">TodoApp</h1>
                </header>
                <section
                    className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200"
                    aria-labelledby="create-todo-heading"
                >
                    <h2
                        id="create-todo-heading"
                        className="text-xl font-semibold text-gray-800 mb-4"
                    >
                        Create a New TODO
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label
                                htmlFor="todo-title"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                TODO Title
                            </label>
                            <input
                                id="todo-title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter TODO title"
                                required
                                aria-describedby="todo-title-help"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 placeholder-gray-400"
                            />
                            <p id="todo-title-help" className="mt-1 text-sm text-gray-500">
                                Enter a descriptive title for your TODO item
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            aria-describedby={loading ? "submit-status" : undefined}
                            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {loading ? "Submitting..." : "Create"}
                        </button>
                        {loading && (
                            <div
                                id="submit-status"
                                className="text-sm text-blue-600"
                                role="status"
                                aria-live="polite"
                            >
                                Creating your TODO item...
                            </div>
                        )}
                    </form>
                </section>
                <section className="mb-6" aria-labelledby="search-heading">
                    <h3 id="search-heading" className="sr-only">
                        Search TODOs
                    </h3>
                    <div className="relative" style={{ marginBottom: "1rem" }}>
                        <label
                            htmlFor="todo-search"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Search TODOs
                        </label>
                        <input
                            type="text"
                            placeholder="Search by title..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                // setPage(1);
                            }}
                            aria-describedby="search-help"
                            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 placeholder-gray-400"
                        />
                        <p id="search-help" className="mt-1 text-sm text-gray-500">
                            Filter your TODO items by typing in the title
                        </p>
                        <div className="w-full sm:w-48">
                            <label
                                htmlFor="status-filter"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(
                                        e.target.value as "all" | "completed" | "pending"
                                    );
                                    //   setPage(1);
                                }}
                                className="w-full appearance-none px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 cursor-pointer hover:border-gray-400"
                            // style={{ marginLeft: "1rem" }}
                            >
                                <option value="all">All</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Incomplete</option>
                            </select>
                        </div>
                    </div>
                </section>
                <section className="mt-8" aria-labelledby="todo-list-heading">
                    <h3
                        id="todo-list-heading"
                        className="text-lg font-semibold text-gray-800 mb-4"
                    >
                        TODO Items
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        <ul className="divide-y divide-gray-200" role="list">
                            {filteredTodos.map((todo) => (
                                <li
                                    key={todo.id}
                                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <div className="flex-shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={todo.completed}
                                            onChange={() => toggleTodo(todo.id, !todo.completed)}
                                            aria-describedby={`todo-${todo.id}-label`}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                        />
                                        <label htmlFor={`todo-${todo.id}`} className="sr-only">
                                            {todo.completed
                                                ? "Mark as incomplete"
                                                : "Mark as complete"}
                                        </label>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {editingId === todo.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            editTodo(todo.id);
                                                        }
                                                        if (e.key === "Escape") {
                                                            cancelEdit();
                                                        }
                                                    }}
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={cancelEdit}
                                                    className="text-gray-500 hover:text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-100"
                                                    type="button"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <a
                                                    href={`/todos/${todo.id.toString()}`}

                                                    id={`todo-${todo.id}-label`}
                                                    className={`block text-sm font-medium hover:text-blue-600 focus:outline-none focus:text-blue-600 transition-colors duration-200 ${todo.completed
                                                        ? "line-through text-gray-500"
                                                        : "text-gray-900"
                                                        }`}
                                                    aria-describedby={
                                                        todo.completed
                                                            ? `todo-${todo.id}-status`
                                                            : undefined
                                                    }
                                                >
                                                    {todo.title}
                                                </a>
                                                {todo.completed && (
                                                    <span
                                                        id={`todo-${todo.id}-status`}
                                                        className="sr-only"
                                                    >
                                                        Completed
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            // style={{ marginLeft: "22px" }}
                                            onClick={() => editTodo(todo.id)}
                                            aria-label={`Edit ${todo.title}`}
                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-200"
                                        >
                                            {" "}
                                            <svg
                                                className="w-3 h-3 mr-1"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                            </svg>
                                            {/* Edit */}
                                            {editingId === todo.id ? "Save" : "Edit"}
                                        </button>
                                    </div>
                                    <button
                                        // style={{ marginLeft: "22px" }}
                                        onClick={() => {
                                            deleteTodo(todo.id);
                                        }}
                                        aria-label={`Delete ${todo.title}`}
                                        className="p-1.5 text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600 transition-colors duration-200"
                                    >
                                        {" "}
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
                {/* <div
                    className="flex items-center justify-between mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200"
                    aria-label="TODO pagination"
                >
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">
                            Page <span className="font-medium">{page}</span> of{" "}
                            <span className="font-medium">
                                {Math.ceil(todos.length / itemsPerPage) || 1}
                            </span>
                        </span>
                        <span className="text-sm text-gray-500">
                            ({todos.length} total items)
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                            aria-label="Go to previous page"
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() =>
                                setPage((prev) =>
                                    prev < Math.ceil(todos.length / itemsPerPage)
                                        ? prev + 1
                                        : prev
                                )
                            }
                            disabled={page >= Math.ceil(todos.length / itemsPerPage)}
                            aria-label="Go to next page"
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200"
                        >
                            Next
                        </button>
                    </div>
                </div> */}
            </div>
        </>
    );

}
