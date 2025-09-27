import express from "express";
import {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getClientReviews
} from "../controllers/reviewController.js";

const router = express.Router();

router.get("/", getAllReviews);
router.get("/:id", getReview);
router.get("/client/:clientId", getClientReviews);
router.post("/", createReview);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);

export default router;
