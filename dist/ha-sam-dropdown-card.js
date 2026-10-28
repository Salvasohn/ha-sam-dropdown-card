/* SAM Dropdown Card - MIT License */
const CARD_VERSION = "00.01.05";
const CARD_TAG_NAME = "ha-sam-dropdown-card";
const EDITOR_TAG_NAME = "ha-sam-dropdown-card-editor";
const CLOSE_MENU_EVENT = "sam-dropdown-close";

const ACTION_PRESETS = Object.freeze([
  ["light.toggle", "Licht umschalten"],
  ["light.turn_on", "Licht einschalten"],
  ["light.turn_off", "Licht ausschalten"],
  ["switch.toggle", "Schalter umschalten"],
  ["scene.turn_on", "Szene aktivieren"],
  ["script.turn_on", "Skript ausführen"],
  ["button.press", "Taster betätigen"],
  ["cover.open_cover", "Beschattung öffnen"],
  ["cover.close_cover", "Beschattung schließen"],
  ["lawn_mower.dock", "Mähroboter zur Ladestation"],
  ["input_select.select_option", "Auswahlhelfer setzen"],
].map((preset) => Object.freeze(preset)));

const CARD_STYLES = [
  "ha-card { padding: 12px; color: var(--primary-text-color); }",
  ".title { font-weight: 600; margin-bottom: 9px; }",
  ".trigger { display: flex; align-items: center; gap: 9px; width: 100%;",
  "  min-height: 45px; padding: 8px 12px; background: rgba(127,127,127,.06);",
  "  border: 1px solid var(--divider-color); border-radius: 9px;",
  "  color: inherit; font: inherit; cursor: pointer; touch-action: manipulation;",
  "  text-align: left; }",
  ".label { flex: 1; overflow: hidden; text-overflow: ellipsis;",
  "  white-space: nowrap; }",
  "button:disabled { opacity: .5; cursor: not-allowed; }",
].join("\n");

