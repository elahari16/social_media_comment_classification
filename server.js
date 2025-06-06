const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const http = require("http");
const morgan = require("morgan");

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

dotenv.config(); // Load environment variables

const app = express();
const httpServer = http.createServer(app);

// Import routes
const { authSocket, socketServer } = require("./socketServer");
const posts = require("./routes/posts");
const users = require("./routes/users");
const comments = require("./routes/comments");
const messages = require("./routes/messages");

// Setup Socket.io
const io = require("socket.io")(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use(authSocket);
io.on("connection", (socket) => socketServer(socket));

// Fix Mongoose strictQuery warning
mongoose.set("strictQuery", false);

// MongoDB Connection using async/await with Error Handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    console.log("✅ MongoDB connected successfully");
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.log("⚠️ Retrying connection in 5 seconds...");
    return false;
  }
};

// Try to connect, with retry logic
(async function initializeDBConnection() {
  let connected = false;
  while (!connected) {
    connected = await connectDB();
    if (!connected) {
      // Wait 5 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
})();

// Middleware setup
app.use(express.json());
app.use(morgan("dev")); // Logs incoming requests for debugging
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);

// Import classify routes
const classify = require("./routes/classify");

// API routes
app.use("/api/posts", posts);
app.use("/api/users", users);
app.use("/api/comments", comments);
app.use("/api/messages", messages);
app.use("/api/classify", classify);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "✅ Server is healthy and running!" });
});

// Production build
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: "❌ Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ message: "🚨 Internal Server Error" });
});

// Graceful Shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🛑 MongoDB connection closed");
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥', err);
  console.error(err.name, err.message, err.stack);
  // Don't crash the server, just log the error
});

// Start the server using PORT from .env
const PORT = process.env.PORT || 5001; // Changed default port to 5001
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
