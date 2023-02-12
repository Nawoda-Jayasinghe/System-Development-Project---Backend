const express = require("express");
const router = express.Router();
const notesController = require("../controllers/notesController");

router
  .route("/")
  .post(notesController.createNewNote)
  .patch(notesController.updateNote);

router.route("/:id").get(notesController.getAllNotesForSpecificProject);

router.route("/getMemberTasks/:id").get(notesController.getAllNotes);

router.route("/:id").delete(notesController.deleteNote);

module.exports = router;
