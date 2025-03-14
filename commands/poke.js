import { SlashCommandBuilder } from '@discordjs/builders';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, MessageFlags } from 'discord.js';
import { fetchRandomGif, handleCommandError } from '../util/helpers.js';

// Get API key from environment variables
const GIPHY_API_KEY = process.env.GIPHY_API_KEY;

// Poke styles with their emoji and message formats
const POKE_STYLES = {
  gentle: {
    emoji: '👉',
    format: (user, message) => `*Gently pokes ${user}* ${message ? `\n> ${message}` : ''}`
  },
  playful: {
    emoji: '😜',
    format: (user, message) => `*Playfully pokes ${user}* ${message ? `\n> ${message}` : ''}`
  },
  aggressive: {
    emoji: '👊',
    format: (user, message) => `*Aggressively pokes ${user}* ${message ? `\n> ${message}` : ''}`
  }
};

// Default poke style
const DEFAULT_STYLE = 'playful';

export const data = new SlashCommandBuilder()
  .setName('poke')
  .setDescription('Poke a user')
  .addUserOption(option => 
    option.setName('user')
      .setDescription('The user to poke')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('message')
      .setDescription('Optional message to send with your poke')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('gif')
      .setDescription('Search term for the GIF (default: poke)')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('style')
      .setDescription('Style of the poke')
      .setRequired(false)
      .addChoices(
        { name: 'Gentle', value: 'gentle' },
        { name: 'Playful', value: 'playful' },
        { name: 'Aggressive', value: 'aggressive' }
      )
  );

export async function execute(interaction) {
  try {
    // Get options from the command
    const targetUser = interaction.options.getUser('user');
    const message = interaction.options.getString('message') || '';
    const searchTerm = interaction.options.getString('gif') || 'poke';
    const style = interaction.options.getString('style') || DEFAULT_STYLE;
    
    // Fetch a GIF based on the search term
    const gifUrl = await fetchRandomGif(searchTerm, GIPHY_API_KEY);
    let currentGifUrl = gifUrl;
    
    // Create the poke message
    const pokeStyle = POKE_STYLES[style] || POKE_STYLES[DEFAULT_STYLE];
    const emoji = pokeStyle.emoji;
    const responseMessage = pokeStyle.format(targetUser.toString(), message);
    
    // Create action row with buttons for GIF preview
    const row = createPreviewButtons();
    
    // Show GIF preview with buttons
    await interaction.reply({
      content: `Preview of your poke:\n${responseMessage}\n[GIF](${currentGifUrl})`,
      components: [row],
      flags: MessageFlags.Ephemeral
    });
    
    // Create a message collector to handle button interactions
    const buttonFilter = i => ['confirm', 'shuffle', 'cancel'].includes(i.customId) && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter: buttonFilter, time: 30000 });
    
    collector.on('collect', async i => {
      if (i.customId === 'confirm') {
        await handleConfirmation(i, interaction, targetUser, responseMessage, currentGifUrl);
      } else if (i.customId === 'shuffle') {
        // Fetch a new GIF with the same search term
        currentGifUrl = await fetchRandomGif(searchTerm, GIPHY_API_KEY);
        await i.update({ 
          content: `Preview of your poke:\n${responseMessage}\n[GIF](${currentGifUrl})`,
          components: [row],
          flags: MessageFlags.Ephemeral
        });
      } else if (i.customId === 'cancel') {
        await i.update({ 
          content: 'Poke cancelled.',
          components: [],
          flags: MessageFlags.Ephemeral
        });
      }
    });
    
    // When the collector ends (timeout), update the message
    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.editReply({ 
          content: 'No response received. Poke cancelled.',
          components: [],
          flags: MessageFlags.Ephemeral
        }).catch(console.error);
      }
    });
  } catch (error) {
    await handleCommandError(error, interaction);
  }
}

/**
 * Creates the action row with preview buttons
 * @returns {ActionRowBuilder} The action row with buttons
 */
function createPreviewButtons() {
  return new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('confirm')
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('shuffle')
        .setLabel('Shuffle GIF')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Danger)
    );
}

/**
 * Handles the confirmation of a poke and sets up the poke back functionality
 * @param {Object} i - The interaction
 * @param {Object} originalInteraction - The original slash command interaction
 * @param {Object} targetUser - The user being poked
 * @param {string} responseMessage - The formatted poke message
 * @param {string} gifUrl - The GIF URL to use
 */
