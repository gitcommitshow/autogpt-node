exports.getCurrentTime = getCurrentTime;

function getCurrentTime(timezone){
    const now = new Date();
    return now.toLocaleString("en-US", { timeZone: timezone });
}