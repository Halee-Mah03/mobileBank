import express from "express";
import { adminRouter } from "./Routes/AdminRoutes.js";
import cors from "cors";
import { EmployeeRouter } from "./Routes/EmployeeRoutes.js";
import { clientRouter } from "./Routes/ClientRoute.js";
import dotenv from "dotenv";
import verifyUser from "./verifyUser.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/auth", adminRouter);
app.use("/emp", EmployeeRouter);
app.use("/cli", clientRouter);
app.use(verifyUser);

app.get("/verify", verifyUser, (req, res) => {
  return res.json({ Status: true, role: req.role, id: result[0].id });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ Status: false, Error: "Internal Server Error" });
});

app.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});
