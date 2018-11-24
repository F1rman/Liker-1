chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
	if(details.tabId !== -1) return;
    var bb = (JSON.parse(JSON.stringify(details.requestHeaders)));
    for (var i = 0; i < details.requestHeaders.length; ++i) {
      if (details.requestHeaders[i].name == 'Accept') {
        details.requestHeaders[i].value = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8";
      }
      if (details.requestHeaders[i].name == 'Origin') {
        details.requestHeaders[i].value = "https://www.instagram.com";
      }
    }
    if(details.url === 'https://www.instagram.com/') details.requestHeaders.push({name: 'Upgrade-Insecure-Requests', value: '1'})
    if(details.url !== 'https://www.instagram.com/') details.requestHeaders.push({name: "X-Requested-With", value: "XMLHttpRequest"})
    // console.log(details.url, bb, details.requestHeaders, details)
    return { requestHeaders: details.requestHeaders };
  },
  {urls: ['*://*.instagram.com/*']},
  [ 'blocking', 'requestHeaders']
);