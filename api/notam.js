
const https = require('https');

module.exports = async (req, res) => {
  const { icao } = req.query;
  if (!icao) return res.status(400).send("Missing ICAO code");

  const url = `https://ourairports.com/airports/${icao}/notams.html`;

  https.get(url, (response) => {
    let html = "";
    response.on("data", (chunk) => html += chunk);
    response.on("end", () => {
      const match = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
      if (match && match[1]) {
        res.status(200).send(match[1]);
      } else {
        res.status(404).send("NOTAM data not found");
      }
    });
  }).on("error", () => {
    res.status(500).send("Error fetching NOTAM data");
  });
};
