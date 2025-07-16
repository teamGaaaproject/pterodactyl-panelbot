const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ComponentType,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('📘 View bot commands and info'),

  async execute(interaction) {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('help_menu')
      .setPlaceholder('📘 Select a help category')
      .addOptions([
        {
          label: '🌐 User Commands',
          value: 'user',
          description: 'Commands regular users can use',
        },
        {
          label: '🛠 Admin Tools',
          value: 'admin',
          description: 'Commands available to bot admins',
        },
        {
          label: 'ℹ️ Bot Info',
          value: 'info',
          description: 'Learn about the bot and creator',
        },
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      content: '📘 **Help Menu**\nUse the dropdown below to browse commands.',
      components: [row],
      ephemeral: true,
    });

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter: i => i.user.id === interaction.user.id,
      time: 20000,
      max: 1,
    });

    collector.on('collect', async (menuInteraction) => {
      const value = menuInteraction.values[0];

      let embed;

      if (value === 'user') {
        embed = new EmbedBuilder()
          .setTitle('🌐 User Commands')
          .setColor('Green')
          .setDescription('Here are commands you can use as a normal user.')
          .addFields({
            name: '/getmcserver',
            value: '🎮 Create your free Minecraft server (1 per user)',
          });
      } else if (value === 'admin') {
        embed = new EmbedBuilder()
          .setTitle('🛠 Admin Commands')
          .setColor('Orange')
          .setDescription('Admin-only tools to manage users and servers.')
          .addFields({
            name: '/admin',
            value: '👑 Open the admin control panel with reset, check, and stats options.',
          });
      } else if (value === 'info') {
        embed = new EmbedBuilder()
          .setTitle('ℹ️ Bot Info')
          .setColor('Blue')
          .setDescription(
            'This bot creates Minecraft servers using the Pterodactyl panel.'
          )
          .addFields(
            { name: '🌐 Panel', value: '[https://paid.lpnodes.qzz](https://paid.lpnodes.qzz)' },
            { name: '👨‍💻 Developer', value: 'Made by aliyahop' }
          );
      }

      if (embed) {
        embed.setFooter({ text: 'Made by aliyahop' });
        await menuInteraction.reply({ embeds: [embed], ephemeral: true });
      }
    });
  },
};
