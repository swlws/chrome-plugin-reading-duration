document.getElementById('tetris-btn').addEventListener('click', function () {
  chrome.tabs.create({ url: './pages/tetris/index.html' });
});
