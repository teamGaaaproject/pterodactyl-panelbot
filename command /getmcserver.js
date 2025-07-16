
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createPteroUser, createMCServer, getServerIP } = require('../utils/pterodactyl');
const { hasServer, storeServer } = require('../utils/storage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('getmcserver')
    .setDescription('🎮 Create your free Minecraft server (1 per user)')
    .addStringOption(opt =>
      opt.setName('email').setDescription('Your email').setRequired(true))
    .addStringOption(opt =>
      opt.setName('username').setDescription('Panel username').setRequired(true))
    .addStringOption(opt =>
      opt.setName('firstname').setDescription('Your first name').setRequired(true))
    .addStringOption(opt =>
      opt.setName('lastname').setDescription('Your last name').setRequired(true))
    .addStringOption(opt =>
      opt.setName('password').setDescription('Password for panel login').setRequired(true)),

  async execute(interaction) {
    const userId = interaction.user.id;

    if (hasServer(userId)) {
      return interaction.reply({ content: '❌ You already created a server.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const email = interaction.options.getString('email');
    const username = interaction.options.getString('username');
    const firstname = interaction.options.getString('firstname');
    const lastname = interaction.options.getString('lastname');
    const password = interaction.options.getString('password');

    try {
      // Step 1: Create Pterodactyl user
      const user = await createPteroUser(email, username, firstname, lastname, password);
      if (!user || !user.id) throw new Error('User creation failed');

      // Step 2: Create Minecraft server
      const server = await createMCServer(user.id, username);
      const { ip, port } = await getServerIP(server.identifier);

      // Step 3: DM server info
      const embed = new EmbedBuilder()
        .setTitle('🟢 Your Minecraft Server is Ready!')
        .setColor('Green')
        .setDescription(`🎮 Server Info:`)
        .addFields(
          { name: '📡 IP:Port', value: `\`${ip}:${port}\`` },
          { name: '🔐 Panel Login', value: `**Username:** \`${username}\`\n**Password:** \`${password}\`` },
          { name: '🌍 Panel URL', value: `[Click to login](https://paid.lpnodes.qzz)` },
          { name: '🧠 Specs', value: 'RAM: 1GB | Disk: 7GB | CPU: 100%' }
        )
        .setFooter({ text: 'Made by galaxy.linux' });

      await interaction.user.send({ embeds: [embed] });
      await interaction.editReply({ content: '✅ Your server has been created! Check your DMs.' });

      storeServer(userId, server.identifier);
    } catch (err) {
      console.error(err);
      await interaction.editReply({ content: '❌ Something went wrong while creating the server.' });
    }
  }
};
