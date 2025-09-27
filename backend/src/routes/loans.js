import express from "express";
import {
  getAllLoans,
  getLoan,
  createLoan,
  updateLoan,
  returnBook
} from "../controllers/loanController.js";

const router = express.Router();

router.get("/", getAllLoans);
router.get("/:id", getLoan);
router.post("/", createLoan);
router.put("/:id", updateLoan);
router.patch("/:id/return", returnBook);

export default router;
