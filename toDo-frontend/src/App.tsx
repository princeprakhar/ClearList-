import { useEffect, useState } from "react";
import Footer from "./components/Footer";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    const response = await fetch("http://127.0.0.1:8080/todos");
    const data = await response.json();
    setTodos(data);
  }

  async function createTodo() {
    const response = await fetch("http://127.0.0.1:8080/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "", title: newTodoTitle, completed: false }),
    });

    const newTodo = await response.json();
    if (newTodo.title === "") {
      alert("Please enter a task");
      return;
    }
    setTodos([...todos, newTodo]);
    setNewTodoTitle("");
  }

  async function updateTodo(updatedTodo: Todo) {
    const response = await fetch("http://127.0.0.1:8080/todos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTodo),
    });
    const newTodo = await response.json();
    setTodos(todos.map((todo) => (todo.id === newTodo.id ? newTodo : todo)));
    setEditingTodo(null);
  }

  async function deleteTodo(id: string) {
    await fetch(`http://127.0.0.1:8080/todos/${id}`, {
      method: "DELETE",
    });
    setTodos(todos.filter((todo) => todo.id !== id));
  }

  return (
    <>
      <div className="flex flex-col min-h-screen p-4">
        <div className="flex justify-center p-4">
          <div className="text-3xl font-bold p-4 text-center rounded-2xl shadow-lg shadow-slate-400">
            ClearList
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-center items-center shadow-xl  shadow-slate-400 rounded-3xl mt-4 mx-2 sm:mx-4 md:mx-10">
          <div className="flex flex-col items-center w-full md:w-1/2 p-4">
            <input
              type="text"
              className="p-4 mb-4 w-full border-2 rounded-2xl"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              placeholder="Type your task..."
            />
            <button
              className="bg-blue-600 w-full md:w-20  text-white p-2 rounded-2xl"
              onClick={createTodo}
            >
              Add
            </button>
          </div>
          <div className="flex flex-col items-center w-full md:w-1/2 p-4 ">
            <ul className="w-full box-border shadow-sm shadow-slate-700 rounded-xl ">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="mb-2 w-full px-3 pt-1 flex flex-col"
                >
                  {editingTodo && editingTodo.id === todo.id ? (
                    <div className="flex flex-col md:flex-row items-center w-full">
                      <input
                        type="text"
                        className="border p-2 mb-2 md:mb-0 w-full md:flex-grow box-border shadow-sm shadow-slate-400"
                        value={editingTodo.title}
                        onChange={(e) =>
                          setEditingTodo(
                            editingTodo
                              ? { ...editingTodo, title: e.target.value }
                              : null
                          )
                        }
                      />
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded mb-2 md:mb-0 md:ml-2 w-full md:w-auto"
                        onClick={() => updateTodo(editingTodo)}
                      >
                        Save
                      </button>
                      <button
                        className="bg-gray-500 text-white px-4 py-2 rounded w-full md:w-auto"
                        onClick={() => setEditingTodo(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-start w-full box-border shadow-md rounded-lg p-4">
                      <div
                        className={`flex-grow ${
                          todo.completed ? "line-through" : ""
                        }  text-sm sm:text-base md:text-lg break-words overflow-hidden`}
                      >
                        {todo.title}
                      </div>
                      <div className="flex mt-2 sm:mt-0 sm:ml-2 space-x-2">
                        <button
                          className="bg-yellow-500 text-white px-3 py-1 rounded sm:px-4 sm:py-2"
                          onClick={() => setEditingTodo(todo)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-3 py-1 rounded sm:px-4 sm:py-2"
                          onClick={() => deleteTodo(todo.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
