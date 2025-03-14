/**
 * Main bot file that handles command loading and event handling
 */

import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Convert ESM __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file (Bun automatically loads .env files)
const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error('Missing required environment variable: DISCORD_TOKEN');
  process.exit(1);
}

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Create a collection for commands
client.commands = new Collection();

// Load all command files
async function loadCommands() {
  try {
    // Adjust path to point to the commands directory from util
    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = await import(`file://${filePath}`);
      
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`Loaded command: ${command.data.name}`);
      } else {
        console.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
    
    console.log(`Successfully loaded ${client.commands.size} commands.`);
  } catch (error) {
    console.error(`Error loading commands: ${error.message}`);
  }
}

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Handle interactions (slash commands)
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isCommand()) return;
  
  const command = client.commands.get(interaction.commandName);
  
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }
  
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing ${interaction.commandName}:`, error);
    
    // Send an error message to the user
    const errorResponse = {
      content: 'There was an error while executing this command!',
      ephemeral: true
    };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorResponse).catch(console.error);
    } else {
      await interaction.reply(errorResponse).catch(console.error);
    }
  }
});

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('Bot is shutting down...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Bot is shutting down...');
  client.destroy();
  process.exit(0);
});

// Initialize the bot
async function init() {
  try {
    // Load commands before logging in
    await loadCommands();
    
    // Login to Discord with the bot token
    await client.login(token);
    
    console.log('Bot initialization complete!');
  } catch (error) {
    console.error('Error during bot initialization:', error);
    process.exit(1);
  }
}

// Start the bot
init();
