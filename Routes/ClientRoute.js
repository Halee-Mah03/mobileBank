import express from "express";
import connection from "../utilis/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/register", (req, res) => {
  const sql = `INSERT INTO clients 
      (first_name,last_name,email,address,password) 
      VALUES (?,?,?,?,?)`;
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err)
      return res.status(500).json({ Status: false, Error: "Query Error" });
    const values = [
      req.body.first_name,
      req.body.last_name,
      req.body.email,
      req.body.address,
      hash,
    ];
    connection.query(sql, values, (err, result) => {
      if (err) return res.status(500).json({ Status: false, Error: err });
      return res.json({ Status: true });
    });
  });
});
router.post("/login", (req, res) => {
  const sql = "SELECT * from clients Where email = ?";
  connection.query(sql, [req.body.email], (err, result) => {
    if (err) return res.json({ loginStatus: false, Error: "Query error" });
    if (result.length > 0) {
      bcrypt.compare(req.body.password, result[0].password, (err, response) => {
        if (err)
          return res.json({ loginStatus: false, Error: "Wrong Password" });
        if (response) {
          const email = result[0].email;
          const token = jwt.sign(
            { role: "user", email: email, id: result[0].id },
            "jwt_secret_key",
            { expiresIn: "1d" }
          );
          res.cookie("token", token);
          return res.json({ loginStatus: true, id: result[0].id });
        }
      });
    } else {
      return res.json({ loginStatus: false, Error: "wrong email or password" });
    }
  });
});

router.get("/dashboard", (req, res) => {
  const email = req.query.email;

  const query = `
    SELECT c.first_name, c.last_name, a.account_number, a.balance
    FROM clients c
    INNER JOIN accounts a ON c.client_id = a.client_id
    WHERE c.email = ?
  `;
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error("error running query:", err);
      res.status(500).send({ message: "Error fetching client data" });
    } else if (!results.length) {
      res.status(404).send({ message: "Client not found" });
    } else {
      const clientData = results[0];
      res.status(200).send({
        first_name: clientData.first_name,
        last_name: clientData.last_name,
        account_number: clientData.account_number,
        balance: clientData.balance,
      });
    }
  });
});

export { router as clientRouter };
