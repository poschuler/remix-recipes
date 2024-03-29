import cloudinary from "cloudinary";
import { writeAsyncIterableToWritable } from "@remix-run/node";

if (typeof process.env.CLOUD_NAME !== "string") {
  throw new Error("Missing env: CLOUD_NAME");
}

if (typeof process.env.API_KEY !== "string") {
  throw new Error("Missing env: CLOUD_NAME");
}

if (typeof process.env.API_SECRET !== "string") {
  throw new Error("Missing env: CLOUD_NAME");
}

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

async function uploadImage(data: AsyncIterable<Uint8Array>) {
  const uploadPromise = new Promise(async (resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder: "remix",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      }
    );
    await writeAsyncIterableToWritable(data, uploadStream);
  });

  return uploadPromise;
}

//console.log("configs", cloudinary.v2.config());
export { uploadImage };
