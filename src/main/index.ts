import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
const path = require("path");
const { spawn } = require("child_process");
// import icon from '../../src/renderer/src/assets/react.svg'

function createWindow(): void {
  let serverProcess;
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? { } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
    }
  })

  // Start your Node server as a child process
  const serverFilePath = path.join(__dirname, '../../../Educ-backend/server.js');
  serverProcess = spawn('node', [serverFilePath]);
  console.log('serverFilePath', serverFilePath)
  serverProcess.stdout.on('data', (data) => {
    console.log(`Node Server: ${data}`);
    // You can add additional checks here to know when your server is ready (e.g., check for specific output from your server).
    // For demonstration purposes, we're logging the server output.
  });

  serverProcess.on('error', (err) => {
    console.error('Error starting the Node server:', err.message);
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    console.log('ELECTRON_RENDERER_URL', process.env['ELECTRON_RENDERER_URL'])
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    // Open the DevTools.
    mainWindow.webContents.openDevTools({ mode: "right" });
    
  } else {
    mainWindow.loadFile('http://127.0.0.1:5173')
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


ipcMain.on('server-started', () => {
  // Display a notification when the server starts
  // new Notification({
  //   title: 'Server Started',
  //   body: 'The Node server has started and is ready to accept requests.',
  // }).show();
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
