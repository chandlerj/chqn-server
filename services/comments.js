const Database = require('better-sqlite3');
const db = new Database('./database/comments.db');

module.exports = db;
