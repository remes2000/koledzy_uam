import fs from 'fs';
import sqlite3 from 'sqlite3';

const NUMBER_OF_FILES = 8;
const FILE_PREFIX = 'message_';
const FILE_EXTENSION = '.json';
const MESSAGE_DIR = 'messages';
const OUTPUT_FILE = 'db.sqlite';
const fixEncoding = m => Buffer.from(m ?? '', 'latin1').toString('utf8');
const millisecondToSecond = ms => Math.floor(ms / 1000);

const messages = Array.from({ length: NUMBER_OF_FILES })
  .map((_, index) => `${MESSAGE_DIR}/${FILE_PREFIX}${index + 1}${FILE_EXTENSION}`)
  .map((filepath) => JSON.parse(fs.readFileSync(filepath, 'utf8')))
  .reduce((accumulator, { messages }) => {
    return [...accumulator, ...messages];
  }, []);

const db = new sqlite3.Database(OUTPUT_FILE);
db.serialize(() => {
  db.run("CREATE TABLE messages (author TEXT, message TEXT, date INTEGER)");
  const insertStatement = db.prepare("INSERT INTO messages (author, message, date) VALUES (?, ?, ?)");
  messages.forEach(({ sender_name, content, timestamp_ms }) => 
    insertStatement.run(fixEncoding(sender_name), fixEncoding(content), millisecondToSecond(timestamp_ms))
  );
  insertStatement.finalize();
});
db.close();
