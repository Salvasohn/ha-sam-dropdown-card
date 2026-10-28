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
assert 'ui_color: {default_color: "primary", include_none: true}' in source
assert 'isLocalEcho' in source and 'this.rendered_' in source
assert 'action.icon_color ?? this.config_.icon_color' in source
print("PASS: native HA editor and focus regression guard")

assert 'const CARD_VERSION = "00.01.07";' in source
assert "createGarageLightItems()" in source
assert 'label: "Licht"' in source
assert 'entity: "light.garage_innen_licht_3"' in source
assert 'selector-row' in source
assert 'if (isLocalEcho && this.rendered_)' in source
assert 'this.config_ = incomingConfig' in source
assert source.index('this.addSelector_(section, "Entität"') < source.index('const iconRow = createElement("div")')
print("PASS: garage defaults, two-column icon layout, stable editor references")
