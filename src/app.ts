import express, { NextFunction, Request, Response } from "express";
import notesRoutes from "./routes/notes";
import morgan from "morgan";
import createHttpError, { isHttpError } from "http-errors";
import cors from "cors"; // Import the cors package
import methodOverride from "method-override";
import userRoutes from "./routes/users";
import session from "express-session";
import env from "./util/validateEnv";
import MongoStore from "connect-mongo";
const app = express();

app.use(cors()); // Enable CORS
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.use(express.json());
const mongoStore = MongoStore.create({
  mongoUrl: env.MONGO_CONNECTION_STRING,
});
app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000, // 1 hour
    },
    rolling: true,
    store: mongoStore,
  })
);

app.use("/api/users", userRoutes);

app.use("/api/notes", notesRoutes);
// Global error handling middleware
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  let errorMessage = "An unknown error occurred";
  let statusCode = 500;
  if (isHttpError(error)) {
    statusCode = error.statusCode;
    errorMessage = error.message;
  }
  res.status(statusCode).json({ error: errorMessage });
});

export default app;
