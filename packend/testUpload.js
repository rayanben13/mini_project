import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadBufferToCloudinaryRaw = (buffer, customFilename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'files',
        resource_type: 'raw',
        public_id: customFilename,
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(buffer);
  });
};

uploadBufferToCloudinaryRaw(Buffer.from('hello pdf test'), 'my-raw-test.pdf').then((res)=> {
    console.log(res);    
}).catch(console.error);
