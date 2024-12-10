chrome.browserAction.onClicked.addListener(() => {
  // Open a new tab with the HTML page you want to show
  chrome.tabs.create({
    url: chrome.runtime.getURL('/popup/index.html')  // Points to your new HTML page
  });
});