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
  "SonderjyskE": "Sønderjyske Fodbold",
  "Nordsjaelland": "FC Nordsjælland"
};

(async () => {
  try {
    const url = 'https://www.sportsmole.co.uk/football/copenhagen/';
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    // Plocka Next Game-div
    const nextGameDiv = $('div.next_game').first();

    // Hämta lag och mappa med TEAM_MAP
    const teamsText = nextGameDiv.find('a').text().trim(); // "Home vs. Away"
    let [home, away] = teamsText.split(' vs. ').map(s => s.trim());
    home = TEAM_MAP[home] || home;
    away = TEAM_MAP[away] || away;

    // Hämta datumtext
    const fullText = nextGameDiv.text().trim(); 
    const dateText = fullText.split(' - ')[1].replace('in Danish Superliga','').trim(); // "Sunday, August 31 at 5pm"

    // Parsar datum
    const datePart = dateText.replace(/^\w+,\s+/, '').replace('at ', '').trim(); // "August 31 5pm"
    const dateParts = datePart.match(/(\w+)\s+(\d+)\s+(\d+)(am|pm)/i);

    const months = {
      January:'01', February:'02', March:'03', April:'04', May:'05', June:'06',
      July:'07', August:'08', September:'09', October:'10', November:'11', December:'12'
    };

    let hour = parseInt(dateParts[3], 10);
    if (dateParts[4].toLowerCase() === 'pm' && hour !== 12) hour += 12;

    // Lägg till 1 timme för svensk tid (BST → CEST)
    hour += 1;

    // Skapa datumsträng
    const year = new Date().getFullYear();
    const month = months[dateParts[1]];
    const day = dateParts[2].padStart(2,'0');
    const hourStr = hour.toString().padStart(2,'0');
    const localDate = `${year}-${month}-${day} ${hourStr}:00:00`;

    // Spara JSON
    const nextMatch = { home, away, date: localDate };
    fs.writeFileSync('next_match.json', JSON.stringify(nextMatch, null, 2));

    console.log(`✅ Nästa match: ${home} vs ${away}`);
    console.log(`Datum/tid (svensk tid): ${localDate}`);
  } catch (err) {
    console.error('❌ Fel vid hämtning:', err);
  }
})();
