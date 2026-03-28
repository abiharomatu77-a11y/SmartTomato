# 🍅 智能番茄钟 (Smart Tomato)

一款基于 Electron 打造的极致简约、功能强大的桌面端专注工具。拒绝花里胡哨，回归专注本质。

[![GitHub license](https://img.shields.io/github/license/abiharomatu77-a11y/SmartTomato)](https://github.com/abiharomatu77-a11y/SmartTomato)
[![GitHub release](https://img.shields.io/github/v/release/abiharomatu77-a11y/SmartTomato)](https://github.com/abiharomatu77-a11y/SmartTomato/releases)

---

## ✨ 核心特性

- **🚀 极简设计**：采用“数据驱动视图”架构，界面清爽，响应灵敏。
- **📊 深度复盘**：自动记录每一次专注任务，支持分页查看，并可一键导出为 **CSV 报表**。
- **⚙️ 高度可调**：内置 `CONFIG` 配置中心，无需深入代码即可轻松修改软件文案与逻辑。
- **📅 常用时间**：支持右键管理常用计时方案，点击即用，快捷高效。
- **🛡️ 极致体验**：支持**开机自启动**设置，配合精心设计的极客风图标，完美融入你的工作桌面。

## 📸 软件预览

*(提示：你可以在这里上传一张软件的截图，然后把图片链接放在下面)*
![软件主界面预览](https://via.placeholder.com/800x450?text=Smart+Tomato+Dashboard)

## 📥 下载与安装

如果你是普通用户，只想直接使用：

1. 前往本仓库的 [Releases](https://github.com/abiharomatu77-a11y/SmartTomato/releases) 页面。
2. 下载最新的 `智能番茄钟.exe`。
3. 双击运行，即可开始你的专注之旅。

## 🛠️ 开发者指南

如果你想在本地运行或二次开发，请确保已安装 [Node.js](https://nodejs.org/) 环境。

### 1. 克隆项目

```bash
git clone [https://github.com/abiharomatu77-a11y/SmartTomato.git](https://github.com/abiharomatu77-a11y/SmartTomato.git)
cd SmartTomato
````

### 2\. 安装依赖

```bash
npm install
```

### 3\. 本地开发模式

```bash
npm start
```

### 4\. 生产环境打包

本项目已针对国内网络环境优化。如果遇到打包时 Electron 下载缓慢，请使用以下命令（Windows PowerShell）：

```powershell
# 设置国内镜像源
$env:ELECTRON_MIRROR="[https://npmmirror.com/mirrors/electron/](https://npmmirror.com/mirrors/electron/)"
$env:ELECTRON_BUILDER_BINARIES_MIRROR="[https://npmmirror.com/mirrors/electron-builder-binaries/](https://npmmirror.com/mirrors/electron-builder-binaries/)"

# 开始打包
npm run dist
```

## 📂 项目结构

```text
SmartTomato/
├── assets/             # 图标等静态资源
├── main.js             # Electron 主进程逻辑（系统底层控制）
├── index.html          # 页面结构（骨架层）
├── style.css           # 样式表（表现层）
├── renderer.js         # 业务逻辑与数据驱动（大脑层）
├── package.json        # 项目配置与打包说明
└── README.md           # 你现在看到的这份超棒文档
```

## 🤝 贡献与反馈

如果你在使用过程中发现 Bug 或有更好的功能建议，欢迎：

- 提交 [Issue](https://www.google.com/search?q=https://github.com/abiharomatu77-a11y/SmartTomato/issues)
- 发送邮件或通过 QQ 联系：**3238281044**

---

**用代码丈量专注，用时间浇灌梦想。** Made with ❤️ by [abiharomatu77](https://www.google.com/search?q=https://github.com/abiharomatu77-a11y)
