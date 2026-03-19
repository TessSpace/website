(() => {
  const header = document.querySelector(".site-header");
  const desktopNav = header?.querySelector(".site-nav");

  if (!header || !desktopNav || header.querySelector(".mobile-nav-toggle")) {
    return;
  }

  const desktopCta = header.querySelector(".site-header__cta");
  const panelId = "mobile-nav-panel";

  const toggle = document.createElement("button");
  toggle.className = "mobile-nav-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", panelId);
  toggle.setAttribute("aria-label", "Open navigation menu");
  toggle.innerHTML = `
    <span class="mobile-nav-toggle__label">Menu</span>
    <span class="mobile-nav-toggle__icon" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
    </span>
  `;
  header.append(toggle);

  const mobileNav = document.createElement("div");
  mobileNav.className = "mobile-nav";
  mobileNav.hidden = true;
  mobileNav.innerHTML = `
    <button class="mobile-nav__backdrop" type="button" aria-label="Close navigation" data-mobile-nav-close></button>
    <div class="mobile-nav__panel" id="${panelId}" role="dialog" aria-modal="true" aria-labelledby="mobile-nav-title">
      <div class="mobile-nav__header">
        <p class="mobile-nav__title" id="mobile-nav-title">Navigation</p>
        <button class="mobile-nav__close" type="button" aria-label="Close navigation" data-mobile-nav-close>
          Close
        </button>
      </div>
    </div>
  `;

  const panel = mobileNav.querySelector(".mobile-nav__panel");
  const navClone = desktopNav.cloneNode(true);
  navClone.setAttribute("aria-label", "Mobile navigation");

  navClone.querySelectorAll(".site-nav__separator").forEach((separator) => {
    separator.remove();
  });

  navClone.querySelectorAll(".site-nav__dropdown").forEach((dropdown) => {
    const trigger = dropdown.querySelector(".site-nav__dropdown-trigger");
    if (!trigger) {
      return;
    }

    const staticLabel = document.createElement("div");
    staticLabel.className = "site-nav__dropdown-trigger site-nav__dropdown-trigger--static";
    staticLabel.innerHTML = trigger.innerHTML;
    trigger.replaceWith(staticLabel);
  });

  panel.append(navClone);

  if (desktopCta) {
    const ctaClone = desktopCta.cloneNode(true);
    ctaClone.classList.add("mobile-nav__cta");
    panel.append(ctaClone);
  }

  document.body.append(mobileNav);

  const closeButtons = mobileNav.querySelectorAll("[data-mobile-nav-close]");
  const firstCloseButton = mobileNav.querySelector(".mobile-nav__close");

  const openNav = () => {
    mobileNav.hidden = false;
    document.body.classList.add("has-mobile-nav");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close navigation menu");
    firstCloseButton?.focus();
  };

  const closeNav = ({ restoreFocus = true } = {}) => {
    if (mobileNav.hidden) {
      return;
    }

    mobileNav.hidden = true;
    document.body.classList.remove("has-mobile-nav");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");

    if (restoreFocus) {
      toggle.focus();
    }
  };

  toggle.addEventListener("click", () => {
    if (mobileNav.hidden) {
      openNav();
      return;
    }

    closeNav();
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => closeNav());
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeNav({ restoreFocus: false }));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !mobileNav.hidden) {
      closeNav();
    }
  });

  const mediaQuery = window.matchMedia("(min-width: 981px)");
  const handleViewportChange = (event) => {
    if (event.matches) {
      closeNav({ restoreFocus: false });
    }
  };

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleViewportChange);
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(handleViewportChange);
  }
})();
