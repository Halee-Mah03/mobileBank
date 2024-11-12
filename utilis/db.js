import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
  if (err) {
    console.log("connection error:", err.message);
  } else {
    console.log("Connected");
  }
});

connection.on("error", (err) => {
  console.log("database error:", err.message);
});

connection.on("close", () => {
  console.log("database connection closed");
});

export default connection;
