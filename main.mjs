import fs from 'fs/promises';

const NUMBER_OF_FILES = 8;
const FILE_PREFIX = 'message_';
const FILE_EXTENSION = '.json';
const MESSAGE_DIR = 'messages';
const OUTPUT_FILE = 'data.csv';

const messageCount = new Map();
const wordCount = new Map();

for (let index = 0; index < NUMBER_OF_FILES; index ++) {
  const filepath = `${MESSAGE_DIR}/${FILE_PREFIX}${index + 1}${FILE_EXTENSION}`;
  console.log(`Reading ${filepath}...`);
  const content = JSON.parse(await fs.readFile(filepath, 'utf8'));
  
  content.messages.forEach(({ timestamp_ms, content }) => {
    const date = new Date(timestamp_ms);
    const key = `${date.getMonth() + 1}-${date.getFullYear()}`;
    messageCount.set(key, messageCount.has(key) ? messageCount.get(key) + 1 : 0);

    (content ?? '').split(/\s+|[,.-]+/).map(s => s.toLowerCase()).forEach((word) => {
      wordCount.set(word, wordCount.has(word) ? wordCount.get(word) + 1 : 0);
    });
  });
}

const sortedResults = Array.from(messageCount.entries()).toSorted(([c1, _], [c2, __]) => {
  const [month1, year1] = c1.split('-').map(Number);
  const [month2, year2] = c2.split('-').map(Number);

  if (year1 === year2) {
    return month1 - month2;
  }
  return year1 - year2;
});

fs.writeFile(OUTPUT_FILE, '');
for (const [date, count] of sortedResults) {
  await fs.appendFile(OUTPUT_FILE, `${date},${count}\n`);
}

const words = Array.from(wordCount.entries())
  .toSorted(([_, c1], [__, c2]) => c2 - c1)
  .splice(0, 50);

for (const [word, count] of words) {
  await fs.appendFile(OUTPUT_FILE, `${word},${count}\n`);
}