import express from "express";
import {
  getAllClients,
  getClient,
  createClient,
  updateClient,
  deleteClient
} from "../controllers/clientController.js";

const router = express.Router();

router.get("/", getAllClients);
router.post("/", createClient);
router.get("/:id", getClient);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);

export default router;
