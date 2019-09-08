browser.tabs.onRemoved.addListener(
  (tabId, removeInfo) => {
    if (!removeInfo.isWindowClosing) {
      browser.windows.get(removeInfo.windowId, { populate: true }).then((windowInfo) => {
        if (windowInfo.tabs.length <= 1) {
          browser.windows.remove(removeInfo.windowId);
        }
      });
    }
  });