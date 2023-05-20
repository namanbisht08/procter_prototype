const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const { spawn } = require("child_process");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve the frontend HTML file
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// // Handle socket.io connections
// io.on("connection", (socket) => {
//   console.log(`A client connected -------------> ${socket.id}`);

//   // Spawn the Python child process
//   const pythonProcess = spawn("python3", ["ml_model.py"]);

//   // Receive video frames from the client and send them to the ML model
//   socket.on("frame", (frame) => {
//     console.log(`Frames --------> ${frame}`);
//     pythonProcess.stdin.write(frame);
//   });

//   // Receive the ML model's output and send it back to the client
//   pythonProcess.stdout.once("data", (data) => {
//     console.log(`Data from ML Model --------> ${data}`);
//     socket.emit("result", data.toString());
//   });

//   // Handle disconnections
//   socket.on("disconnect", () => {
//     console.log("A client disconnected");
//     pythonProcess.stdin.end();
//   });
// });

io.on("connection", (socket) => {
  console.log(`A client connected -------------> ${socket.id}`);

  // const fileName = `${socket.id}.txt`; // Generate unique file name using socket.id

  const fileName = `frame1.txt`;

  let fileStream;

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log("A client disconnected");
    if (fileStream) {
      fileStream.end(); // Close the file stream
    }
  });

  // Receive video frames from the client and write them to a text file
  socket.on("frame", (frame) => {
    console.log(`Frames --------> ${frame}`);

    if (!fileStream) {
      // Create a new file stream for each client
      fileStream = fs.createWriteStream(fileName);

      // Handle disconnections for the current client
      socket.on("disconnect", () => {
        console.log("A client disconnected");
        if (fileStream) {
          fileStream.end(); // Close the file stream
        }
      });
    }

    // Write the frame to the file
    fileStream.write(frame); // Add a newline character after each frame
  });
});

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
