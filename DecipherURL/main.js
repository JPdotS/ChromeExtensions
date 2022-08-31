
var url = window.location.toString();
chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
  url = decodeURIComponent(tabs[0].url);
  navigator.clipboard.writeText(url);

  var msg = "The URL: \n";
  msg = msg.concat(url)
  msg = msg.concat("\n\nParts: \n")

  // url = url.replace(/\/\//gi, "\/");
  // url = url.replace(/\//gi, "\n");
  url = url.replace(/\?/gi, "\n\? ");
  url = url.replace(/\&/gi, "\n\& ");
  
  var element = document.querySelector("#greeting");
  element.innerText = msg.concat(url);
});

