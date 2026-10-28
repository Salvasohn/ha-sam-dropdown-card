/* Browserless runtime regression tests for SAM Dropdown Card. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(
  path.join(__dirname, "../dist/ha-sam-dropdown-card.js"), "utf8",
);
const registry = new Map();
const serviceCalls = [];
const openedUrls = [];
const navigation = [];
const alerts = [];

class FakeElement {
  constructor(tagName = "host") {
    this.tagName = tagName;
    this.children = [];
    this.listeners = {};
    this.style = {setProperty() {}};
    this.attributes = {};
    this.value = "";
    this.open = false;
  }
  attachShadow() {
    this.shadowRoot = new FakeElement("shadow");
    return this.shadowRoot;
  }
  set innerHTML(value) {
    this.children = [];
    this.markup = value;
  }
  get innerHTML() {
    return this.markup;
  }
  append(...children) {
    this.children.push(...children);
  }
  addEventListener(type, callback) {
    this.listeners[type] = callback;
  }
  setAttribute(name, value) {
    this.attributes[name] = value;
  }
  dispatchEvent(event) {
    this.lastEvent = event;
    return true;
  }
  findAll(predicate) {
    const found = [];
    const visit = (parent) => {
      for (const child of parent.children) {
        if (predicate(child)) found.push(child);
        visit(child);
      }
    };
    visit(this);
    return found;
  }
  querySelectorAll(selector) {
    const tags = selector.split(",").map((part) =>
      part.trim().split(/[.:[ ]/)[0]);
    return this.findAll((item) => tags.includes(item.tagName));
  }
  querySelector(selector) {
    return this.querySelectorAll(selector)[0] ?? null;
  }
  fire(type, value) {
    assert.ok(this.listeners[type], "Missing event listener: " + type);
    this.listeners[type]({
      detail: {value},
      preventDefault() {},
      stopPropagation() {},
    });
  }
  remove() {}
  focus() {}
}
const environment = {
  HTMLElement: FakeElement,
  document: {
    createElement: (tagName) => new FakeElement(tagName),
    dispatchEvent() {},
    body: {append() {}},
    addEventListener() {},
    removeEventListener() {},
  },
  customElements: {
    get: (tagName) => registry.get(tagName),
    define: (tagName, ctor) => registry.set(tagName, ctor),
  },
  window: {
    customCards: [],
    confirm: () => true,
    alert: (text) => alerts.push(text),
    location: {href: "https://home.example/lovelace"},
    history: {pushState: (_state, _title, target) => navigation.push(target)},
    dispatchEvent: (event) => navigation.push(event.type),
    open: (...args) => openedUrls.push(args),
  },
  CustomEvent: class {
    constructor(type, init) {
      this.type = type;
      this.detail = init.detail;
    }
  },
  Event: class {
    constructor(type) {
      this.type = type;
    }
  },
  URL,
  console: {info() {}},
};
const exported = vm.runInNewContext(
  source + "\n({SamDropdownCard, SamDropdownEditor, getActionMode, " +
    "isActionAvailable, normalizeCardConfig})",
  environment,
);
const {SamDropdownCard, SamDropdownEditor, getActionMode,
  isActionAvailable, normalizeCardConfig} = exported;

async function runTests() {
  const hass = {
    states: {
      "light.demo": {state: "on"},
      "sensor.demo": {state: "42"},
      "scene.party": {state: "scening"},
      "lawn_mower.robot": {state: "docked"},
    },
    callService: async (domain, service, data) =>
      serviceCalls.push({domain, service, data}),
  };
  const card = new SamDropdownCard();
  card.hass = hass;
  card.setConfig({items: [{label: "Licht", entity: "light.demo"}]});
  await card.executeAction_({entity: "light.demo"});
  assert.equal(serviceCalls[0].domain, "light");
  assert.equal(serviceCalls[0].service, "toggle");
  assert.equal(serviceCalls[0].data.entity_id, "light.demo");

  await card.executeAction_({entity: "sensor.demo"});
  assert.equal(card.lastEvent.type, "hass-more-info");
  assert.equal(card.lastEvent.detail.entityId, "sensor.demo");

  await card.executeAction_({
    entity: "lawn_mower.robot", domain: "lawn_mower", service: "dock",
  });
  assert.equal(serviceCalls[1].service, "dock");
  assert.equal(getActionMode({
    entity: "scene.party", domain: "scene", service: "turn_on",
  }), "call-service");

  await card.executeAction_({
    action: "navigate", navigation_path: "/lovelace/garage",
  });
  assert.deepEqual(navigation, ["/lovelace/garage", "location-changed"]);
  await card.executeAction_({action: "url", url: "https://example.org"});
  assert.equal(openedUrls[0][0], new URL("https://example.org").href);
  assert.equal(alerts.length, 0);
  assert.equal(isActionAvailable({entity: "sensor.demo"}, hass), true);

  const editor = new SamDropdownEditor();
  editor.hass = hass;
  editor.setConfig({label: "Licht", items: [
    {entity: "light.demo", label: "Licht"},
  ]});
  const advanced = () => editor.shadowRoot.findAll(
    (node) => node.tagName === "details",
  )[0];
  const selector = advanced().findAll(
    (node) => node.tagName === "select",
  )[0];
  assert.equal(selector.value, "auto");
  assert.equal(editor.shadowRoot.findAll(
    (node) => node.tagName === "select",
  ).length, 1);
  selector.value = "call-service";
  selector.fire("change");
  assert.equal(advanced().open, true);
  assert.equal(editor.lastEvent.detail.config.items[0].action, "call-service");
  const activeConfig = editor.config_;
  editor.setConfig(editor.lastEvent.detail.config);
  assert.equal(editor.config_, activeConfig);

  const layoutOptions = editor.shadowRoot.findAll(
    (node) => node.tagName === "ha-form",
  )[0].schema.find((item) => item.name === "layout").selector.select.options;
  assert.deepEqual(
    [...layoutOptions.map((item) => item.label)],
    ["Standard-Layout", "Horizontales Layout", "Vertikales Layout"],
  );
  assert.equal(normalizeCardConfig({}).layout, "default");
  assert.equal(normalizeCardConfig({layout: "vertical"}).layout, "vertical");


  // Home Assistant sets .preview=true only in the edit-card preview pane.
  const previewCard = new SamDropdownCard();
  previewCard.hass = hass;
  previewCard.setConfig({
    label: "Licht",
    layout: "vertical",
    icon_color: "blue",
    items: [
      {label: "Alle", entity: "light.demo", icon: "mdi:lightbulb-group"},
      {label: "Temperatur", entity: "sensor.demo", icon: "mdi:thermometer"},
    ],
  });
  assert.equal(previewCard.preview, false);
  assert.equal(previewCard.shadowRoot.findAll(
    (node) => node.className === "preview-section",
  ).length, 0);
  previewCard.preview = true;
  assert.equal(previewCard.shadowRoot.findAll(
    (node) => node.className === "preview-section",
  ).length, 2);
  const previewSections = previewCard.shadowRoot.findAll(
    (node) => node.className === "preview-section",
  );
  assert.equal(previewSections[0].findAll(
    (node) => node.className === "preview-menu",
  ).length, 0);
  assert.equal(previewSections[1].findAll(
    (node) => node.className === "preview-option",
  ).length, 2);
  assert.equal(previewCard.shadowRoot.findAll(
    (node) => node.className === "trigger vertical",
  ).length, 2);
  assert.deepEqual(
    [...previewCard.shadowRoot.findAll(
      (node) => node.className === "preview-heading",
    ).map((node) => node.textContent)],
    ["Dropdown – geschlossen", "Dropdown – geöffnet"],
  );
  assert.equal(previewCard.shadowRoot.findAll(
    (node) => node.className === "preview-option",
  ).every((node) => !node.listeners.click), true);

  // Changes in configuration refresh both previews; no new YAML properties.
  previewCard.setConfig({
    label: "Neue Beschriftung",
    items: [{label: "Eintrag 1", entity: "light.demo"}],
  });
  assert.equal(previewCard.shadowRoot.findAll(
    (node) => node.className === "preview-option",
  ).length, 1);
  const labels = previewCard.shadowRoot.findAll(
    (node) => node.className === "label",
  );
  assert.deepEqual([...labels.map((node) => node.textContent)],
    ["Neue Beschriftung", "Neue Beschriftung"]);
  previewCard.preview = false;
  assert.equal(previewCard.shadowRoot.findAll(
    (node) => node.className === "preview-section",
  ).length, 0);
  assert.equal(previewCard.shadowRoot.findAll(
    (node) => node.tagName === "button",
  ).length, 1);

  // Existing explicit custom services must not change to generic toggle.
  assert.equal(getActionMode({
    domain: "input_select", service: "select_option",
    entity: "input_select.example",
  }), "call-service");
  console.log("PASS: actions, editor state, layout, two live-updating " +
    "non-interactive open/closed card previews");
}

runTests().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
