import { Router } from "express";
import {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
} from "./note.controllers.js";
import { authenticateToken } from "../../middleware/authMiddleware.js";

const router = Router();

// All Notes Routes
router.route("/")
  .post(authenticateToken, createNote)
  .get(authenticateToken, getNotes)
  .patch(authenticateToken, updateNote)
  .delete(authenticateToken, deleteNote);

export const noteRoutes = router;