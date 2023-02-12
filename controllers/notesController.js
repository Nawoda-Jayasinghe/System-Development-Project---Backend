const Note = require("../models/Note");
const User = require("../models/User");
const mongoose = require("mongoose");
const jwt_decode =  require("jwt-decode");

// @desc Get all notes
// @route GET /notes
// @access Private
const getAllNotes = async (req, res) => {
  const { id } = req.params;
  const token = req.headers.token;

  const user = await User.findById(id);

  if(user.roles === "Admin" || user.roles === "Manager"){
    const notes = await Note.find().sort({ createdAt: -1 }).populate("user project").lean();
    return res.json(notes);
  }

  // Get all notes from MongoDB
  const notes = await Note.find().sort({ createdAt: -1 }).populate("user project").lean();

  let tasks = [];

  notes.map((note) => {
    note.user.map((user) => {
      if(user._id.toString() === id.toString()){
        tasks.push(note);
      }
    })
  })

  // If no notes
  if (!tasks.length) {
    return res.json({ message: "No notes found" });
  }

  // const notesWithUser = await Promise.all(notes.map(async (note) => {
  //     const user = await User.findById(note.user).lean().exec()
  //     return { ...note, username: user.username }
  // }))

  res.json(tasks);
};

// @desc Get all notes for specific project
// @route GET /notes
// @access Private
const getAllNotesForSpecificProject = async (req, res) => {
  // const id = mongoose.Types.ObjectId(req.params);
  const id = req.params.id;

  // Get all notes from MongoDB
  const notes = await Note.find({ project: id }).sort({ createdAt: -1 }).populate("user").lean();

  // If no notes
  if (!notes?.length) {
    return res.json({ message: "No notes found", result: false });
  }

  res.json({ notes, result: true });
};

// @desc Create new note
// @route POST /notes
// @access Private
const createNewNote = async (req, res) => {
  const { user, task, description, project } = req.body;

  // Confirm data
  if (!user || !task || !description || !project) {
    return res.json({ message: "All fields are required", result: false });
  }

  // user?.map((id,index) => {
  //   user[index] = mongoose.Types.ObjectId(id);
  // })

  // Create and store the new user
  const note = await Note.create({ user, task, description, project });

  if (note) {
    // Created
    return res.json({ message: "New note created", result: true });
  } else {
    return res.json({ message: "Invalid note data received", result: false });
  }
};

// @desc Update a note
// @route PATCH /notes
// @access Private
const updateNote = async (req, res) => {
  const { id, completed } = req.body;

  console.log(req.body);

  // Confirm data
  if (!id) {
    return res.json({ message: "All fields are required", result: false });
  }

  // Confirm note exists to update
  const note = await Note.findById(id).exec();

  if (!note) {
    return res.json({ message: "Note not found", result: false });
  }

  note.completed = completed;

  const updatedNote = await note.save();

  res.json({ message: `'${updatedNote.task}' updated`, result: true });
};

// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteNote = async (req, res) => {
  const { id } = req.params;

  // Confirm data
  if (!id) {
    return res.json({ message: "Task ID required", result:false });
  }

  // Confirm note exists to delete
  const note = await Note.findById(id).exec();

  if (!note) {
    return res.json({ message: "Task not found" , result: false});
  }

  const result = await note.deleteOne();

  const reply = `Task '${result.title}' with ID ${result._id} deleted`;

  res.json({reply, result:true});
};

module.exports = {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote,
  getAllNotesForSpecificProject,
};
