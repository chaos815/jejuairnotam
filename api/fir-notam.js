
const https = require('https');
const querystring = require('querystring');

module.exports = async (req, res) => {
  const { fir } = req.query;
  if (!fir) return res.status(400).send("Missing FIR code");

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
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const request = https.request(options, (response) => {
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
  });

  request.on("error", () => {
    res.status(500).send("Error fetching FIR NOTAM data");
  });

  request.write(postData);
  request.end();
};
