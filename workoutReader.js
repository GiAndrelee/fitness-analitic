/**
 * workoutReader.js
 *
 * Functions to read CSV workout data using csv-parser, count workouts,
 * calculate total minutes, and handle errors.
 *
 * Expected CSV columns (case-insensitive): date, type, minutes
 *
 * Example:
 * date,type,minutes
 * 2025-11-01,run,30
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

/**
 * Reads CSV workouts from disk and returns an array of parsed rows.
 * Each row will have its keys lower-cased for consistency.
 * @param {string} filePath - Path to the CSV file.
 * @returns {Promise<Array<Object>>} - Parsed rows.
 */
function readWorkoutCsv(filePath) {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      return reject(new Error('readWorkoutCsv: filePath is required'));
    }

    const resolved = path.resolve(filePath);
    const results = [];

    const stream = fs.createReadStream(resolved)
      .on('error', (err) => {
        reject(new Error(`Failed to open CSV file ${resolved}: ${err.message}`));
      })
      .pipe(csv())
      .on('data', (row) => {
        // normalize keys to lowercase
        const normalized = {};
        Object.keys(row).forEach((k) => {
          normalized[k.toLowerCase()] = row[k];
        });
        results.push(normalized);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (err) => {
        reject(new Error(`Failed to parse CSV file ${resolved}: ${err.message}`));
      });

    // In case pipe errors not captured in older Node versions
    stream.on('error', (err) => {
      reject(new Error(`CSV stream error for ${resolved}: ${err.message}`));
    });
  });
}

/**
 * Counts the number of workout rows in the CSV file.
 * @param {string} filePath - Path to CSV file or parsed array input.
 * @returns {Promise<number>}
 */
async function countWorkouts(filePathOrRows) {
  let rows = filePathOrRows;
  if (typeof filePathOrRows === 'string') {
    rows = await readWorkoutCsv(filePathOrRows);
  }

  if (Array.isArray(rows)) {
    return rows.length;
  }
  return 0;
}

/**
 * Calculates total minutes from workout rows (array of objects).
 * Accepts either a file path (string) or parsed rows (array).
 * @param {string|Array<Object>} filePathOrRows
 * @returns {Promise<number>} - Sum of minutes (parsed to numbers). Invalid/non-numeric minutes are treated as 0.
 */
async function totalWorkoutMinutes(filePathOrRows) {
  let rows = filePathOrRows;
  if (typeof filePathOrRows === 'string') {
    rows = await readWorkoutCsv(filePathOrRows);
  }

  if (!Array.isArray(rows)) return 0;

  let total = 0;
  for (const r of rows) {
    // Accept keys like "minutes" (lowercase), or other variants
    const raw = r.minutes ?? r.Minutes ?? r.MINUTES ?? '';
    const n = Number(String(raw).trim());
    if (!Number.isNaN(n) && Number.isFinite(n)) total += n;
  }

  return total;
}

module.exports = {
  readWorkoutCsv,
  countWorkouts,
  totalWorkoutMinutes,
};
