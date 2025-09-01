const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const TEAM_MAP = {
  "Copenhagen": "F.C. København",
  "Brondby": "Brøndby IF",
  "FC Midtjylland": "FC Midtjylland",
  "Aarhus": "AGF",
  "Odense": "OB",
  "Fredericia": "FC Fredericia",
  "Randers": "Randers FC",
  "Viborg": "Viborg FF",
  "Silkeborg": "Silkeborg IF",
  "Vejle": "Vejle Boldklub",
  "SonderjyskE": "Sønderjyske",
  "Nordsjaelland": "FC Nordsjælland"
};

(async () => {
  try {
    const { data: html } = await axios.get('https://www.sportsmole.co.uk/football/danish-superliga/table.html');
    const $ = cheerio.load(html);

    const table = $('table').first().find('tbody tr')
      .map((_, el) => {
        const tds = $(el).find('td');
        if (tds.length < 2) return null;

        const pos = $(tds[0]).text().trim();
        let team = $(tds[1]).find('a.desktop_only').text().trim() || $(tds[1]).text().trim();
        team = TEAM_MAP[team] || team;
        const points = parseInt($(tds[tds.length - 1]).find('strong').text().trim() || $(tds[tds.length - 1]).text().trim(), 10);

        return pos && team && !isNaN(points) ? { pos, team, points } : null;
      }).get();

    // Unika lag
    const uniqueTable = [...new Map(table.map(t => [t.team, t])).values()];

    fs.writeFileSync('superliga_table.json', JSON.stringify(uniqueTable, null, 2));
    console.log('✅ JSON uppdaterad med officiella lagnamn!');
  } catch (err) {
    console.error('❌ Fel vid hämtning:', err);
  }
})();

