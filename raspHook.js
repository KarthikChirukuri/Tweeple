const child_process = require("child_process");

// Save original exec
const originalExec = child_process.exec;

// Override exec
child_process.exec = function (command, callback) {
  if (command.includes("rm -rf") || command.includes("shutdown")) {
    console.log("[RASP] Blocked dangerous command: ", command);
    if (callback) return callback(new Error("Blocked by Node Security Shield"));
    return;
  }
  return originalExec(command, callback);
};

// Block eval
const originalEval = global.eval;
global.eval = function (code) {
  console.log("[RASP] Blocked eval() usage");
  throw new Error("Blocked by Node Security Shield");
};
