/* global browser */

function observe(targetNode, callback) {
  // Create an observer instance linked to the callback function
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        callback();
      }
    }
  });

  // Start observing the target node for configured mutations
  observer.observe(targetNode, {
    // attributes: true,
    childList: true,
    subtree: true,
  });
}

function getParentElementWithClass(element, className) {
  if (element.classList.contains(className)) {
    return element;
  }

  if (!element.parentElement) {
    return null;
  }

  return getParentElementWithClass(element.parentNode, className);
}

const logger = (...args) => {
  return console.log("[zactopus' Twitch Tweaks]", ...args);
};

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

async function initialiseSettings() {
  // clear when debugging
  //   await browser.storage[BROWSER_SCOPE].clear();

  const INITIAL_SETTINGS = {
    alphabetiseFollowedChannels: {
      name: "Followed Channels in Alphabetical Order",
      value: true,
      hardRefresh: true,
    },
    simplifyTwitch: {
      name: "Simplify Twitch Aesthetically",
      value: true,
    },
    simplifySideBar: {
      name: "Simplify sidebar",
      value: true,
    },
    simplifyUserDropdown: {
      name: "Simplify User Dropdown",
      value: true,
    },
    removeHypeTrain: {
      name: "Remove Hype Train",
      value: false,
    },
    removePrime: {
      name: "Remove Amazon Prime stuff",
      value: true,
    },
    removeBits: {
      name: "Remove references to bitties",
      value: false,
    },
    removeSubscriptions: {
      name: "Remove references to subscriptions",
      value: false,
    },
    removeSubscriptionsBadges: {
      name: "Remove subscription badges",
      value: false,
    },
    removeViewCounts: {
      name: "Remove view counts",
      value: true,
    },
    removeAnnoyingChatBadges: {
      name: "Remove annoying chat badges",
      value: true,
    },
    rainbowLogo: {
      name: "Rainbow Logo",
      value: false,
    },
    pinkMode: {
      name: "Pink Mode",
      value: false,
    },
  };

  const settings = await getSettings();

  const emptySettings =
    !settings || Object.keys(settings).length === 0;
  if (emptySettings) {
    await setSettings(INITIAL_SETTINGS);
  }

  return getSettings();
}

const DEFAULT_STYLES = `
  [data-zactopus-twitch-tweaks-hidden="true"], /* my custom js hiding thing */
  .community-highlight-stack__backlog-card:empty { /* hide empty community highlight container */
      display: none !important;
  }
`;

