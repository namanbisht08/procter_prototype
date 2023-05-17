const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const { spawn } = require("child_process");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve the frontend HTML file
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Handle socket.io connections
io.on("connection", (socket) => {
  console.log("A client connected");

  // Spawn the Python child process
  const pythonProcess = spawn("python3", ["ml_model.py"]);

  // Receive video frames from the client and send them to the ML model
  socket.on("frame", (frame) => {
    console.log(`Frames --------> ${frame}`);
    pythonProcess.stdin.write(frame);
  });

  // Receive the ML model's output and send it back to the client
  pythonProcess.stdout.on("data", (data) => {
    console.log(`Data from ML Model --------> ${data}`);
    socket.emit("result", data.toString());
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log("A client disconnected");
    pythonProcess.stdin.end();
  });
});

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
