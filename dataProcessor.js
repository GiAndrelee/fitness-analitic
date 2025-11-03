/**
 * dataProcessor.js
 *
 * Main program that uses environment variables and calls reader functions
 * with async/await. This script demonstrates usage of healthReader and
 * workoutReader and prints a brief summary.
 *
 * Environment variables (from .env or actual env):
 * - USER_NAME
 * - WEEKLY_GOAL (number of exercise minutes per week)
 *
 * Usage:
 *   node dataProcessor.js path/to/health.json path/to/workouts.csv
 */

require('dotenv').config();
const path = require('path');

const { countHealthEntries } = require('./healthReader');
const { countWorkouts, totalWorkoutMinutes } = require('./workoutReader');

async function main(argv) {
  try {
    const user = process.env.USER_NAME ?? 'unknown';
    const weeklyGoalRaw = process.env.WEEKLY_GOAL ?? '';
    const weeklyGoal = Number(weeklyGoalRaw);
    const goalIsNumber = !Number.isNaN(weeklyGoal) && Number.isFinite(weeklyGoal);

    const healthFile = argv[2] ? path.resolve(argv[2]) : null;
    const workoutFile = argv[3] ? path.resolve(argv[3]) : null;

    console.log(`Hello ${user}!`);

    if (healthFile) {
      try {
        const healthCount = await countHealthEntries(healthFile);
        console.log(`Found ${healthCount} health entries in ${healthFile}`);
      } catch (err) {
        console.error(`Error reading health data: ${err.message}`);
      }
    } else {
      console.log('No health JSON file provided as argument.');
    }

    if (workoutFile) {
      try {
        const workouts = await countWorkouts(workoutFile);
        const minutes = await totalWorkoutMinutes(workoutFile);
        console.log(`Found ${workouts} workouts in ${workoutFile}, total minutes: ${minutes}`);
        if (goalIsNumber) {
          console.log(`Weekly goal: ${weeklyGoal} minutes. Progress: ${Math.round((minutes / weeklyGoal) * 100)}%`);
        }
      } catch (err) {
        console.error(`Error reading workout CSV: ${err.message}`);
      }
    } else {
      console.log('No workout CSV file provided as argument.');
    }
  } catch (err) {
    console.error(`Unexpected error: ${err && err.message ? err.message : String(err)}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main(process.argv);
}

module.exports = { main };