const SETTING_STYLES_MAP = {
  alphabetiseFollowedChannels: `
    .side-nav-show-more-toggle__button { /* show more buttons bottom left */ 
        display: none !important;
    }
  `,
  removeViewCounts: `  
    [data-a-target="side-nav-live-status"], /* hide viewer counts in nav */
    .tw-media-card-stat, /* remove view count on media card */
    [d="M5 7a5 5 0 116.192 4.857A2 2 0 0013 13h1a3 3 0 013 3v2h-2v-2a1 1 0 00-1-1h-1a3.99 3.99 0 01-3-1.354A3.99 3.99 0 017 15H6a1 1 0 00-1 1v2H3v-2a3 3 0 013-3h1a2 2 0 001.808-1.143A5.002 5.002 0 015 7zm5 3a3 3 0 110-6 3 3 0 010 6z"], /* viewer count icon */
    [data-a-target="animated-channel-viewers-count"] { /* viewer count */
    
        display: none !important;
    }
  `,
  removeSubscriptions: `
    [data-test-selector="subscribe-button__dropdown"], /* sub button */
    .tw-halo__indicator, /* hide subs in chat */
    .channel-leaderboard, /* leaderboard things in chat */
    /* sub gifts */
    .chat-badge[aria-label="Sub Gifter badge"] {
        display: none !important;
    }
  `,
  removeSubscriptionsBadges: `
    .chat-badge[aria-label*='Subscriber'] { /* sub badges */
        display: none !important;
    }
  `,
  removeBits: `
    [aria-label="Vote with Bits"], /* no vote with bits for poll */
    .channel-leaderboard, /* leaderboard things in chat */
    [data-a-target="top-nav-get-bits-button"], /* get bits button */
    [aria-label="Bits"][data-a-target="bits-button"], 
    /* bitties badges */
    .chat-badge[aria-label*="Bits Leader "],
    .chat-badge[aria-label*="cheer "] {
        display: none !important;
    }
  `,
  removePrime: `
    /* amazon prime */
    .chat-badge[aria-label="Prime Gaming badge"],
    .extension-view__iframe, /* prime loot thing */
    .top-nav__prime { /* navigation prime notifications */
        display: none !important;
    }
  `,
  removeAnnoyingChatBadges: `
    /* turbo */
    .chat-badge[aria-label="Turbo badge"] {
        display: none !important;
    }
  `,
  simplifyUserDropdown: `
    [class*="ScDropDownMenuSeparator-sc-"],
    [data-test-selector="user-menu-dropdown__friends-link"],
    [data-test-selector="user-menu-dropdown__subscriptions-link"],
    [data-a-target="inventory-dropdown-link"],
    [data-test-selector="user-menu-dropdown__payments-link"],
    [data-test-selector="user-menu-dropdown__language-link"],
    [data-a-target="consent-dropdown-menu"],
    [data-test-selector="user-menu-dropdown__avatar"],
    [data-test-selector="user-menu-dropdown__display-name"],
    [data-a-target="online-status"] {
        display: none !important;
    }
  `,
  removeHypeTrain: `    
    .chat-badge[aria-label*="Hype Train Conductor"], /* hype train badge */
    [data-zactopus-twitch-tweaks-hype-train="true"],
    .hype-train-fail__container { 
        display: none !important;
    }
  `,
  rainbowLogo: `
    /* gay logo animation */
    .tw-animated-glitch-logo {
        animation: rainbowRotate 5s linear infinite;
    }

    [points="26 25 30 21 30 10 14 10 14 25 18 25 18 29 22 25"] {
        fill: var(--color-background-base);
    }

    @keyframes rainbowRotate {
        from {
            filter: hue-rotate(0deg);
        }
        to {
            filter: hue-rotate(360deg);
        }
    }
  `,
  pinkMode: `
    /* pink colours */
    .tw-root--theme-dark,
    :root {
        --color-accent: #e082e3;
        --color-twitch-purple: #e082e3;
        --color-twitch-purple-1: #471248;
        --color-twitch-purple-2: #5e1c60;
        --color-twitch-purple-3: #792c7b;
        --color-twitch-purple-4: #903d93;
        --color-twitch-purple-5: #9f48a2;
        --color-twitch-purple-6: #b056b3;
        --color-twitch-purple-7: #b45bb7;
        --color-twitch-purple-8: #cb6ece;
        --color-twitch-purple-9: #e082e3;
        --color-twitch-purple-10: #e7a4ea;
        --color-twitch-purple-11: #f7cef9;
        --color-twitch-purple-12: #e3bde6;
        --color-twitch-purple-13: #f7c9f9;
        --color-twitch-purple-14: #f1ccf2;
        --color-twitch-purple-15: #ebc8ec;
        /* the following are alpha versions of --color-twitch-purple-7 */
        --color-opac-p-1: rgba(139, 41, 142, 0.05);
        --color-opac-p-2: rgba(139, 41, 142, 0.1);
        --color-opac-p-3: rgba(139, 41, 142, 0.15);
        --color-opac-p-4: rgba(139, 41, 142, 0.2);
        --color-opac-p-5: rgba(139, 41, 142, 0.25);
        --color-opac-p-6: rgba(139, 41, 142, 0.3);
        --color-opac-p-7: rgba(139, 41, 142, 0.4);
        --color-opac-p-8: rgba(139, 41, 142, 0.5);
        --color-opac-p-9: rgba(139, 41, 142, 0.6);
        --color-opac-p-10: rgba(139, 41, 142, 0.7);
        --color-opac-p-11: rgba(139, 41, 142, 0.75);
        --color-opac-p-12: rgba(139, 41, 142, 0.8);
        --color-opac-p-13: rgba(139, 41, 142, 0.85);
        --color-opac-p-14: rgba(139, 41, 142, 0.9);
        --color-opac-p-15: rgba(139, 41, 142, 0.95);

        --color-text-button-primary: black;
    }

    .tw-root--theme-dark .navigation-link.active,
    .tw-root--theme-dark .navigation-link:hover {
        color: var(--color-twitch-purple-9);
    }

    .tw-root--theme-dark .navigation-link__active-indicator {
        background: var(--color-twitch-purple-8);
    }
  `,
  simplifyTwitch: `
    /* 'stream chat' header */
    [data-test-selector="chat-room-header-label"],
    /* channel point window header */
    #channel-points-reward-center-header h5,
    /* live badge on video player */
    .tw-channel-status-text-indicator,
    /* share button under stream */ 
    [data-a-target="share-button"], 
    /* remove annoying navbar links */
    [data-a-target="esports-link"],
    [data-a-target="music-link"],
    [data-a-target="ellipsis-button"],
    .navigation-link__left-border  {
        display: none !important;
    }

    /* chat */
    /* remove the : */
    [data-test-selector="chat-message-separator"] {
        display: none !important;
    }
    .chat-line__username-container {
        margin-right: 0.5em;
    }

    /* remove icon next to chat */
    .chat-input__badge-carousel {
        display: none !important;
    }
    [data-test-selector="chat-input"] {
        padding-left: 1rem !important;
    }
    
    /* nav shadow */
    .top-nav__menu {
        box-shadow: 0 5px 0 rgba(0, 0, 0, 0.15) !important;
    }

    /* remove placeholder from search */
    [aria-label="Search Input"]::placeholder {
        color: transparent !important;
    }

    /* search box border */
    .tw-combo-input__input {
        margin-right: 0 !important;
    }

    /* stream borders */
    .stream-chat-header {
        border-bottom: none !important;
    }
    .channel-root__right-column > div {
        border-left: none !important;
    }
    .channel-info-content > div > div {
        border-top: none !important;
    }
    [data-test-selector="extension_panel_selector"] > div {
        border: none !important;
    }
  `,
  simplifySideBar: `
    [aria-label="Online Friends"], /* friends section */ 
    .side-nav-search-input, /* friends search bar */ 
    .find-me.tw-relative, /* recommendations */
    [aria-label="Recommended Channels"] { /* recommend channels */
        display: none !important;
    }
  `,
};

