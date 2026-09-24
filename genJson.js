const fs = require('node:fs/promises');
const path = require('node:path');

const directory = process.argv[2];
const output = process.argv[3] ?? 'files.json';

if (!directory) {
  console.error('Usage: script DIRECTORY');
  process.exit(1);
}

const files = [];

async function walk(folder) {
  for (const entry of await fs.readdir(folder, { withFileTypes: true })) {
    const filename = path.join(folder, entry.name);

    if (entry.isDirectory()) {
      await walk(filename);
    } else if (entry.isFile() && path.resolve(filename) !== path.resolve(output)) {
      const basename = path.basename(filename)
      
      /** remove not needed files */
      const found = basename.search('-');
      if(found > 0){ 
        continue;
      }

      const provinceName = path.basename(basename).replace('.geojson','').replace('_', ' ');
      
      const content = await fs.readFile(filename, 'utf8')
      files.push({ filename, name: provinceName, content: JSON.parse(content) });
    }
  }
}

(async () => {
  await walk(directory);
  files.sort((a, b) => a.filename.localeCompare(b.filename));
  console.log(JSON.stringify(files))
  await fs.writeFile('provinces.json', JSON.stringify(files, null, 2) + '\n');
})().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
