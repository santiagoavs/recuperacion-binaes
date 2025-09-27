import express from "express";
import {
  signUp,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", signUp);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);
router.patch("/update-password", updatePassword);

export default router;
