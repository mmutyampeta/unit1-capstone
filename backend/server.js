require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
mongoose.connect(process.env.MONGO_URL);

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));

app.use(cors())
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/users", require("./routes/users"));
app.use("/api/recipes", require("./routes/recipes"));

const clientDistPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientDistPath));
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api/")) {
    return res.sendFile(path.join(clientDistPath, "index.html"));
  }
  next();
});

app.use('/api/ai', require('./routes/ai'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
