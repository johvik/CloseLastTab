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
          if (windowInfo.tabs.length == 1) {
            // Reopening the last tab with Ctrl+Shift+T causes issues.
            // Looking at favIconUrl and url seems to be a decent workaround.
            //
            // When preferences -> Home -> New tabs = Blank Page
            //  Test                favIconUrl  url
            //  blank               undefined   about:blank
            //  loaded site         undefined   about:blank
            //  reopen loaded site  long-url    about:blank
            //  container site      undefined   about:blank
            //  file                undefined   about:blank
            //  reopen file         undefined   file-url
            //
            // When preferences -> Home -> New tabs = Firefox Home
            //  Test                favIconUrl                            url
            //  blank               chrome://branding/content/icon32.png  about:newtab
            //  loaded site         chrome://branding/content/icon32.png  about:newtab
            //  reopen loaded site  long-url                              about:blank
            //  container site      chrome://branding/content/icon32.png  about:newtab
            //  file                chrome://branding/content/icon32.png  about:newtab
            //  reopen file         undefined                             file-url
            //
            // In a private window
            //  Test   favIconUrl                                          url
            //  blank  chrome://browser/skin/privatebrowsing/favicon.svg   about:privatebrowsing

            const favIconUrl = windowInfo.tabs[0].favIconUrl;
            const url = windowInfo.tabs[0].url;
            if ((!favIconUrl || favIconUrl.startsWith('chrome:')) && ['about:blank', 'about:newtab', 'about:privatebrowsing'].includes(url)) {
              browser.windows.remove(removeInfo.windowId);
            }
          } else {
            browser.windows.remove(removeInfo.windowId);
          }
        }
      });
    }
  });

browser.tabs.onCreated.addListener((tab) => {
  closeWindow = true;
});