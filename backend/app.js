const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
const port = process.env.PORT;
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
require("./Routes/Cron/updateMetalPrices.cron.js");


// Database connection
const connectDB = require("./config/dbConnection.js");
connectDB();

// Static file handling
app.use("/imageUploads", express.static("imageUploads"));

const routers = require("./routes.js");
app.use("", routers);

// Serve admin build first
// 1️⃣ Admin app (served ONLY under /admin)
app.use(
  "/admin",
  express.static(path.join(__dirname, "./admin/build"))
);

// Admin SPA fallback
app.get("/admin/*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "./admin/build/index.html")
  );
});

// 2️⃣ Frontend app (root)
app.use(
  "/",
  express.static(path.join(__dirname, "./frontend/build"))
);

// Frontend SPA fallback
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "./frontend/build/index.html")
  );
});

app.listen(port, () => {
  console.log(`Server is running on ${process.env.IP_ADDRESS}`);
});
