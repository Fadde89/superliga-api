const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

(async () => {
  try {
    const res = await axios.get('https://www.sportsmole.co.uk/football/danish-superliga/table.html');
    const $ = cheerio.load(res.data);
    const table = [];

    $('table').first().find('tbody tr').each((i, el) => {
      const tds = $(el).find('td');
      const name = $(tds[0]).text().trim();
      const pts = parseInt($(tds[8]).text().trim(), 10);
      table.push({ name, points: pts });
    });

    fs.writeFileSync('superliga_table.json', JSON.stringify(table, null, 2));
    console.log('JSON uppdaterad!');
  } catch (err) {
    console.error('Fel vid hämtning eller skrivning:', err);
  }
})();
