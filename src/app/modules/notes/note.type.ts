export type NoteStatus = "PENDING" | "COMPLETED";

export interface CreateNoteInput {
  subject: string;
  description: string;
  date?: string;
}

export interface UpdateNoteInput {
  subject?: string;
  description?: string;
  date?: string;
  status?: NoteStatus;
}