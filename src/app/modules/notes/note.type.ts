import { ObjectId } from "mongodb";

export interface NoteDocument {
  _id?: ObjectId;
  subject: string;
  description: string;
  userId: ObjectId;
  createdAt: Date;
}

export interface CreateNoteInput {
  subject: string;
  description: string;
}

export interface UpdateNoteInput {
  subject?: string;
  description?: string;
}