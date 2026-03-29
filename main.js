const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow; // 你原来应该就有这个变量
let normalBounds; // 【新增】用来保存主界面时的窗口大小和位置

function createWindow() {
  // 创建主窗口
  mainWindow = new BrowserWindow({
    width: 850,           // 窗口宽度
    height: 600,          // 窗口高度
    title: "智能番茄钟",  // 窗口标题
    icon: path.join(__dirname, 'assets/icon.ico'), // 窗口图标
    autoHideMenuBar: true, // 隐藏默认菜单栏
    resizable: true,      // 允许调整大小
    webPreferences: {
      nodeIntegration: true,     // 允许在渲染进程使用 Node API
      contextIsolation: false    // 配合 nodeIntegration 使用
    },
    // 可选：如果要让浮窗无边框，可以取消下面的注释
    // frame: false,  // 无边框窗口，适合浮窗模式
  });

  // 加载界面文件
  mainWindow.loadFile('index.html');

  // 保存初始窗口位置和大小
  normalBounds = mainWindow.getBounds();
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

// ================= 小浮窗功能 =================

// 1. 接收进入小浮窗的指令
ipcMain.on('enter-mini-mode', () => {
  if (mainWindow) {
    // 记住当前窗口的大小和位置
    normalBounds = mainWindow.getBounds(); 

    // 设置小浮窗的尺寸 (宽 200，高 150，你可以根据你的 UI 调整)
    mainWindow.setMinimumSize(270, 200); // 设置最小尺寸，防止用户调整得太小
    mainWindow.setBounds({ width: 270, height: 200 }, true); 
    
    // 设置窗口始终置顶
    mainWindow.setAlwaysOnTop(true, 'floating'); 
  }
});

// 2. 接收退出小浮窗的指令
ipcMain.on('exit-mini-mode', () => {
  if (mainWindow) {
    // 恢复原来的大小和位置
    if (normalBounds) {
      mainWindow.setBounds(normalBounds, true); 
    }
    // 取消置顶
    mainWindow.setAlwaysOnTop(false); 
  }
});