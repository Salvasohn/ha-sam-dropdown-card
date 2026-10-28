# SAM Dropdown Card

Lovelace-Dropdown-Karte für Home Assistant mit **grafischem Konfigurationseditor** zur Verwendung als eigenständige Detail-Card.

## Status

**Version 00.01.12 – Feature-Branch.** `master` bleibt ohne ausdrückliche Anweisung unverändert. Lauffähige Commits werden automatisch mit dem jeweiligen Tag im Format `xx.xx.xx` versehen.

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

Für den Test ohne Master-Merge kann das getaggte JavaScript-Artefakt aus `00.01.12` nach `/config/www/ha-sam-dropdown-card.js` kopiert und als Dashboard-Ressource `/local/ha-sam-dropdown-card.js?v=00.01.12` registriert werden.

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

## 00.01.11 – Vereinfachte Aktionen und Standard-Layout

Für die Button-Darstellung sind `layout: default` (Garage-Standard), `layout: horizontal` und `layout: vertical` möglich. `layout: vertical` setzt das Symbol über den Namen; die beiden anderen Werte platzieren es links daneben.


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

## 00.01.11 – Zwei gleichzeitige Zustandsvorschauen

Die **rechte Vorschau im Home-Assistant-Karteneditor** zeigt jetzt gleichzeitig zwei Bereiche:
- **Dropdown – geschlossen:** derselbe Button wie auf dem Dashboard, ohne geöffnetes Menü.
- **Dropdown – geöffnet:** derselbe Button und darunter alle konfigurierten Menüeinträge.

Dabei werden `label`, `icon`, `icon_color`, `layout` und `items` aus der aktuellen Kartenkonfiguration verwendet. Änderungen im Editor aktualisieren **beide** Ansichten. Das aufgeklappte Menü wird im Editor bewusst **inline** dargestellt, damit es nicht abgeschnitten oder vom Karten-Popup verdeckt wird.

**Sicherheit:** Beide Ansichten sind ausschließlich visuelle Vorschauen. Klicken auf die Vorschau löst weder Service-Aufrufe noch Navigation aus. Auf dem **gespeicherten Dashboard** bleibt die Karte unverändert: ein einzelner interaktiver Dropdown-Button, dessen Menü sich bei Klick öffnet. Home Assistant kennzeichnet die Karte im Editor über die Eigenschaft `preview`; es wird keine zusätzliche Kartenkonfiguration benötigt.

## 00.01.11 – Inhaltsbreite und Rechtsausrichtung des Dropdowns

Das schwebende Dropdown passt sich horizontal dem **breitesten Menüeintrag** an (`width: max-content` mit einer Mindestbreite von 140 px), statt die vollständige Breite des übergeordneten Buttons einzunehmen. Die **rechte Menükante wird an der rechten Kante des übergeordneten Dropdown-Buttons** ausgerichtet. Falls die so berechnete Position über den linken oder rechten Bildschirmrand hinausragt, bleibt ein Rand von mindestens 4 px zum sichtbaren Bereich erhalten. Lange Bezeichnungen werden bei Platzmangel gekürzt, statt das Menü über den Viewport hinausragen zu lassen.

In der **geöffneten Vorschau** ist das Menü ebenfalls nur so breit wie sein Inhalt und rechtsbündig zum darüberliegenden Button ausgerichtet. Die geschlossene Vorschau sowie die normale Buttonbreite bleiben unverändert. Die Aktions- und Editorlogik ist von dieser Änderung unberührt.

## 00.01.12 – Statusabhängige Icons und ausgerichtete Vorschau

- Der Elternbutton leuchtet in seiner konfigurierten Icon-Farbe, sobald mindestens eine konfigurierte Entität aktiv ist. Sind alle schaltbaren Entitäten aus, erscheint sein Symbol grau. Diese Aggregation funktioniert auch ohne separate übergeordnete Entität.
- Einträge mit aktivem Zustand (`on`, unterstützte Öffnungs-/Wiedergabe-/Schlosszustände) leuchten in der individuell gewählten Farbe. Ausgeschaltete Symbole sind grau; nicht sinnvoll binär auswertbare Entitäten behalten ihre konfigurierte Farbe, beeinflussen jedoch nicht den Elternstatus.
- Zustandsänderungen von Home Assistant aktualisieren die Symbole unmittelbar in beiden Editorvorschauen und im Dashboard, ohne das geöffnete Menü oder die Editor-Eingaben neu aufzubauen.
- `box-sizing: border-box` behebt den Breitenüberlauf des Buttons. Dadurch fluchtet die rechte Kante der geöffneten Vorschau exakt mit der rechten Buttonkante; die inhaltsabhängige Menübreite bleibt erhalten.
