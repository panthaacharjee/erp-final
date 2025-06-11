const express = require("express")
const app = express()

const bodyParser = require('body-parser')
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");


app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(
  fileUpload({ limits: { fieldSize: 100 * 1024 * 1024  }, useTempFiles: true })
);
app.use(express.json({ limit: "50mb" }));


app.use(cookieParser());

const user = require("./routes/authRoute")

app.use("/api/v1", user)

module.exports = app