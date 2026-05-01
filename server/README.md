
Places Proxy
===========

Lightweight Express proxy that forwards Google Places Nearby Search requests from the mobile app. The proxy keeps the Google API key on the server so it is not embedded in client builds.

Key benefits
- Keeps your `GOOGLE_MAPS_API_KEY` out of client-side code and repos.
- Simple single endpoint for nearby gas station lookups.
- Easy to run locally or deploy to any Node.js host.

Prerequisites
- Node.js 14+ / npm

Quick start (local)
1. Change to the server folder and install dependencies:

```bash
cd server
npm install
```

2. Start the proxy with your API key in the environment:

Windows PowerShell:
```powershell
$env:GOOGLE_MAPS_API_KEY='YOUR_REAL_KEY'; npm start
```

macOS / Linux:
```bash
GOOGLE_MAPS_API_KEY=YOUR_REAL_KEY npm start
```

By default the server listens on `http://localhost:4000`.

Configuration
- `GOOGLE_MAPS_API_KEY` (required): Your Google Maps / Places API key. The server reads this from the environment.
- `PORT` (optional): The port to bind to (defaults to `4000`).

API
- GET /places/nearby
	- Query parameters:
		- `lat` (required) — latitude
		- `lng` (required) — longitude
		- `radius` (optional) — search radius in meters (defaults to 5000)
	- Response: Forwards the Google Places Nearby Search JSON response. Example:

```json
{
	"results": [ /* array of place objects as returned by Google */ ],
	"status": "OK",
	...
}
```

Security & best practices
- Do NOT commit your API key. Use environment variables or secret managers in deployment.
- Restrict the `GOOGLE_MAPS_API_KEY` in Google Cloud Console to the specific server IPs or the host domain and enable only the required APIs (Places API, Maps SDK as needed).
- Monitor usage and set billing alerts — Places requests may incur charges.

Deployment
- This proxy can be deployed to any Node.js hosting provider (Heroku, Render, Fly, AWS Elastic Beanstalk, etc.). Ensure `GOOGLE_MAPS_API_KEY` is configured in the host's environment settings.
- For production, run behind HTTPS and consider adding basic authentication, rate limiting, and logging.

Performance & production hardening
- Caching: The server implements a short in-memory cache (60s TTL) to reduce repetitive Google Places calls for identical coordinates. For production use consider replacing with Redis or another shared cache to support multiple instances.
- Rate limiting: Requests are rate-limited to 200 requests per IP per hour by default. Adjust limits in `index.js` to match your expected usage and deployment scale.
- Security: Restrict the `GOOGLE_MAPS_API_KEY` to the server's IP or domain in the Google Cloud Console and only enable the required APIs.

Troubleshooting
- `500 Server missing GOOGLE_MAPS_API_KEY` — you started the server without setting the `GOOGLE_MAPS_API_KEY` env var.
- `400 lat and lng required` — ensure the client supplies `lat` and `lng` query params.
- If Google returns an error (e.g., `OVER_QUERY_LIMIT` or `REQUEST_DENIED`), check API key restrictions, billing, and enabled APIs in Google Cloud Console.

Extending the proxy
- Add caching (in-memory or Redis) to reduce Google API usage for frequent lookups.
- Add rate limiting (express-rate-limit) and request validation.

Contributing
- PRs welcome. Keep changes focused and include tests where appropriate.

License
- MIT
