const { parentPort, workerData } = require("worker_threads");
const { PythonShell } = require("python-shell");

// Process frame in Python
function processFrame(frame) {
  const options = {
    mode: "text",
    pythonPath: "python3", // Path to your Python executable
    pythonOptions: ["-u"], // To disable output buffering
    scriptPath: __dirname, // Path to the current directory
  };

  // Execute Python script
  const pyshell = new PythonShell("./../ml_model.py", options);

  // Receive messages from the Python script
  pyshell.on("message", (message) => {
    // Process the received message (drowsiness detection result)
    const result = Number(message);
    parentPort.postMessage(result);
    //pyshell.terminate(); // Terminate the Python script after receiving the result
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

// Start processing the frame
processFrame(workerData);
