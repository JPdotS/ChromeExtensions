
var url = window.location.toString();
chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
  var element = document.querySelector("#greeting");
    url = tabs[0].url;
    var msg = "URL: ";
    url = url.replace(/\//gi, "\n");
    element.innerText = msg.concat(url);
});

