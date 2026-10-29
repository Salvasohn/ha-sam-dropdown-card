from pathlib import Path
import json
import re

repo_root = Path(__file__).resolve().parent.parent
version = (repo_root / "VERSION").read_text().strip()
assert re.fullmatch(r"\d{2}\.\d{2}\.\d{2}", version)

manifest = json.loads((repo_root / "hacs.json").read_text())
assert manifest["filename"] == "ha-sam-dropdown-card.js"

source = (repo_root / "dist" / manifest["filename"]).read_text()
assert f'const CARD_VERSION = "{version}";' in source
assert "static getConfigElement()" in source
assert 'new CustomEvent("config-changed"' in source
assert 'type: custom:ha-sam-dropdown-card' in (repo_root / "README.md").read_text()

# Public Home Assistant contracts are preserved; internal naming follows Google JS.
for class_name in ("SamDropdownCard", "SamDropdownEditor"):
    assert f"class {class_name}" in source

for private_member in (
    "config_", "hass_", "menu_", "renderCard_", "renderEditor_",
    "openMenu_", "closeMenu_", "dispatchConfigChanged_",
):
    assert private_member in source, private_member

for legacy_identifier in (
    "samConfig", "samElem", "samIcon", "samReady",
    "_cfg", "_draw", "_render", "_close", "_open",
    "_refresh", "_position", "_input", "_emit",
):
    assert not re.search(r"\b" + re.escape(legacy_identifier) + r"\b", source)

print("PASS: version, HACS manifest, public API, Google-style naming")

assert 'createElement("ha-form")' in source
assert 'createElement("ha-selector")' in source
assert 'ui_color: {default_color: "state", include_state: true, include_none: true}' in source
assert 'isLocalEcho' in source and 'this.rendered_' in source
assert 'getItemIconColor(action, this.config_.icon_color)' in source
print("PASS: native HA editor and focus regression guard")

assert 'const CARD_VERSION = "00.01.15";' in source
assert "createGarageLightItems()" in source
assert 'label: "Licht"' in source
assert 'entity: "light.garage_innen_licht_3"' in source
assert 'selector-row' in source
assert 'if (isLocalEcho && this.rendered_)' in source
assert 'this.config_ = incomingConfig' in source
assert source.index('this.addSelector_(section, "Entität"') < source.index('const iconRow = createElement("div")')
print("PASS: garage defaults, two-column icon layout, stable editor references")

# Horizontal is backward compatible; both layouts must be available in the GUI.
assert 'layout: ["default", "horizontal", "vertical"].includes(sourceConfig.layout)' in source
assert 'layout: "default"' in source
assert '{name: "layout", selector: {select: {' in source
assert '{value: "default", label: "Standard-Layout"}' in source
assert '{value: "horizontal", label: "Horizontales Layout"}' in source
assert '{value: "vertical", label: "Vertikales Layout"}' in source
assert 'triggerButton.className = this.config_.layout === "vertical"' in source
assert '".trigger.vertical { flex-direction: column;' in source
assert 'chevronIcon.className = "chevron";' in source
assert 'for (const key of ["title", "label", "display_mode", "layout"])' in source
assert 'layout: vertical' in (repo_root / "README.md").read_text()
print("PASS: horizontal/vertical layout selector, rendering, defaults and persistence")

assert 'const AUTOMATIC_TOGGLE_DOMAINS = new Set([' in source
assert 'function getActionMode(action)' in source
assert 'function getAutomaticService(action)' in source
assert 'new CustomEvent("hass-more-info"' in source
assert 'window.history.pushState(' in source
assert 'window.open(destination.href, "_blank", "noopener,noreferrer")' in source
assert 'this.renderEditor_(index)' in source
assert 'action: "auto", entity: ""' in source
print("PASS: automatic action routing and reduced advanced editor")

assert 'set preview(isPreview)' in source
assert 'renderExpandedPreview_(containerElement)' in source
assert 'renderDualPreview_' not in source
assert 'Dropdown – geschlossen' not in source
assert 'Dropdown – geöffnet' not in source
assert 'this.createTriggerButton_(true, true)' in source
assert 'if (this.isPreview_) {' in source
print("PASS: single expanded visual preview only in the card editor")

assert 'this.menu_.style.width = "max-content";' in source
assert 'const rightAlignedLeft = triggerBounds.right - menuWidth;' in source
assert 'justify-self: end; width: max-content;' in source
assert 'maxWidth: "calc(100vw - 8px)"' in source
print("PASS: intrinsic-width, right-aligned popup and editor preview")

assert "function isEntityActive(action, hass)" in source
assert "function setStatusIcon(icon, active, colorName, action, hass)" in source
assert "this.updateIconStates_();" in source
assert "this.previewItemIcons_" in source
assert "this.menuItemIcons_" in source
assert "position: relative; box-sizing: border-box;" in source
print("PASS: live entity status, aggregated parent icon and corrected preview width")

assert "function getItemIconColor(action, parentColor)" in source
assert "function getDefaultEntityIconColor(action, hass)" in source
assert 'sourceConfig.icon_color === undefined' in source
assert 'action.icon_color = normalizeIconColor(value)' in source
assert 'this.config_.icon_color = normalizeIconColor(value)' in source
print("PASS: cleared icon colors persist and use HA state theme colors")

assert 'display_mode: ["standard", "compact"].includes(sourceConfig.display_mode)' in source
assert '{name: "display_mode", selector: {select: {' in source
assert '{value: "standard", label: "Standard"}' in source
assert '{value: "compact", label: "Kompakt"}' in source
assert 'display_mode: "Darstellung"' in source
assert '"trigger compact"' in source
assert '".trigger.compact { height: 64px; min-height: 64px;' in source
assert 'ha-card.compact-card { padding: 0;' in source
print("PASS: compact OG-Bad presentation and unchanged default appearance")
