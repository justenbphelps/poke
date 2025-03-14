import { SlashCommandBuilder } from '@discordjs/builders';
import { getRandomItem, handleCommandError } from '../util/helpers.js';

// Roast categories with their respective roasts
const ROAST_CATEGORIES = {
  friendly: [
    "I'd roast you, but my mom said I shouldn't burn trash.",
    "You're the reason they put instructions on shampoo.",
    "If laughter is the best medicine, your face must be curing the world.",
    "I'm not saying you're boring, but you make plain bread look exciting.",
    "You have so many gaps in your knowledge, it's like a golf course up there.",
    "I'd tell you to go outside and touch grass, but I'm afraid the grass would run away.",
    "Your fashion sense called. It's filing for divorce.",
    "You're not completely useless... you can always serve as a bad example.",
    "I'm not insulting you, I'm describing you.",
    "If you were a vegetable, you'd be a 'cute-cumber'... but you're not, so you're just a potato."
  ],
  nerdy: [
    "You're like a broken compiler - you never get anything right.",
    "Your code has more bugs than an ant farm.",
    "You're like IPv4 - increasingly outdated but somehow still around.",
    "Your logic has more holes than a deprecated API.",
    "You're like Windows Vista - nobody wants you around for long.",
    "You have the processing power of a potato calculator.",
    "Your brain runs on Internet Explorer.",
    "You're like a USB stick - takes three tries to get anything right.",
    "You're so dense, light bends around you. That's relativity for you.",
    "You're like a quantum computer - nobody really understands how you work."
  ],
  savage: [
    "I'm jealous of people who don't know you.",
    "You're as sharp as a marble.",
    "I'd tell you a joke, but it looks like your life already did that.",
    "You're not stupid; you just have bad luck when thinking.",
    "You bring everyone so much joy... when you leave the room.",
    "I'm not saying I hate you, but I would unplug your life support to charge my phone.",
    "Your birth certificate is an apology letter from the condom factory.",
    "I bet your brain feels as good as new, seeing that you've never used it.",
    "If I wanted to kill myself, I'd climb your ego and jump to your IQ.",
    "You're so dense, light bends around you."
  ]
};

// Defensive comebacks when the bot decides to defend instead of roast
const DEFENSES = [
  "I was going to roast you, but you know what? You're actually pretty cool.",
  "Nah, I can't roast you today. You're too awesome for that.",
  "Roast you? But then who would brighten everyone's day with their presence?",
  "I'd roast you, but I'm too busy admiring your positive qualities.",
  "Sorry, I only roast people I don't respect. You're off the hook.",
  "You want me to roast you? That's like trying to find flaws in a masterpiece.",
  "I was going to roast you, but then I realized I'd be jealous of you.",
  "Roasting you would be like criticizing a rainbow for having too many colors.",
  "I can't roast someone who's clearly living their best life.",
  "Roast denied. You deserve compliments, not burns."
];

// Category emojis for visual distinction
const CATEGORY_EMOJIS = {
  friendly: '😜',
  nerdy: '🤓',
  savage: '🔥',
  random: '🎯',
  defense: '🛡️'
};

// Chance to defend instead of roast (15%)
const DEFENSE_CHANCE = 0.15;

export const data = new SlashCommandBuilder()
  .setName('roast')
  .setDescription('Roast a user with a light-hearted joke')
  .addUserOption(option => 
    option.setName('user')
      .setDescription('The user to roast')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('category')
      .setDescription('Type of roast')
      .setRequired(false)
      .addChoices(
        { name: 'Friendly', value: 'friendly' },
        { name: 'Nerdy', value: 'nerdy' },
        { name: 'Savage', value: 'savage' },
        { name: 'Random', value: 'random' }
      )
  );

export async function execute(interaction) {
  try {
    const targetUser = interaction.options.getUser('user');
    const category = interaction.options.getString('category') || 'random';
    
    // Determine if we should defend instead of roast
    const shouldDefend = Math.random() < DEFENSE_CHANCE;
    
    if (shouldDefend) {
      await handleDefense(interaction, targetUser);
      return;
    }
    
    await handleRoast(interaction, targetUser, category);
  } catch (error) {
    await handleCommandError(error, interaction);
  }
}

/**
 * Handles sending a defense message instead of a roast
 * @param {Object} interaction - The Discord interaction
 * @param {Object} targetUser - The user who would have been roasted
 */
async function handleDefense(interaction, targetUser) {
  // Get a random defense
  const defense = getRandomItem(DEFENSES);
  
  // Create the defense message
  const responseMessage = `${CATEGORY_EMOJIS.defense} ${targetUser}, ${defense}`;
  
  // Send the response
  await interaction.reply({
    content: responseMessage,
    allowedMentions: { users: [targetUser.id] }
  });
}

/**
 * Handles sending a roast message
 * @param {Object} interaction - The Discord interaction
 * @param {Object} targetUser - The user to roast
 * @param {string} category - The category of roast to use
 */
async function handleRoast(interaction, targetUser, category) {
  // Get roasts from the selected category
  let roasts;
  let selectedCategory = category;
  
  if (category === 'random') {
    // Get all roasts from all categories
    const allCategories = Object.keys(ROAST_CATEGORIES);
    selectedCategory = getRandomItem(allCategories);
  }
  
  roasts = ROAST_CATEGORIES[selectedCategory];
  
  // Get a random roast
  const randomRoast = getRandomItem(roasts);
  
  // Get the appropriate emoji for the category
  const categoryEmoji = CATEGORY_EMOJIS[selectedCategory] || CATEGORY_EMOJIS.random;
  
  // Create the roast message
  const responseMessage = `${categoryEmoji} ${targetUser}, ${randomRoast}`;
  
  // Send the response
  await interaction.reply({
    content: responseMessage,
    allowedMentions: { users: [targetUser.id] }
  });
}
