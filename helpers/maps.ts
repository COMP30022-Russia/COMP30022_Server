import https from 'https';

// Key for Directions API
const KEY = process.env.DIRECTIONS_API_KEY;

/**
 * Retrieves a route from the Directions API.
 * @param {boolean} isWalking Is walking mode.
 * @param {string} placeID Place ID.
 * @param {number} lat Latitude.
 * @param {number} lon Longitude.
 * @return {Promise} Promise of query result.
 */
export default (
    isWalking: boolean,
    placeID: string,
    lat: number,
    lon: number
) => {
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
                `https://maps.googleapis.com/maps/api/directions/json?origin=${lat},${lon}&destination=${placeID}&mode=${mode}&key=${KEY}`,
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
