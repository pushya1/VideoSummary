const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const transcribeRoutes = require("./routes/transcribeRoutes");
const streamRoutes = require("./routes/streamRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
require("dotenv").config();

const app = express();
const port = 5000;

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

const connectDB = require("./config/db");
connectDB();


app.use(authRoutes);
app.use(transcribeRoutes);
app.use(streamRoutes);
app.use(chatbotRoutes);

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
