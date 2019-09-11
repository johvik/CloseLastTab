// The flow when we want to close the window seems to be:
// onRemoved -> onCreated (the new tab) -> get callback
// We can however get (for example when opening a container tab):
// onCreated (new tab is opened) -> onRemoved -> get callback
// In this case we do not want to close the window.
let closeWindow = false;

browser.tabs.onRemoved.addListener(
  (tabId, removeInfo) => {
    closeWindow = false;
    if (!removeInfo.isWindowClosing) {
      browser.windows.get(removeInfo.windowId, { populate: true }).then((windowInfo) => {
        if (windowInfo.tabs.length <= 1 && closeWindow) {
          browser.windows.remove(removeInfo.windowId);
        }
      });
    }
  });

browser.tabs.onCreated.addListener((tab) => {
  closeWindow = true;
});