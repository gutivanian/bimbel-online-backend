const eventModel = require('../models/event.model');

const rolesColors = {
  Admin: '#ff6666',
  Manager: '#66b3ff',
  Staff: '#85e085',
  Supervisor: '#ffcc99',
  Operator: '#c2c2f0',
  Engineer: '#c2f0c2',
  Consultant: '#f0c2c2',
};
 
// Get all events
const getAllEvents = async (req, res) => {
  try {
    const events = await eventModel.getAllEvents();
    // Mengubah assigned_users menjadi assignedTo (array of objects)
    const formattedEvents = events.map(event => ({
      id: event.id.toString(),
      title: event.title,
      start: event.start_time,
      end: event.end_time,
      role: event.role,
      assignedTo: event.assigned_users, // Array of { userid, name }
      notes: event.notes,
      backgroundColor: rolesColors[event.role] || '#ccc',
    }));
    res.status(200).json(formattedEvents);
  } catch (err) {
    console.error('Error fetching all events:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get event by ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await eventModel.getEventById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }
    const formattedEvent = {
      id: event.id.toString(),
      title: event.title,
      start: event.start_time,
      end: event.end_time,
      role: event.role,
      assignedTo: event.assigned_users, // Array of { userid, name }
      notes: event.notes,
      backgroundColor: event.role
    ? event.role.map((r) => rolesColors[r] || '#ccc').join(', ')
    : '#ccc', // Kombinasikan warna untuk semua role,
    };
    res.status(200).json(formattedEvent);
  } catch (err) {
    console.error('Error fetching event by ID:', err);
    res.status(500).json({ error: err.message });
  }
};

// Create a new event
const createEventController = async (req, res) => {
  try {
    const newEvent = await eventModel.createEvent(req.body);
    // Mendapatkan assigned_users dengan nama
    const eventWithNames = await eventModel.getEventById(newEvent.id);
    const formattedEvent = {
      id: eventWithNames.id.toString(),
      title: eventWithNames.title,
      start: eventWithNames.start_time,
      end: eventWithNames.end_time,
      role: eventWithNames.role,
      assignedTo: eventWithNames.assigned_users, // Array of { userid, name }
      notes: eventWithNames.notes,
      backgroundColor: eventWithNames.role
    ? eventWithNames.role.map((r) => rolesColors[r] || '#ccc').join(', ')
    : '#ccc', // Kombinasikan warna untuk semua role
    };
    res.status(201).json(formattedEvent);
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: err.message });
  } 
};

// Update an event
const updateEventController = async (req, res) => {
  try {
    console.log('Received update payload:', req.body); // Tambahkan ini untuk debugging
    const { id } = req.params;
    const updatedEvent = await eventModel.updateEvent(id, req.body);
    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found." });
    }
    // Mendapatkan assigned_users dengan nama
    const eventWithNames = await eventModel.getEventById(updatedEvent.id);
    const formattedEvent = {
      id: eventWithNames.id.toString(),
      title: eventWithNames.title,
      start: eventWithNames.start_time,
      end: eventWithNames.end_time,
      role: eventWithNames.role,
      assignedTo: eventWithNames.assigned_users, // Array of { userid, name }
      notes: eventWithNames.notes,
      backgroundColor: rolesColors[eventWithNames.role] || '#ccc',
    };
    res.status(200).json(formattedEvent);
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ error: err.message });
  }
};
 

// Delete an event
const deleteEventController = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEvent = await eventModel.deleteEvent(id);
    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found." });
    }
    res.status(200).json({ message: "Event deleted successfully." });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent: createEventController,
  updateEvent: updateEventController,
  deleteEvent: deleteEventController,
};
