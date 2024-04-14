/* eslint-disable @typescript-eslint/no-unused-vars */
import { RequestHandler } from "express";
import NoteModel from "../models/note";
import createHttpError from "http-errors";
import { isValidObjectId } from "mongoose";

export const getNote: RequestHandler = async (req, res, next) => {
  const noteId = req.params.noteId;

  try {
    // Check if noteId is a valid ObjectId format
    if (!isValidObjectId(noteId)) {
      return next(createHttpError(400, "Invalid note ID format"));
    }
    const note = await NoteModel.findById(noteId).exec();
    console.log("my note is " + note);
    if (!note) {
      throw createHttpError(404, "Note not found"); // Throw the error
    }
    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

export const createNote: RequestHandler = async (req, res, next) => {
  interface NoteModelTypes {
    title?: string;
    text?: string;
  }
  const { title, text }: NoteModelTypes = req.body;

  try {
    // Check if title exists
    if (!title) {
      throw createHttpError(400, "Title field is missing");
    }
    // Check if title and text are strings
    if (typeof title !== "string" || (text && typeof text !== "string")) {
      if (typeof title !== "string") {
        throw createHttpError(400, "title must be string");
      }
      if (text && typeof text !== "string") {
        throw createHttpError(400, "text must be string");
      }
      throw createHttpError(400, "title and text must be string");
    }
    const newNote = await NoteModel.create({
      title,
      text,
    });
    res.status(201).json(newNote);
  } catch (error) {
    next(error);
  }
};

export const getNotes: RequestHandler = async (req, res, next) => {
  try {
    const notes = await NoteModel.find().exec();
    res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
};

export const deleteNote: RequestHandler = async (req, res, next) => {
  const noteId = req.params.noteId;

  try {
    if (!isValidObjectId(noteId)) {
      return next(createHttpError(400, "Invalid note ID format"));
    }

    const deletedNote = await NoteModel.findByIdAndDelete(noteId).exec();
    if (!deletedNote) {
      throw createHttpError(404, "Note not found");
    }
    // Here we don't need a message on the front. We can just delete the note from it.
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
export const updateNote: RequestHandler = async (req, res, next) => {
  interface bodyTypes {
    title?: string;
    text?: string;
  }
  const noteId = req.params.noteId;
  const updates: bodyTypes = req.body;

  try {
    if (!isValidObjectId(noteId)) {
      return next(createHttpError(400, "Invalid note ID format"));
    }
    // Check types if title or text exists
    if (updates.title && typeof updates.title !== "string") {
      return next(createHttpError(400, "Title must be a string"));
    }
    if (updates.text && typeof updates.text !== "string") {
      return next(createHttpError(400, "Text must be a string"));
    }

    const updatedNote = await NoteModel.findByIdAndUpdate(
      noteId,
      updates,
      { new: true } // Return the updated document
    ).exec();

    if (!updatedNote) {
      throw createHttpError(404, "Note not found");
    }
    res.status(200).json(updatedNote);
  } catch (error) {
    next(error);
  }
};

export const deleteAllNotes: RequestHandler = async (req, res, next) => {
  try {
    // Confirmation check (replace with your preferred method)
    if (!req.query.confirm || req.query.confirm !== "ALL_NOTES_DELETE") {
      return res.status(400).json({
        message:
          "Confirmation required to delete all notes. Use query param 'confirm=ALL_NOTES_DELETE'",
      });
    }

    const deletedCount = await NoteModel.deleteMany().exec();
    res
      .status(200)
      .json({ message: `Deleted ${deletedCount.deletedCount} notes` });
  } catch (error) {
    next(error);
  }
};
