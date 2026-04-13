const { ipcRenderer } = require('electron');

// ========== 【配置中心】：全盘掌控软件数据 ==========
const CONFIG = {
  colors: { danger: '#ef4444', dark: '#1f2937' },
  text: {
    // 侧边栏与标题
    titleApp: 'Overtime Focus',
    navTimer: '🕒 计时 (Timer)',
    navHistory: '📊 历史 (History)',
    navSettings: '⚙️ 设置 (Settings)',
    
    // 计时界面
    placeholderTask: '你现在正在做什么任务？',
    btnStart: '▶ 开始专注',
    btnFinish: '✅ 完成任务',
    btnEnterMini: '🪟 小浮窗',
    btnExitMini: '还原',

    
    // 历史界面
    titleHistory: '📊 专注历史记录',
    btnExport: '📥 导出 CSV',
    placeholderEmpty: '暂无记录，快去开启你的第一次专注吧！',
    btnPrevPage: '◀ 上一页',
    btnNextPage: '下一页 ▶',
    
    // 设置界面
    titleSettings: '⚙️ 软件设置',
    titleSys: '💻 系统设置',
    labelAutoStart: '开机自动启动',
    titleContact: '💬 联系作者',
    descContact: '如果你在使用中遇到问题，或者有好的建议，欢迎联系我：',
    
    // 弹窗与右键
    titleModal: '添加常用时间',
    btnCancel: '取消',
    btnSave: '保存配置',
    btnDelete: '删除',
    btnDeleteRecord: '删除记录',
    
    // 提示通知
    labelPlanned: '计划',
    labelOvertime: '超时',
    labelMinute: '分钟',
    labelSecond: '秒',
    notifyTimeUp: '时间到！',
    notifyTimeUpDesc: '预定时间已用完，现已进入超时记录模式。',
    notifyTimeover: '超时提醒！',
    alertNoData: '当前没有记录可以导出哦！',
    exportFilename: '超时专注_历史记录.csv',
  },
  numbers: { historyPerPage: 10, maxHistoryRecords: 5000, reminderPercentage: 25 }
};

// --- 【核心重构】：将 CONFIG 数据瞬间注入整个界面的引擎 ---
function applyConfig() {
  const t = CONFIG.text;
  document.title = t.titleApp;
  document.getElementById('app-title-sidebar').innerText = t.titleApp;
  
  // 导航栏
  document.getElementById('nav-timer').innerText = t.navTimer;
  document.getElementById('nav-history').innerText = t.navHistory;
  document.getElementById('nav-settings').innerText = t.navSettings;
  
  // 计时界面
  document.getElementById('task-input').placeholder = t.placeholderTask;
  document.getElementById('btn-start').innerText = t.btnStart;
  document.getElementById('btn-finish').innerText = t.btnFinish;
  document.getElementById('btn-enter-mini').innerText = t.btnEnterMini;
  document.getElementById('btn-exit-mini').innerText = t.btnExitMini;
  
  // 历史界面
  document.getElementById('history-title').innerText = t.titleHistory;
  document.getElementById('btn-export').innerText = t.btnExport;
  document.getElementById('empty-history-msg').innerText = t.placeholderEmpty;
  document.getElementById('btn-prev-page').innerText = t.btnPrevPage;
  document.getElementById('btn-next-page').innerText = t.btnNextPage;
  
  // 设置界面
  document.getElementById('settings-title').innerText = t.titleSettings;
  document.getElementById('settings-sys-title').innerText = t.titleSys;
  document.getElementById('settings-autostart-label').innerText = t.labelAutoStart;
  document.getElementById('settings-contact-title').innerText = t.titleContact;
  document.getElementById('settings-contact-desc').innerText = t.descContact;
  
  // 弹窗与右键
  document.getElementById('modal-title').innerText = t.titleModal;
  document.getElementById('btn-modal-cancel').innerText = t.btnCancel;
  document.getElementById('btn-modal-save').innerText = t.btnSave;
  document.getElementById('btn-delete-time').innerText = t.btnDelete;
  document.getElementById('btn-delete-history').innerText = t.btnDeleteRecord;
}

// ================= 全局状态变量 =================
let totalSeconds = 0;      
let currentSeconds = 0;    
let timerInterval = null;  
let isRunning = false;     
let isOvertime = false;      
let overtimeSeconds = 0;     
let reminderInterval = 0;    
let timeToDelete = null;     
let historyIndexToDelete = null; 
let currentHistoryPage = 1;
let targetEndTime = 0;

