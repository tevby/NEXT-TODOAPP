// Simple in-memory store. Data is lost on restart / redeploy.
// Note: On Vercel, memory can reset between invocations.

export type User = {
  id: number;
  email: string;
  password: string; // hashed
};

export type Todo = {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
};

const globalAny = globalThis as unknown as {
  __users?: User[];
  __todos?: Todo[];
  __uid?: number;
  __tid?: number;
};

export const users: User[] = globalAny.__users ?? (globalAny.__users = []);
export const todos: Todo[] = globalAny.__todos ?? (globalAny.__todos = []);
let uid = globalAny.__uid ?? 1;
let tid = globalAny.__tid ?? 1;

// Helpers
export function nextUserId() {
  globalAny.__uid = (uid = uid + 1);
  return uid - 1;
}
export function nextTodoId() {
  globalAny.__tid = (tid = tid + 1);
  return tid - 1;
}

export function findUserByEmail(email: string) {
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}
export function findUserById(id: number) {
  return users.find(u => u.id === id);
}
