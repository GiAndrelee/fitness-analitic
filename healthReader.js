/**
 * healthReader.js
 *
 * Functions to read JSON health data asynchronously, count health entries,
 * and handle errors.
 *
 * Expected format of the JSON file (array of objects):
 * [
 *   { "date": "2025-11-01", "steps": 10000, "sleep_hours": 7.5 },
 *   ...
 * ]
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Reads a JSON file from disk asynchronously and parses it.
 * @param {string} filePath - Path to the JSON file.
 * @returns {Promise<any>} - Parsed JSON content.
 * @throws {Error} - If file cannot be read or JSON is invalid.
 */
async function readHealthJson(filePath) {
  if (!filePath) {
    throw new Error('readHealthJson: filePath is required');
  }

  const resolved = path.resolve(filePath);
  try {
    const content = await fs.readFile(resolved, 'utf8');
    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch (parseErr) {
      const err = new Error(`Failed to parse JSON from ${resolved}: ${parseErr.message}`);
      err.cause = parseErr;
      throw err;
    }
  } catch (err) {
    const wrapped = new Error(`Failed to read file ${resolved}: ${err.message}`);
    wrapped.cause = err;
    throw wrapped;
  }
}

/**
 * Counts the number of health entries in the provided JSON data.
 * Accepts either a path to a JSON file or an already parsed object/array.
 * @param {string|any} source - File path or parsed JSON value.
 * @returns {Promise<number>} - Number of entries (0 for invalid shapes).
 */
async function countHealthEntries(source) {
  let data = source;
  if (typeof source === 'string') {
    data = await readHealthJson(source);
  }

  if (Array.isArray(data)) {
    return data.length;
  }

  // If JSON has a top-level object with a key like "entries" or "health", try to be helpful
  if (data && typeof data === 'object') {
    const possibleArrays = Object.values(data).filter((v) => Array.isArray(v));
    if (possibleArrays.length > 0) {
      return possibleArrays[0].length;
    }
  }

  // Not an array or object containing arrays
  return 0;
}

module.exports = {
  readHealthJson,
  countHealthEntries,
};
