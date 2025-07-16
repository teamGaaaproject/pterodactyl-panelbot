const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ComponentType,
} = require('discord.js');
const { hasServer, resetServer, getAll } = require('../../utils/storage');

// ✅ Replace with your admin Discord ID(s)
const ADMIN_IDS = ['123456789012345678', '987654321098765432']; // example only

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('👑 Admin panel for server management'),

  async execute(interaction) {
    if (!ADMIN_IDS.includes(interaction.user.id)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    const menu = new StringSelectMenuBuilder()
      .setCustomId('admin_menu')
      .setPlaceholder('🛠️ Select admin action')
      .addOptions([
        {
          label: '🔍 Check if user has server',
          value: 'check',
          description: 'Find out if a user already created a server',
        },
        {
          label: '🔄 Reset user server limit',
          value: 'reset',
          description: 'Allow a user to create a new server',
        },
        {
          label: '📊 View total server stats',
          value: 'stats',
          description: 'See how many users have servers',
        },
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      content: '**👑 Admin Panel**\nSelect a task below:',
      components: [row],
      ephemeral: true,
    });

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter: i => i.user.id === interaction.user.id,
      time: 20000,
      max: 1,
    });

    collector.on('collect', async select => {
      const value = select.values[0];

      if (value === 'check') {
        await select.reply({ content: '🔎 Please mention a user to check.', ephemeral: true });

        const msg = await interaction.channel.awaitMessages({
          filter: m => m.mentions.users.size > 0 && m.author.id === interaction.user.id,
          max: 1,
          time: 15000,
        });

        if (msg.size === 0) return select.followUp({ content: '⏱️ Timeout.', ephemeral: true });

        const target = msg.first().mentions.users.first();
        const exists = hasServer(target.id);

        const embed = new EmbedBuilder()
          .setTitle('🔍 Server Check')
          .setDescription(`User: <@${target.id}>\nStatus: ${exists ? '✅ Has a server' : '❌ No server yet'}`)
          .setColor(exists ? 'Green' : 'Red')
          .setFooter({ text: 'Made by galaxy.linux' });

        await select.followUp({ embeds: [embed], ephemeral: true });
      }

      if (value === 'reset') {
        await select.reply({ content: '♻️ Mention a user to reset server limit.', ephemeral: true });

        const msg = await interaction.channel.awaitMessages({
          filter: m => m.mentions.users.size > 0 && m.author.id === interaction.user.id,
          max: 1,
          time: 15000,
        });

        if (msg.size === 0) return select.followUp({ content: '⏱️ Timeout.', ephemeral: true });

        const target = msg.first().mentions.users.first();
        resetServer(target.id);

        const embed = new EmbedBuilder()
          .setTitle('♻️ Server Reset')
          .setDescription(`✅ <@${target.id}> can now create a new server.`)
          .setColor('Blue')
          .setFooter({ text: 'Made by aliyahop' });

        await select.followUp({ embeds: [embed], ephemeral: true });
      }

      if (value === 'stats') {
        const all = getAll();
        const total = Object.keys(all).length;

        const embed = new EmbedBuilder()
          .setTitle('📊 Server Stats')
          .addFields({ name: 'Total Users with Servers', value: `\`${total}\`` })
          .setColor('Purple')
          .setFooter({ text: 'Made by galaxy.linux' });

        await select.reply({ embeds: [embed], ephemeral: true });
      }
    });
  },
};
