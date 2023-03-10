import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import multer from 'multer';
dotenv.config();

export const configureCloudinary = () => {
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

// configure multer for handling image upload
export const upload = multer({
  // store files in memory instead of on disk because we don't need to save the file
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
  fileFilter: (req, file, cb) => {
    // accept image only. throw error in callback if not an image
    if (!file.mimetype.startsWith('image')) {
      cb(new Error('Only image files are allowed!'));
    }
    // callback with no error to accept the file
    cb(null, true);
  },
}).single('image'); // name of the input field in the form
