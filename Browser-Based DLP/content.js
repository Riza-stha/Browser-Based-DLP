// Initial toggle setup
chrome.storage.local.get([
  "clipboardToggle",
  "screenshotToggle",
  "fileTransferToggle",
  "downloadToggle",
  "alertToggle",
  "inactivityToggle"
], (toggles) => {
  console.log("Initial toggle state:", toggles);
  if (toggles.clipboardToggle) enableClipboardBlocking();
  if (toggles.screenshotToggle) enableScreenshotBlocking();
  if (toggles.fileTransferToggle) enableFileTransferRestriction();
  if (toggles.downloadToggle) enableDownloadBlocking();
  if (toggles.alertToggle) enableFormAlert();
  if (toggles.inactivityToggle) enableInactivityLogout();
});

// Listen for toggle changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local") {
    if ("clipboardToggle" in changes) {
      console.log("Clipboard toggle changed:", changes.clipboardToggle.newValue);
      changes.clipboardToggle.newValue ? enableClipboardBlocking() : disableClipboardBlocking();
    }
    if ("screenshotToggle" in changes) {
      console.log("Screenshot toggle changed:", changes.screenshotToggle.newValue);
      changes.screenshotToggle.newValue ? enableScreenshotBlocking() : disableScreenshotBlocking();
    }
    if ("fileTransferToggle" in changes) {
      console.log("File transfer toggle changed:", changes.fileTransferToggle.newValue);
      changes.fileTransferToggle.newValue ? enableFileTransferRestriction() : disableFileTransferRestriction();
    }
    if ("downloadToggle" in changes) {
      console.log("Download toggle changed:", changes.downloadToggle.newValue);
      changes.downloadToggle.newValue ? enableDownloadBlocking() : disableDownloadBlocking();
    } 
    if ("alertToggle" in changes) {
      console.log("Alert toggle changed:", changes.alertToggle.newValue);
      changes.alertToggle.newValue ? enableFormAlert() : disableFormAlert();
    }
    if ("inactivityToggle" in changes) {
      console.log("Inactivity toggle changed:", changes.inactivityToggle.newValue);
      changes.inactivityToggle.newValue ? enableInactivityLogout() : disableInactivityLogout();
    }
  }
});

// Clipboard Blocking
function clipboardHandler(e) {
  console.log("Clipboard action blocked:", e.type);
  if (e.type === "copy") {
    alert("Copying is disabled on this page.");
  } else if (e.type === "cut") {
    alert("Cutting is disabled on this page.");
  } else if (e.type === "paste") {
    alert("Pasting is disabled on this page.");
  }
  e.preventDefault();
}

function enableClipboardBlocking() {
  console.log("Clipboard blocking enabled");
  document.addEventListener("copy", clipboardHandler);
  document.addEventListener("cut", clipboardHandler);
  document.addEventListener("paste", clipboardHandler);
}

function disableClipboardBlocking() {
  console.log("Clipboard blocking disabled");
  document.removeEventListener("copy", clipboardHandler);
  document.removeEventListener("cut", clipboardHandler);
  document.removeEventListener("paste", clipboardHandler);
}


//Screenshot Blocking
function screenshotHandler(e) {
  console.log("Screenshot action blocked:", e.key);
  if (e.key === "PrintScreen" || (e.ctrlKey && e.key === "p")) {
    alert("Screenshots are blocked!");
    e.preventDefault();
  }
}

function enableScreenshotBlocking() {
  console.log("Screenshot blocking enabled");
  document.addEventListener("keydown", screenshotHandler);
}

function disableScreenshotBlocking() {
  console.log("Screenshot blocking disabled");
  document.removeEventListener("keydown", screenshotHandler);
}


//File Transfer Blocking
let fileInputObserver;
let dropZoneObserver;
let fileTransferEnabled = true;

function blockFileUploads() {
  const fileInputs = document.querySelectorAll('input[type="file"]');
  fileInputs.forEach(input => {
    if (input.dataset.restricted === "true") return;
    input.dataset.restricted = "true"; 

    input.addEventListener('click', (e) => {
      if (!fileTransferEnabled) return;
      e.preventDefault();
      alert("File uploads are restricted by the extension.");
    });
  });
}

