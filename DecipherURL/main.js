
var url = window.location.toString();
chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
  var element = document.querySelector("#greeting");

    url = decodeURIComponent(tabs[0].url);

    var msg = "The URL: \n";
    msg = msg.concat(url)
    msg = msg.concat("\n\n\nParts: \n")

    // url = url.replace(/\/\//gi, "\/");
    // url = url.replace(/\//gi, "\n");
    url = url.replace(/\?/gi, "\n\? ");
    url = url.replace(/\&/gi, "\n\& ");
    element.innerText = msg.concat(url);
});

