import { useEffect, useState } from "react";
import Footer from "./components/Footer";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  category: string;
}

interface User {
  username: string;
  token: string;
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("work");
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'welcome' | 'login' | 'register' | 'app'>('welcome');
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setCurrentView('app');
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user]);

  async function fetchTodos() {
    if (!user) return;
    
    try {
      const response = await fetch("clear-list-fsvt-5chet85dn-prakhar-deeps-projects.vercel.app/todos", {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch todos');
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setError('Failed to fetch todos');
    }
  }

  async function handleAuth(isRegister: boolean) {
    try {
      const response = await fetch(`clear-list-fsvt-5chet85dn-prakhar-deeps-projects.vercel.app/${isRegister ? 'register' : 'login'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (isRegister) {
        setCurrentView('login');
        setError('Registration successful! Please log in.');
      } else {
        const userData = { username, token: data.token };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setCurrentView('app');
        setError('');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication failed');
    }

    setUsername('');
    setPassword('');
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem('user');
    setTodos([]);
    setCurrentView('welcome');
  }

  async function createTodo() {
    if (!user) return;
    if (newTodoTitle.trim() === "") {
      setError("Please enter a task");
      return;
    }
    try {
      const response = await fetch("clear-list-fsvt-5chet85dn-prakhar-deeps-projects.vercel.app/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ title: newTodoTitle, completed: false, category: selectedCategory }),
      });

      if (!response.ok) throw new Error('Failed to create todo');
      const newTodo = await response.json();
      setTodos([...todos, newTodo]);
      setNewTodoTitle("");
      setError("");
    } catch (error) {
      setError('Failed to create todo');
    }
  }

  async function updateTodo(updatedTodo: Todo) {
    if (!user) return;
    try {
      const response = await fetch("clear-list-fsvt-5chet85dn-prakhar-deeps-projects.vercel.app/todos", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(updatedTodo),
      });
      if (!response.ok) throw new Error('Failed to update todo');
      const newTodo = await response.json();
      setTodos(todos.map((todo) => (todo.id === newTodo.id ? newTodo : todo)));
      setEditingTodo(null);
      setError("");
    } catch (error) {
      setError('Failed to update todo');
    }
  }

  async function deleteTodo(id: string) {
    if (!user) return;
    try {
      const response = await fetch(`clear-list-fsvt-5chet85dn-prakhar-deeps-projects.vercel.app/todos/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete todo');
      setTodos(todos.filter((todo) => todo.id !== id));
      setError("");
    } catch (error) {
      setError('Failed to delete todo');
    }
  }

  if (currentView === 'welcome') {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-500 to-black">
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <h1 className="text-5xl font-bold text-white mb-6">Welcome to ClearList</h1>
          <p className="text-xl text-white mb-8 text-center max-w-2xl">
            Your personal task management solution. Stay organized, boost productivity, 
            and achieve your goals with our intuitive todo list application.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setCurrentView('register')}
              className="bg-black text-slate-300 px-8 py-3 rounded-full font-semibold text-lg hover:bg-slate-800 transition duration-300"
            >
              Get Started
            </button>
            <button 
              onClick={() => setCurrentView('login')}
              className="bg-black border-2 border-black text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-slate-800 hover:text-slate-300 transition duration-300"
            >
              Login
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-black">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">Simple & Intuitive</h2>
            <p className="text-gray-500">Easy to use interface that helps you focus on what matters most</p>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">Stay Organized</h2>
            <p className="text-gray-500">Categorize your tasks and track progress effortlessly</p>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">Secure & Reliable</h2>
            <p className="text-gray-500">Your data is protected and accessible whenever you need it</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (currentView === 'login' || currentView === 'register') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-500 to-gray-600">
        <div className="w-full max-w-md bg-gray-400 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">
            {currentView === 'register' ? 'Create an Account' : 'Welcome Back!'}
          </h2>
          {error && <p className="text-red-700 mb-4 text-center">{error}</p>}
          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 mb-4 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-4 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="w-full bg-slate-500 text-black p-2 rounded mb-2"
            onClick={() => handleAuth(currentView === 'register')}
          >
            {currentView === 'register' ? 'Sign Up' : 'Login'}
          </button>
          <button
            className="w-full text-black-500 underline"
            onClick={() => {
              setCurrentView(currentView === 'register' ? 'login' : 'register');
              setError('');
            }}
          >
            {currentView === 'register' 
              ? 'Already have an account? Login' 
              : 'Need an account? Sign Up'}
          </button>
          <button
            className="w-full text-gray-500 mt-4"
            onClick={() => setCurrentView('welcome')}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen p-4">
        <div className="flex justify-between items-center p-4">
          <div className="text-3xl font-bold p-4 text-center rounded-2xl shadow-lg shadow-slate-400">
            ClearList
          </div>
          <div className="flex items-center">
            <span className="mr-4">Welcome, {user?.username}!</span>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div className="flex flex-col md:flex-row justify-center items-center shadow-xl shadow-slate-400 rounded-3xl mt-4 mx-2 sm:mx-4 md:mx-10">
          <div className="flex flex-col items-center w-full md:w-1/2 p-4">
            <div className="flex w-full mb-4">
              <input
                type="text"
                className="p-4 flex-grow border-2 relative rounded-l-2xl"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                placeholder="Type your task..."
              />
              <select
                className="p-4 border-2 border-l-0 rounded-r-2xl"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="shopping">Shopping</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button
              className="bg-blue-600 w-full md:w-20 text-white p-2 rounded-2xl"
              onClick={createTodo}
            >
              Add
            </button>
          </div>
          <div className="flex flex-col items-center w-full md:w-1/2 p-4">
            <ul className="w-full flex-grow box-border shadow-sm shadow-slate-700 rounded-xl">
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
                        <div className="text-xs text-gray-400">Category: {todo.category}</div>
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