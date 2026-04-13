const { app, BrowserWindow, ipcMain, Tray, Menu, dialog } = require('electron');
const path = require('path'); // 如果你还没加这一行，顺便加上，一会儿找图标路径要用
const { autoUpdater } = require('electron-updater');

let mainWindow; // 你原来应该就有这个变量
let normalBounds; // 【新增】用来保存主界面时的窗口大小和位置

let tray = null; 
let isQuitting = false;

function createWindow() {
  // 创建主窗口
  mainWindow = new BrowserWindow({
    width: 850,           // 窗口宽度
    height: 600,          // 窗口高度
    title: "超时专注",  // 窗口标题
    icon: path.join(__dirname, 'assets/icon.ico'), // 窗口图标
    autoHideMenuBar: true, // 隐藏默认菜单栏
    resizable: true,      // 允许调整大小
    webPreferences: {
      nodeIntegration: true,     // 允许在渲染进程使用 Node API
      contextIsolation: false,    // 配合 nodeIntegration 使用
      backgroundThrottling: false
    },
  });
  mainWindow.loadFile('index.html');// 加载界面文件
  normalBounds = mainWindow.getBounds();// 保存初始窗口位置和大小
  mainWindow.on('close', (event) => {
    // 如果不是真正要退出
    if (!isQuitting) {
      event.preventDefault(); // 阻止默认的彻底关闭行为
      mainWindow.hide();      // 只是把窗口隐藏起来
    }
  });
}

// 当软件准备好时，打开窗口
app.whenReady().then(() => {
  createWindow();

  // ================= 创建系统托盘 =================
  const iconPath = path.join(__dirname, 'assets/icon.ico'); 
  tray = new Tray(iconPath);

  tray.setToolTip('超时专注');

  // 3. 构建右键菜单
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

  // 4. 把菜单绑到托盘上
  tray.setContextMenu(contextMenu);

  // 5. 监听鼠标双击事件：双击托盘图标，直接显示窗口
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus(); // 顺便把窗口拉到最前面
    }
  });

  setTimeout(checkForUpdates, 3000); // 过 3 秒钟再去检查更新
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

    mainWindow.setMinimumSize(250, 180); // 设置最小尺寸，防止用户调整得太小
    mainWindow.setBounds({ width: 250, height: 180 }, true); 
    
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

// ================= 自动更新逻辑 =================
function checkForUpdates() {
  // 1. 配置：如果在本地开发测试，不要强行检查（会报错，因为没打包签名）
  if (!app.isPackaged) return; 

  // 2. 告诉更新器，静默下载，别打扰用户
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  // 3. 监听：发现新版本
  autoUpdater.on('update-available', (info) => {
    // 可以在这里用 ipcRenderer 通知主界面显示一个小红点，暂时省略
    console.log('发现新版本，开始下载...');
  });

  // 4. 监听：新版本下载完成！
  autoUpdater.on('update-downloaded', (info) => {
    // 弹出一个系统提示框告诉用户
    dialog.showMessageBox({
      type: 'info',
      title: '升级提示',
      message: `超时专注 ${info.version} 已经下载完毕！`,
      detail: '是否现在重启软件并安装更新？（如果不立即重启，将在下次启动时自动安装）',
      buttons: ['立即重启安装', '稍后提醒我']
    }).then((result) => {
      // 用户点击了第一个按钮（立即重启安装）
      if (result.response === 0) {
        isQuitting = true; // 绕过我们之前写的托盘假关闭逻辑
        autoUpdater.quitAndInstall(); // 退出并安装
      }
    });
  });

  // 5. 监听：更新出错
  autoUpdater.on('error', (err) => {
    console.error('更新检查出错:', err);
  });

  // 开始执行检查！
  autoUpdater.checkForUpdates();
}