const axios = require('axios');
const ical = require('node-ical');
const fs = require('fs');

(async () => {
  try {
    const icsUrl = 'https://www.fck.dk/fck.ics';
    const response = await axios.get(icsUrl);
    const events = ical.sync.parseICS(response.data);

    const now = new Date();
    const matches = [];

    // Hämta alla kommande matcher
    for (const key in events) {
      const ev = events[key];
      if (ev.type === 'VEVENT' && ev.start > now) {
        matches.push({
          summary: ev.summary,
          start: ev.start
        });
      }
    }

    if (matches.length === 0) {
      throw new Error('Inga kommande matcher hittades i kalendern.');
    }

    // Sortera matcher på starttid
    matches.sort((a, b) => a.start - b.start);
    const nextMatch = matches[0];

    // Parsar home vs away från summary
    let [home, away] = nextMatch.summary.split(/ - | vs /);
    home = home?.trim();
    away = away?.trim();

    // Konvertera till svensk tid
    const date = new Date(nextMatch.start);
    const localDate = date.toLocaleString('sv-SE', { timeZone: 'Europe/Copenhagen' });

    // Spara JSON utan location
    const data = { home, away, date: localDate };
    fs.writeFileSync('next_match.json', JSON.stringify(data, null, 2));

    // Console-log med emojis
    console.log(`✅ Nästa match: ${home} vs ${away}`);
    console.log(`📅 Datum/tid: ${localDate}`);

  } catch (err) {
    console.error('❌ Fel vid hämtning:', err);
  }
})();
