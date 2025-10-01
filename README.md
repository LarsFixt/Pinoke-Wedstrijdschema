# Pinoké Wedstrijdschema

Pinoké Wedstrijdschema is een webapplicatie die het aankomende thuiswedstrijdschema voor de hockeyclub Pinoké weergeeft. Het biedt een duidelijke en gebruiksvriendelijke interface om wedstrijddetails te bekijken op een televisie/signage scherm in een clubhuis, inclusief teams, tijden en veldnummers.

## Functies

* **Live Wedstrijdgegevens**: Haalt de nieuwste wedstrijdschema's op en geeft deze weer.
* **Focus op Thuiswedstrijden**: Filtert om alleen de thuiswedstrijden te tonen die gespeeld worden in het "Amsterdamse Bos (Pinoké)".
* **Wedstrijden van Vandaag en Aankomend**: Toont de wedstrijden van vandaag of, als er geen zijn, de eerstvolgende dag met wedstrijden.
* **Automatische Updates**: Het schema voor de huidige dag wordt automatisch bijgewerkt en ververst elk uur.
* **Live Status**: Geeft aan of een wedstrijd bezig is of binnenkort start.
* **Carousel Weergave**: Wedstrijden worden overzichtelijk getoond in een carousel, met paginering en automatische rotatie.
* **Veld- en Scheidsrechterinformatie**: Toont veldnummer en scheidsrechters per wedstrijd.
* **Laatste Update Tijd**: Geeft aan wanneer de gegevens voor het laatst zijn bijgewerkt.

## Tech Stack

* **Framework**: [Nuxt.js](https://nuxt.com/)
* **JavaScript Library**: [Vue.js](https://vuejs.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)

## Data Source

De wedstrijdgegevens worden opgehaald van de officiële Pinoké website, die gebruikmaakt van de LISA hockeydatabase. Dit project is niet officieel verbonden aan of goedgekeurd door Pinoké of LISA Hockey. De data wordt gebruikt zoals deze beschikbaar is, en de nauwkeurigheid is afhankelijk van de bron. Zie de [LISA Hockey](https://www.lisahockey.nl) voor meer informatie over hun diensten.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

### Development Server

Start the development server on http://localhost:3000:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

### Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

## Licentie

Dit project is gelicentieerd onder de **GPL-3.0 license**. Zie het `LICENSE` bestand voor meer details.