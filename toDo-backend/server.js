const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
require('dotenv').config();

const app = express();
const port = 8080;
const JWT_SECRET = process.env.JWT_SECRET; // In production, use an environment variable

// Middleware
app.use(cors(
    {
        origin: 'https://clear-list-f2hp.vercel.app/',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
));
app.use(bodyParser.json());



app.get('/', (req, res) => {
    res.send('Hello World!');

});

// Zod Schemas
const userSchema = z.object({
    username: z.string().min(3).max(50),
    password: z.string().min(6).max(100)
});

const todoSchema = z.object({
    title: z.string().min(1).max(100),
    completed: z.boolean(),
    category: z.string().min(1).max(50)
});

const updateTodoSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1).max(100),
    completed: z.boolean()
});

// Validation middleware
const validateSchema = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        return res.status(400).json({
            message: "Validation failed",
            errors: error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message
            }))
        });
    }
};

// MongoDB connection
DB_URL = process.env.DB_URL ;
mongoose.connect(DB_URL , {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('MongoDB connection error:', error);
});

// Mongoose Schemas
const mongoUserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
});

const mongoTodoSchema = new mongoose.Schema({
    id: String,
    title: String,
    completed: Boolean,
    category: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const User = mongoose.model('User', mongoUserSchema);
const Todo = mongoose.model('Todo', mongoTodoSchema);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.sendStatus(401);
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// User registration
app.post('/register', validateSchema(userSchema), async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const user = new User({
            username,
            password: hashedPassword
        });
        
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user' });
    }
});

// User login
app.post('/login', validateSchema(userSchema), async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        
        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }
        
        // Create and assign token
        const token = jwt.sign({ _id: user._id }, JWT_SECRET);
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Get all todos
app.get('/todos', authenticateToken, async (req, res) => {
    try {
        const todos = await Todo.find({ userId: req.user._id });
        res.json(todos);
    } catch (error) {
        res.status(500).send('Error fetching todos');
    }
});

// Create a new todo
app.post('/todos', authenticateToken, validateSchema(todoSchema), async (req, res) => {
    try {
        const { title, completed, category } = req.body;
        const todo = new Todo({
            id: uuidv4(),
            title,
            completed,
            category,
            userId: req.user._id
        });
        const savedTodo = await todo.save();
        res.json(savedTodo);
    } catch (error) {
        res.status(500).send('Error creating todo');
    }
});

// Update a todo
app.put('/todos', authenticateToken, validateSchema(updateTodoSchema), async (req, res) => {
    try {
        const { id, title, completed } = req.body;
        const updatedTodo = await Todo.findOneAndUpdate(
            { id: id, userId: req.user._id },
            { title, completed },
            { new: true }
        );
        if (updatedTodo) {
            res.json(updatedTodo);
        } else {
            res.status(404).send('Todo not found');
        }
    } catch (error) {
        res.status(500).send('Error updating todo');
    }
});

// Delete a todo
app.delete('/todos/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        // Validate UUID
        if (!z.string().uuid().safeParse(id).success) {
            return res.status(400).json({ message: 'Invalid todo ID' });
        }
        
        const result = await Todo.deleteOne({ id: id, userId: req.user._id });
        if (result.deletedCount > 0) {
            res.status(200).send('Todo deleted');
        } else {
            res.status(404).send('Todo not found');
        }
    } catch (error) {
        res.status(500).send('Error deleting todo');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});