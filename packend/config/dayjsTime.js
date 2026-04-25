import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';

dayjs.extend(relativeTime);

export default dayjs;

export const reminder_time_input = (date, time) =>
  dayjs(`${date} ${time}`).toDate();

export const reminder_time_output = (date) =>
  dayjs(date).format('YYYY-MM-DD HH:mm');
