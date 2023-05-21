const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const { Worker } = require("worker_threads");
const path = require("path");

// Serve the frontend HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "./../index1.html"));
});

// WebSocket connection
io.on("connection", (socket) => {
  console.log("Client connected -------->", socket.id);

  // Receive video frame from the frontend
  let i = 1;
  socket.on("frame", (frame) => {
    console.log("frame ------------>", i++);
    // Process frame using a worker thread
    processFrame(frame.trim().slice(23), (result) => {
      // Send drowsiness detection result to the frontend
      console.log("result ------------>", result);
      socket.emit("result", result);
    });
  });

  // Client disconnected
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Function to process frame in a worker thread
function processFrame(frame, callback) {
  // Create a worker thread
  const worker = new Worker("./frameWorker.js", {
    workerData: frame,
  });

  // Receive messages from the worker thread
  worker.on("message", (message) => {
    // Process the received message (drowsiness detection result)
    const result = Number(message);
    callback(result);
  });

  // Handle worker thread termination
  worker.on("error", (error) => {
    console.error("Worker thread error:", error);
  });

  worker.on("exit", (code) => {
    if (code !== 0) console.error(`Worker thread exited with code ${code}`);
  });
}

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
