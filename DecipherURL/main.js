var url = window.location.toString();

function setGreeting(text) {
  var element = document.querySelector("#greeting");
  if (element) {
    element.innerText = text;
  }
}

chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
  try {
    if (!tabs || !tabs.length || !tabs[0] || !tabs[0].url) {
      setGreeting("Could not read the active tab URL.");
      return;
    }

    var rawUrl = tabs[0].url;
    try {
      url = decodeURIComponent(rawUrl);
    } catch (e) {
      url = rawUrl; // Fallback to raw URL if it's not safely decodable
    }

    try {
      navigator.clipboard.writeText(url).catch(function () { /* ignore clipboard errors */ });
    } catch (e) {
      // Ignore clipboard API errors in environments where it's unavailable
    }

    var msg = "The URL: \n";
    msg = msg.concat(url);
    msg = msg.concat("\n\nParts: \n");

    // url = url.replace(/\/\//gi, "\/");
    // url = url.replace(/\//gi, "\n");
    var formatted = url.replace(/\?/gi, "\n\? ").replace(/\&/gi, "\n\& ");

    setGreeting(msg.concat(formatted));
  } catch (err) {
    setGreeting("An error occurred while processing the URL.");
  }
});

