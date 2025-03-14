# Poke Discord Bot

A Discord bot with playful commands for interacting with other server members.

## Features

- **Poke Command**: Poke users with customizable styles, messages, and GIFs
- **Roast Command**: Send light-hearted roasts with different categories
- **Glitter Command**: Cover users in virtual glitter with fun messages
- **Poke Back**: Recipients can respond to pokes with their own customized poke

## Project Structure

```
poke/
├── commands/         # Command implementations
│   ├── poke.js       # Poke command
│   ├── roast.js      # Roast command
│   └── glitter.js    # Glitter command
├── util/             # Utility scripts
│   ├── bot.js        # Main bot file
│   ├── deploy.js     # Command deployment script
│   └── helpers.js    # Shared utility functions
├── .env              # Environment variables
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

## Environment Variables

- `DISCORD_TOKEN`: Your bot's token from the Discord Developer Portal
- `DISCORD_CLIENT_ID`: Your application's client ID from the Discord Developer Portal
- `GIPHY_API_KEY`: API key for Giphy to fetch GIFs (get one at [developers.giphy.com](https://developers.giphy.com/))

## Commands

### Deploying Slash Commands

To register the slash commands with Discord:

```
bun run deploy
```

### Starting the Bot

To start the bot:

```
bun run start
```

## Command Usage

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

## License

MIT
