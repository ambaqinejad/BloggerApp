const fs = require('fs');
const path = require('path');
const Blogger = require(path.join(process.cwd(), 'models', 'blogger.js'));

module.exports = (function() {
    (fs.existsSync(path.join(process.cwd(), 'public', 'images')) ||
        fs.mkdirSync(path.join(process.cwd(), 'public', 'images')));
    (fs.existsSync(path.join(process.cwd(), 'public', 'images', 'avatars')) ||
        fs.mkdirSync(path.join(process.cwd(), 'public', 'images', 'avatars')));
    (fs.existsSync(path.join(process.cwd(), 'public', 'images', 'post_images')) ||
        fs.mkdirSync(path.join(process.cwd(), 'public', 'images', 'post_images')));
    (fs.existsSync(path.join(process.cwd(), 'public', 'images', 'post_header_image')) ||
        fs.mkdirSync(path.join(process.cwd(), 'public', 'images', 'post_header_image')));


    new Blogger({
        firstName: 'Amir Hosein',
        lastName: 'Baqinejad',
        password: 'admin123',
        username: 'admin',
        email: 'admin@yahoo.com',
        phone: '+989355919223',
        gender: 'male',
        avatar: null
    }).save(err => {
        if (err) {
            console.log('Error in admin creation');
        } else {
            console.log('Admin was created successfully');
        }
    })

})()