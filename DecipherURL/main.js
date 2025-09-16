var url = window.location.toString();

function setText(selector, text) {
  var el = document.querySelector(selector);
  if (el) {
    el.innerText = text;
  }
}

function setStatus(text) {
  setText("#status", text || "");
}

function copyToClipboard(text) {
  try {
    return navigator.clipboard.writeText(text);
  } catch (e) {
    return Promise.reject(e);
  }
}

chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
  try {
    if (!tabs || !tabs.length || !tabs[0] || !tabs[0].url) {
      setStatus("Could not read the active tab URL.");
      return;
    }

    var rawUrl = tabs[0].url;
    try {
      url = decodeURIComponent(rawUrl);
    } catch (e) {
      url = rawUrl; // Fallback to raw URL if it's not safely decodable
    }

    var parts = url.replace(/\?/gi, "\n\? ").replace(/\&/gi, "\n\& ");

    setText("#full-url", url);
    setText("#parts", parts);

    var copyUrlBtn = document.querySelector("#copy-url");
    if (copyUrlBtn) {
      copyUrlBtn.addEventListener("click", function () {
        copyToClipboard(url).then(function () {
          setStatus("Copied full URL");
          setTimeout(function () { setStatus(""); }, 1200);
        }).catch(function () {
          setStatus("Failed to copy");
        });
      });
    }

    var copyPartsBtn = document.querySelector("#copy-parts");
    if (copyPartsBtn) {
      copyPartsBtn.addEventListener("click", function () {
        copyToClipboard(parts).then(function () {
          setStatus("Copied query parts");
          setTimeout(function () { setStatus(""); }, 1200);
        }).catch(function () {
          setStatus("Failed to copy");
        });
      });
    }
  } catch (err) {
    setStatus("An error occurred while processing the URL.");
  }
});

