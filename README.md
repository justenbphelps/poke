# Poke! Discord Bot

A fun Discord bot with playful commands for interactive server experiences. Poke friends, send light-hearted roasts, or shower them with virtual glitter!

<div align="center">
  <img src="https://img.shields.io/badge/discord.js-v14-blue" alt="discord.js v14">
  <img src="https://img.shields.io/badge/bun-%3E%3D1.0.0-orange" alt="Bun >=1.0.0">
  <img src="https://img.shields.io/badge/servers-50k%2B-brightgreen" alt="50k+ servers">
  <img src="https://img.shields.io/badge/uptime-99.9%25-success" alt="99.9% uptime">
</div>

## Features

- **Poke Command**: Poke users with customizable styles, messages, and GIFs
- **Roast Command**: Send light-hearted roasts with different categories
- **Glitter Command**: Cover users in virtual glitter with fun messages
- **Interactive UI**: Preview GIFs before sending, shuffle for different options
- **Poke Back**: Recipients can respond to pokes with their own customized poke
- **Modern Landing Page**: Professional website showcasing the bot's features

## Project Structure

```
poke/
├── commands/         # Command implementations
│   ├── poke.js       # Poke command
│   ├── roast.js      # Roast command
│   └── glitter.js    # Glitter command
├── docs/             # Landing page files
│   ├── index.html    # Main landing page
│   ├── privacy.html  # Privacy policy
│   └── terms.html    # Terms of service
├── util/             # Utility scripts
│   ├── bot.js        # Main bot file
│   ├── deploy.js     # Command deployment script
│   └── helpers.js    # Shared utility functions
├── .env              # Environment variables
├── Dockerfile        # Container configuration
├── railway.toml      # Railway deployment config
├── package.json      # Project configuration
└── README.md         # This file
```

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   bun install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   DISCORD_TOKEN=your_bot_token
   DISCORD_CLIENT_ID=your_application_id
   GIPHY_API_KEY=your_giphy_api_key
   ```
4. Deploy slash commands:
   ```
   bun run deploy
   ```
5. Start the bot:
   ```
   bun run start
   ```

## Environment Variables

- `DISCORD_TOKEN`: Your bot's token from the Discord Developer Portal
- `DISCORD_CLIENT_ID`: Your application's client ID from the Discord Developer Portal
- `GIPHY_API_KEY`: API key for Giphy to fetch GIFs (get one at [developers.giphy.com](https://developers.giphy.com/))

## Commands

### /poke

Pokes a user with customizable options.

- **user**: The user to poke (required)
- **message**: Optional message to send with the poke
- **gif**: Search term for the GIF (default: poke)
- **style**: Style of the poke (gentle, playful, aggressive)

The command includes a preview with options to shuffle GIFs before sending. The recipient can also poke back using a button.

### /roast

Roasts a user with a light-hearted joke.

- **user**: The user to roast (required)
- **category**: Type of roast (friendly, nerdy, savage, random)

There's a 15% chance the bot will defend the user instead of roasting them.

### /glitter

Covers a user in virtual glitter with a fun message.

- **user**: The user to cover in glitter (required)

## Deployment

### Railway

This project is configured for deployment on Railway with the following files:

- `Dockerfile`: Container configuration for Bun runtime
- `railway.toml`: Railway deployment configuration
- `Procfile`: Process definition for the web service

### GitHub Pages

The landing page can be deployed to GitHub Pages:

1. Go to repository settings
2. Navigate to Pages section
3. Select the `docs` folder as the source
4. The site will be available at `https://yourusername.github.io/poke`

## Development

### Adding New Commands

1. Create a new file in the `commands` directory
2. Export a `data` object with the command definition
3. Export an `execute` function to handle the command
4. Run `bun run deploy` to register the new command

### Utility Functions

The project includes shared utility functions in `util/helpers.js`:

- `fetchRandomGif`: Fetches a random GIF from Giphy
- `getRandomItem`: Gets a random item from an array
- `handleCommandError`: Centralized error handling for commands

## Landing Page

The bot includes a modern, professional landing page with:

- Responsive design for all device sizes
- Feature showcase with animated elements
- Command documentation
- Social proof with statistics and testimonials
- Privacy policy and terms of service
- "Add to Discord" button for easy installation

## License

MIT
