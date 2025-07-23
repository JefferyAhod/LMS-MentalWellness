import express from "express";
import { getAllCourses, getCourseById } from "../controllers/courseController.js";

const coursesRouter = express.Router();

coursesRouter.route("/").get(getAllCourses);

coursesRouter.route("/:id").get(getCourseById);

export default coursesRouter;