function updateStylesElement(styles) {
  logger("Updating styles");

  const STYLES_ELEMENT_ID = "zactopus-twitch-tweaks-styles";
  const existingStylesElement =
    document.getElementById(STYLES_ELEMENT_ID);

  if (existingStylesElement) {
    existingStylesElement.remove();
  }

  const stylesElement = document.createElement("style");
  stylesElement.id = STYLES_ELEMENT_ID;
  stylesElement.appendChild(document.createTextNode(styles));
  document.body.appendChild(stylesElement);
}

async function updateStyles() {
  const settings = await getSettings();

  let styles = DEFAULT_STYLES;
  Object.keys(settings).forEach((settingKey) => {
    const setting = settings[settingKey];
    const isSettingEnabled = setting && setting.value === true;
    const settingStyles = SETTING_STYLES_MAP[settingKey];
    if (isSettingEnabled && settingStyles) {
      styles += settingStyles;
    }
  });

  updateStylesElement(styles);
}

function alphabetiseFollowedChannels({
  categoriesToRemove = [],
} = {}) {
  let currentFollowedChannelsUsernames = [];

  function areUpdatedFollowerChannelSame(followedChannels) {
    const followedChannelsUsernames = followedChannels.map(
      (channel) => {
        return channel.username;
      },
    );
    return (
      currentFollowedChannelsUsernames.toString() ===
      followedChannelsUsernames.toString()
    );
  }

  observe(document.body, () => {
    const sideNavTransitionGroupElement = document.querySelector(
      ".side-nav-section .tw-transition-group",
    );

    if (sideNavTransitionGroupElement) {
      const followedChannelsElements = [
        ...document.querySelectorAll(
          '[data-test-selector="followed-channel"]',
        ),
      ];

      // no channels
      if (followedChannelsElements.length === 0) {
        logger("No channels");
        return;
      }

      const followedChannels = followedChannelsElements.map(
        (element) => {
          const username = element
            .getAttribute("href")
            .replace("/", "");
          return { element, username };
        },
      );

      if (areUpdatedFollowerChannelSame(followedChannels)) {
        return;
      }
      currentFollowedChannelsUsernames = followedChannels
        .map((j) => j.username)
        .toString();

      // hide any removed categories
      followedChannels.forEach((channel) => {
        const category = channel.element.querySelector(
          '[data-a-target="side-nav-game-title"]',
        )?.innerText;
        const isntCategoryToBeRemoved =
          !categoriesToRemove.includes(category);

        if (!isntCategoryToBeRemoved) {
          channel.element.setAttribute(
            "data-zactopus-twitch-tweaks",
            "true",
          );
          channel.element.setAttribute(
            "data-zactopus-twitch-tweaks-hidden",
            "true",
          );
        }
      });

      const filteredFollowedChannels = followedChannels.filter(
        (channel) => {
          const hasOfflineClassName = channel.element.querySelector(
            ".side-nav-card__avatar--offline",
          );
          return !hasOfflineClassName;
        },
      );

      if (filteredFollowedChannels.length === 0) {
        logger("No online channels");
        return;
      }

      const sortedFollowedChannels = filteredFollowedChannels.sort(
        (a, b) => {
          return a.username.localeCompare(b.username);
        },
      );

      sortedFollowedChannels.reverse().forEach((channel) => {
        const element = getParentElementWithClass(
          channel.element,
          "tw-transition",
        );
        if (element) {
          element.setAttribute("data-zactopus-twitch-tweaks", "true");
          sideNavTransitionGroupElement.prepend(element);
        }
      });

      logger("Updated channels", currentFollowedChannelsUsernames);
    }
  });
}