async function handleConfirmation(i, originalInteraction, targetUser, responseMessage, gifUrl) {
  try {
    // First update the ephemeral message to show it's been sent
    await i.update({ 
      content: `Your poke has been sent!`, 
      components: [],
      flags: MessageFlags.Ephemeral
    });
    
    // Create poke back button
    const pokeBackRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`pokeback_${originalInteraction.user.id}`)
          .setLabel('Poke Back')
          .setEmoji('👉')
          .setStyle(ButtonStyle.Secondary)
      );
    
    // Send the poke message with the poke back button
    const pokeMessage = await originalInteraction.channel.send({
      content: responseMessage,
      files: [{ attachment: gifUrl, name: 'poke.gif' }],
      components: [pokeBackRow]
    });
    
    // Set up collector for poke back button
    setupPokeBackCollector(pokeMessage, originalInteraction, targetUser);
  } catch (error) {
    console.error('Error handling poke confirmation:', error);
  }
}

/**
 * Sets up the collector for the poke back button
 * @param {Object} pokeMessage - The message containing the poke back button
 * @param {Object} originalInteraction - The original slash command interaction
 * @param {Object} targetUser - The user who can poke back
 */
function setupPokeBackCollector(pokeMessage, originalInteraction, targetUser) {
  // Set up a collector for the poke back button
  const pokeBackFilter = i => i.customId === `pokeback_${originalInteraction.user.id}` && i.user.id === targetUser.id;
  const pokeBackCollector = pokeMessage.createMessageComponentCollector({ 
    filter: pokeBackFilter, 
    time: 300000 // 5 minutes
  });
  
  pokeBackCollector.on('collect', async i => {
    await handlePokeBack(i, originalInteraction);
  });
  
  // When the collector ends, remove the button
  pokeBackCollector.on('end', () => {
    pokeMessage.edit({ components: [] }).catch(console.error);
  });
}

/**
 * Handles the poke back interaction
 * @param {Object} i - The interaction
 * @param {Object} originalInteraction - The original slash command interaction
 */
async function handlePokeBack(i, originalInteraction) {
  try {
    // Create a modal for the poke back
    const pokeBackModal = new ModalBuilder()
      .setCustomId('pokeBackModal')
      .setTitle(`Poke ${originalInteraction.user.username} Back`);
    
    // Create inputs for the poke back modal
    const gifInput = new TextInputBuilder()
      .setCustomId('gifSearchTerm')
      .setLabel('GIF Search Term')
      .setPlaceholder('e.g., poke, revenge, gotcha')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setValue('poke back');
    
    const messageInput = new TextInputBuilder()
      .setCustomId('pokeMessage')
      .setLabel('Message (Optional)')
      .setPlaceholder('Add a message to your poke back')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);
    
    const styleInput = new TextInputBuilder()
      .setCustomId('pokeStyle')
      .setLabel('Poke Style (Optional)')
      .setPlaceholder('gentle, playful, or aggressive')
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
      .setValue('playful');
    
    // Add inputs to action rows
    const firstRow = new ActionRowBuilder().addComponents(gifInput);
    const secondRow = new ActionRowBuilder().addComponents(messageInput);
    const thirdRow = new ActionRowBuilder().addComponents(styleInput);
    
    // Add action rows to the modal
    pokeBackModal.addComponents(firstRow, secondRow, thirdRow);
    
    // Show the modal
    await i.showModal(pokeBackModal);
    
    // Handle the modal submission
    const pokeBackSubmission = await i.awaitModalSubmit({ time: 300000 }).catch(() => null);
    if (!pokeBackSubmission) return;
    
    // Get values from the modal
    const searchTerm = pokeBackSubmission.fields.getTextInputValue('gifSearchTerm') || 'poke back';
    const message = pokeBackSubmission.fields.getTextInputValue('pokeMessage') || '';
    const style = pokeBackSubmission.fields.getTextInputValue('pokeStyle') || DEFAULT_STYLE;
    
    // Fetch a GIF
    const pokeBackGifUrl = await fetchRandomGif(searchTerm, GIPHY_API_KEY);
    
    // Create the poke back message
    const pokeBackStyle = POKE_STYLES[style] || POKE_STYLES[DEFAULT_STYLE];
    const pokeBackMessage = pokeBackStyle.format(originalInteraction.user.toString(), message);
    
    // Send the poke back message
    await pokeBackSubmission.reply({
      content: pokeBackMessage,
      files: [{ attachment: pokeBackGifUrl, name: 'pokeback.gif' }]
    });
    
    // Disable the poke back button after it's been used
    await i.message.edit({
      components: []
    }).catch(console.error);
  } catch (error) {
    console.error('Error handling poke back:', error);
  }
}