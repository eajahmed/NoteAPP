import { ApiError } from "../../utils/apiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  createNoteService,
  getNotesService,
  getSingleNoteService,
  updateNoteService,
  deleteNoteService,
} from "./note.service.js";

import type {
  CreateNoteInput,
  UpdateNoteInput,
} from "./note.type.js";

// Create Note
export const createNote = asyncHandler(async (req, res) => {
  const userId = res.locals.userId;

  const note = await createNoteService(
    userId,
    req.body as CreateNoteInput
  );

  res.status(201).json({
    success: true,
    message: "Note created successfully",
    data: note,
  });
});

// Get All Notes & Get Single Note
export const getNotes = asyncHandler(async (req, res) => {
  const userId = res.locals.userId;
  const noteId = req.query.id;
  const date = req.query.date;

  // Get Single Note
  if (noteId !== undefined) {
    if (typeof noteId !== "string") {
      throw new ApiError(400, "Invalid Note ID");
    }

    const note = await getSingleNoteService(noteId, userId);

    return res.status(200).json({
      success: true,
      data: note,
    });
  }

  // Validate Date
  if (date !== undefined && typeof date !== "string") {
    throw new ApiError(400, "Invalid date");
  }

  // Get All Notes with optional Date Filter
  const notes = await getNotesService(userId, date);

  return res.status(200).json({
    success: true,
    data: notes,
  });
});

// Update Note
export const updateNote = asyncHandler(async (req, res) => {
  const userId = res.locals.userId;
  const noteId = String(req.query.id);

  const note = await updateNoteService(
    noteId,
    userId,
    req.body as UpdateNoteInput
  );

  res.status(200).json({
    success: true,
    message: "Note updated successfully",
    data: note,
  });
});

// Delete Note
export const deleteNote = asyncHandler(async (req, res) => {
  const userId = res.locals.userId;
  const noteId = String(req.query.id);

  await deleteNoteService(noteId, userId);

  res.status(200).json({
    success: true,
    message: "Note deleted successfully",
  });
});