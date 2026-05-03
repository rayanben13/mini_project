import { cloudinary, GetPublicId } from '../config/Cloudinary.js';

const url = "https://res.cloudinary.com/dtgvaabon/image/upload/v1776991199/files/gj6aq4ochc8du50wt3b8.pdf";
const publicId = GetPublicId(url);
console.log("Public ID:", publicId);

async function test() {
  try {
    // Try with image
    console.log("Trying to destroy as image...");
    let result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    console.log(result);
    
    // Try with raw
    console.log("Trying to destroy as raw with extension...");
    let result2 = await cloudinary.uploader.destroy(publicId + ".pdf", { resource_type: 'raw' });
    console.log(result2);
  } catch (e) {
    console.error(e);
  }
}
test();
