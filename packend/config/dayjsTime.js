import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import timezone from 'dayjs/plugin/timezone.js';
<<<<<<< HEAD
import utc from 'dayjs/plugin/utc.js';
=======
>>>>>>> 12017be3f1f695c245d8df7f477b3076b90b8704

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

export default dayjs;

export const reminder_time_input = (date, time) =>
  dayjs(`${date} ${time}`).toDate();

export const reminder_time_output = (date) =>
  dayjs(date).format('YYYY-MM-DD HH:mm');

export const algeriaTime = (date) => dayjs(date).tz('Africa/Algiers');
