let startTime = Date.now();
let durationInterval;
let durationDiv; // 用于存储 durationDiv 实例
let pausedDuration = 0; // 记录暂停的时间
let pageTitle = ''; // 页面名称
let pageHostname = ''; // 页面域名
let pageUrl = ''; // 页面地址

// 抽离时间格式化的函数
function formatDuration(duration) {
  if (duration < 60) {
    return `${Math.floor(duration)}秒`;
  } else if (duration < 3600) {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}分${seconds}秒`;
  } else {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);
    return `${hours}小时${minutes}分${seconds}秒`;
  }
}

function updateDuration() {
  const currentTime = Date.now();
  const duration = (currentTime - startTime) / 1000; // in seconds
  if (durationDiv) {
    durationDiv.textContent = `阅读时长: ${formatDuration(duration)}`;
  }
}

// 抽离DOM样式设置的函数
function setStyles(element, styles) {
  Object.assign(element.style, styles);
}

// 抽离DOM创建逻辑并使用单例模式
function createDurationDiv() {
  if (!durationDiv) {
    durationDiv = document.createElement('div');
    durationDiv.id = 'chrome-plugin-duration-fo-stay';

    // 使用 setStyles 函数设置样式
    setStyles(durationDiv, {
      position: 'fixed',
      color: 'orange',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      textAlign: 'center',
      zIndex: '9999999',
      bottom: '10px', // 修改为右下角定位
      right: '10px', // 修改为右下角定位
      padding: '4px 8px', // 添加内边距
      pointerEvents: 'none',
      fontSize: '12px', // 调整字体大小
    });

    document.body.parentElement.appendChild(durationDiv);
  }
  return durationDiv;
}

function setPageInfo() {
  pageHostname = window.location.hostname;
  pageTitle = document.title;
  pageUrl = window.location.href;
}

function resetDuration() {
  clearInterval(durationInterval);
  startTime = Date.now() - pausedDuration; // 调整 startTime 以补偿暂停的时间
  durationInterval = setInterval(updateDuration, 1000);

  // 创建或获取 durationDiv 实例
  createDurationDiv();
}

function handleVisibilityChange() {
  if (document.hidden) {
    clearInterval(durationInterval); // 暂停计时
    pausedDuration = Date.now() - startTime; // 记录暂停的时间
  } else {
    startTime = Date.now() - pausedDuration; // 调整 startTime 以补偿暂停的时间
    durationInterval = setInterval(updateDuration, 1000); // 恢复计时
  }
}

async function recordPageVisit() {
  const currentTime = Date.now();
  const duration = (currentTime - startTime) / 1000; // in seconds
  const recordDate = new Date().toLocaleDateString();

  // 获取存储在 chrome.storage 中的历史记录
  const result = await chrome.storage.local.get(['history']);
  let history = result.history || [];

  // 找到当前页面的历史记录
  let pageEntry = history.find(
    (entry) => entry.url === pageUrl && entry.recordDate === recordDate
  );

  if (pageEntry) {
    // 如果页面已经存在于历史记录中，更新停留时间
    pageEntry.duration = pageEntry.duration + duration;
  } else {
    // 如果页面不存在于历史记录中，创建新的历史记录条目
    pageEntry = { pageHostname, pageTitle, pageUrl, duration };
    history.unshift(pageEntry);
  }

  // 更新最后访问时间
  pageEntry.recordDate = recordDate;

  // 保存更新后的历史记录到 chrome.storage
  await chrome.storage.local.set({ history: history });
}

let lock = false;
async function handleRouteChangeEvent() {
  if (lock) return;
  lock = true;

  await recordPageVisit();

  setPageInfo();

  resetDuration();

  lock = false;
}

window.addEventListener('load', setPageInfo); // 添加 load 事件监听
window.addEventListener('popstate', handleRouteChangeEvent);
window.addEventListener('hashchange', handleRouteChangeEvent);
window.addEventListener('visibilitychange', handleVisibilityChange); // 添加 visibilitychange 事件监听
resetDuration();
