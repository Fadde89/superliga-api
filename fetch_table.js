const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

(async () => {
  try {
    const url = 'https://www.sportsmole.co.uk/football/danish-superliga/table.html';
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const table = [];

    $('table tbody tr').each((i, el) => {
      const pos = $(el).find('td.positiontd').first().text().trim();
      const team = $(el).find('td.teamtd a').first().text().trim();
      const points = $(el).find('td').last().text().trim();

      if(pos && team && points) {
        table.push({ pos, team, points: Number(points) });
      }
    });

    fs.writeFileSync('superliga_table.json', JSON.stringify(table, null, 2));
    console.log('✅ JSON uppdaterad med alla lag korrekt!');
  } catch (err) {
    console.error(err);
  }
})();
