# SAM Dropdown Card

Lovelace-Dropdown-Karte für Home Assistant mit **grafischem Konfigurationseditor** zur Verwendung als eigenständige Detail-Card.

## Status

**Version 00.01.06 – Feature-Branch.** `master` bleibt ohne ausdrückliche Anweisung unverändert. Lauffähige Commits werden automatisch mit dem jeweiligen Tag im Format `xx.xx.xx` versehen.

## Funktionen

- Visueller Lovelace-Editor mit nativen Home-Assistant-Feldern: Titel, Button, Symbolsuche, Symbolfarben und Menüeinträge.
- Pro Eintrag: Beschriftung, durchsuchbare Symbolauswahl, individuelle Icon-Farbe, Domain/Service, Entität, JSON, Bestätigung, Freigabe und Deaktivierung.
- Menüs werden als schwebendes Popover angezeigt; Bedienung per Touch, Maus und Tastatur.
- Nur vorhandene und verfügbare Entitäten sind schaltbar; Aktionsfehler werden angezeigt.
- Die Konfiguration bleibt im Dashboard gespeichert. Beim Tippen bleibt der Editor erhalten und der Cursor behält seinen Fokus.

## Verwendung

Kartentyp: `custom:ha-sam-dropdown-card`

```yaml
type: custom:ha-sam-dropdown-card
title: Garage
label: Licht
icon: mdi:lightbulb-group
icon_color: blue
items:
  - label: Alle
    icon: mdi:lightbulb-group
    domain: light
    service: toggle
    entity: light.garage_lichtgruppe
  - label: Innen 1
    icon: mdi:lightbulb
    domain: light
    service: toggle
    entity: light.garage_innen_licht_1
```

## Installation

Custom Repository: `https://github.com/Salvasohn/ha-sam-dropdown-card` (HACS-Typ **Dashboard**). HACS-Installation erfolgt erst nach freigegebener Veröffentlichung auf `master`.

Für den Test ohne Master-Merge kann das getaggte JavaScript-Artefakt aus `00.01.06` nach `/config/www/ha-sam-dropdown-card.js` kopiert und als Dashboard-Ressource `/local/ha-sam-dropdown-card.js?v=00.01.06` registriert werden.

## Google JavaScript Style Guide

Die Implementierung folgt bei **Bezeichnern** dem [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html#naming):

| Kategorie | Regel | Beispiele |
| --- | --- | --- |
| Klassen | `UpperCamelCase` | `SamDropdownCard`, `SamDropdownEditor` |
| Funktionen und Methoden | `lowerCamelCase` | `normalizeCardConfig`, `createElement`, `isActionAvailable` |
| Parameter und lokale Variablen | `lowerCamelCase` | `menuButton`, `selectedAction`, `entitySuggestions` |
| Unveränderliche Modulkonstanten | `CONSTANT_CASE` | `CARD_VERSION`, `CARD_TAG_NAME`, `ACTION_PRESETS` |
| Private Felder/Methoden | `lowerCamelCase_` | `config_`, `openMenu_`, `renderEditor_` |

Drittanbieter-APIs sind **unverändert**: `setConfig`, `getConfigElement`, `getStubConfig`, `hass`, `config-changed`, `items`, `entity_id` und `custom:ha-sam-dropdown-card`. Alte Dashboard-Konfigurationen müssen daher nicht angepasst werden.

Zusätzlich ist `.clang-format` für den Google-basierten Formatierungsstil hinterlegt. `clang-format` formatiert Code, benennt aber **keine Bezeichner automatisch** um.

```bash
clang-format -i -style=file dist/ha-sam-dropdown-card.js
node --check dist/ha-sam-dropdown-card.js
python3 tests/validate.py
```

## Beiträge und Berechtigungen

Bugreports und Feedback: [Issues](https://github.com/Salvasohn/ha-sam-dropdown-card/issues). Externe Nutzer können Pull Requests aus Forks vorschlagen, besitzen aber ohne Freigabe keine Schreibrechte.

## Entwicklungsregeln

1. Lineare Historie (Fast-Forward/Rebase; keine Merge-Commits).
2. `master` nur nach expliziter Freigabe ändern.
3. Möglichst wenige Commits; ein lauffähiger Stand pro Version.
4. Jeder lauffähige Commit erhält das zugehörige Git-Tag `xx.xx.xx`, auch außerhalb von `master`.

## GUI-Verbesserungen ab 00.01.06

Native `ha-form`- und `ha-selector`-Felder für Symbol (`icon`) und Icon-Farbe (`ui_color`), auch je Menüpunkt. Die Farbe wird als `icon_color` gespeichert und mit Home-Assistant-Theme-Farbvariablen dargestellt. `setConfig` überspringt einen vollständigen Re-Render, wenn Home Assistant ein selbst erzeugtes `config-changed`-Ereignis zurückmeldet. Nur strukturelle Änderungen lösen einen gezielten Neuaufbau aus. Ein produktiver HA-Test steht noch aus.
