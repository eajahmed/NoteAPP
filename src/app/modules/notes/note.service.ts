
import prisma from "../../../config/prisma.js";
import { ApiError } from "../../utils/apiError.js";

import type {
  CreateNoteInput,
  UpdateNoteInput,
} from "./note.type.js";

// Validate MongoDB ObjectId
const isValidObjectId = (id: string) => /^[a-fA-F0-9]{24}$/.test(id);

// Get Current Date in Bangladesh
const getDhakaDate = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(new Date());

  const day = parts.find((part) => part.type === "day")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const year = parts.find((part) => part.type === "year")?.value;

  return `${year}-${month}-${day}`;
};

// Parse Note Date
const parseNoteDate = (date?: string) => {
  const dateString = date || getDhakaDate();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new ApiError(400, "Invalid date format. Use YYYY-MM-DD");
  }

  const checkDate = new Date(`${dateString}T00:00:00Z`);

  if (
    Number.isNaN(checkDate.getTime()) ||
    checkDate.toISOString().slice(0, 10) !== dateString
  ) {
    throw new ApiError(400, "Invalid date");
  }

  return new Date(`${dateString}T00:00:00+06:00`);
};

// Create Note
export const createNoteService = async (
  userId: string,
  data: CreateNoteInput,
) => {
  const { subject, description, date } = data;

  if (
    typeof subject !== "string" ||
    !subject.trim() ||
    typeof description !== "string" ||
    !description.trim()
  ) {
    throw new ApiError(400, "Subject and description are required");
  }

  const newNote = await prisma.note.create({
    data: {
      subject: subject.trim(),
      description: description.trim(),
      date: parseNoteDate(date),
      status: "PENDING",
      userId,
    },
  });

  return newNote;
};

// Get All Notes
export const getNotesService = async (
  userId: string,
  date?: string,
) => {
  const notes = await prisma.note.findMany({
    where: {
      userId,
      ...(date && {
        date: {
          gte: parseNoteDate(date),
          lt: new Date(
            parseNoteDate(date).getTime() + 24 * 60 * 60 * 1000,
          ),
        },
      }),
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (notes.length === 0) {
    throw new ApiError(404, "No notes found");
  }

  return notes;
};

// Get Single Note
export const getSingleNoteService = async (
  noteId: string,
  userId: string,
) => {
  if (!isValidObjectId(noteId)) {
    throw new ApiError(400, "Invalid Note ID");
  }

  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      userId,
    },
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
  data: UpdateNoteInput,
) => {
  if (!isValidObjectId(noteId)) {
    throw new ApiError(400, "Invalid Note ID");
  }

  const { subject, description, date, status } = data;

  if (
    subject === undefined &&
    description === undefined &&
    date === undefined &&
    status === undefined
  ) {
    throw new ApiError(400, "At least one field is required to update");
  }

  if (
    subject !== undefined &&
    (typeof subject !== "string" || !subject.trim())
  ) {
    throw new ApiError(400, "Invalid subject");
  }

  if (
    description !== undefined &&
    (typeof description !== "string" || !description.trim())
  ) {
    throw new ApiError(400, "Invalid description");
  }

  if (
    status !== undefined &&
    status !== "PENDING" &&
    status !== "COMPLETED"
  ) {
    throw new ApiError(400, "Invalid note status");
  }

  const updateData: {
    subject?: string;
    description?: string;
    date?: Date;
    status?: "PENDING" | "COMPLETED";
  } = {};

  if (subject !== undefined) updateData.subject = subject.trim();
  if (description !== undefined) updateData.description = description.trim();
  if (date !== undefined) updateData.date = parseNoteDate(date);
  if (status !== undefined) updateData.status = status;

  const result = await prisma.note.updateMany({
    where: {
      id: noteId,
      userId,
    },
    data: updateData,
  });

  if (result.count === 0) {
    throw new ApiError(404, "Note not found");
  }

  return await prisma.note.findFirst({
    where: {
      id: noteId,
      userId,
    },
  });
};

// Delete Note
export const deleteNoteService = async (
  noteId: string,
  userId: string,
) => {
  if (!isValidObjectId(noteId)) {
    throw new ApiError(400, "Invalid Note ID");
  }

  const result = await prisma.note.deleteMany({
    where: {
      id: noteId,
      userId,
    },
  });

  if (result.count === 0) {
    throw new ApiError(404, "Note not found");
  }

  return result;
};
