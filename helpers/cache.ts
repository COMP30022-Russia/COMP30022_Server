// node-cache service
// Adapted from https://stackoverflow.com/questions/46048844
import NodeCache from 'node-cache';

/**
 * Defines an in-memory caching service with NodeCache as the provider.
 */
export default (provider: NodeCache) => {
    /**
     * Saves an item to the cache.
     * @param key Key of item.
     * @param value Value of item.
     */
    const setItem = (key: string, value: any) => {
        return provider.set(key, value);
    };

    /**
     * Retrieves an item from the cache.
     * @param key Key of item.
     * @return Value of item.
     */
    const getItem = (key: string) => {
        return provider.get(key);
    };

    /**
     * Deletes an item from the cache.
     * @param key Key of item.
     */
    const deleteItem = (key: string) => {
        return provider.del(key);
    };

    return {
        setItem,
        getItem,
        deleteItem
    };
};
