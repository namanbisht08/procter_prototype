const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const { PythonShell } = require("python-shell");

// Serve the frontend HTML file
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index1.html");
});

// WebSocket connection
io.on("connection", (socket) => {
  console.log("Client connected -------->", socket.id);

  // Receive video frame from the frontend
  let i = 1;
  socket.on("frame", (frame) => {
    console.log("frame ------------> ", i++);
    // Process frame in Python
    processFrame(frame.trim().slice(23), (result) => {
      // Send drowsiness detection result to the frontend
      console.log("result ------------> ", result);
      socket.emit("result", result);
    });
  });

  // Client disconnected
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Function to process frame in Python
function processFrame(frame, callback) {
  // Configure PythonShell

  const options = {
    mode: "text",
    pythonPath: "python3", // Path to your Python executable
    pythonOptions: ["-u"], // To disable output buffering
    scriptPath: __dirname, // Path to the current directory
  };

  // Execute Python script
  const pyshell = new PythonShell("ml_model.py", options);

  // Receive messages from the Python script
  pyshell.on("message", (message) => {
    // Process the received message (drowsiness detection result)
    const result = Number(message);
    callback(result);
  });

  // Handle Python script termination
  pyshell.on("close", (code, signal) => {
    if (signal) {
      console.error(`Python script terminated due to signal: ${signal}`);
    } else if (code !== 0) {
      console.error(`Python script exited with code ${code}`);
    }
  });

  // Send the video frame to the Python script
  pyshell.send(frame);
}

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
