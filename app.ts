const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const errorMiddleware = require("./middleware/error");
const cors = require("cors");

const autoIncrement = require("mongoose-auto-increment");

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(
  fileUpload({
    useTempFiles: false, // ← THIS IS CRITICAL!
    createParentPath: true,
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);
app.use(express.json({ limit: "50mb" }));

const corsOptions = {
  origin: [
    "http://localhost:3000", // Your local development
    "https://erp-final-fontend.vercel.app", // Your production frontend
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.use(cookieParser());

const user = require("./routes/authRoute");
const hr = require("./routes/hrRoutes");
const business = require("./routes/bussinessRoute");
const product = require("./routes/productRoutes");
const order = require("./routes/orderRoute");

app.use("/api/v1", user);
app.use("/api/v1", hr);
app.use("/api/v1", business);
app.use("/api/v1", product);
app.use("/api/v1", order);

app.use(errorMiddleware);

module.exports = app;
