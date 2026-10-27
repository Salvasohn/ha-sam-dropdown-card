from pathlib import Path
import json,re
root=Path(__file__).resolve().parent.parent
version=(root/"VERSION").read_text().strip()
assert re.fullmatch(r"\d{2}\.\d{2}\.\d{2}",version)
manifest=json.loads((root/"hacs.json").read_text())
assert manifest["filename"]=="ha-sam-dropdown-card.js"
js=(root/"dist"/manifest["filename"]).read_text()
assert ('const SAM_VERSION="'+version+'"') in js
assert "getConfigElement()" in js and "config-changed" in js
assert "custom:ha-sam-dropdown-card" in (root/"README.md").read_text()
print("PASS: version, HACS manifest, GUI editor")

assert '.className="hint";' not in js.split("root.append(")[-1], "Invalid DOM append return usage"

assert len(js.splitlines()) > 200, 'JS must remain readable/multiline'
