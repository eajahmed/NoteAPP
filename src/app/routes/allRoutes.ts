import { Router } from "express";

import { userRoutes } from "../modules/users/user.routes.js";
import { noteRoutes } from "../modules/notes/note.routes.js";

const router = Router();

const routes = [
  { path: "/users", route: userRoutes },
  { path: "/notes", route: noteRoutes },
];

routes.forEach((item) => {
  router.use(item.path, item.route);
});

export const allRoutes = router;