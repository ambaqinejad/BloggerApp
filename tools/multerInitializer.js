const fs = require('fs');
const path = require('path');
const multer = require('multer');

const destination = (address) => {
    return (req, file, cb) => {
        cb(null, address)
    }
}

const filename = (foldername) => {
    return (req, file, cb) => {
        const imageName = `${req.session.blogger.username}-${foldername}-${Date.now()}-${file.originalname}`;
        req.file = file;
        req.file.imageName = imageName;
        cb(null, imageName)
    }
}

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Invalid type of image'), false);
    }
}

const avatarStorage = multer.diskStorage({
    destination: destination(path.join(process.cwd(), 'public', 'images', 'avatars')),
    filename: filename('avatar')
});

const postImageStorage = multer.diskStorage({
    destination: destination(path.join(process.cwd(), 'public', 'images', 'post_images')),
    filename: filename('post_image')
})

const postHeaderImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), 'public', 'images', 'post_header_image'))
    },
    filename: filename('post_header_image')
})

const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter
})

const uploadPostImage = multer({
    storage: postImageStorage,
    fileFilter
})

const uploadPostHeaderImage = multer({
    storage: postHeaderImageStorage,
    fileFilter
})

module.exports = {
    uploadAvatar,
    uploadPostImage,
    uploadPostHeaderImage
}