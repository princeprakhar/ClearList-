const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');

const app = express();
const port = 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory database
let todos = [];

// Get all todos
app.get('/todos', (req, res) => {
    res.json(todos);
});

// Create a new todo
app.post('/todos', (req, res) => {
    const { title, completed } = req.body;
    const todo = {
        id: uuidv4(),
        title,
        completed,
    };
    todos.push(todo);
    res.json(todo);
});

// Update a todo
app.put('/todos', (req, res) => {
    const { id, title, completed } = req.body;
    const todo = todos.find(todo => todo.id === id);
    if (todo) {
        todo.title = title;
        todo.completed = completed;
        res.json(todo);
    } else {
        res.status(404).send('Todo not found');
    }
});

// Delete a todo
app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;
    todos = todos.filter(todo => todo.id !== id);
    res.status(200).send('Todo deleted');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
