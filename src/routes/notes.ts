import express from "express";
import * as NotesController from "../controllers/notes";

const router = express.Router();
router.get("/", NotesController.getNotes);
router.delete(
  "/all/:confirm?=ALL_NOTES_DELETE",
  NotesController.deleteAllNotes
);

router.get("/:noteId", NotesController.getNote);
router.delete("/:noteId", NotesController.deleteNote);
router.patch("/:noteId", NotesController.updateNote);
router.post("/", NotesController.createNote);
export default router;