function blockWeTransferDropZone() {
  const dropZone = document.querySelector('[data-testid="drop-zone"]');
  if (!dropZone) return;

  if (dropZone.dataset.restricted === "true") return;

  dropZone.dataset.restricted = "true"; 

  dropZone.addEventListener('dragover', e => {
    if (!fileTransferEnabled) return;
    e.preventDefault();
    e.stopPropagation();
  }, { capture: true, passive: false });
  
  dropZone.addEventListener('drop', e => {
    if (!fileTransferEnabled) return;
    e.preventDefault();
    e.stopPropagation();
    alert("File upload through drag and drop are restricted by the extension.");
  }, { capture: true, passive: false });
  
  dropZone.addEventListener('click', e => {
    if (!fileTransferEnabled) return;
    e.stopPropagation();
    e.preventDefault();
    alert("Click to upload is restricted by the extension.");
  }, true);
  
}

function enableFileTransferRestriction() {
  console.log("File transfer restriction enabled");
  fileTransferEnabled = true;
  blockFileUploads();
  fileInputObserver = new MutationObserver(() => {
    blockFileUploads();
  });
  fileInputObserver.observe(document.body, { childList: true, subtree: true });

  blockWeTransferDropZone();
  dropZoneObserver = new MutationObserver(() => {
    blockWeTransferDropZone();
  });
  dropZoneObserver.observe(document.body, { childList: true, subtree: true });
}

function disableFileTransferRestriction() {
  console.log("File transfer restriction disabled");
  fileTransferEnabled = false;

  if (fileInputObserver) fileInputObserver.disconnect();
  if (dropZoneObserver) dropZoneObserver.disconnect();
}


// Function to block Gmail's download buttons for attachments
let downloadObserver;
let downloadBlockingEnabled = true;

function blockGmailDownloadButtons() {
  const downloadButtons = document.querySelectorAll('button[aria-label^="Download attachment"]');

  downloadButtons.forEach(button => {
    if (!button.dataset.restricted) {
      button.addEventListener('click', (e) => {
        if (!downloadBlockingEnabled) return;
        e.preventDefault();
        e.stopPropagation();
        alert("Downloading attachments is restricted.");
      });
      // Prevent duplicate listeners
      button.dataset.restricted = "true";
    }
  });
}

function enableDownloadBlocking() {
  console.log("Download blocking enabled");
  downloadBlockingEnabled = true;
  blockGmailDownloadButtons();
  downloadObserver = new MutationObserver(blockGmailDownloadButtons);
  downloadObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function disableDownloadBlocking() {
  console.log("Download blocking disabled");
  downloadBlockingEnabled = false;
  if (downloadObserver) {
    downloadObserver.disconnect();
    downloadObserver = null;
  }
}



// Form Alert
function formAlertHandler(e) {
  console.log("Form submission alert triggered");
  alert("Suspicious Activity Detected: A form is being submitted!");
}

function enableFormAlert() {
  console.log("Form alert enabled");
  document.addEventListener("submit", formAlertHandler, true);
}

function disableFormAlert() {
  console.log("Form alert disabled");
  document.removeEventListener("submit", formAlertHandler, true);
}
//Inactivity Logot
let logoutTimer;

function startLogoutTimer() {
  clearTimeout(logoutTimer);
  logoutTimer = setTimeout(() => {
    console.log("Logging out from Gmail...");
    window.location.href = "https://accounts.google.com/Logout";
  }, 180000); // 3 minutes
}

function enableInactivityLogout() {
  document.addEventListener("mousemove", startLogoutTimer);
  document.addEventListener("keydown", startLogoutTimer);
  startLogoutTimer();
}

function disableInactivityLogout() {
  clearTimeout(logoutTimer);
  document.removeEventListener("mousemove", startLogoutTimer);
  document.removeEventListener("keydown", startLogoutTimer);
}
