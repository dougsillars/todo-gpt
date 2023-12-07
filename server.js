const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = 8080;

const pool = new Pool({
    host: 'todo-ha.doug-462031336-deploy.svc.cluster.local',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'todo'
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//todo init table
// Create the todo table if it doesn't exist
pool.query(`
  CREATE TABLE IF NOT EXISTS todo (
    id SERIAL PRIMARY KEY,
    task VARCHAR(255) NOT NULL
  )
`)
  .then(() => {
    console.log('Todo table created or already exists');
  })
  .catch((error) => {
    console.error('Error creating todo table:', error);
  });

// Serve HTML file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// API endpoint to get all todo entries
app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todo');
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Internal Server Error');
  }
});

// API endpoint to add a new todo entry
app.post('/api/todos', async (req, res) => {
  const task = req.body.task;

  try {
    const result = await pool.query('INSERT INTO todo (task) VALUES ($1) RETURNING *', [task]);
    console.log(result);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
