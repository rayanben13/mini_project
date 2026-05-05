<<<<<<< HEAD
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
=======
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
>>>>>>> 4bc7fb730f647cf59404cb5c67dfa31036eb0493

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

export default dayjs;

export const reminder_time_input = (date, time) =>
  dayjs(`${date} ${time}`).toDate();

export const reminder_time_output = (date) =>
<<<<<<< HEAD
  dayjs(date).format("YYYY-MM-DD HH:mm");
=======
  dayjs(date).format('YYYY-MM-DD HH:mm');

export const algeriaTime = (date) => dayjs(date).tz('Africa/Algiers');
>>>>>>> 4bc7fb730f647cf59404cb5c67dfa31036eb0493
