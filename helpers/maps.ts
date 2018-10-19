import https from 'https';

// Key for Google Maps Directions API
const KEY = process.env.DIRECTIONS_API_KEY;
// URL prefix for API
const API_URL = 'https://maps.googleapis.com/maps/api/directions/json?';

/**
 * Retrieves a route from Google Maps Directions API.
 * @param isWalking Is walking mode.
 * @param placeID Google Maps Place ID.
 * @param lat Latitude of current location.
 * @param lon Longitude of current location.
 * @return Promise for query result.
 */
export default (
    isWalking: boolean,
    placeID: string,
    lat: number,
    lon: number
) => {
    // Convert mode to form accepted by API
    const apiMode = isWalking ? 'walking' : 'transit';

    // If not in production, return fake response (as API calls are expensive)
    if (process.env.NODE_ENV !== 'production') {
        return {
            isWalking,
            placeID,
            start: {
                lat,
                lon
            }
        };
    }

    return new Promise((resolve, reject) => {
        // Build query URL
        const origin = `origin=${lat},${lon}`;
        const destination = `destination=place_id:${placeID}`;
        const mode = `mode=${apiMode}`;
        const query = `${API_URL}&${origin}&${destination}&${mode}&key=${KEY}`;

        https
            .get(query, res => {
                let data = '';

                // Receive data
                res.on('data', (chunk: any) => {
                    data += chunk;
                });

                // Whole response received, parse JSON and return
                res.on('end', () => {
                    // Ensure status code is 200
                    if (res.statusCode !== 200) {
                        reject(new Error('Maps API error'));
                    }

                    resolve(JSON.parse(data));
                });
            })
            .on('error', err => {
                reject(err);
            });
    });
};
