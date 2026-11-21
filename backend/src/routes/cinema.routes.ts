import { Router } from "express";
import {
  getAllCinemas,
  createCinema,
  getCinemaBundleQuote,
} from "../controllers/cinema.controller.js";

const router = Router();

router.get("/", getAllCinemas);
router.post("/", createCinema);
router.post("/:id/bundle-quote", getCinemaBundleQuote);
router.get("/:id/bundle-quote", getCinemaBundleQuote);

export default router;