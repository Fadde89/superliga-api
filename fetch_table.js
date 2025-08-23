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

      if (tds.length < 2) return; // hoppa över rader utan tillräckligt med kolumner

      const pos = $(tds[0]).text().trim();

      // Lagets namn: ta desktop link om finns, annars td text
      let team = $(tds[1]).find('a.desktop_only').text().trim();
      if (!team) team = $(tds[1]).text().trim();

      // Poäng: ta <strong> om finns, annars td text
      let pointsText = $(tds[tds.length - 1]).find('strong').text().trim();
      if (!pointsText) pointsText = $(tds[tds.length - 1]).text().trim();

      if (pos && team && pointsText && !isNaN(pointsText)) {
        table.push({ pos, team, points: parseInt(pointsText, 10) });
      }
    });

    fs.writeFileSync('superliga_table.json', JSON.stringify(table, null, 2));
    console.log('✅ JSON uppdaterad med alla lag korrekt!');
  } catch (err) {
    console.error('❌ Fel vid hämtning:', err);
  }
})();
