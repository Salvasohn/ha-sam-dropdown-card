/* SAM Dropdown Card - MIT License */
const CARD_VERSION = "00.01.09";
const CARD_TAG_NAME = "ha-sam-dropdown-card";
const EDITOR_TAG_NAME = "ha-sam-dropdown-card-editor";
const CLOSE_MENU_EVENT = "sam-dropdown-close";

// Only domains with well-defined, reversible toggle behavior are automatic.
const AUTOMATIC_TOGGLE_DOMAINS = new Set([
  "light", "switch", "input_boolean", "fan", "automation",
]);

const ACTION_MODES = Object.freeze([
  ["auto", "Standard (automatisch)"],
  ["more-info", "Mehr Informationen"],
  ["call-service", "Dienst ausführen"],
  ["navigate", "Navigation"],
  ["url", "URL öffnen"],
]);

function getActionMode(action) {
  if (action.action) {
    return ACTION_MODES.some(([value]) => value === action.action)
      ? action.action : "auto";
  }
  // Backward compatibility with actions before version 00.01.09:
  // explicit services (e.g. mower dock, scenes) must never be changed.
  if (action.domain && action.service) {
    const entityDomain = (action.entity || "").split(".")[0];
    return action.service === "toggle" && action.domain === entityDomain
      ? "auto" : "call-service";
  }
  return "auto";
}

function getAutomaticService(action) {
  const entityDomain = (action.entity || "").split(".")[0];
  if (action.action === undefined && action.domain && action.service === "toggle" &&
      action.domain === entityDomain) {
    return {domain: action.domain, service: action.service};
  }
  if (AUTOMATIC_TOGGLE_DOMAINS.has(entityDomain)) {
    return {domain: entityDomain, service: "toggle"};
  }
  return null;
}

const CARD_STYLES = [
  "ha-card { padding: 12px; color: var(--primary-text-color); }",
  ".title { font-weight: 600; margin-bottom: 9px; }",
  ".trigger { display: flex; align-items: center; gap: 9px; width: 100%;",
  "  min-height: 45px; padding: 8px 12px; background: rgba(127,127,127,.06);",
  "  border: 1px solid var(--divider-color); border-radius: 9px;",
  "  color: inherit; font: inherit; cursor: pointer; touch-action: manipulation;",
  "  text-align: left; position: relative; }",
  ".label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis;",
  "  white-space: nowrap; }",
  ".trigger.vertical { flex-direction: column; justify-content: center;",
  "  min-height: 84px; gap: 6px; padding: 12px 28px; text-align: center; }",
  ".trigger.vertical .label { flex: none; width: 100%; text-align: center;",
  "  white-space: normal; overflow: visible; overflow-wrap: anywhere;",
  "  line-height: 1.3; }",
  ".trigger.vertical .chevron { position: absolute; right: 8px; top: 8px; }",
  "button:disabled { opacity: .5; cursor: not-allowed; }",
].join("\n");

const EDITOR_STYLES = [
  ".selector-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));",
  "  gap: 12px; align-items: end; min-width: 0; }",
  ".selector-row > * { display: block; min-width: 0; width: 100%; }",
  ":host { display: block; color: var(--primary-text-color); }",
  ".root { display: grid; gap: 12px; }",
  "label { display: grid; gap: 5px; font-size: 13px;",
  "  color: var(--secondary-text-color); }",
  "input, select, textarea { box-sizing: border-box; width: 100%; min-width: 0;",
  "  padding: 9px; border: 1px solid var(--divider-color);",
  "  border-radius: 7px; background: var(--card-background-color, #242424);",
  "  color: var(--primary-text-color); font: inherit; }",
  "button { border: 1px solid var(--divider-color); border-radius: 7px;",
  "  padding: 7px 10px; color: var(--primary-text-color);",
  "  background: transparent; cursor: pointer; font: inherit; }",
  "button:disabled { opacity: .4; }",
  "section { border: 1px solid var(--divider-color); padding: 12px;",
  "  border-radius: 10px; display: grid; gap: 10px; }",
  "header { display: flex; justify-content: space-between; align-items: center; }",
  ".tools { display: flex; gap: 3px; }",
  "summary { cursor: pointer; }",
  "h4 { margin: 5px 0; }",
  ".hint { color: var(--secondary-text-color); font-size: 12px; }",
].join("\n");

