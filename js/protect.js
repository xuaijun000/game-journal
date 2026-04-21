(function () {
  "use strict";

  var DEVTOOLS_GAP = 160;
  var devtoolsTriggered = false;

  function isProtectedCombo(event) {
    var key = (event.key || "").toLowerCase();
    var ctrlOrMeta = event.ctrlKey || event.metaKey;

    if (key === "f12") {
      return true;
    }

    if (!ctrlOrMeta) {
      return false;
    }

    return key === "u" || key === "s" || key === "a";
  }

  function blockContextMenu() {
    document.addEventListener("contextmenu", function (event) {
      event.preventDefault();
    });
  }

  function blockShortcuts() {
    document.addEventListener(
      "keydown",
      function (event) {
        if (isProtectedCombo(event)) {
          event.preventDefault();
          event.stopPropagation();
        }
      },
      true
    );
  }

  function hardenImages() {
    var markUndraggable = function (img) {
      img.setAttribute("draggable", "false");
    };

    var images = document.querySelectorAll("img");
    images.forEach(markUndraggable);

    document.addEventListener(
      "dragstart",
      function (event) {
        if (event.target && event.target.tagName === "IMG") {
          event.preventDefault();
        }
      },
      true
    );

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (!node || node.nodeType !== 1) {
            return;
          }
          if (node.tagName === "IMG") {
            markUndraggable(node);
            return;
          }
          if (node.querySelectorAll) {
            node.querySelectorAll("img").forEach(markUndraggable);
          }
        });
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function renderDevtoolsWarning() {
    var overlay = document.getElementById("pf-devtools-warning");
    if (overlay) {
      overlay.style.display = "flex";
      return;
    }

    overlay = document.createElement("div");
    overlay.id = "pf-devtools-warning";
    overlay.innerHTML =
      '<div style="max-width:580px;padding:24px 28px;border:1px solid rgba(255,92,92,.35);border-radius:12px;background:#111a1b;color:#f9e1d8;font-family:\'Noto Sans SC\',sans-serif;box-shadow:0 16px 48px rgba(0,0,0,.45);text-align:center;">' +
      '<h2 style="margin:0 0 10px;font-size:22px;letter-spacing:.03em;color:#ffb3a3;">PIXELFISH 安全提示</h2>' +
      '<p style="margin:0 0 8px;font-size:14px;line-height:1.8;">检测到开发者工具已开启。本站内容受版权保护，请勿抓取、复制或未授权转载。</p>' +
      '<p style="margin:0;font-size:12px;line-height:1.8;color:#8ea6a7;">© 2024-2026 PIXELFISH 版权所有</p>' +
      "</div>";
    overlay.style.cssText =
      "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(9,12,13,.95);z-index:2147483647;padding:18px;";
    document.body.appendChild(overlay);
  }

  function detectDevtools() {
    if (devtoolsTriggered) {
      return;
    }

    var widthGap = Math.abs(window.outerWidth - window.innerWidth);
    var heightGap = Math.abs(window.outerHeight - window.innerHeight);
    var looksOpen = widthGap > DEVTOOLS_GAP || heightGap > DEVTOOLS_GAP;

    if (looksOpen) {
      devtoolsTriggered = true;
      renderDevtoolsWarning();
    }
  }

  function startDevtoolsMonitor() {
    window.addEventListener("resize", detectDevtools, { passive: true });
    window.addEventListener("focus", detectDevtools, { passive: true });
    setInterval(detectDevtools, 1200);
  }

  function printConsoleNotice() {
    console.log(
      "%cPIXELFISH%c 版权所有 © 2024-2026",
      "background:#111a1b;color:#7ecdc4;padding:6px 12px;border-radius:4px;font-size:16px;font-weight:700;",
      "color:#ffb3a3;font-size:13px;font-weight:600;"
    );
    console.log(
      "%c未经授权禁止转载、抓取、镜像或用于商业用途。",
      "color:#f7d6cf;font-size:12px;font-weight:600;"
    );
  }

  function initProtection() {
    blockContextMenu();
    blockShortcuts();
    hardenImages();
    startDevtoolsMonitor();
    printConsoleNotice();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProtection);
  } else {
    initProtection();
  }
})();
