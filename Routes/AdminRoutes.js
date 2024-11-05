import express from "express";
import connection from "../utilis/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = express.Router();
router.post("/adminlogin", (req, res) => {
  const sql = "SELECT * from admin Where email = ? and password = ?";
  connection.query(sql, [req.body.email, req.body.password], (err, result) => {
    if (err) return res.json({ loginStatus: false, Error: "Query error" });
    if (result.length > 0) {
      const email = result[0].email;
      const token = jwt.sign(
        { role: "admin", email: email, id: result[0].id },
        "jwt_secret_key",
        { expiresIn: "1d" }
      );
      res.cookie("token", token);
      return res.json({ loginStatus: true });
    } else {
      return res.json({ loginStatus: false, Error: "wrong email or password" });
    }
  });
});

router.post("/addemployee", (req, res) => {
  const sql = `INSERT INTO employees (FirstName, LastName, Email, Salary, Password, Department) VALUES (?,?,?,?,?,?)`;

  bcrypt.hash(req.body.Password, 10, (err, hash) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });

    connection.query(
      sql,
      [
        req.body.FirstName,
        req.body.LastName,
        req.body.Email,
        req.body.Salary,
        hash,
        req.body.Department,
      ],
      (err, result) => {
        if (err) return res.json({ Status: false, Error: err });
        return res.json({ Status: true });
      }
    );
  });
});

router.get("/employee", (req, res) => {
  const sql = "SELECT * FROM employees";
  connection.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});
router.get("/employee/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM employees WHERE id = ?";
  connection.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

router.put("/edit_employee/:id", (req, res) => {
  const id = req.params.id;
  const sql = `UPDATE employees 
        set FirstName = ?, LastName = ?, Email = ?, Salary = ?, Department = ? 
        Where id = ?`;
  const values = [
    req.body.FirstName,
    req.body.LastName,
    req.body.Email,
    req.body.Salary,
    req.body.Department,
  ];
  connection.query(sql, [...values, id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});
router.delete("/delete_employee/:id", (req, res) => {
  const id = req.params.id;
  const sql = "delete from employees where id = ?";
  connection.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.post("/addclient", (req, res) => {
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

router.get("/list", (req, res) => {
  const query = `
    SELECT 
      c.client_id, 
      c.first_name, 
      c.last_name, 
      c.email, 
      c.address, 
      a.account_number, 
      a.account_type, 
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

router.delete("/delete_client/:id", (req, res) => {
  const id = req.params.id;
  const sql = "delete from clients where client_id = ?";
  connection.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});
router.put("/edit_client/:id", (req, res) => {
  const id = req.params.id;
  const sql = `UPDATE clients 
      set first_name = ?, last_name = ?, email = ?, address = ? 
      Where client_id = ?`;
  const values = [
    req.body.first_name,
    req.body.last_name,
    req.body.email,
    req.body.address,
  ];
  connection.query(sql, [...values, id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/admin_count", (req, res) => {
  const sql = "select count(admin_id) as admin from admin";
  connection.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/employee_count", (req, res) => {
  const sql = "select count(id) as employee from employees";
  connection.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/client_count", (req, res) => {
  const sql = "select count(client_id) as client from clients";
  connection.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/salary_count", (req, res) => {
  const sql = "select sum(salary) as salaryOFEmp from employees";
  connection.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});
router.get("/balance_count", (req, res) => {
  const sql = "select sum(balance) as balanceOFClient from accounts";
  connection.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/admin-name", (req, res) => {
  const query = "SELECT first_name, last_name FROM admin WHERE admin_id = 1";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("error running query:", err);
      res.status(500).send({ message: "Error fetching admin name" });
    } else if (!results.length) {
      res.status(404).send({ message: "Admin not found" });
    } else {
      const adminName = `${results[0].first_name} ${results[0].last_name}`;
      res.send({ name: adminName });
    }
  });
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: true });
});

export { router as adminRouter };