const EDITOR_STYLES = [
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

function normalizeCardConfig(config) {
  const sourceConfig = config || {};
  return {
    type: "custom:" + CARD_TAG_NAME,
    title: sourceConfig.title || "",
    label: sourceConfig.label || "Aktionen",
    icon: sourceConfig.icon || "mdi:menu-down",
    items: Array.isArray(sourceConfig.items)
      ? sourceConfig.items.map((item) => ({ ...item }))
      : [],
  };
}

function createElement(tagName, textContent) {
  const element = document.createElement(tagName);
  if (textContent !== undefined) {
    element.textContent = textContent;
  }
  return element;
}

function createIcon(iconName) {
  const iconElement = createElement("ha-icon");
  iconElement.setAttribute("icon", iconName || "mdi:gesture-tap-button");
  iconElement.style.setProperty("--mdc-icon-size", "20px");
  return iconElement;
}

function isActionAvailable(action, hass) {
  if (!action.domain || !action.service || !action.entity || action.disabled) {
    return false;
  }
  const entityState = hass?.states?.[action.entity]?.state;
  if (!entityState || ["unknown", "unavailable"].includes(entityState)) {
    return false;
  }
  return !action.enabled_entity ||
    hass?.states?.[action.enabled_entity]?.state === "on";
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
    return { label: "Aktionen", icon: "mdi:menu-down", items: [] };
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
    triggerButton.className = "trigger";
    triggerButton.setAttribute("aria-haspopup", "menu");
    triggerButton.setAttribute("aria-expanded", "false");
    triggerButton.append(createIcon(this.config_.icon));

    const labelElement = createElement("span", this.config_.label);
    labelElement.className = "label";
    triggerButton.append(labelElement, createIcon("mdi:chevron-down"));
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
      const serviceData = parseActionData(action.data);
      serviceData.entity_id = action.entity;
      await this.hass_.callService(action.domain, action.service, serviceData);
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
    menuButton.append(createIcon(action.icon), createElement("span", action.label || "Aktion"));
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
    this.attachShadow({ mode: "open" });
    this.config_ = null;
    this.hass_ = null;
  }

  setConfig(config) {
    this.config_ = normalizeCardConfig(config);
    this.renderEditor_();
  }

  set hass(hass) {
    const shouldRender = !this.hass_ && this.config_;
    this.hass_ = hass;
    if (shouldRender) {
      this.renderEditor_();
    }
  }

  dispatchConfigChanged_() {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: JSON.parse(JSON.stringify(this.config_)) },
      bubbles: true,
      composed: true,
    }));
  }

  addTextInput_(parentElement, fieldLabel, fieldValue, onChange) {
    const labelElement = createElement("label");
    labelElement.append(createElement("span", fieldLabel));

    const inputElement = createElement("input");
    inputElement.value = fieldValue ?? "";
    inputElement.addEventListener("input", () => {
      onChange(inputElement.value);
      this.dispatchConfigChanged_();
    });
    labelElement.append(inputElement);
    parentElement.append(labelElement);
    return inputElement;
  }

  appendActionEditor_(containerElement, action, actionIndex) {
    const actionSection = createElement("section");
    const actionHeader = createElement("header");
    actionHeader.append(createElement("b", action.label || "Eintrag " + (actionIndex + 1)));

    const moveControls = createElement("div");
    moveControls.className = "tools";
    const controls = [["↑", -1], ["↓", 1], ["×", 0]];
    for (const [controlLabel, direction] of controls) {
      const controlButton = createElement("button", controlLabel);
      if (direction !== 0) {
        const targetIndex = actionIndex + direction;
        controlButton.disabled = targetIndex < 0 || targetIndex >= this.config_.items.length;
      }
      controlButton.addEventListener("click", () => {
        if (direction === 0) {
          this.config_.items.splice(actionIndex, 1);
        } else {
          const targetIndex = actionIndex + direction;
          [this.config_.items[actionIndex], this.config_.items[targetIndex]] = [
            this.config_.items[targetIndex],
            this.config_.items[actionIndex],
          ];
        }
        this.dispatchConfigChanged_();
        this.renderEditor_();
      });
      moveControls.append(controlButton);
    }
    actionHeader.append(moveControls);
    actionSection.append(actionHeader);

    this.addTextInput_(actionSection, "Bezeichnung", action.label, (value) => {
      action.label = value;
    });
    this.addTextInput_(actionSection, "Icon (MDI)", action.icon, (value) => {
      action.icon = value;
    });

    const actionLabel = createElement("label");
    actionLabel.append(createElement("span", "Aktion"));
    const actionSelector = createElement("select");
    const selectedAction = (action.domain || "") + "." + (action.service || "");
    for (const [presetValue, presetName] of [
      ...ACTION_PRESETS,
      ["custom", "Eigene Aktion"],
    ]) {
      const optionElement = createElement("option", presetName);
      optionElement.value = presetValue;
      actionSelector.append(optionElement);
    }
    actionSelector.value = ACTION_PRESETS.some(([preset]) => preset === selectedAction)
      ? selectedAction
      : "custom";
    actionSelector.addEventListener("change", () => {
      if (actionSelector.value === "custom") {
        action.domain = "";
        action.service = "";
      } else {
        [action.domain, action.service] = actionSelector.value.split(".");
      }
      this.dispatchConfigChanged_();
      this.renderEditor_();
    });
    actionLabel.append(actionSelector);
    actionSection.append(actionLabel);

    if (actionSelector.value === "custom") {
      this.addTextInput_(actionSection, "Domain", action.domain, (value) => {
        action.domain = value;
      });
      this.addTextInput_(actionSection, "Service", action.service, (value) => {
        action.service = value;
      });
    }

    const entityInput = this.addTextInput_(
      actionSection,
      "Entität",
      action.entity,
      (value) => { action.entity = value; },
    );
    entityInput.setAttribute("list", "sam-entity-suggestions");

    const advancedSection = createElement("details");
    advancedSection.append(createElement("summary", "Erweiterte Einstellungen"));
    this.addTextInput_(
      advancedSection,
      "Zusatzdaten (JSON)",
      typeof action.data === "string" ? action.data : JSON.stringify(action.data || {}),
      (value) => { action.data = value; },
    );
    this.addTextInput_(advancedSection, "Bestätigungstext", action.confirm, (value) => {
      action.confirm = value;
    });
    this.addTextInput_(advancedSection, "Freigabe-Entität", action.enabled_entity, (value) => {
      action.enabled_entity = value;
    });

    const disabledLabel = createElement("label");
    disabledLabel.append(createElement("span", "Eintrag deaktivieren"));
    const disabledCheckbox = createElement("input");
    disabledCheckbox.type = "checkbox";
    disabledCheckbox.checked = !!action.disabled;
    disabledCheckbox.addEventListener("change", () => {
      action.disabled = disabledCheckbox.checked;
      this.dispatchConfigChanged_();
    });
    disabledLabel.append(disabledCheckbox);
    advancedSection.append(disabledLabel);
    actionSection.append(advancedSection);
    containerElement.append(actionSection);
  }

  renderEditor_() {
    if (!this.config_) {
      return;
    }
    const shadowRoot = this.shadowRoot;
    shadowRoot.innerHTML = "";
    shadowRoot.append(createElement("style", EDITOR_STYLES));

    const editorRoot = createElement("div");
    editorRoot.className = "root";
    shadowRoot.append(editorRoot);

    editorRoot.append(createElement("h4", "Darstellung"));
    for (const [fieldLabel, propertyName] of [
      ["Titel (optional)", "title"],
      ["Button-Text", "label"],
      ["Button-Icon (MDI)", "icon"],
    ]) {
      this.addTextInput_(editorRoot, fieldLabel, this.config_[propertyName], (value) => {
        this.config_[propertyName] = value;
      });
    }

    editorRoot.append(createElement("h4",
      "Dropdown-Einträge (" + this.config_.items.length + ")"));
    const hintElement = createElement("p",
      "Jeder Menüeintrag löst eine Home-Assistant-Aktion aus; " +
      "Maschinenaktionen bitte mit Bestätigung absichern.");
    hintElement.className = "hint";
    editorRoot.append(hintElement);

    const entitySuggestions = createElement("datalist");
    entitySuggestions.id = "sam-entity-suggestions";
    for (const entityId of Object.keys(this.hass_?.states || {}).slice(0, 9000)) {
      const optionElement = createElement("option");
      optionElement.value = entityId;
      entitySuggestions.append(optionElement);
    }
    editorRoot.append(entitySuggestions);

    this.config_.items.forEach((action, actionIndex) => {
      this.appendActionEditor_(editorRoot, action, actionIndex);
    });

    const addActionButton = createElement("button", "+ Eintrag hinzufügen");
    addActionButton.addEventListener("click", () => {
      this.config_.items.push({
        label: "Neue Aktion",
        icon: "mdi:gesture-tap-button",
        domain: "light",
        service: "toggle",
        entity: "",
      });
      this.dispatchConfigChanged_();
      this.renderEditor_();
    });
    editorRoot.append(addActionButton);
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
