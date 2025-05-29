
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.blockSocialToggle) {
      const newVal = changes.blockSocialToggle.newValue;
      chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: newVal ? ["ruleset_1"] : [],
        disableRulesetIds: newVal ? [] : ["ruleset_1"]
      });
    }
  });
  