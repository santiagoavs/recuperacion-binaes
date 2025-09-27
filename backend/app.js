import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import bookRoutes from "./src/routes/books.js";
import userRoutes from "./src/routes/users.js";
import authorRoutes from "./src/routes/authors.js";
import categoryRoutes from "./src/routes/categories.js";
import clientRoutes from "./src/routes/clients.js";
import loanRoutes from "./src/routes/loans.js";
import reviewRoutes from "./src/routes/reviews.js";

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
});

app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json());

app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/reviews", reviewRoutes);

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Algo salió mal"
  });
});

export default app;