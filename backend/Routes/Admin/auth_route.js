const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcrypt");
const Admin = require("../../Models/Admin/admin_model");
const SubAdmin = require("../../Models/Admin/subAdmin_model");
const checkAdminRole = require("../../Middleware/adminMiddleWares");
const route = express.Router();

let secretKey = process.env.JWT_TOKEN;

// check user is admin or not
route.get("/checkAdmin", checkAdminRole, async (req, res) => {
  return res.status(200).json({ type: "success", message: "this is admin" });
});

function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res
      .status(401)
      .json({ type: "error", message: "No token provided" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).json({ type: "error", message: "Invalid token" });
    }

    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
}

route.get("/userName", verifyToken, async (req, res) => {
  try {
    if (req.userRole === "admin") {
      const admin = await Admin.findById(req.userId);

      if (!admin) {
        return res
          .status(404)
          .json({ type: "warning", message: "Admin not found" });
      }
      return res
        .status(200)
        .json({ type: "success", name: admin.username, role: "admin" });
    } else {
      const subAdmin = await SubAdmin.findById(req.userId);
      if (!subAdmin) {
        return res
          .status(404)
          .json({ type: "warning", message: "Sub-admin not found" });
      }
      role = subAdmin?.role;

      return res
        .status(200)
        .json({
          type: "success",
          name: subAdmin?.name,
          username: subAdmin?.username,
          role: role,
        });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ type: "error", message: "Error retrieving user name", error });
  }
});

module.exports = route;
