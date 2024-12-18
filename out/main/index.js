import { app, BrowserWindow } from "electron";
import { fileURLToPath } from "url";
import path from "path";
const myFileName = fileURLToPath(import.meta.url);
const myDirName = path.dirname(myFileName);
let mainWindow = null;
app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(myDirName, "../preload/index.js"),
      // 使用新变量
      contextIsolation: true
    }
  });
  mainWindow.loadURL("http://localhost:3000");
});
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
