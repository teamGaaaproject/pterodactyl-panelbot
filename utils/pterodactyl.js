const axios = require('axios');
require('dotenv').config();

const ADMIN_URL = process.env.ADMIN_API;
const CLIENT_URL = process.env.CLIENT_API;
const ADMIN_KEY = process.env.ADMIN_KEY;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${ADMIN_KEY}`
};

// 🧑 Step 1: Create Pterodactyl User
async function createPteroUser(email, username, firstname, lastname, password) {
  const data = {
    email,
    username,
    first_name: firstname,
    last_name: lastname,
    password
  };

  const res = await axios.post(`${ADMIN_URL}/users`, data, { headers });
  return res.data.attributes;
}

// 🧱 Step 2: Create Minecraft Server
async function createMCServer(userId, serverName) {
  const serverData = {
    name: `${serverName}-mc`,
    user: userId,
    egg: 1, // Replace with your Minecraft Egg ID
    docker_image: "ghcr.io/pterodactyl/yolks:java_17", // Match your panel
    startup: "java -Xms128M -Xmx1024M -jar server.jar nogui",
    limits: {
      memory: 1024,
      swap: 0,
      disk: 7000,
      io: 500,
      cpu: 100
    },
    feature_limits: {
      databases: 1,
      backups: 1,
      allocations: 1
    },
    environment: {
      SERVER_JARFILE: "server.jar",
      VERSION: "latest",
      TYPE: "PAPER"
    },
    deploy: {
      locations: [1], // Replace with your location ID
      dedicated_ip: false,
      port_range: []
    },
    start_on_completion: true
  };

  const res = await axios.post(`${ADMIN_URL}/servers`, serverData, { headers });
  return res.data.attributes;
}

// 🌐 Step 3: Get Server IP & Port
async function getServerIP(serverIdentifier) {
  const res = await axios.get(`${ADMIN_URL}/servers/${serverIdentifier}/allocations`, { headers });
  const alloc = res.data.data[0].attributes;
  return { ip: alloc.ip, port: alloc.port };
}

module.exports = {
  createPteroUser,
  createMCServer,
  getServerIP
};
