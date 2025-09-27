import express from "express";
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  uploadUserPhoto
} from "../controllers/userController.js";
import { uploadSingle } from "../middleware/multer.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.patch("/update-me", updateMe);
router.delete("/delete-me", deleteMe);
router.patch("/:id/upload-photo", uploadSingle('photo'), uploadUserPhoto);

export default router;
