import jwt from "jsonwebtoken";

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res
      .status(401)
      .json({ loginStatus: false, Error: "Not authenticated" });
  }
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
    } else {
      req.user = decoded;
      req.role = decoded.role;
      next();
    }
  });
};

export default verifyUser;
