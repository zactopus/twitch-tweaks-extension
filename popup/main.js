/* global browser */

async function sendHardRefreshMessage() {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!tab) {
    return;
  }

  browser.tabs.sendMessage(tab.id, {
    hardRefresh: true,
  });
}

const BROWSER_SCOPE = "sync";
const BROWSER_STORAGE_KEY = "zactopus-twitch-tweaks";

async function getSettings() {
  const results = await browser.storage[BROWSER_SCOPE].get(
    BROWSER_STORAGE_KEY,
  );
  const settings = results[BROWSER_STORAGE_KEY];
  if (!settings) {
    return {};
  }

  return settings;
}

async function setSettings(settings) {
  return browser.storage[BROWSER_SCOPE].set({
    [BROWSER_STORAGE_KEY]: settings,
  });
}

function createSettingsElement(key, setting) {
  const settingsElement = document.createElement("label");

  const settingsInputElement = document.createElement("input");
  settingsInputElement.type = "checkbox";
  settingsInputElement.id = key;
  settingsInputElement.name = key;
  if (setting.value === true) {
    settingsInputElement.checked = true;
  }

  settingsInputElement.addEventListener("change", async () => {
    const settings = await getSettings();
    await setSettings({
      ...settings,
      [key]: {
        ...setting,
        value: settingsInputElement.checked,
      },
    });

    if (setting.hardRefresh) {
      await sendHardRefreshMessage();
    }
  });

  const settingsTextElement = document.createElement("span");
  settingsTextElement.innerText = setting.name;

  settingsElement.appendChild(settingsInputElement);
  settingsElement.appendChild(settingsTextElement);

  document.querySelector("main").appendChild(settingsElement);
}

(async function () {
  const settings = await getSettings();

  Object.keys(settings).forEach((settingKey) => {
    createSettingsElement(settingKey, settings[settingKey]);
  });
})();