// 初始化 SVG
const circle = document.getElementById('progress-circle');
const radius = circle.r.baseVal.value;
const circumference = radius * 2 * Math.PI; 
circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = 0;

// ================= 生命周期与事件 =================
window.onload = function() {
  applyConfig(); // 激活配置引擎

  let savedTimes = JSON.parse(localStorage.getItem('tomatoTimesArray') || '[]');
  savedTimes.forEach(time => renderTimeButton(time));
  checkPlusButtonState();
  renderHistory(); 
  
  if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
  }
  document.getElementById('auto-start-checkbox').checked = localStorage.getItem('tomatoAutoStart') === 'true';
  updateDisplay(0);
};

document.addEventListener('click', function() {
  document.getElementById('custom-context-menu').style.display = 'none';
  document.getElementById('history-context-menu').style.display = 'none';
});

// ================= 视图控制与功能 =================
function switchView(viewName) {
  document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-card').forEach(c => c.classList.remove('active'));
  document.getElementById('view-' + viewName).classList.add('active');
  const navEl = document.getElementById('nav-' + viewName);
  if (navEl) navEl.classList.add('active');
}

function updateDisplay(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  let str = h > 0 ? `${h.toString().padStart(2, '0')}:` : '';
  str += `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  
  document.getElementById('time-display').innerText = str;
  document.getElementById('mini-time-display').innerText = str;
}

function sendNotification(title, body) {
  if (Notification.permission === "granted") new Notification(title, { body });
}

// 弹窗逻辑
function selectCustomTime(btn) {
  if (isRunning) return;
  document.getElementById('custom-time-modal').style.display = 'flex';
  document.getElementById('input-hours').value = '0';
  document.getElementById('input-minutes').value = '45';
}
function closeCustomModal() { document.getElementById('custom-time-modal').style.display = 'none'; }
function changeHour(d) { let v = (parseInt(document.getElementById('input-hours').value)||0)+d; document.getElementById('input-hours').value = v<0?23:v>23?0:v; }
function changeMinute(d) { let v = (parseInt(document.getElementById('input-minutes').value)||0)+d; document.getElementById('input-minutes').value = v<0?59:v>59?0:v; }

function confirmCustomTime() {
  const mins = (parseInt(document.getElementById('input-hours').value)||0)*60 + (parseInt(document.getElementById('input-minutes').value)||0);
  if (mins <= 0) return alert("时间不能为 0 哦！");
  
  let saved = JSON.parse(localStorage.getItem('tomatoTimesArray') || '[]');
  const ms = mins.toString();
  if (saved.length >= 5) return alert("最多只能添加 5 个常用时间！");
  if (saved.includes(ms)) return alert("这个时间已经存在啦！");

  saved.push(ms);
  localStorage.setItem('tomatoTimesArray', JSON.stringify(saved));
  closeCustomModal();
  renderTimeButton(ms);
  checkPlusButtonState();
}

function formatTimeDisplay(m) {
  const h = Math.floor(m / 60); const min = m % 60;
  return h > 0 && min > 0 ? `${h}h ${min}m` : h > 0 ? `${h}h` : `${min}m`;
}

function renderTimeButton(minutes) {
  const btn = document.createElement('button');
  btn.className = 'time-btn';
  btn.innerText = formatTimeDisplay(minutes);
  btn.onclick = function() { selectTimeByMinutes(minutes, this); };
  btn.oncontextmenu = function(e) {
    e.preventDefault(); timeToDelete = minutes;
    const menu = document.getElementById('custom-context-menu');
    menu.style.display = 'block'; menu.style.left = e.clientX + 'px'; menu.style.top = e.clientY + 'px';
  };
  document.getElementById('time-options').insertBefore(btn, document.getElementById('btn-add-time'));
}

document.getElementById('btn-delete-time').onclick = function() {
  if (!timeToDelete) return;
  let saved = JSON.parse(localStorage.getItem('tomatoTimesArray') || '[]').filter(t => t !== timeToDelete.toString());
  localStorage.setItem('tomatoTimesArray', JSON.stringify(saved));
  document.querySelectorAll('.time-btn:not(#btn-add-time)').forEach(b => b.remove());
  saved.forEach(t => renderTimeButton(t));
  checkPlusButtonState();
  timeToDelete = null;
  document.getElementById('custom-context-menu').style.display = 'none';
};

function checkPlusButtonState() {
  const saved = JSON.parse(localStorage.getItem('tomatoTimesArray') || '[]');
  const pBtn = document.getElementById('btn-add-time');
  pBtn.disabled = saved.length >= 5;
  pBtn.style.cssText = pBtn.disabled ? 'background:#f3f4f6;color:#9ca3af;border-color:#e5e7eb;cursor:not-allowed;' : 'background:white;color:#4b5563;border-color:#e5e7eb;cursor:pointer;';
}

function selectTimeByMinutes(minutes, btn) {
  if (isRunning) return;
  document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  totalSeconds = minutes * 60; currentSeconds = totalSeconds;
  circle.style.strokeDashoffset = 0; updateDisplay(currentSeconds);
}

function startTimer() {
  if (totalSeconds === 0) return alert("请先选择一个时间！");
  isRunning = true;
  document.getElementById('time-options').style.display = 'none';
  document.getElementById('btn-start').style.display = 'none';
  document.getElementById('btn-finish').style.display = 'block';
  document.getElementById('task-input').disabled = true;

  reminderInterval = Math.max(Math.floor(totalSeconds * 0.25), 1);

  // 一按下开始，立刻算出“目标结束时间”的绝对时间戳
  targetEndTime = Date.now() + totalSeconds * 1000;

  timerInterval = setInterval(() => {
    const now = Date.now(); 

    if (!isOvertime) {
      // 没超时：目标时间 - 现在
      currentSeconds = Math.round((targetEndTime - now) / 1000);

      // 时间到了，切换状态
      if (currentSeconds <= 0) {
        currentSeconds = 0;
        isOvertime = true;
        
        circle.style.stroke = CONFIG.colors.danger;
        document.getElementById('time-display').style.color = CONFIG.colors.danger; 
        document.getElementById('mini-time-display').style.color = CONFIG.colors.danger; 
        sendNotification(CONFIG.text.notifyTimeUp, CONFIG.text.notifyTimeUpDesc);
      }
      
      updateDisplay(currentSeconds);
      circle.style.strokeDashoffset = circumference - (currentSeconds / totalSeconds) * circumference;

    } else {
      // 超时了：直接用 现在 - 目标时间！(极致精准，无缝衔接)
      overtimeSeconds = Math.round((now - targetEndTime) / 1000);
      
      updateDisplay(overtimeSeconds);
      circle.style.strokeDashoffset = circumference - ((overtimeSeconds % reminderInterval) / reminderInterval) * circumference;
      
      if (overtimeSeconds > 0 && overtimeSeconds % reminderInterval === 0) {
        sendNotification(CONFIG.text.notifyTimeover, `你已经额外耗费了计划 ${(overtimeSeconds / reminderInterval) * 25}% 的时间！建议休息！`);
      }
    }
  }, 1000);
}

function finishTask() {
  clearInterval(timerInterval);
  const taskName = document.getElementById('task-input').value || "未命名任务";
  const record = {
    date: new Date().toLocaleString(), task: taskName,
    planned: Math.floor(totalSeconds / 60), overtime: Math.floor(overtimeSeconds / 60),
    overtimeSecs: overtimeSeconds % 60, isOver: isOvertime
  };

  let historyData = JSON.parse(localStorage.getItem('tomatoHistory') || '[]');
  historyData.unshift(record);
  if (historyData.length > CONFIG.numbers.maxHistoryRecords) historyData = historyData.slice(0, CONFIG.numbers.maxHistoryRecords);
  localStorage.setItem('tomatoHistory', JSON.stringify(historyData));

  isRunning = false; isOvertime = false; totalSeconds = 0; currentSeconds = 0; overtimeSeconds = 0;
  circle.style.stroke = '#10b981'; 
  document.getElementById('time-display').style.color = CONFIG.colors.dark;
  document.getElementById('mini-time-display').style.color = CONFIG.colors.dark;

  circle.style.strokeDashoffset = 0; updateDisplay(0);
  
  document.getElementById('time-options').style.display = 'flex';
  document.querySelectorAll('.time-btn:not(#btn-add-time)').forEach(b => b.classList.remove('active'));
  document.getElementById('btn-start').style.display = 'block';
  document.getElementById('btn-finish').style.display = 'none';
  document.getElementById('task-input').disabled = false;
  document.getElementById('task-input').value = ''; 
  renderHistory();
}

// 历史记录引擎
function renderHistory() {
  const container = document.getElementById('history-list-container');
  const pagination = document.getElementById('history-pagination');
  let data = JSON.parse(localStorage.getItem('tomatoHistory') || '[]');
  
  if (data.length === 0) {
    container.innerHTML = `<p style="color: #9ca3af; text-align: center; margin-top: 50px;">${CONFIG.text.placeholderEmpty}</p>`;
    pagination.style.display = 'none'; return;
  }
  
  const totalPages = Math.ceil(data.length / CONFIG.numbers.historyPerPage);
  if (currentHistoryPage > totalPages) currentHistoryPage = totalPages;
  if (currentHistoryPage < 1) currentHistoryPage = 1;

  const start = (currentHistoryPage - 1) * CONFIG.numbers.historyPerPage;
  container.innerHTML = ''; 

  data.slice(start, start + CONFIG.numbers.historyPerPage).forEach((record, idx) => {
    const item = document.createElement('div');
    item.className = 'history-item';
    
    let tags = `<span class="tag-planned">${CONFIG.text.labelPlanned}: ${record.planned} ${CONFIG.text.labelMinute}</span>`;
    if (record.isOver) tags += `<span class="tag-overtime">${CONFIG.text.labelOvertime}: ${record.overtime} ${CONFIG.text.labelMinute.slice(0, 1)} ${record.overtimeSecs} ${CONFIG.text.labelSecond}</span>`;

    item.innerHTML = `<div class="history-info"><h4>${record.task}</h4><div class="history-tags">${tags}</div></div><div class="history-date">${record.date}</div>`;
    item.oncontextmenu = function(e) {
      e.preventDefault(); historyIndexToDelete = start + idx;
      const menu = document.getElementById('history-context-menu');
      menu.style.display = 'block'; menu.style.left = e.clientX + 'px'; menu.style.top = e.clientY + 'px';
    };
    container.appendChild(item);
  });

  pagination.style.display = 'flex';
  document.getElementById('page-info-text').innerText = `第 ${currentHistoryPage} / ${totalPages} 页`; 
  document.getElementById('btn-prev-page').disabled = (currentHistoryPage === 1);
  document.getElementById('btn-next-page').disabled = (currentHistoryPage === totalPages);
}

function changeHistoryPage(delta) {
  currentHistoryPage += delta; renderHistory();
  document.getElementById('history-list-container').scrollTop = 0;
}

document.getElementById('btn-delete-history').onclick = function() {
  if (historyIndexToDelete === null) return;
  let data = JSON.parse(localStorage.getItem('tomatoHistory') || '[]');
  data.splice(historyIndexToDelete, 1);
  localStorage.setItem('tomatoHistory', JSON.stringify(data));
  if (currentHistoryPage > Math.ceil(data.length / CONFIG.numbers.historyPerPage) && currentHistoryPage > 1) currentHistoryPage--;
  renderHistory();
  historyIndexToDelete = null;
  document.getElementById('history-context-menu').style.display = 'none';
};

function exportToCSV() {
  let data = JSON.parse(localStorage.getItem('tomatoHistory') || '[]');
  if (data.length === 0) return alert(CONFIG.text.alertNoData);

  let csv = "\uFEFF日期时间,任务名称,计划专注(分钟),是否超时,超时分钟,超时秒数\n";
  data.forEach(r => csv += `${r.date},"${r.task.replace(/"/g, '""')}",${r.planned},${r.isOver ? "是" : "否"},${r.overtime},${r.overtimeSecs}\n`);

  const link = document.createElement("a");
  link.setAttribute("href", URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })));
  link.setAttribute("download", CONFIG.text.exportFilename);
  document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

function toggleAutoStart(isEnable) {
  ipcRenderer.send('toggle-auto-start', isEnable);
  localStorage.setItem('tomatoAutoStart', isEnable);
}

// 进入小浮窗模式
function enterMiniMode() {
  // 1. 隐藏主界面，显示小浮窗
  document.querySelector('.app-container').style.display = 'none';
  document.getElementById('mini-view').style.display = 'block';
  
  // 2. 告诉主进程去改变窗口大小
  ipcRenderer.send('enter-mini-mode');
}

// 退出小浮窗模式（绑定给 mini-view 里的还原按钮）
function exitMiniMode() {
  // 1. 隐藏小浮窗，恢复主界面
  document.getElementById('mini-view').style.display = 'none';
  // 注意：你的 app-container 原本的 display 是 block 还是 flex？如果是 flex 这里就写 flex
  document.querySelector('.app-container').style.display = 'flex'; 
  
  // 2. 告诉主进程还原窗口大小
  ipcRenderer.send('exit-mini-mode');
}