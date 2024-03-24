"use strict";
const electron = require("electron");
const path$1 = require("path");
const utils = require("@electron-toolkit/utils");
const path = require("path");
const { spawn } = require("child_process");
function createWindow() {
  let serverProcess;
  const mainWindow = new electron.BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: false,
    ...process.platform === "linux" ? {} : {},
    webPreferences: {
      preload: path$1.join(__dirname, "../preload/index.js"),
      sandbox: false,
      nodeIntegration: true
    }
  });
  const serverFilePath = path.join(__dirname, "../../../Educ-backend/server.js");
  serverProcess = spawn("node", [serverFilePath]);
  console.log("serverFilePath", serverFilePath);
  serverProcess.stdout.on("data", (data) => {
    console.log(`Node Server: ${data}`);
  });
  serverProcess.on("error", (err) => {
    console.error("Error starting the Node server:", err.message);
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    console.log("ELECTRON_RENDERER_URL", process.env["ELECTRON_RENDERER_URL"]);
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    mainWindow.webContents.openDevTools({ mode: "right" });
  } else {
    mainWindow.loadFile("http://127.0.0.1:5173");
  }
}
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.electron");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.ipcMain.on("server-started", () => {
});
