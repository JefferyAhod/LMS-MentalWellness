import express from "express";
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  completeOnboarding,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const authRouter = express.Router();

// @route   POST /api/auth/register
authRouter.post("/register", register);

// @route   POST /api/auth/login
authRouter.post("/login", login);

// @route   POST /api/auth/logout
authRouter.post("/logout", logout);

// @route   POST /api/auth/forgot-password
authRouter.post("/forgot-password", forgotPassword);

// @route   PUT /api/auth/reset-password/:resetToken
authRouter.put("/reset-password/:resetToken", resetPassword);
authRouter.put('/complete-onboarding', protect, completeOnboarding);

authRouter.get("/me", protect, (req, res) => {
  res.status(200).json(req.user); // this returns the logged-in user
});
export default authRouter;
