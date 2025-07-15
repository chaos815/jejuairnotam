
import axios from 'axios';
export default async function handler(req, res) {
  const { dep, arr } = req.query;
  try {
    const airportUrl = `https://ourairports.com/airports/${dep}/notams.html`;
    const firUrl = `https://www.notams.faa.gov/dinsQueryWeb/firArtccResults.jsp?fir=${dep.substring(0,2)}RR`;
    const airportResp = await axios.get(airportUrl);
    const firResp = await axios.get(firUrl);
    res.status(200).json({
      raw: `공항: ${airportResp.data.substring(0, 500)}...`,
      translated: `FIR: ${firResp.data.substring(0, 500)}...`
    });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}
