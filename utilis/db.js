import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectTimeout: 30000,
};

const connection = mysql.createConnection(dbConfig);

let retryCount = 0;
const maxRetries = 5;
const retryDelay = 5000;

const connectWithRetry = () => {
  connection.connect((err) => {
    if (err && err.code === "ETIMEDOUT") {
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(
          `Connection timeout. Retrying (${retryCount}/${maxRetries})...`
        );
        setTimeout(connectWithRetry, retryDelay);
      } else {
        console.log("Maximum retries exceeded. Connection failed.");
      }
    } else if (err) {
      console.log("Connection error:", err.message);
    } else {
      console.log("Connected");
      retryCount = 0;
    }
  });
};
connection.on("error", (err) => {
  console.log("Database error:", err.message);
});

connection.on("close", () => {
  console.log("Database connection closed");
});

connectWithRetry();

export default connection;