function redirectHomePageToFollowingPage() {
  window.addEventListener("load", () => {
    if (window.location.href === "https://www.twitch.tv/") {
      logger("Redirected to following/live page");
      // redirect to live following page
      window.location.href =
        window.location.origin + "/directory/following/live";
    }
  });

  observe(document.body, () => {
    const followingLinkElement = document.querySelector(
      '[data-test-selector="top-nav__following-link"]',
    );
    const homepageLinkElements = [
      ...document.querySelectorAll('[href="/"]'),
    ];

    if (followingLinkElement && homepageLinkElements.length > 0) {
      homepageLinkElements.forEach((element) => {
        element.setAttribute(
          "data-a-target",
          followingLinkElement.getAttribute("data-a-target"),
        );
        element.href = followingLinkElement.href;
        element.addEventListener("click", () => {
          logger("Redirected to following/live page");
          // redirect to live following page
          window.location.href =
            window.location.origin + "/directory/following/live";
        });
      });
    }
  });
}

function removeHypeTrain() {
  observe(document.body, () => {
    const communityHighlightElements = [
      ...document.querySelectorAll(".community-highlight"),
    ];

    if (communityHighlightElements.length > 0) {
      communityHighlightElements.forEach((element) => {
        const hasInProgressHypeTrain = element.querySelector(
          ".hype-train-progress-bar__container",
        );
        if (hasInProgressHypeTrain) {
          logger("Removing hype train");
          element.setAttribute(
            "data-zactopus-twitch-tweaks-hype-train",
            "true",
          );
        }
      });
    }
  });
}

function expandShowMore() {
  observe(document.body, () => {
    const offlineUserElements = [
      ...document.querySelectorAll(
        '[data-a-target="side-nav-live-status"]',
      ),
    ].filter((element) => element.innerText === "Offline");
    const hasOfflineUserInSidebar = offlineUserElements.length > 0;
    const showMoreLinkElement = document.querySelector(
      '[data-a-target="side-nav-show-more-button"]',
    );
    if (showMoreLinkElement && !hasOfflineUserInSidebar) {
      logger("Expanding followed channels");
      showMoreLinkElement.click();
    }
  });
}

function hideOfflineChannels() {
  observe(document.body, () => {
    const offlineUserElements = [
      ...document.querySelectorAll(
        '[data-a-target="side-nav-live-status"]',
      ),
    ].filter((element) => element.innerText === "Offline");
    const hasOfflineUserInSidebar = offlineUserElements.length > 0;

    if (hasOfflineUserInSidebar) {
      logger("Hiding offline users");
      offlineUserElements.forEach((element) => {
        const parentElement = getParentElementWithClass(
          element,
          "tw-transition",
        );
        if (parentElement) {
          parentElement.setAttribute(
            "data-zactopus-twitch-tweaks",
            "true",
          );
          parentElement.setAttribute(
            "data-zactopus-twitch-tweaks-hidden",
            "true",
          );
        }
      });
    }
  });
}

(async function () {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  logger("Loading...");

  const settings = await initialiseSettings();

  updateStyles();

  redirectHomePageToFollowingPage();

  if (settings.alphabetiseFollowedChannels.value === true) {
    expandShowMore();
    hideOfflineChannels();
    alphabetiseFollowedChannels({
      categoriesToRemove: ["Dead by Daylight"],
    });
  }

  removeHypeTrain();

  browser.storage.onChanged.addListener(() => {
    updateStyles();
  });

  browser.runtime.onMessage.addListener((message) => {
    if (message.hardRefresh) {
      window.location.reload();
    }
  });
})();
