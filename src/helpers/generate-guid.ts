/**
 * The function generates a GUID (Globally Unique Identifier) using a specific format.
 * @returns A randomly generated GUID (Globally Unique Identifier) in the format
 * 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx' where each 'x' and 'y' is replaced with a random hexadecimal
 * digit.
 */
export function generateGUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}