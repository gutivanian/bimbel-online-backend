const pool = require('../config/db.config');

// Get all events with assigned user details
const getAllEvents = async () => {
  const query = `
    SELECT 
      e.id, 
      e.title, 
      e.start_time, 
      e.end_time, 
      e.role, 
      e.assigned_to, 
      e.notes,
      COALESCE(
        json_agg(
          json_build_object('userid', u.userid, 'name', u.name)
        ) FILTER (WHERE u.userid IS NOT NULL), '[]'
      ) AS assigned_users
    FROM events e
    LEFT JOIN LATERAL json_array_elements_text(e.assigned_to) AS assigned_user_id(user_id)
      ON TRUE
    LEFT JOIN v_dashboard_userdata u 
      ON u.userid = assigned_user_id.user_id::integer
    GROUP BY e.id
    ORDER BY e.start_time ASC
    LIMIT 100
  `;
  
  const { rows } = await pool.query(query);
  return rows;
};

// Get event by ID with assigned user details
const getEventById = async (id) => {
  const query = `
    SELECT 
      e.id, 
      e.title, 
      e.start_time, 
      e.end_time, 
      e.role, 
      e.assigned_to, 
      e.notes,
      COALESCE(
        json_agg(
          json_build_object('userid', u.userid, 'name', u.name)
        ) FILTER (WHERE u.userid IS NOT NULL), '[]'
      ) AS assigned_users
    FROM events e
    LEFT JOIN LATERAL json_array_elements_text(e.assigned_to) AS assigned_user_id(user_id)
      ON TRUE
    LEFT JOIN v_dashboard_userdata u 
      ON u.userid = assigned_user_id.user_id::integer
    WHERE e.id = $1
    GROUP BY e.id
  `;  
  
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

// Create a new event 
const createEvent = async (event) => {
  const query = `
  INSERT INTO events (title, start_time, end_time, role, assigned_to, notes, starter_user_id, master_id, event_master_id, event_type)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
  `;
  const values = [
    event.title,
    event.start_time,  
    event.end_time,
    JSON.stringify(event.role),
    JSON.stringify(event.assigned_to), // Store as JSON
    event.notes,
    event.starter_user_id, // Tambahkan starter_user_id,
    event.master_id, // Tambahkan master_id
    event.event_master_id, // Tambahkan event_master_id
    event.event_type, // Tambahkan event_type
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Update an event
const updateEvent = async (id, event) => {
  const assignedTo = [event.teacher_id, ...event.student_list_ids];

  const query = `
  UPDATE events
  SET title = $1, start_time = $2, end_time = $3, role = $4, assigned_to = $5, notes = $6, starter_user_id = $7
  WHERE id = $8 RETURNING *
  `;  
  const values = [
    event.name,
    event.start_time, // Pastikan menggunakan 'start_time' sesuai kolom di database
    event.end_time,   // Pastikan menggunakan 'end_time' sesuai kolom di database
    JSON.stringify(event.role) || JSON.stringify(['teacher','student']),
    JSON.stringify(assignedTo),
    event.description,
    event.teacher_id, // Tambahkan starter_user_id
    id,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const startEvent = async (id) => {
  const query = `
  UPDATE events
  SET is_started = true
  WHERE id = $1 RETURNING *
  `;  
  const values = [
    id,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};


// Delete an event
const deleteEvent = async (id) => {
  const query = 'DELETE FROM events WHERE id = $1 RETURNING *';
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};
 
module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  startEvent,
  deleteEvent,
};
