import express from "express";
import {
  getAllBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  uploadBookCover
} from "../controllers/bookController.js";

const router = express.Router();

router.get("/", getAllBooks);
router.get("/:id", getBook);
router.post("/", createBook);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook);
router.patch("/:id/upload-cover", uploadBookCover);

export default router;
