# SAM Dropdown Card

Lovelace-Dropdown-Karte für Home Assistant mit **grafischem Konfigurationseditor** zur Verwendung als eigenständige Detail-Card.

## Status

**Version 00.01.09 – Feature-Branch.** `master` bleibt ohne ausdrückliche Anweisung unverändert. Lauffähige Commits werden automatisch mit dem jeweiligen Tag im Format `xx.xx.xx` versehen.

## Funktionen

- Visueller Lovelace-Editor mit nativen Home-Assistant-Feldern: Layout (Standard, horizontal oder vertikal), Entität, Symbolsuche, Icon-Farbe und Menüeinträge. Symbol und Farbe stehen nebeneinander, die Entität darüber.
- Pro Eintrag: Beschriftung, durchsuchbare Symbolauswahl, individuelle Icon-Farbe, Entität, Bestätigung, Freigabe und Deaktivierung. Spezialaktionen sind in **Erweiterte Einstellungen** verborgen.
- Menüs werden als schwebendes Popover angezeigt; Bedienung per Touch, Maus und Tastatur.
- Nur vorhandene und verfügbare Entitäten sind schaltbar; Aktionsfehler werden angezeigt.
- Die Konfiguration bleibt im Dashboard gespeichert. Auch nach Auswahl einer Entität bleibt diese bei weiteren Eingaben und beim Speichern erhalten; beim Tippen bleibt der Cursor im Feld.

## Verwendung

Kartentyp: `custom:ha-sam-dropdown-card`

```yaml
type: custom:ha-sam-dropdown-card
title: Garage
label: Licht
icon: mdi:lightbulb-group
icon_color: blue
layout: default
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

Für den Test ohne Master-Merge kann das getaggte JavaScript-Artefakt aus `00.01.09` nach `/config/www/ha-sam-dropdown-card.js` kopiert und als Dashboard-Ressource `/local/ha-sam-dropdown-card.js?v=00.01.09` registriert werden.

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

## 00.01.07 – Garage-Licht-Vorlage und Editor-Fixes

Neue Karten starten mit dem vorhandenen Garage-Licht-Dropdown: Button **Licht** (`mdi:lightbulb-group`) mit den Einträgen **Alle**, **Innen 1**, **Innen 2**, **Innen 3** und den entsprechenden `light.garage_*`-Entitäten. Diese Vorbelegung wird ausschließlich für neu erstellte Karten ohne explizite `items` verwendet. Bestehende Karten mit `items: []` oder individuellen Einträgen behalten diese Einstellungen.

In der GUI stehen **Entität** vor **Symbol** und **Icon-Farbe**; Symbol und Farbe sind in einer zweispaltigen Zeile angeordnet, sowohl im Hauptbereich als auch je Menüeintrag. Die interne Konfiguration wird bei einem lokalen Home-Assistant-Echo nicht mehr ersetzt, damit die Entitätsauswahl beim Speichern bestehen bleibt.

## 00.01.08 – Button-Layout

Das GUI-Feld **Layout** unter **Darstellung** bietet jetzt **Standard-Layout**, **Horizontales Layout** und **Vertikales Layout**. `layout: default` verwendet dieselbe horizontale Darstellung wie bisher. Ältere Karten mit `layout: horizontal` bleiben unverändert. Bei vertikalem Layout wird nur der Dropdown-Auslösebutton umgeordnet; die eigentliche Menüeintragsliste bleibt wie bisher bedienbar. Der vertikale Button erhält mehr Höhe und der Dropdown-Pfeil steht rechts oben. Bestehende Entitätsauswahl, Icons, Farben und die Garage-Defaults bleiben unverändert.

## 00.01.09 – Vereinfachte Aktionen und Standard-Layout

- Layoutauswahl: **Standard-Layout**, **Horizontales Layout**, **Vertikales Layout**. Standard-Layout und horizontales Layout zeigen Symbol und Beschriftung nebeneinander.
- Unter einem Menüeintrag sind **Bezeichnung**, **Entität**, **Symbol** und **Icon-Farbe** direkt sichtbar. **Aktion** liegt ausschließlich unter **Erweiterte Einstellungen**.
- **Standard (automatisch)** schaltet `light`, `switch`, `input_boolean`, `fan` und `automation` mit `toggle`. Nicht umschaltbare Entitätsarten öffnen die Home-Assistant-Detailansicht (`more-info`), statt einen ungeeigneten Service aufzurufen. Andere Domänen wie `cover` werden **nicht** automatisch betätigt.
- Erweiterte Aktionen: **Mehr Informationen**, **Dienst ausführen**, **Navigation** und **URL öffnen**. `Domain`, `Service` und JSON-Daten erscheinen nur bei Dienstaufrufen; für Navigation/URL werden die passenden Eingabefelder eingeblendet.
- **Abwärtskompatibilität:** Bereits konfigurierte `domain`/`service`-Aktionen werden weiterhin ausgeführt. Insbesondere `scene.turn_on`, `lawn_mower.dock` und `input_select.select_option` bleiben unverändert. Ein bestehender `light.toggle` wird als normale Umschaltaktion erkannt.
- Neu angelegte Einträge benötigen für das Standardverhalten nur eine Entität, keinen expliziten Service. Die vorgegebenen vier Garagenlichter bleiben unverändert.

### Neues Konfigurationsschema

```yaml
type: custom:ha-sam-dropdown-card
label: Licht
layout: default
items:
  - label: Garagenlicht
    entity: light.garage_lichtgruppe  # Automatisch light.toggle
  - label: Luftfeuchtigkeit
    entity: sensor.garage_humidity   # Automatisch Mehr Informationen
  - label: Ladestation
    entity: lawn_mower.mahroboter
    action: call-service
    domain: lawn_mower
    service: dock
    confirm: "Roboter zur Ladestation senden?"
```

Die vorhandenen Eigenschaften `domain`, `service` und `data` werden bei Alt-Konfigurationen weiter unterstützt. `action` ist optional und wird nur gesetzt, wenn die Auswahl im erweiterten Editor geändert wird.
