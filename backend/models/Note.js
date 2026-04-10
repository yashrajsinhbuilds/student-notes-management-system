// models/Note.js
// This file defines the structure (schema) of our Note document in MongoDB

const mongoose = require("mongoose");

// Define the schema - like a blueprint for each note
const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Title is mandatory
  },
  description: {
    type: String,
    required: true, // Description is mandatory
  },
  date: {
    type: Date,
    default: Date.now, // Automatically set to current date/time when note is created
  },
});

// Create the model from the schema and export it
// MongoDB collection will be named "notes" (lowercase + plural of "Note")
const Note = mongoose.model("Note", noteSchema);

module.exports = Note;
