/**
 * Command registration script for Discord bot
 * This script registers all slash commands with the Discord API
 */

import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Convert ESM __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file (Bun automatically loads .env files)
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

if (!token || !clientId) {
  console.error('Missing required environment variables: DISCORD_TOKEN and/or DISCORD_CLIENT_ID');
  process.exit(1);
}

// Debug output to verify token format (masked for security)
console.log(`Using token: ${token.substring(0, 4)}...${token.substring(token.length - 4)}`);
console.log(`Using client ID: ${clientId}`);

// Set up REST API client
const rest = new REST({ version: '10' }).setToken(token);

// Deploy commands
async function deployCommands() {
  const commands = [];
  
  // Adjust path to point to the commands directory from util
  const commandsPath = path.join(__dirname, '..', 'commands');
  
  try {
    // Read all command files
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = await import(`file://${filePath}`);
      
      if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(`Loaded command for deployment: ${command.data.name}`);
      } else {
        console.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
    
    console.log(`Started refreshing ${commands.length} application (/) commands.`);
    
    // The put method is used to fully refresh all commands
    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands },
    );
    
    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error('Error deploying commands:');
    if (error.status === 401) {
      console.error('Authentication failed: Invalid token. Please check your DISCORD_TOKEN.');
      console.error('Make sure you are using the bot token from the Discord Developer Portal.');
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

// Execute the deployment
deployCommands();