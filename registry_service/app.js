const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 5102;

// Middleware
app.use(bodyParser.json());

// PostgreSQL configuration
const pool = new Pool({
  user: 'registry_user',
  host: '115.112.141.156',
  database: 'container_registry',
  password: 'rainfall@1',
  port: 5432,
});

// Endpoint to Register or Update Container Activity (Upsert)
app.post('/api/v1/container-activity', async (req, res) => {
  const { container_id, image_name, start_time, stop_time, activity_status, updated_at } = req.body;

  // Validate required fields
  if (!container_id || !image_name || !start_time || !activity_status || !updated_at) {
    return res.status(400).json({ error: 'All fields except stop_time are required.' });
  }

  try {
    // Use PostgreSQL UPSERT with ON CONFLICT
    const query = `
      INSERT INTO container_activity (id, container_id, image_name, start_time, stop_time, activity_status, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (container_id)
      DO UPDATE SET
         image_name = EXCLUDED.image_name,
         start_time = EXCLUDED.start_time,
         stop_time = EXCLUDED.stop_time,
         activity_status = EXCLUDED.activity_status,
         updated_at = EXCLUDED.updated_at
      RETURNING id;
    `;

    // Values for the query
    const values = [
      uuidv4(), // Generate a unique ID for new rows
      container_id,
      image_name,
      start_time,
      stop_time || null,
      activity_status,
      updated_at,
    ];

    const result = await pool.query(query, values);

    // Respond with the ID of the affected record
    res.status(201).json({
      message: 'Container activity recorded or updated successfully!',
      activity_id: result.rows[0].id,
    });
  } catch (error) {
    console.error('Error upserting container activity:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
