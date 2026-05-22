import { CloudConvert } from 'cloudconvert';
import dotenv from 'dotenv';

dotenv.config();

const cloudConvert = new CloudConvert(process.env.CLOUDCONVERT_API_KEY);

export default cloudConvert;
