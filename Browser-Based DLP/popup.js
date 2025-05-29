const toggles = {
  screenshotToggle: false,
  clipboardToggle: false,
  fileTransferToggle: false,
  downloadToggle: false,
  inactivityToggle: false,
  blockSocialToggle: false,
  alertToggle: false
  
};

// Load saved settings
document.addEventListener("DOMContentLoaded", () => {
  for (let key in toggles) {
    const checkbox = document.getElementById(key);
    if (!checkbox) continue; // ✅ Skip if element is not found

    chrome.storage.local.get([key], (result) => {
      checkbox.checked = result[key] || false;
    });

    checkbox.addEventListener("change", () => {
      chrome.storage.local.set({ [key]: checkbox.checked });
    });
  }
});
