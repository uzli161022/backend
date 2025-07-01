require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'https://frontend-xi-six-52.vercel.app/',
  credentials: true
}));
app.use(express.json());

// Database connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'portfolio_db'
};

// Create a pool of database connections
const pool = mysql.createPool(dbConfig);

// Routes
// Home route
app.get('/api/home', async (req, res) => {
    try {
        const [about] = await pool.query('SELECT * FROM about LIMIT 1');
        const [projects] = await pool.query('SELECT * FROM projects ORDER BY created_at DESC LIMIT 3');
        const [experiences] = await pool.query('SELECT * FROM experiences ORDER BY start_date DESC LIMIT 3');
        
        res.json({
            about: about[0],
            featuredProjects: projects,
            recentExperiences: experiences
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// About route
// server/index.js
app.get('/api/about', async (req, res) => {
  try {
    const [about] = await pool.query('SELECT * FROM about LIMIT 1');
    
    // Jika tidak ada data, kembalikan struktur default
    if (about.length === 0) {
      return res.json({
        title: "About Me",
        description: "This is my professional profile",
        skills: "JavaScript,React,Node.js,HTML,CSS"
      });
    }
    
    res.json(about[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Projects route
app.get('/api/projects', async (req, res) => {
    try {
        const [projects] = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
        res.json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Experiences route
app.get('/api/experiences', async (req, res) => {
    try {
        const [experiences] = await pool.query('SELECT * FROM experiences ORDER BY start_date DESC');
        res.json(experiences);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Contact route
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        await pool.query(
            'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
            [name, email, message]
        );
        
        res.json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
