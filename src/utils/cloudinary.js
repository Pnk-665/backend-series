import {v2 as cloudinary} from "cloudinary"
import fs from "fs"  //file system

cloudinary.config({ 
  cloud_name: process.env.MY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log("TESTING ENV VARIABLES: ", process.env.MY_CLOUD_NAME);

const uploadOnCloudinary = async (localFilePath) =>{
  try {
    if(!localFilePath) return null
    // upload file on cloudinary
    
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    })

    //file has been uploaded successfully
    console.log("File has uploaded on cloudinary", response.url)

    return response
    
  } catch (error) {
  if (fs.existsSync(localFilePath)) {
    fs.unlinkSync(localFilePath)
  }
  console.error("Cloudinary upload failed:", error)
  return null
}
}

export {uploadOnCloudinary, cloudinary}