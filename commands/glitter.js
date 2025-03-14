import { SlashCommandBuilder } from '@discordjs/builders';
import { getRandomItem, handleCommandError } from '../util/helpers.js';

// List of glitter messages
const GLITTER_MESSAGES = [
  "has been covered in sparkly pink glitter! ✨✨✨",
  "is now sparkling with rainbow glitter! It's EVERYWHERE! 🌈✨",
  "has been hit by a glitter bomb! Good luck cleaning that up! ✨💣✨",
  "is now 90% glitter, 10% human. Congratulations! ✨👤✨",
  "will be finding glitter in strange places for weeks! ✨🔍✨",
  "is now the shiniest thing in the server! MY EYES! 👀✨",
  "has been transformed into a walking disco ball! ✨🕺✨",
  "is leaving a trail of glitter wherever they go! ✨👣✨",
  "has achieved maximum sparkle capacity! ✨💯✨",
  "is now visible from space thanks to all that glitter! ✨🛰️✨"
];

export const data = new SlashCommandBuilder()
  .setName('glitter')
  .setDescription('Cover a user in virtual glitter')
  .addUserOption(option => 
    option.setName('user')
      .setDescription('The user to cover in glitter')
      .setRequired(true)
  );

export async function execute(interaction) {
  try {
    const targetUser = interaction.options.getUser('user');
    
    // Get a random glitter message
    const randomMessage = getRandomItem(GLITTER_MESSAGES);
    
    // Create the glitter message with emojis for extra effect
    const responseMessage = `✨✨✨ ${targetUser} ${randomMessage} ✨✨✨`;
    
    // Send the response
    await interaction.reply({
      content: responseMessage,
      allowedMentions: { users: [targetUser.id] }
    });
  } catch (error) {
    await handleCommandError(error, interaction);
  }
}
