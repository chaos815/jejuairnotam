
const axios = require('axios');
const querystring = require('querystring');
const flights = require('./flightMap');

async function getAirportNotam(icao) {
  try {
    const response = await axios.get(`https://ourairports.com/airports/${icao}/notams.html`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const match = response.data.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
    return match && match[1] ? match[1] : `NOTAM not found for ${icao}`;
  } catch {
    return `Failed to fetch airport NOTAM for ${icao}`;
  }
}

async function getFIRNotam(fir) {
  try {
    const postData = querystring.stringify({
      submit: "View NOTAMs",
      retrieveLocId: fir,
      submitType: "notamRetrievalByICAOs"
    });

    const response = await axios.post("https://www.notams.faa.gov/dinsQueryWeb/firArtccAction.do", postData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const match = response.data.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
    return match && match[1] ? match[1] : `FIR NOTAM not found for ${fir}`;
  } catch {
    return `Failed to fetch FIR NOTAM for ${fir}`;
  }
}

module.exports = async (req, res) => {
  const { flight } = req.query;
  const info = flights[flight];
  if (!info) return res.status(404).send("Unknown flight number");

  const firMap = { RKSI: "RKRR", RKPC: "RKRR", RKPK: "RKRR", RKSS: "RKRR", VMMC: "VHHH", VHHH: "VHHH", RJTT: "RJJJ", RJAA: "RJJJ", RJBB: "RJJJ", RJFF: "RJJJ", RCTP: "RCAA" };

  const depFIR = firMap[info.dep] || "UNKNOWN";
  const arrFIR = firMap[info.arr] || "UNKNOWN";

  const [depNotam, arrNotam, depFIRNotam, arrFIRNotam] = await Promise.all([
    getAirportNotam(info.dep),
    getAirportNotam(info.arr),
    getFIRNotam(depFIR),
    getFIRNotam(arrFIR)
  ]);

  res.status(200).json({
    departure: info.dep,
    arrival: info.arr,
    depAirportNotam: depNotam,
    arrAirportNotam: arrNotam,
    depFIRNotam,
    arrFIRNotam
  });
};
