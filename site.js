// Keeps the page on the current release without a rebuild.
//
// The manifest is the same version.json the app's updater reads. GitHub's
// contents API is authoritative and CORS-enabled, so it is tried first;
// jsDelivr caches @main and can serve the previous manifest for a while after a
// release, so it is only a fallback. When both fail the baked-in numbers stay.
(function () {
  "use strict";

  var REPO = "lolcaken/the-moath-macro";
  var SOURCES = [
    {
      url: "https://api.github.com/repos/" + REPO + "/contents/version.json?ref=main",
      contents: true
    },
    {
      url: "https://cdn.jsdelivr.net/gh/" + REPO + "@main/version.json",
      contents: false
    }
  ];

  var toast = document.getElementById("toast");
  var toastTimer = 0;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("show");
    }, 1800);
  }

  function formatSize(bytes) {
    if (!bytes || typeof bytes !== "number") return null;
    return (bytes / 1e6).toFixed(2) + " MB";
  }

  function shortSha(sha) {
    if (!sha || sha.length < 16) return sha;
    return sha.slice(0, 8) + "\u2026" + sha.slice(-7);
  }

  function setText(name, value) {
    if (!value) return;
    var nodes = document.querySelectorAll('[data-manifest="' + name + '"]');
    for (var i = 0; i < nodes.length; i += 1) nodes[i].textContent = value;
  }

  function setHref(id, url) {
    var node = document.getElementById(id);
    if (node && url) node.href = url;
  }

  function apply(manifest) {
    if (!manifest || !manifest.assets) return;
    var portable = manifest.assets["windows-x64"];
    var setup = manifest.assets["windows-x64-setup"];

    setText("version", "v" + manifest.version);
    if (portable) {
      setText("size-zip", formatSize(portable.size));
      setText("sha", shortSha(portable.sha256));
      if (portable.url) {
        setHref("dl-zip", portable.url);
        setHref("bar-download", portable.url);
      }
      if (portable.sha256) document.body.dataset.sha = portable.sha256;
    }
    if (setup) {
      setText("size-setup", formatSize(setup.size));
      if (setup.url) setHref("dl-setup", setup.url);
    }
  }

  function decodeContents(payload) {
    if (!payload || !payload.content) throw new Error("no content");
    var binary = window.atob(payload.content.replace(/\n/g, ""));
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return JSON.parse(new TextDecoder("utf-8").decode(bytes));
  }

  function fetchManifest() {
    if (!("fetch" in window)) return;

    var next = function (index) {
      if (index >= SOURCES.length) return;
      var source = SOURCES[index];
      fetch(source.url, { cache: "no-cache" })
        .then(function (res) {
          if (!res.ok) throw new Error("manifest " + res.status);
          return res.json();
        })
        .then(function (payload) {
          var manifest = source.contents ? decodeContents(payload) : payload;
          if (!manifest || !manifest.version) throw new Error("bad manifest");
          apply(manifest);
        })
        .catch(function () {
          next(index + 1);
        });
    };

    next(0);
  }

  function copyChecksum() {
    var sha = document.body.dataset.sha;
    if (!sha) {
      var node = document.querySelector('[data-manifest="sha"]');
      sha = node ? node.textContent : "";
    }
    if (!sha) return;

    var done = function () { showToast("SHA-256 copied"); };
    var failed = function () { showToast("Copy failed"); };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(sha).then(done, failed);
      return;
    }
    var area = document.createElement("textarea");
    area.value = sha;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand("copy") ? done() : failed();
    } catch (error) {
      failed();
    }
    document.body.removeChild(area);
  }

  var copyButton = document.getElementById("copy-sha");
  if (copyButton) copyButton.addEventListener("click", copyChecksum);

  fetchManifest();
})();
