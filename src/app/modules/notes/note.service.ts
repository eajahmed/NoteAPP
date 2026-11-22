import { ObjectId } from "mongodb";

import { getDB } from "../../../config/db.js";
import { ApiError } from "../../utils/apiError.js";

import type {
  NoteDocument,
  CreateNoteInput,
  UpdateNoteInput,
} from "./note.type.js";

// Get Notes Collection
const getCollection = () => {
  return getDB().collection<NoteDocument>("notes");
};

// Create Note
export const createNoteService = async (
  userId: string,
  data: CreateNoteInput
) => {
  const { subject, description } = data;

  if (!subject || !description) {
    throw new ApiError(400, "Subject and description are required");
  }

  const newNote: NoteDocument = {
    subject,
    description,
    userId: new ObjectId(userId),
    createdAt: new Date(),
  };

  const result = await getCollection().insertOne(newNote);

  return await getCollection().findOne({
    _id: result.insertedId,
    userId: new ObjectId(userId),
  });
};

// Get All Notes
export const getNotesService = async (userId: string) => {
  const notes = await getCollection()
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .toArray();

  if (notes.length === 0) {
    throw new ApiError(404, "No notes found");
  }

  return notes;
};

// Get Single Note
export const getSingleNoteService = async (
  noteId: string,
  userId: string
) => {
  if (!ObjectId.isValid(noteId)) {
    throw new ApiError(400, "Invalid Note ID");
  }

  const note = await getCollection().findOne({
    _id: new ObjectId(noteId),
    userId: new ObjectId(userId),
  });

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  return note;
};

// Update Note
export const updateNoteService = async (
  noteId: string,
  userId: string,
  data: UpdateNoteInput
) => {
  if (!ObjectId.isValid(noteId)) {
    throw new ApiError(400, "Invalid Note ID");
  }

  const { subject, description } = data;

  if (subject === undefined && description === undefined) {
    throw new ApiError(400, "At least one field is required to update");
  }

  const updateData: UpdateNoteInput = {};

  if (subject !== undefined) updateData.subject = subject;
  if (description !== undefined) updateData.description = description;

  const result = await getCollection().updateOne(
    {
      _id: new ObjectId(noteId),
      userId: new ObjectId(userId),
    },
    {
      $set: updateData,
    }
  );

  if (result.matchedCount === 0) {
    throw new ApiError(404, "Note not found");
  }

  return await getCollection().findOne({
    _id: new ObjectId(noteId),
    userId: new ObjectId(userId),
  });
};

// Delete Note
export const deleteNoteService = async (
  noteId: string,
  userId: string
) => {
  if (!ObjectId.isValid(noteId)) {
    throw new ApiError(400, "Invalid Note ID");
  }

  const result = await getCollection().deleteOne({
    _id: new ObjectId(noteId),
    userId: new ObjectId(userId),
  });

  if (result.deletedCount === 0) {
    throw new ApiError(404, "Note not found");
  }

  return result;
};