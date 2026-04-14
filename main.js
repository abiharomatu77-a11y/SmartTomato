// 库文件
const { app, BrowserWindow, ipcMain, Tray, Menu, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const { screen } = require('electron');

const MINI_WIDTH = 250;
const MINI_HEIGHT = 150;

let miniModeTimer = null;
let isDocked = true;

let mainWindow;
let normalBounds;

let tray = null; 
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 850,           // 宽度
    height: 600,          // 高度
    title: "超时专注",  // 标题
    icon: path.join(__dirname, 'assets/icon.ico'), // 图标
    autoHideMenuBar: true, // 菜单栏
    resizable: true,      // 调整大小
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false
    },
  });
  mainWindow.loadFile('index.html');
  normalBounds = mainWindow.getBounds();// 保存初始位置
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault(); // 阻止彻底关闭
      mainWindow.hide();      // 窗口隐藏
    }
  });
}

// 打开窗口
app.whenReady().then(() => {
  createWindow();
  // 创建系统托盘
  const iconPath = path.join(__dirname, 'assets/icon.ico'); 
  tray = new Tray(iconPath);
  tray.setToolTip('超时专注');
  // 右键菜单
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: '打开界面', 
      click: () => { mainWindow.show(); } // 点击后把隐藏的窗口叫出来
    },
    { 
      label: '退出', 
      click: () => {
        isQuitting = true; // 发出“真退出”的暗号
        app.quit();        // 杀掉整个软件
      }
    }
  ]);
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus(); // 拉到最前面
    }
  });

  setTimeout(checkForUpdates, 3000); // 过 3 秒钟再去检查更新
});

// 监听开机自启
ipcMain.on('toggle-auto-start', (event, isEnable) => {
  app.setLoginItemSettings({
    openAtLogin: isEnable,
    path: process.execPath
  });
});

// 小浮窗
// 进入小浮窗
ipcMain.on('enter-mini-mode', () => {
  if (mainWindow) {
    // 记住窗口位置
    normalBounds = mainWindow.getBounds(); 
    mainWindow.setMinimumSize(250, 180); // 设置最小尺寸
    mainWindow.setBounds({ width: 250, height: 180 }, true); 
    // 置顶
    mainWindow.setAlwaysOnTop(true, 'floating'); 
  }
});

// 2. 接收退出小浮窗的指令
ipcMain.on('exit-mini-mode', () => {
  if (mainWindow) {
    mainWindow.setOpacity(1.0);
    if (normalBounds) {
      mainWindow.setBounds(normalBounds, true); 
    }
    mainWindow.setAlwaysOnTop(false); 
  }
});

// ================= 自动更新逻辑 =================
function checkForUpdates() {
  // 如果在本地开发测试，不要强行检查
  if (!app.isPackaged) return; 
  // 静默下载
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  // 发现新版本
  autoUpdater.on('update-available', (info) => {
    // 可以在这里用 ipcRenderer 通知主界面显示一个小红点，暂时省略
    console.log('发现新版本，开始下载...');
  });
  // 新版本下载完成！
  autoUpdater.on('update-downloaded', (info) => {
  // 弹出一个系统提示框告诉用户
    dialog.showMessageBox({
      type: 'info',
      title: '升级提示',
      message: `超时专注 ${info.version} 已经下载完毕！`,
      detail: '是否现在重启软件并安装更新？（如果不立即重启，将在下次启动时自动安装）',
      buttons: ['立即重启安装', '稍后提醒我']
    }).then((result) => {
      // 立即重启安装
      if (result.response === 0) {
        isQuitting = true; // 绕过我们之前写的托盘假关闭逻辑
        autoUpdater.quitAndInstall(); // 退出并安装
      }
    });
  });
  // 更新出错
  autoUpdater.on('error', (err) => {
    console.error('更新检查出错:', err);
  });
  // 执行检查
  autoUpdater.checkForUpdates();
}

// 轮询函数
function startMiniModePolling() {
  if (miniModeTimer) clearInterval(miniModeTimer);
  
  miniModeTimer = setInterval(() => {
    if (!mainWindow) return;

    const { x: mouseX, y: mouseY } = screen.getCursorScreenPoint();
    const { x: winX, y: winY, width: winW, height: winH } = mainWindow.getBounds();
    const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;

    const buffer = isDocked ? 0 : 100; 

    const isMouseInZone = 
      mouseX >= (winX - buffer) && 
      mouseX <= (winX + winW + buffer) &&
      mouseY >= (winY - buffer) && 
      mouseY <= (winY + winH + buffer);

    if (isMouseInZone && isDocked) {
      isDocked = false;
      mainWindow.setBounds({
        x: screenWidth - MINI_WIDTH - 10, 
        width: MINI_WIDTH,
        height: MINI_HEIGHT
      }, true);
      mainWindow.setOpacity(1.0);
    } else if (!isMouseInZone && !isDocked) {
      isDocked = true;
      mainWindow.setBounds({
        x: screenWidth - 20, 
        width: MINI_WIDTH,
        height: MINI_HEIGHT
      }, true);
      mainWindow.setOpacity(0.6);
    }
  }, 200); // 200ms 是一个兼顾反应速度和性能的完美平衡点
}

// 停止轮询
function stopMiniModePolling() {
  if (miniModeTimer) {
    clearInterval(miniModeTimer);
    miniModeTimer = null;
  }
}

ipcMain.on('enter-mini-mode', () => {
  isDocked = true; // 初始状态为缩进
  startMiniModePolling(); // 进入时开始检测
});

ipcMain.on('exit-mini-mode', () => {
  stopMiniModePolling(); // 退出时彻底销毁定时器，不再占用任何资源
  
  if (mainWindow) {
    mainWindow.setOpacity(1.0);
    if (normalBounds) {
      mainWindow.setBounds(normalBounds, true);
    }
    mainWindow.setAlwaysOnTop(false);
  }
});