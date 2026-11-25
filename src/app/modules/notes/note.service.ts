
import prisma from "../../../config/prisma.js";
import { ApiError } from "../../utils/apiError.js";

import type {
  CreateNoteInput,
  UpdateNoteInput,
} from "./note.type.js";

// Validate MongoDB ObjectId
const isValidObjectId = (id: string) => /^[a-fA-F0-9]{24}$/.test(id);

// Get Current Date in Bangladesh (DD-MM-YYYY)
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

  return `${day}-${month}-${year}`;
};

// Parse Note Date (DD-MM-YYYY)
const parseNoteDate = (date?: string) => {
  const dateString = date || getDhakaDate();

  if (!/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    throw new ApiError(400, "Invalid date format. Use DD-MM-YYYY");
  }

  const [day, month, year] = dateString.split("-").map(Number);

  const parsedDate = new Date(
    Date.UTC(year, month - 1, day),
  );

  // Check whether the date is valid
  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    throw new ApiError(400, "Invalid date");
  }

  return parsedDate;
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
  const selectedDate = date ? parseNoteDate(date) : undefined;

  const notes = await prisma.note.findMany({
    where: {
      userId,
      ...(selectedDate && {
        date: {
          gte: selectedDate,
          lt: new Date(
            selectedDate.getTime() + 24 * 60 * 60 * 1000,
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
