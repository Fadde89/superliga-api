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

    for (const key in events) {
      const ev = events[key];
      if (ev.type === 'VEVENT' && ev.start > now) {
        matches.push({
          summary: ev.summary,
          location: ev.location,
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

    // Försök parsa lag (ex: "F.C. København vs. Brøndby IF")
    let [home, away] = nextMatch.summary.split(' vs ');
    home = home?.trim() || 'Okänt lag';
    away = away?.trim() || 'Okänt lag';

    // Konvertera till lokal tid
    const date = new Date(nextMatch.start);
    const localDate = date.toLocaleString('sv-SE', { timeZone: 'Europe/Copenhagen' });

    const data = {
      home,
      away,
      date: localDate,
      location: nextMatch.location || 'Okänd plats'
    };

    fs.writeFileSync('next_match.json', JSON.stringify(data, null, 2));

    console.log(`✅ Nästa match: ${home} vs ${away}`);
    console.log(`📅 Datum/tid: ${localDate}`);
    console.log(`📍 Plats: ${data.location}`);
  } catch (err) {
    console.error('❌ Fel vid hämtning:', err);
  }
})();
