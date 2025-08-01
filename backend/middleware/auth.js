import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const isAthunticated = async (req, res, next) => {
  const token = req.header("Auth");

  //  console.log("checking token",token)

  if (!token) {
    return res.json({ message: "No token found, Login First", success: false });
  }

  const decoded = jwt.verify(token, process.env.JWT);

  const id = decoded.userId;

  let user = await User.findById(id);
  if (!user) return res.json({ message: "User not found", success: false });

  req.user = user;
    next();
};

// New middleware for admin routes
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

export default authMiddleware;
