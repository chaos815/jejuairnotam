
const https = require('https');
const querystring = require('querystring');
const flights = require('./flightMap');

function getAirportNotam(icao) {
  return new Promise((resolve) => {
    const url = `https://ourairports.com/airports/${icao}/notams.html`;
    https.get(url, (res) => {
      let html = '';
      res.on('data', (chunk) => html += chunk);
      res.on('end', () => {
        const match = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
        resolve(match && match[1] ? match[1] : `NOTAM not found for ${icao}`);
      });
    }).on('error', () => resolve(`Failed to fetch airport NOTAM for ${icao}`));
  });
}

function getFIRNotam(fir) {
  return new Promise((resolve) => {
    const postData = querystring.stringify({
      submit: "View NOTAMs",
      retrieveLocId: fir,
      submitType: "notamRetrievalByICAOs"
    });

    const options = {
      hostname: 'www.notams.faa.gov',
      path: '/dinsQueryWeb/firArtccAction.do',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      }
    };

    const req = https.request(options, (res) => {
      let html = '';
      res.on('data', (chunk) => html += chunk);
      res.on('end', () => {
        const match = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
        resolve(match && match[1] ? match[1] : `FIR NOTAM not found for ${fir}`);
      });
    });

    req.on('error', () => resolve(`Failed to fetch FIR NOTAM for ${fir}`));
    req.write(postData);
    req.end();
  });
}

module.exports = async (req, res) => {
  const { flight } = req.query;
  const info = flights[flight];
  if (!info) {
    res.status(404).send("Unknown flight number");
    return;
  }

  const firs = { RKSI: "RKRR", RKPC: "RKRR", RKPK: "RKRR", RKSS: "RKRR", VMMC: "VHHH", VHHH: "VHHH", RJTT: "RJJJ" };
  const fir_dep = firs[info.dep] || "UNKNOWN";
  const fir_arr = firs[info.arr] || "UNKNOWN";

  const [notamDep, notamArr, notamFIRDep, notamFIRArr] = await Promise.all([
    getAirportNotam(info.dep),
    getAirportNotam(info.arr),
    getFIRNotam(fir_dep),
    getFIRNotam(fir_arr),
  ]);

  res.status(200).json({
    departure: info.dep,
    arrival: info.arr,
    depAirportNotam: notamDep,
    arrAirportNotam: notamArr,
    depFIRNotam: notamFIRDep,
    arrFIRNotam: notamFIRArr,
  });
};
