import cloudinary from "../config/cloudinary.js";


const uploadCloudinary = (fileSource, folder = 'connect_hub') => {
    return new Promise((resolve, reject) => {
        if (typeof fileSource === 'string') {
            cloudinary.uploader.upload(fileSource, { folder: folder }, (error, result) => {
                if (error) return reject(error);
                resolve(result)
           
            })
        } else {
            // if it is a buffer (Multer)
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: folder, resource_type: 'auto' },
                (error, result) => {
                    if (error) return reject(error)
                    resolve(result)
                }
            );
            uploadStream.end(fileSource)
        }
    })
}

export default uploadCloudinary;