// Based on the already established Garage room card, button2 ("Licht").
// Only newly created cards receive these defaults; explicit items are preserved.
const GARAGE_LIGHT_ITEMS = Object.freeze([
  {label: "Alle", icon: "mdi:lightbulb-group", domain: "light",
    service: "toggle", entity: "light.garage_lichtgruppe"},
  {label: "Innen 1", icon: "mdi:lightbulb", domain: "light",
    service: "toggle", entity: "light.garage_innen_licht_1"},
  {label: "Innen 2", icon: "mdi:lightbulb", domain: "light",
    service: "toggle", entity: "light.garage_innen_licht_2"},
  {label: "Innen 3", icon: "mdi:lightbulb", domain: "light",
    service: "toggle", entity: "light.garage_innen_licht_3"},
]);

function createGarageLightItems() {
  return GARAGE_LIGHT_ITEMS.map((item) => ({...item}));
}

function normalizeCardConfig(config) {
  const sourceConfig = config || {};
  return {
    ...sourceConfig,
    type: "custom:" + CARD_TAG_NAME,
    title: sourceConfig.title ?? "",
    label: sourceConfig.label ?? "Licht",
    icon: sourceConfig.icon ?? "mdi:lightbulb-group",
    icon_color: sourceConfig.icon_color ?? "primary",
    layout: ["default", "horizontal", "vertical"].includes(sourceConfig.layout)
      ? sourceConfig.layout : "default",
    items: Array.isArray(sourceConfig.items)
      ? sourceConfig.items.map((item) => ({...item}))
      : createGarageLightItems(),
  };
}

const ICON_COLOR_NAMES = new Set([
  "red", "pink", "purple", "deep-purple", "indigo", "blue", "light-blue",
  "cyan", "teal", "green", "light-green", "lime", "yellow", "amber",
  "orange", "deep-orange", "brown", "grey", "blue-grey",
]);

function getIconColor(colorName) {
  if (colorName === "primary") return "var(--primary-color)";
  if (colorName === "accent") return "var(--accent-color)";
  if (colorName === "disabled") return "var(--disabled-text-color)";
  if (colorName === "none" || !colorName) {
    return "var(--state-icon-color, #44739e)";
  }
  if (ICON_COLOR_NAMES.has(colorName)) {
    return "var(--" + colorName + "-color, var(--primary-color))";
  }
  return "var(--primary-color)";
}

function createElement(tagName, textContent) {
  const element = document.createElement(tagName);
  if (textContent !== undefined) {
    element.textContent = textContent;
  }
  return element;
}

function createIcon(iconName, colorName) {
  const iconElement = createElement("ha-icon");
  iconElement.setAttribute("icon", iconName || "mdi:gesture-tap-button");
  iconElement.style.setProperty("--mdc-icon-size", "20px");
  if (colorName) iconElement.style.color = getIconColor(colorName);
  return iconElement;
}

function isActionAvailable(action, hass) {
  if (action.disabled) return false;
  if (action.enabled_entity &&
      hass?.states?.[action.enabled_entity]?.state !== "on") {
    return false;
  }
  const mode = getActionMode(action);
  if (mode === "navigate") {
    return typeof action.navigation_path === "string" &&
      action.navigation_path.startsWith("/") &&
      !action.navigation_path.startsWith("//");
  }
  if (mode === "url") {
    return typeof action.url === "string" && action.url.trim().length > 0;
  }
  if (mode === "call-service" && (!action.domain || !action.service)) {
    return false;
  }
  if (!action.entity) return mode === "call-service";
  const entityState = hass?.states?.[action.entity]?.state;
  return !!entityState && !["unknown", "unavailable"].includes(entityState);
}

