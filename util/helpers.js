/**
 * Shared utility functions for Discord bot commands
 */

import fetch from 'node-fetch';

/**
 * Fetches a random GIF from Giphy based on the search term
 * @param {string} searchTerm - The search term for the GIF
 * @param {string} apiKey - The Giphy API key
 * @returns {Promise<string>} - URL of the random GIF
 */
export async function fetchRandomGif(searchTerm = 'poke', apiKey) {
  if (!apiKey) {
    throw new Error('GIPHY_API_KEY is not defined in environment variables');
  }
  
  try {
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/random?api_key=${apiKey}&tag=${encodeURIComponent(searchTerm)}&rating=PG-13`
    );
    
    if (!response.ok) {
      throw new Error(`Giphy API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.data || !data.data.images || !data.data.images.original) {
      throw new Error('Invalid response format from Giphy API');
    }
    
    return data.data.images.original.url;
  } catch (error) {
    console.error('Error fetching GIF from Giphy:', error);
    // Return a fallback GIF URL in case of error
    return 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif';
  }
}

/**
 * Creates a random selection from an array
 * @param {Array} array - The array to select from
 * @returns {*} - A random element from the array
 */
export function getRandomItem(array) {
  if (!Array.isArray(array) || array.length === 0) {
    throw new Error('Invalid array provided to getRandomItem');
  }
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Handles error logging and user feedback for command errors
 * @param {Error} error - The error that occurred
 * @param {Object} interaction - The Discord interaction object
 */
export async function handleCommandError(error, interaction) {
  console.error(`Error in ${interaction.commandName} command:`, error);
  
  const errorMessage = 'There was an error while executing this command!';
  
  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ 
        content: errorMessage, 
        ephemeral: true 
      });
    } else {
      await interaction.reply({ 
        content: errorMessage, 
        ephemeral: true 
      });
    }
  } catch (followupError) {
    console.error('Error sending error message to user:', followupError);
  }
}
