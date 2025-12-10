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


// Database connection
const connectDB = require("./config/dbConnection.js");
connectDB();

// Static file handling
app.use("/imageUploads", express.static("imageUploads"));

// Initialize Firebase Admin SDK
// const admin = require("firebase-admin");
// const serviceAccount = require("./shubhlibaas-c4839-firebase-adminsdk-n9xek-a6fd3cc9e2.json");
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

const routers = require("./routes.js");
app.use("", routers);

// Serve admin build first
app.use(express.static(path.join(__dirname, "./frontend/build")));
app.use("/admin",express.static(path.join(__dirname, "./admin/build")));

app.get("/admin/*", (req, res) => {
  res.sendFile(path.join(__dirname, "./admin/build/index.html"));
});


app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./frontend/build/index.html"));
});



// app.get("/", (req, res) => res.send("welcome"));

app.listen(port, () => {
  console.log(`Server is running on ${process.env.IP_ADDRESS}`);
});
