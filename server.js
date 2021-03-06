const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

//connect DB
connectDB();

//init middleware
app.use(express.json({ extended: false }));
app.get("/", (req, res) => {
  res.send("API running...");
});

//define routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server started on port: ", PORT);
  console.log("PORT at .env file: ", process.env.PORT);
});
