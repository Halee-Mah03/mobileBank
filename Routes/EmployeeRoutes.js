import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import connection from "../utilis/db.js";

const router = express.Router();

router.post("/emlogin", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      loginStatus: false,
      Error: "Email and password are required",
    });
  }

  const sql = "SELECT * FROM employees WHERE Email = ?";
  connection.query(sql, [email], (err, result) => {
    if (err) {
      console.error(err);
      return res.json({ loginStatus: false, Error: "Query error" });
    }

    if (result.length === 0) {
      return res.json({
        loginStatus: false,
        Error: "Invalid email or password",
      });
    }

    const hashedPassword = result[0].Password;
    bcrypt.compare(password, hashedPassword, (err, response) => {
      if (err) {
        console.error(err);
        return res.json({
          loginStatus: false,
          Error: "Error comparing passwords",
        });
      }

      if (!response) {
        return res.json({
          loginStatus: false,
          Error: "Invalid email or password",
        });
      }

      const token = jwt.sign(
        {
          role: "user",
          Email: email,
          id: result[0].id,
        },
        "12345",
        { expiresIn: "30d" }
      );

      res.cookie("token", token, { httpOnly: true });
      res.json({ loginStatus: true, token });
    });
  });
});

router.get("/client", (req, res) => {
  const query = `
    SELECT 
      c.first_name, 
      c.last_name, 
      c.email, 
      c.address, 
      a.account_number, 
      a.balance 
    FROM 
      clients c 
    INNER JOIN accounts a ON c.client_id = a.client_id
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to retrieve data" });
    }
    res.json(results);
  });
});

router.post("/credited", (req, res) => {
  const { account_number, amount, description } = req.body;

  const updateBalanceQuery = `
    UPDATE accounts 
    SET balance = balance + ? 
    WHERE account_number = ?
  `;

  connection.query(
    updateBalanceQuery,
    [amount, account_number],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update account balance" });
      } else {
        const insertTransactionQuery = `
        INSERT INTO transactionhistory (account_number, transaction_type, amount, balance, description)
        VALUES (?, 'Credit', ?, (SELECT balance FROM accounts WHERE account_number = ?), ?)
`;

        connection.query(
          insertTransactionQuery,
          [account_number, amount, account_number, description],
          (err, results) => {
            if (err) {
              console.error(err);
              res
                .status(500)
                .json({ error: "Failed to insert transaction history" });
            } else {
              res.json({ message: "Transaction history updated successfully" });
            }
          }
        );
      }
    }
  );
});

router.get("/transactions", (req, res) => {
  const query = `
    SELECT transaction_id, account_number, transaction_type, amount, balance, description, transaction_date
    FROM transactionhistory
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to retrieve transaction history" });
    } else {
      res.json(results);
    }
  });
});

router.post("/debited", (req, res) => {
  const { account_number, amount, description } = req.body;

  const updateBalanceQuery = `
    UPDATE accounts 
    SET balance = balance - ? 
    WHERE account_number = ?
  `;

  connection.query(
    updateBalanceQuery,
    [amount, account_number],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update account balance" });
      } else {
        const insertTransactionQuery = `
        INSERT INTO transactionhistory (account_number, transaction_type, amount, balance, description)
        VALUES (?, 'Debit', ?, (SELECT balance FROM accounts WHERE account_number = ?), ?)
`;

        connection.query(
          insertTransactionQuery,
          [account_number, amount, account_number, description],
          (err, results) => {
            if (err) {
              console.error(err);
              res
                .status(500)
                .json({ error: "Failed to insert transaction history" });
            } else {
              res.json({ message: "Transaction history updated successfully" });
            }
          }
        );
      }
    }
  );
});

router.get("/employee-name", (req, res) => {
  const email = req.query.Email;
  const query = "SELECT FirstName, LastName FROM employees WHERE id = ?";
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error("error running query:", err);
      res.status(500).send({ message: "Error fetching employee name" });
    } else if (!results.length) {
      res.status(404).send({ message: "Employee not found" });
    } else {
      const employeeName = results[0];
      res.status(200).send({
        FirstName: employeeName.FirstName,
        LastName: employeeName.LastName,
      });
    }
  });
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: true });
});

export { router as EmployeeRouter };
