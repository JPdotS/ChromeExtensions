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

    var activeTabId = tabs[0].id;
    var rawUrl = tabs[0].url;
    try {
      url = decodeURIComponent(rawUrl);
    } catch (e) {
      url = rawUrl; // Fallback to raw URL if it's not safely decodable
    }

    function render(u) {
      var parts = (u || "").replace(/\?/gi, "\n\? ").replace(/\&/gi, "\n\& ");
      setText("#parts", parts);
      return parts;
    }

    var urlInput = document.querySelector("#url-input");
    if (urlInput) {
      urlInput.value = url;
    }

    var parts = render(url);

    var copyUrlBtn = document.querySelector("#copy-url");
    if (copyUrlBtn) {
      copyUrlBtn.addEventListener("click", function () {
        var current = (document.querySelector("#url-input") || {}).value || url;
        copyToClipboard(current).then(function () {
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
        var currentUrl = (document.querySelector("#url-input") || {}).value || url;
        var currentParts = render(currentUrl);
        copyToClipboard(currentParts).then(function () {
          setStatus("Copied query parts");
          setTimeout(function () { setStatus(""); }, 1200);
        }).catch(function () {
          setStatus("Failed to copy");
        });
      });
    }

    if (urlInput) {
      urlInput.addEventListener("input", function (e) {
        var value = e.target.value || "";
        render(value);
      });
      urlInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          var targetUrl = urlInput.value.trim();
          if (!targetUrl) {
            setStatus("URL is empty");
            return;
          }
          try {
            // If user entered without protocol, assume https
            if (!/^https?:\/\//i.test(targetUrl)) {
              targetUrl = "https://" + targetUrl;
            }
            chrome.tabs.update(activeTabId, { url: targetUrl });
            setStatus("Loading...");
          } catch (e2) {
            setStatus("Failed to load URL");
          }
        }
      });
    }
  } catch (err) {
    setStatus("An error occurred while processing the URL.");
  }
});

