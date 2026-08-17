(() => {
  "use strict";

  const measurementId = window.TESS_ANALYTICS_CONFIG?.measurementId;

  if (!measurementId) {
    return;
  }

  const analyticsScriptId = "google-analytics-script";
  let analyticsInitialized = false;
  let lastTrackedPage = null;

  observeClientSideNavigation();
  loadGoogleAnalytics();

  function loadGoogleAnalytics() {
    if (document.getElementById(analyticsScriptId)) {
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };

    const script = document.createElement("script");
    script.id = analyticsScriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.addEventListener("load", initializeAnalytics, { once: true });
    document.head.append(script);
  }

  function initializeAnalytics() {
    if (analyticsInitialized || typeof window.gtag !== "function") {
      return;
    }

    const page = getAnonymousPageDetails();
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      allow_ad_personalization_signals: false,
      allow_google_signals: false,
      page_location: page.location,
      page_path: page.path,
      page_referrer: getAnonymousReferrer(),
      send_page_view: false,
    });
    analyticsInitialized = true;
    trackPageView();
  }

  function trackPageView() {
    if (!analyticsInitialized || typeof window.gtag !== "function") {
      return;
    }

    const page = getAnonymousPageDetails();
    if (page.key === lastTrackedPage) {
      return;
    }

    lastTrackedPage = page.key;
    window.gtag("event", "page_view", {
      page_location: page.location,
      page_path: page.path,
      page_referrer: getAnonymousReferrer(),
      page_title: document.title,
    });
  }

  function getAnonymousPageDetails() {
    // Query strings and ordinary anchors are omitted so accidental personal data is not sent to GA.
    const hashRoute = /^#!?\//.test(window.location.hash) ? window.location.hash : "";
    const path = `${window.location.pathname}${hashRoute}`;

    return {
      key: path,
      location: `${window.location.origin}${path}`,
      path,
    };
  }

  function getAnonymousReferrer() {
    if (!document.referrer) {
      return "";
    }

    try {
      const referrer = new URL(document.referrer);
      return `${referrer.origin}${referrer.pathname}`;
    } catch {
      return "";
    }
  }

  function observeClientSideNavigation() {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    const schedulePageView = () => {
      window.setTimeout(trackPageView, 0);
    };

    window.history.pushState = function pushState(...args) {
      const result = originalPushState.apply(this, args);
      schedulePageView();
      return result;
    };

    window.history.replaceState = function replaceState(...args) {
      const result = originalReplaceState.apply(this, args);
      schedulePageView();
      return result;
    };

    window.addEventListener("popstate", schedulePageView);
    window.addEventListener("hashchange", schedulePageView);
  }
})();