function parseActionData(rawData) {
  if (!rawData) {
    return {};
  }
  const parsedData = typeof rawData === "string"
    ? JSON.parse(rawData)
    : { ...rawData };
  if (!parsedData || typeof parsedData !== "object" || Array.isArray(parsedData)) {
    throw new Error("Ungültige Aktionsdaten");
  }
  return parsedData;
}

class SamDropdownCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.config_ = normalizeCardConfig({});
    this.hass_ = null;
    this.menu_ = null;
    this.isBusy_ = false;
    this.triggerButton_ = null;

    this.handleOutsidePointerDown_ = (event) => {
      const eventPath = event.composedPath ? event.composedPath() : [];
      if (!eventPath.includes(this.menu_) && !eventPath.includes(this)) {
        this.closeMenu_();
      }
    };
    this.handleMenuKeyboard_ = (event) => {
      if (event.key === "Escape") {
        this.closeMenu_();
        this.triggerButton_?.focus();
        return;
      }
      if (!this.menu_ || !["ArrowDown", "ArrowUp"].includes(event.key)) {
        return;
      }
      const availableButtons = [
        ...this.menu_.querySelectorAll("button:not([disabled])"),
      ];
      if (!availableButtons.length) {
        return;
      }
      event.preventDefault();
      const activeIndex = availableButtons.indexOf(document.activeElement);
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = (activeIndex + direction + availableButtons.length)
        % availableButtons.length;
      availableButtons[nextIndex].focus();
    };
    this.handleMenuReposition_ = () => this.positionMenu_();
    this.handleOtherMenuOpening_ = (event) => {
      if (event.detail !== this) {
        this.closeMenu_();
      }
    };
  }

  static getConfigElement() {
    return document.createElement(EDITOR_TAG_NAME);
  }

  static getStubConfig() {
    return {
      label: "Licht",
      icon: "mdi:lightbulb-group",
      icon_color: "primary",
      layout: "default",
      items: createGarageLightItems(),
    };
  }

  setConfig(config) {
    this.config_ = normalizeCardConfig(config);
    this.closeMenu_();
    this.renderCard_();
  }

  set hass(hass) {
    this.hass_ = hass;
    this.updateAvailability_();
  }

  getCardSize() {
    if (this.config_.layout === "vertical") {
      return this.config_.title ? 3 : 2;
    }
    return this.config_.title ? 2 : 1;
  }

  disconnectedCallback() {
    this.closeMenu_();
  }

  renderCard_() {
    const shadowRoot = this.shadowRoot;
    shadowRoot.innerHTML = "";

    const stylesheet = createElement("style", CARD_STYLES);
    shadowRoot.append(stylesheet);

    const cardElement = createElement("ha-card");
    if (this.config_.title) {
      const titleElement = createElement("div", this.config_.title);
      titleElement.className = "title";
      cardElement.append(titleElement);
    }

    const triggerButton = createElement("button");
    triggerButton.type = "button";
    triggerButton.className = this.config_.layout === "vertical"
      ? "trigger vertical"
      : "trigger";
    triggerButton.setAttribute("aria-haspopup", "menu");
    triggerButton.setAttribute("aria-expanded", "false");
    triggerButton.append(createIcon(this.config_.icon, this.config_.icon_color));

    const labelElement = createElement("span", this.config_.label);
    labelElement.className = "label";
    const chevronIcon = createIcon("mdi:chevron-down");
    chevronIcon.className = "chevron";
    triggerButton.append(labelElement, chevronIcon);
    triggerButton.addEventListener("click", (event) => {
      event.preventDefault();
      if (this.menu_) {
        this.closeMenu_();
      } else {
        this.openMenu_();
      }
    });

    cardElement.append(triggerButton);
    shadowRoot.append(cardElement);
    this.triggerButton_ = triggerButton;
    this.updateAvailability_();
  }

  updateAvailability_() {
    if (this.triggerButton_) {
      this.triggerButton_.disabled = this.isBusy_ || !this.config_.items.length;
    }
    if (!this.menu_) {
      return;
    }
    for (const menuButton of this.menu_.querySelectorAll("button")) {
      menuButton.disabled = this.isBusy_ ||
        !isActionAvailable(menuButton.actionConfig_, this.hass_);
    }
  }

  async executeAction_(action) {
    if (this.isBusy_ || !isActionAvailable(action, this.hass_)) {
      return;
    }
    if (action.confirm && !window.confirm(String(action.confirm))) {
      return;
    }

    this.isBusy_ = true;
    this.updateAvailability_();
    try {
      const mode = getActionMode(action);
      if (mode === "more-info") {
        this.dispatchEvent(new CustomEvent("hass-more-info", {
          detail: {entityId: action.entity},
          bubbles: true,
          composed: true,
        }));
      } else if (mode === "navigate") {
        if (!action.navigation_path.startsWith("/") ||
            action.navigation_path.startsWith("//")) {
          throw new Error("Ungültiger Navigationspfad");
        }
        window.history.pushState(null, "", action.navigation_path);
        window.dispatchEvent(new Event("location-changed"));
      } else if (mode === "url") {
        const destination = new URL(action.url, window.location.href);
        if (!["http:", "https:"].includes(destination.protocol)) {
          throw new Error("Nur HTTP- und HTTPS-Adressen sind erlaubt");
        }
        window.open(destination.href, "_blank", "noopener,noreferrer");
      } else {
        const automaticService = mode === "auto" ? getAutomaticService(action) : null;
        if (mode === "auto" && !automaticService) {
          this.dispatchEvent(new CustomEvent("hass-more-info", {
            detail: {entityId: action.entity},
            bubbles: true,
            composed: true,
          }));
        } else {
          const domain = automaticService?.domain ?? action.domain;
          const service = automaticService?.service ?? action.service;
          const serviceData = mode === "call-service" ? parseActionData(action.data) : {};
          if (action.entity) serviceData.entity_id = action.entity;
          await this.hass_.callService(domain, service, serviceData);
        }
      }
      this.closeMenu_();
    } catch (error) {
      window.alert("Aktion fehlgeschlagen: " + String(error));
    } finally {
      this.isBusy_ = false;
      this.updateAvailability_();
    }
  }

  createMenuButton_(action) {
    const menuButton = createElement("button");
    menuButton.type = "button";
    menuButton.actionConfig_ = action;
    Object.assign(menuButton.style, {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      width: "100%",
      minHeight: "42px",
      padding: "8px",
      border: "0",
      borderRadius: "7px",
      textAlign: "left",
      background: "transparent",
      color: "inherit",
      font: "inherit",
      cursor: "pointer",
      touchAction: "manipulation",
    });
    menuButton.append(
      createIcon(action.icon, action.icon_color ?? this.config_.icon_color),
      createElement("span", action.label || "Aktion"),
    );
    menuButton.onmouseenter = () => {
      menuButton.style.background = "rgba(68,115,158,.23)";
    };
    menuButton.onmouseleave = () => {
      menuButton.style.background = "transparent";
    };
    menuButton.addEventListener("click", (event) => {
      event.preventDefault();
      void this.executeAction_(action);
    });
    return menuButton;
  }

  openMenu_() {
    if (this.menu_ || !this.hass_ || !this.config_.items.length) {
      return;
    }
    document.dispatchEvent(new CustomEvent(CLOSE_MENU_EVENT, { detail: this }));

    const menuElement = createElement("div");
    menuElement.setAttribute("role", "menu");
    Object.assign(menuElement.style, {
      position: "fixed",
      zIndex: "2147483640",
      padding: "5px",
      boxSizing: "border-box",
      borderRadius: "10px",
      border: "1px solid var(--divider-color)",
      background: "var(--ha-card-background,var(--card-background-color,#262626))",
      color: "var(--primary-text-color)",
      boxShadow: "0 8px 20px #0005",
      overflowY: "auto",
    });

    for (const action of this.config_.items) {
      menuElement.append(this.createMenuButton_(action));
    }
    this.menu_ = menuElement;
    document.body.append(menuElement);

    this.positionMenu_();
    this.updateAvailability_();
    this.triggerButton_?.setAttribute("aria-expanded", "true");

    document.addEventListener("pointerdown", this.handleOutsidePointerDown_, true);
    document.addEventListener("keydown", this.handleMenuKeyboard_, true);
    document.addEventListener(CLOSE_MENU_EVENT, this.handleOtherMenuOpening_);
    window.addEventListener("resize", this.handleMenuReposition_);
    window.addEventListener("scroll", this.handleMenuReposition_, true);
    menuElement.querySelector("button:not([disabled])")?.focus({ preventScroll: true });
  }

  positionMenu_() {
    if (!this.menu_ || !this.triggerButton_) {
      return;
    }
    const triggerBounds = this.triggerButton_.getBoundingClientRect();
    const menuWidth = Math.min(Math.max(195, triggerBounds.width), window.innerWidth - 8);
    const availableBelow = window.innerHeight - triggerBounds.bottom;
    const preferredHeight = Math.min(this.menu_.scrollHeight, window.innerHeight - 16);
    const openAbove = availableBelow < preferredHeight && triggerBounds.top > availableBelow;
    const availableHeight = openAbove ? triggerBounds.top : availableBelow;

    this.menu_.style.width = menuWidth + "px";
    this.menu_.style.left = Math.max(
      4,
      Math.min(triggerBounds.left, window.innerWidth - menuWidth - 4),
    ) + "px";
    this.menu_.style.maxHeight = Math.max(42, availableHeight - 8) + "px";
    this.menu_.style.top = (
      openAbove
        ? Math.max(4, triggerBounds.top - Math.min(preferredHeight, availableHeight - 8))
        : triggerBounds.bottom
    ) + "px";
  }

  closeMenu_() {
    if (!this.menu_) {
      return;
    }
    this.menu_.remove();
    this.menu_ = null;
    this.triggerButton_?.setAttribute("aria-expanded", "false");

    document.removeEventListener("pointerdown", this.handleOutsidePointerDown_, true);
    document.removeEventListener("keydown", this.handleMenuKeyboard_, true);
    document.removeEventListener(CLOSE_MENU_EVENT, this.handleOtherMenuOpening_);
    window.removeEventListener("resize", this.handleMenuReposition_);
    window.removeEventListener("scroll", this.handleMenuReposition_, true);
  }
}

class SamDropdownEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: "open"});
    this.config_ = null;
    this.hass_ = null;
    this.rendered_ = false;
    this.lastEmittedConfig_ = null;
  }

  setConfig(config) {
    const incomingConfig = normalizeCardConfig(config);
    const isLocalEcho = JSON.stringify(incomingConfig) === this.lastEmittedConfig_;

    // Home Assistant sends config-changed back through setConfig(). The rendered
    // controls still have closures pointing to items in this.config_. Replacing
    // that object here breaks later edits (e.g. entity is silently reverted).
    // Keep both the DOM and the original item references for local echoes.
    if (isLocalEcho && this.rendered_) {
      return;
    }

    this.config_ = incomingConfig;
    this.lastEmittedConfig_ = null;
    this.renderEditor_();
  }

  set hass(hass) {
    this.hass_ = hass;
    for (const element of this.shadowRoot.querySelectorAll("ha-form, ha-selector")) {
      element.hass = hass;
    }
  }

  dispatchConfigChanged_() {
    const config = JSON.parse(JSON.stringify(this.config_));
    this.lastEmittedConfig_ = JSON.stringify(config);
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: {config}, bubbles: true, composed: true,
    }));
  }

  addTextInput_(parent, labelText, value, onChange) {
    const label = createElement("label");
    label.append(createElement("span", labelText));
    const input = createElement("input");
    input.value = value ?? "";
    input.addEventListener("input", () => {
      onChange(input.value);
      this.dispatchConfigChanged_();
    });
    label.append(input);
    parent.append(label);
    return input;
  }

  addSelector_(parent, label, value, selectorConfig, onChange) {
    const selector = createElement("ha-selector");
    selector.hass = this.hass_;
    selector.selector = selectorConfig;
    selector.value = value;
    selector.label = label;
    selector.required = false;
    selector.addEventListener("value-changed", (event) => {
      event.stopPropagation();
      onChange(event.detail.value);
      this.dispatchConfigChanged_();
    });
    parent.append(selector);
    return selector;
  }

  createAppearanceForm_() {
    const form = createElement("ha-form");
    form.hass = this.hass_;
    form.schema = [
      {name: "title", selector: {text: {}}},
      {name: "label", selector: {text: {}}},
      {name: "layout", selector: {select: {
        mode: "dropdown",
        options: [
          {value: "default", label: "Standard-Layout"},
          {value: "horizontal", label: "Horizontales Layout"},
          {value: "vertical", label: "Vertikales Layout"},
        ],
      }}},
    ];
    form.data = {
      title: this.config_.title,
      label: this.config_.label,
      layout: this.config_.layout,
    };
    const labels = {
      title: "Titel (optional)", label: "Button-Text", layout: "Layout",
    };
    form.computeLabel = (schema) => labels[schema.name] || schema.name;
    form.addEventListener("value-changed", (event) => {
      event.stopPropagation();
      const newValues = event.detail.value || {};
      for (const key of ["title", "label", "layout"]) {
        if (Object.hasOwn(newValues, key)) this.config_[key] = newValues[key];
      }
      this.dispatchConfigChanged_();
    });
    return form;
  }

  appendActionEditor_(container, action, index, expandedActionIndex) {
    const section = createElement("section");
    const header = createElement("header");
    header.append(createElement("b", action.label || "Eintrag " + (index + 1)));
    const tools = createElement("div");
    tools.className = "tools";
    for (const [label, direction] of [["↑", -1], ["↓", 1], ["×", 0]]) {
      const control = createElement("button", label);
      if (direction) {
        control.disabled = index + direction < 0 ||
          index + direction >= this.config_.items.length;
      }
      control.addEventListener("click", () => {
        if (direction === 0) {
          this.config_.items.splice(index, 1);
        } else {
          const target = index + direction;
          [this.config_.items[index], this.config_.items[target]] =
            [this.config_.items[target], this.config_.items[index]];
        }
        this.dispatchConfigChanged_();
        this.renderEditor_();
      });
      tools.append(control);
    }
    header.append(tools);
    section.append(header);

    this.addTextInput_(section, "Bezeichnung", action.label, (value) => {
      action.label = value;
    });
    this.addSelector_(section, "Entität", action.entity || "",
      {entity: {}}, (value) => { action.entity = value; });
    const iconRow = createElement("div");
    iconRow.className = "selector-row";
    this.addSelector_(iconRow, "Symbol", action.icon || "",
      {icon: {}}, (value) => { action.icon = value; });
    this.addSelector_(iconRow, "Icon-Farbe", action.icon_color ?? "primary",
      {ui_color: {default_color: "primary", include_none: true}},
      (value) => { action.icon_color = value; });
    section.append(iconRow);

    const advanced = createElement("details");
    advanced.append(createElement("summary", "Erweiterte Einstellungen"));
    if (index === expandedActionIndex) advanced.open = true;

    const actionLabel = createElement("label");
    actionLabel.append(createElement("span", "Aktion"));
    const select = createElement("select");
    for (const [value, label] of ACTION_MODES) {
      const option = createElement("option", label);
      option.value = value;
      select.append(option);
    }
    const actionMode = getActionMode(action);
    select.value = actionMode;
    select.addEventListener("change", () => {
      action.action = select.value;
      this.dispatchConfigChanged_();
      // Only change structure when switching between action modes.
      this.renderEditor_(index);
    });
    actionLabel.append(select);
    advanced.append(actionLabel);

    if (actionMode === "call-service") {
      this.addTextInput_(advanced, "Domain", action.domain ?? "", (value) => {
        action.domain = value;
      });
      this.addTextInput_(advanced, "Service", action.service ?? "", (value) => {
        action.service = value;
      });
      this.addTextInput_(advanced, "Zusatzdaten (JSON)",
        typeof action.data === "string"
          ? action.data : JSON.stringify(action.data || {}),
        (value) => {action.data = value;});
    }
    if (actionMode === "navigate") {
      this.addTextInput_(advanced, "Navigationspfad",
        action.navigation_path ?? "", (value) => {action.navigation_path = value;});
    }
    if (actionMode === "url") {
      this.addTextInput_(advanced, "URL", action.url ?? "", (value) => {
        action.url = value;
      });
    }

    this.addTextInput_(advanced, "Bestätigungstext", action.confirm, (value) => {
      action.confirm = value;
    });
    this.addSelector_(advanced, "Freigabe-Entität", action.enabled_entity || "",
      {entity: {}}, (value) => { action.enabled_entity = value; });
    const checkLabel = createElement("label");
    checkLabel.append(createElement("span", "Eintrag deaktivieren"));
    const checkbox = createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!action.disabled;
    checkbox.addEventListener("change", () => {
      action.disabled = checkbox.checked;
      this.dispatchConfigChanged_();
    });
    checkLabel.append(checkbox);
    advanced.append(checkLabel);
    section.append(advanced);
    container.append(section);
  }

  renderEditor_(expandedActionIndex = -1) {
    if (!this.config_) return;
    const root = this.shadowRoot;
    root.innerHTML = "";
    root.append(createElement("style", EDITOR_STYLES));
    const container = createElement("div");
    container.className = "root";
    root.append(container);
    container.append(createElement("h4", "Darstellung"));
    container.append(this.createAppearanceForm_());
    const appearanceIconRow = createElement("div");
    appearanceIconRow.className = "selector-row";
    this.addSelector_(appearanceIconRow, "Symbol", this.config_.icon,
      {icon: {}}, (value) => { this.config_.icon = value; });
    this.addSelector_(appearanceIconRow, "Icon-Farbe", this.config_.icon_color,
      {ui_color: {default_color: "primary", include_none: true}},
      (value) => { this.config_.icon_color = value; });
    container.append(appearanceIconRow);

    container.append(createElement(
      "h4", "Dropdown-Einträge (" + this.config_.items.length + ")",
    ));
    const hint = createElement("p",
      "Menüeinträge führen HA-Aktionen aus. " +
      "Für Maschinen und Tore bitte eine Bestätigung konfigurieren.");
    hint.className = "hint";
    container.append(hint);

    this.config_.items.forEach((action, index) => {
      this.appendActionEditor_(container, action, index, expandedActionIndex);
    });
    const addButton = createElement("button", "+ Eintrag hinzufügen");
    addButton.addEventListener("click", () => {
      this.config_.items.push({
        label: "Neue Aktion", icon: "mdi:lightbulb",
        icon_color: "primary", action: "auto", entity: "",
      });
      this.dispatchConfigChanged_();
      this.renderEditor_();
    });
    container.append(addButton);
    this.rendered_ = true;
  }
}

if (!customElements.get(CARD_TAG_NAME)) {
  customElements.define(CARD_TAG_NAME, SamDropdownCard);
}
if (!customElements.get(EDITOR_TAG_NAME)) {
  customElements.define(EDITOR_TAG_NAME, SamDropdownEditor);
}
window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === CARD_TAG_NAME)) {
  window.customCards.push({
    type: CARD_TAG_NAME,
    name: "SAM Dropdown Card",
    preview: true,
    description: "Dropdown-Karte mit grafischem Editor und Home-Assistant-Aktionen",
  });
}
console.info("SAM Dropdown Card " + CARD_VERSION);
