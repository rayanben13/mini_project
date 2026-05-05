import dayjs from '../config/dayjsTime.js';
try {
    console.log("Testing dayjs().utc():", dayjs().utc().format());
} catch (e) {
    console.error("Error testing dayjs().utc():", e.message);
}
