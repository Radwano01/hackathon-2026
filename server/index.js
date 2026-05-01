const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');

const app = express();
app.use(cors());

// Basic rate limiter: 200 requests per IP per hour
app.use(
  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!GOOGLE_KEY) {
  console.warn('WARNING: GOOGLE_MAPS_API_KEY is not set. Proxy will return an error.');
}

app.get('/places/nearby', async (req, res) => {
  const { lat, lng, radius = 5000 } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });
  if (!GOOGLE_KEY) return res.status(500).json({ error: 'Server missing GOOGLE_MAPS_API_KEY' });

  const cacheKey = `nearby:${lat}:${lng}:${radius}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=gas_station&key=${GOOGLE_KEY}`;
    const r = await fetch(url);
    const json = await r.json();
    cache.set(cacheKey, json);
    return res.json(json);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'fetch_failed' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Places proxy listening on http://localhost:${port}`));
