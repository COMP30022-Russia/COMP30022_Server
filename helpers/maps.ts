import https from 'https';

// Key for Google Maps Directions API
const KEY = process.env.DIRECTIONS_API_KEY;

/**
 * Retrieves a route from Google Maps Directions API.
 * @param {boolean} isWalking Is walking mode.
 * @param {string} placeID Google Maps Place ID.
 * @param {number} lat Latitude of current location.
 * @param {number} lon Longitude of current location.
 * @return {Promise} Promise for query result.
 */
export default (
    isWalking: boolean,
    placeID: string,
    lat: number,
    lon: number
) => {
    // Convert mode to form accepted by API
    const mode = isWalking ? 'walking' : 'transit';

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
        https
            .get(
                `https://maps.googleapis.com/maps/api/directions/json?origin=${lat},${lon}&destination=place_id:${placeID}&mode=${mode}&key=${KEY}`,
                res => {
                    let data = '';

                    // Receive data
                    res.on('data', (chunk: any) => {
                        data += chunk;
                    });

                    // Whole response received, parse JSON and return
                    res.on('end', () => {
                        // Ensure status code is 200
                        if (res.statusCode != 200) {
                            reject(new Error('Maps API error'));
                        }

                        resolve(JSON.parse(data));
                    });
                }
            )
            .on('error', err => {
                reject(err);
            });
    });
};
