const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// 这个函数用来创建一个窗口
function createWindow () {
  const win = new BrowserWindow({
    width: 850,           // 窗口宽度
    height: 600,          // 窗口高度
    title: "智能番茄钟 Pro",
    autoHideMenuBar: true, // 隐藏丑陋的默认菜单栏
    resizable: true,      // 允许调整大小
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // 让这个窗口去加载我们的界面文件
  win.loadFile('index.html');
}

// 当软件准备好时，打开窗口
app.whenReady().then(() => {
  createWindow();

  // 在 macOS 上，用户点击 dock 图标时重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 当所有窗口被关闭时，完全退出软件
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// --- 监听来自设置页面的"开机自启"指令 ---
ipcMain.on('toggle-auto-start', (event, isEnable) => {
  app.setLoginItemSettings({
    openAtLogin: isEnable, // true 为开启，false 为关闭
    path: process.execPath // 告诉系统启动当前的 exe
  });
});