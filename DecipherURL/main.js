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

    function parseUrlParams(u) {
      try {
        var parsed = new URL(u);
        var out = [];
        parsed.searchParams.forEach(function (value, key) {
          out.push({ key: key, value: value });
        });
        return out;
      } catch (_) {
        // Fallback for invalid URL strings: manual parse
        var qIndex = (u || "").indexOf("?");
        if (qIndex === -1) return [];
        var query = (u || "").slice(qIndex + 1);
        if (!query) return [];
        return query.split("&").filter(Boolean).map(function (pair) {
          var kv = pair.split("=");
          return { key: decodeURIComponent(kv[0] || ""), value: decodeURIComponent(kv[1] || "") };
        });
      }
    }

    function stringifyUrl(base, params) {
      try {
        var u = new URL(base);
        u.search = "";
        params.forEach(function (p) { if (p.key) u.searchParams.append(p.key, p.value || ""); });
        return u.toString();
      } catch (_) {
        var hashIndex = base.indexOf("#");
        var hash = "";
        if (hashIndex !== -1) { hash = base.slice(hashIndex); base = base.slice(0, hashIndex); }
        var baseNoQuery = base.split("?")[0];
        var q = params.filter(function (p) { return p.key; }).map(function (p) {
          return encodeURIComponent(p.key) + "=" + encodeURIComponent(p.value || "");
        }).join("&");
        return baseNoQuery + (q ? ("?" + q) : "") + hash;
      }
    }

    function renderPartsText(u) {
      var text = (u || "").replace(/\?/gi, "\n\? ").replace(/\&/gi, "\n\& ");
      setText("#parts", text);
      return text;
    }

    function renderRows(u) {
      var rowsEl = document.querySelector("#query-rows");
      if (!rowsEl) return [];
      rowsEl.innerHTML = "";
      var params = parseUrlParams(u);
      params.forEach(function (p, idx) {
        var row = document.createElement("div");
        row.className = "row";
        row.innerHTML = '<input class="kv" data-field="key" placeholder="name" value="' + (p.key || "") + '" />' +
                        '<input class="kv" data-field="value" placeholder="value" value="' + (p.value || "") + '" />' +
                        '<button class="btn icon danger" data-action="remove">del</button>';
        rowsEl.appendChild(row);
      });
      return params;
    }

    var urlInput = document.querySelector("#url-input");
    if (urlInput) {
      urlInput.value = url;
    }

    var parts = renderPartsText(url);
    var params = renderRows(url);

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
        var currentParts = renderPartsText(currentUrl);
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
        renderPartsText(value);
        renderRows(value);
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

    // Add/remove and live editing handlers
    var rowsContainer = document.querySelector("#query-rows");
    var addBtn = document.querySelector("#add-param");

    function getParamsFromRows() {
      var rows = Array.prototype.slice.call(document.querySelectorAll('#query-rows .row'));
      return rows.map(function (row) {
        var keyInput = row.querySelector('input.kv[data-field="key"]');
        var valInput = row.querySelector('input.kv[data-field="value"]');
        return { key: (keyInput && keyInput.value) || "", value: (valInput && valInput.value) || "" };
      });
    }

    function syncUrlFromParams() {
      var base = (urlInput && urlInput.value) || url;
      // Preserve base without query
      var baseNoQuery = base.split('?')[0] + (base.includes('#') ? ('#' + base.split('#')[1]) : '');
      var next = stringifyUrl(base, getParamsFromRows());
      if (urlInput) urlInput.value = next;
      renderPartsText(next);
    }

    if (rowsContainer) {
      rowsContainer.addEventListener('input', function (e) {
        if (e.target && e.target.classList.contains('kv')) {
          syncUrlFromParams();
        }
      });
      rowsContainer.addEventListener('click', function (e) {
        var t = e.target;
        if (t && t.matches('button[data-action="remove"]')) {
          var row = t.parentElement;
          if (row && row.parentElement) {
            row.parentElement.removeChild(row);
            syncUrlFromParams();
          }
        }
      });
    }

    if (addBtn) {
      addBtn.addEventListener('click', function () {
        var rowsEl = document.querySelector('#query-rows');
        var row = document.createElement('div');
        row.className = 'row';
        row.innerHTML = '<input class="kv" data-field="key" placeholder="name" />' +
                        '<input class="kv" data-field="value" placeholder="value" />' +
                        '<button class="btn icon danger" data-action="remove">del</button>';
        if (rowsEl) rowsEl.appendChild(row);
        syncUrlFromParams();
      });
    }

    // Bottom Load URL button
    var loadBtn = document.querySelector('#load-url');
    if (loadBtn) {
      loadBtn.addEventListener('click', function () {
        var targetUrl = (urlInput && urlInput.value.trim()) || url;
        if (!targetUrl) {
          setStatus('URL is empty');
          return;
        }
        try {
          if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = 'https://' + targetUrl;
          }
          chrome.tabs.update(activeTabId, { url: targetUrl });
          setStatus('Loading...');
        } catch (e3) {
          setStatus('Failed to load URL');
        }
      });
    }
  } catch (err) {
    setStatus("An error occurred while processing the URL.");
  }
});

