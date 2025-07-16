const fs = require('fs');
const path = './data.json';

function loadData() {
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, JSON.stringify({}));
  }
  const raw = fs.readFileSync(path);
  return JSON.parse(raw);
}

function saveData(data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

function hasServer(userId) {
  const data = loadData();
  return data.hasOwnProperty(userId);
}

function storeServer(userId, serverId) {
  const data = loadData();
  data[userId] = serverId;
  saveData(data);
}

function resetServer(userId) {
  const data = loadData();
  delete data[userId];
  saveData(data);
}

function getAll() {
  return loadData();
}

module.exports = {
  hasServer,
  storeServer,
  resetServer,
  getAll
};
