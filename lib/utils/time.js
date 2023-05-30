exports.getCurrentTime = getCurrentTime;
exports.sleep = sleep;

/**
 * Get current time in the given timezone, formatted for en-US
 * @param {*} timezone 
 */
function getCurrentTime(timezone){
    const now = new Date();
    return now.toLocaleString("en-US", { timeZone: timezone });
}

/**
 * Sleep for duration (in seconds)
 * @param {number} duration (in seconds)
 */
async function sleep(duration){
    await new Promise(resolve => setTimeout(resolve, duration*1000));
}