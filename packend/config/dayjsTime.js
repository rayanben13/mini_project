import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

export default dayjs;

export const reminder_time_input = (date, time) =>
  dayjs(`${date} ${time}`).toDate();

export const reminder_time_output = (date) =>
  dayjs(date).format('YYYY-MM-DD HH:mm');

export const algeriaTime = (date) => dayjs(date).tz('Africa/Algiers');
