import mysql from "mysql";

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "thebank",
});

connection.connect(function (err) {
  if (err) {
    console.log("connection error");
  } else {
    console.log("Connected");
  }
});

export default connection;
