import jwt from "jsonwebtoken";

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    jwt.verify(token, "jwt_secret_key", (err, decoded) => {
      if (err) return res.json({ loginStatus: false, Error: "Wrong Token" });

      result[0].id = result[0].id; // Assuming id is in the decoded token
      req.role = decoded.role;
      next();
    });
  } else {
    return res.json({ loginStatus: false, Error: "Not authenticated" });
  }
};

export default verifyUser;
