# SAM Dropdown Card

Lovelace-Dropdown-Karte für Home Assistant mit **grafischem Konfigurationseditor**, zur Verwendung als eigenständige Detail-Card.

## Status
**Version 00.01.01 – Feature-Branch.** \`master\` bleibt ohne ausdrückliche Anweisung unverändert. Lauffähige Versionen werden über GitHub Actions auf dem zugehörigen Commit mit Tags im Format \`xx.xx.xx\` versehen.

## Funktionen
- Visueller Lovelace-Editor: Titel, Button, Icon, beliebig viele Menüeinträge.
- Pro Eintrag: Beschriftung, MDI-Icon, HA-Domain/Service, Entität, Zusatzdaten (JSON), Bestätigung, Freigabe und Deaktivierung.
- Menüs werden als schwebendes Popover angezeigt. Touch, Maus und Tastatur.
- Nur vorhandene/verfügbare Entitäten sind schaltbar; Fehler werden angezeigt.
- Konfiguration bleibt im Home-Assistant-Dashboard gespeichert.

## Verwendung
Karte: \`custom:ha-sam-dropdown-card\`

\`\`\`yaml
type: custom:ha-sam-dropdown-card
title: Garage
label: Licht
icon: mdi:lightbulb-group
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
\`\`\`

## Installation
Das HACS-Custom-Repository ist \`https://github.com/Salvasohn/ha-sam-dropdown-card\` (Typ **Dashboard**).
Die reguläre Installation über HACS wird nach der ausdrücklich genehmigten Veröffentlichung auf dem Standardbranch geprüft.

Bis dahin manuell: \`dist/ha-sam-dropdown-card.js\` nach \`/config/www/ha-sam-dropdown-card.js\` kopieren, unter **Einstellungen → Dashboards → Ressourcen** die Ressource \`/local/ha-sam-dropdown-card.js\` als JavaScript-Modul eintragen.

## Mitwirkung
Fehlerberichte und Kommentare sind willkommen: [Issues](https://github.com/Salvasohn/ha-sam-dropdown-card/issues). Der Eigentümer und autorisierte Apps entscheiden über alle Änderungen. In öffentlichen GitHub-Repositories können Dritte weiterhin Pull Requests aus Forks *vorschlagen*, ohne Schreibrechte am Original zu haben; diese werden nicht automatisch übernommen.

## Entwicklungsregeln
1. Lineare Historie (Fast-Forward oder Rebase; keine Merge-Commits).
2. \`master\` nur mit ausdrücklicher Freigabe ändern.
3. Möglichst wenige, geprüfte Commits.
4. **Jeder lauffähige Commit** erhält ein unveränderliches annotiertes Git-Tag gemäß \`VERSION\` im Format \`xx.xx.xx\`, auch außerhalb von \`master\`.
