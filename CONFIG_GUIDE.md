# 🎨 SmartTomato 配置指南

## 概述
代码已重构！所有的颜色、文本、数值等常量都集中在 **CONFIG 对象** 中维护，大大提高了可维护性。

## 快速开始
编辑 `index.html` 文件，找到 `<script>` 标签下的 `CONFIG` 对象，直接修改即可。

---

## 配置项详解

### 🎨 颜色配置 (`CONFIG.colors`)
```javascript
colors: {
  primary: '#4f46e5',        // 主色（蓝紫）- 强调、焦点、活跃
  success: '#10b981',        // 成功色（绿）- 开始、进行中
  successDark: '#059669',    // 深绿 - 悬停状态
  danger: '#ef4444',         // 危险色（红）- 结束、超时、错误
  dark: '#1f2937',           // 深色文本
  textPrimary: '#4b5563',    // 主文本色（中灰）
  textSecondary: '#6b7280',  // 次文本色（浅灰）
  textTertiary: '#9ca3af',   // 三级文本色（更浅灰）
  
  // 背景与边框
  bgLight: '#f3f4f6',        // 浅背景
  bgLighter: '#f9fafb',      // 更浅背景
  border: '#e5e7eb',         // 边框色
  borderLight: '#d1d5db',    // 浅边框
  
  // 标签色
  tagPlannedBg: '#d1fae5',   // 计划标签背景（浅绿）
  tagPlannedText: '#065f46', // 计划标签文字（深绿）
  tagOvertime: '#fee2e2',    // 超时标签背景（浅红）
  tagOvertimeText: '#991b1b',// 超时标签文字（深红）
}
```

**快速修改例子：**
```javascript
// 想把所有绿色改成蓝色？
success: '#3b82f6',  // 改这里！
successDark: '#2563eb',
```

---

### 📝 文本配置 (`CONFIG.text`)
```javascript
text: {
  // 标题
  titleApp: '智能番茄钟 Pro',
  titleHistory: '📊 专注历史记录',
  
  // 按钮文本
  btnStart: '开始',
  btnFinish: '完成',
  btnExport: '📥 导出 CSV',
  
  // 标签
  labelPlanned: '计划',
  labelOvertime: '超时',
  labelMinute: '分钟',
  
  // 提示文本
  placeholderEmpty: '暂无记录，快去开启你的第一次专注吧！',
  
  // 通知内容
  notifyTimeUp: '时间到！',
  notifyTimeUpDesc: '预定时间已用完，现已进入超时记录模式。',
}
```

**快速修改例子：**
```javascript
// 换个应用名字
titleApp: 'Pomodoro Timer 2024',

// 改成英文
labelPlanned: 'Planned',
labelOvertime: 'Overtime',
```

---

### 📊 数值配置 (`CONFIG.numbers`)
```javascript
numbers: {
  historyPerPage: 10,      // 每页显示的记录数
  maxHistoryRecords: 5000, // 最多保留的记录数
  reminderPercentage: 25,  // 提醒百分比
}
```

**快速修改例子：**
```javascript
// 改成每页 20 条记录
historyPerPage: 20,

// 限制最多 1000 条记录
maxHistoryRecords: 1000,
```

---

### 📏 尺寸配置 (`CONFIG.sizes`)
```javascript
sizes: {
  timerSize: 240,      // 计时器圆形大小（像素）
  timerFontSize: 48,   // 计时器字体大小（像素）
  modalWidth: 400,     // 模态框宽度（像素）
  sidebarWidth: 250,   // 侧边栏宽度（像素）
  listMaxWidth: 1200,  // 列表最大宽度（像素）
  listWidth: 90,       // 列表宽度（百分比）
}
```

**快速修改例子：**
```javascript
// 放大计时器
timerSize: 300,
timerFontSize: 56,

// 缩小侧边栏
sidebarWidth: 180,
```

---

## 🎯 常见用法

### 场景 1：改色调（深色主题 → 浅色主题）
```javascript
dark: '#f7f7f7',           // 改成浅色
textPrimary: '#333333',
textSecondary: '#666666',
bgLight: '#ffffff',
```

### 场景 2：改品牌颜色
```javascript
primary: '#ff6b6b',        // 自定义品牌色
success: '#ff6b6b',
danger: '#ff6b6b',
```

### 场景 3：国际化（英文）
```javascript
labelPlanned: 'Plan',
labelOvertime: 'Extra',
btnStart: 'Start',
btnFinish: 'End',
```

---

## ⚠️ 注意事项

1. **修改后需要刷新浏览器** 才能看到效果
2. **某些样式需要同时修改多个颜色** 才能保证一致性（如：标签的背景 + 文字）
3. **数值单位要对应**：
   - `sizes` 中的值默认为像素（px）
   - `numbers` 中的值为纯数字
   - `colors` 中的值为十六进制颜色值
4. **不要删除 CONFIG 对象**，会导致程序出错

---

## 🔍 文件位置
- 配置对象：`index.html` 第 **248-310 行**（大约）
- 应用配置函数：`index.html` 第 **323-335 行**（大约）

---

## 💡 扩展建议
如果想进一步改进，可以：
1. 添加更多的响应式尺寸配置
2. 创建"主题切换"功能
3. 将 CONFIG 抽出到单独的 `config.js` 文件
4. 新增"深色模式"预设配置

---

**祝你使用愉快！🚀**
