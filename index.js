const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
});

client.commands = new Collection();

const commandFolders = fs.readdirSync('./commands');

// 🔁 Load user & admin commands
for (const folder of commandFolders) {
  const folderPath = `./commands/${folder}`;
  const commandFiles = fs.existsSync(folderPath) && fs.lstatSync(folderPath).isDirectory()
    ? fs.readdirSync(folderPath).filter(file => file.endsWith('.js'))
    : [];

  for (const file of commandFiles) {
    const command = require(`${folderPath}/${file}`);
    if (command?.data?.name) {
      client.commands.set(command.data.name, command);
    }
  }

  // Also load directly from commands/ folder (non-subfolders)
  if (folder.endsWith('.js')) {
    const command = require(`./commands/${folder}`);
    if (command?.data?.name) {
      client.commands.set(command.data.name, command);
    }
  }
}

// Register slash commands
client.once('ready', async () => {
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  const commands = client.commands.map(c => c.data.toJSON());

  await rest.put(Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID), {
    body: commands,
  });

  console.log(`✅ Bot Ready! Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (command) {
    try {
      await command.execute(interaction, client);
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ An error occurred.', ephemeral: true });
    }
  }
});

client.login(process.env.TOKEN);
