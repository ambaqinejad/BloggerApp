// nodejs modules
const path = require('path');
const fs = require('fs');

// third party modules
const multer = require('multer');

// my own modules
const Blogger = require(path.join(process.cwd(), 'models', 'blogger.js'));
const Article = require(path.join(process.cwd(), 'models', 'article.js'));
const redirect = require(path.join(process.cwd(), 'tools', 'redirection.js'));
const multerInitializer = require(path.join(process.cwd(), 'tools', 'multerInitializer.js'));

const getDashboardPage = (req, res, next) => {
    Article.find({}).populate('postedBy', {
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        avatar: true,
    }).exec((err, articles) => {
        if (err) {
            return res.render('dashboard.ejs', {
                err: 'Could not to retrieve articles. Something went wrong.',
                detailError: ""
            });
        }
        res.render('dashboard.ejs', {
            err: '',
            blogger: req.session.blogger,
            articles,
            detailError: req.query.detailError || ''
        })
    })
}

const getMyPostsPage = (req, res, next) => {
    const bloggerID = req.params.bloggerID;
    console.log('a', bloggerID);
    Article.find({ postedBy: bloggerID }).populate('postedBy', {
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        avatar: true,
    }).exec((err, articles) => {
        if (err) {
            return res.render('myPosts.ejs', {
                err: 'Could not to retrieve articles. Something went wrong.',
                detailError: ""
            });
        }
        res.render('myPosts.ejs', {
            err: '',
            blogger: req.session.blogger,
            articles,
            detailError: req.query.detailError || ''
        })
    })
}

const getNewPostPage = (req, res, next) => {
    res.render('newPost.ejs', {
        blogger: req.session.blogger,
        message: req.query.message || ''
    })
}

const getUpdatePostPage = (req, res, next) => {
    res.render('updatePost.ejs', {
        blogger: req.session.blogger,
        message: req.query.message || ''
    })
}

const getWhoAmIPage = (req, res, next) => {
    res.render('whoAmI.ejs', {
        blogger: req.session.blogger
    })
}

const getModifyInformationPage = (req, res, next) => {
    res.render('modifyInformation.ejs', {
        blogger: req.session.blogger,
        message: req.query.message || ''
    })
}

const getDetailPage = (req, res, next) => {
    res.render('postDetail.ejs', {
        blogger: req.session.blogger
    })
}

const resetBloggerPassword = async(req, res, next) => {
    const bloggerID = req.params.bloggerID;
    let blogger;
    try {
        blogger = await Blogger.findById(bloggerID);
    } catch (err) {
        return redirect(res, '/dashboard/getBloggers', 'Something went wrong.')
    }
    Blogger.updateOne({ _id: bloggerID }, { password: blogger.phone }, err => {
        if (err) {
            return redirect(res, '/dashboard/getBloggers', 'Something went wrong.')
        }
        return redirect(res, '/dashboard/getBloggers', 'Updated Successfully.')
    })
}

const getBloggersPage = (req, res) => {
    Blogger.find({ role: 'blogger' }, {
        password: 0,
        _v: 0
    }, (err, bloggers) => {
        if (err) {
            return res.render('bloggers.ejs', {
                err: 'Could not to retrieve bloggers information. Something went wrong.',
                detailError: ""
            });
        }
        res.render('bloggers.ejs', {
            err: '',
            blogger: req.session.blogger,
            bloggers,
            detailError: req.query.detailError || '',
            message: req.query.message || ''
        })
    })
}

const getArticle = (req, res, next) => {
    const articleID = req.body.articleID;
    Article.findById(articleID).populate('postedBy')
        .exec((err, article) => {
            if (err) {
                return res.status(500).json({
                    err: err.message,
                })
            }
            res.json({
                article
            })
        })
}

const updateBlogger = (req, res, next) => {
    const bloggerNewObj = {
        firstName: req.body.firstName || req.session.blogger.firstName,
        lastName: req.body.lastName || req.session.blogger.lastName,
        username: req.body.username || req.session.blogger.username,
        gender: req.body.gender || req.session.blogger.gender,
        avatar: req.body.avatar || req.session.blogger.avatar,
        phone: req.body.phone ? `+98${req.body.phone}` : req.session.blogger.phone,
        email: req.body.email || req.session.blogger.email,
        createdAt: req.body.createdAt || req.session.blogger.createdAt
    }

    if (req.body.password) {
        bloggerNewObj.password = req.body.password
    }

    Blogger.findOne({ username: bloggerNewObj.username }, (err, blogger) => {
        if (err) {
            return redirect(res, '/dashboard/modifyInformation', 'Something went wrong.');
        }
        if (blogger && bloggerNewObj.username !== blogger.username) {
            return redirect(res, '/dashboard/modifyInformation', 'Username is already in use.');
        }
        Blogger.updateOne({ username: req.session.blogger.username }, bloggerNewObj, (err) => {
            if (err) {
                return redirect(res, '/dashboard/modifyInformation', 'Something went wrong.');
            }
            req.session.blogger = null;
            return res.redirect('/auth/signIn');
        })
    })
}

const logout = (req, res, next) => {
    req.session.blogger = null;
    return res.redirect('/auth/signIn')
}

const uploadAvatar = (req, res, next) => {
    const upload = multerInitializer.uploadAvatar.single('avatar');
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.log(err.message);
            res.redirect('/dashboard')
        } else if (err) {
            console.log(err.message);
            res.redirect('/dashboard')
        } else {
            Blogger.findByIdAndUpdate(req.session.blogger._id, { avatar: req.file.filename }, { new: true }, (err, blogger) => {
                if (err) {
                    console.log(err.message);
                    res.redirect('/dashboard')
                } else {
                    if (req.session.blogger.avatar) {
                        fs.unlink(path.join(process.cwd(), 'public', 'images', 'avatars', req.session.blogger.avatar), (err) => {
                            if (err) {
                                console.log(err.message);
                                res.redirect('/dashboard')
                            } else {
                                req.session.blogger = blogger;
                                res.redirect('/dashboard')
                            }
                        })
                    } else {
                        req.session.blogger = blogger;
                        res.redirect('/dashboard')
                    }
                }
            })
        }
    })
}

const uploadPostImage = (req, res, next) => {
    const upload = multerInitializer.uploadPostImage.single('postImage');
    upload(req, res, error => {
        if (error) {
            res.status(500).json({
                message: err.message
            })
        } else {
            res.json({
                imageUrl: `images/post_images/${req.file.imageName}`
            })
        }
    })
}

const deletePostImage = (req, res) => {
    req.body.deleted.forEach(url => {
        try {
            fs.unlinkSync(path.join(process.cwd(), 'public', url));
        } catch (err) {
            console.log(err.message);
        }
    })
}

const uploadPost = (req, res, next) => {
    const upload = multerInitializer.uploadPostHeaderImage.single('postHeaderImage');
    upload(req, res, err => {
        if (err) {
            return redirect(res, '/dashboard/newPost', 'Something went wrong.')
        }
        if (!req.body.title || !req.body.description) {
            return redirect(res, '/dashboard/newPost', 'Title and description are required.')
        }
        req.body.image = req.file.imageName;
        req.body.postedBy = req.session.blogger._id
        new Article(req.body).save(err => {
            if (err) {
                return redirect(res, '/dashboard/newPost', 'Something went wrong.')
            }
            return res.redirect(`/dashboard/myPosts/${req.session.blogger._id}`);
        })
    })
}

const saveUpdatePost = (req, res, next) => {
    if (!req.body.title || !req.body.description) {
        return redirect(res, '/dashboard/updatePost', 'Title and description are required.')
    }
    Article.findByIdAndUpdate(req.body.articleId, req.body, (err) => {
        if (err) {
            redirect(res, '/dashboard/updatePost', 'Something went wrong.')
        }
        res.redirect('/dashboard/myPosts')
    })
}

const deletePost = async(req, res, next) => {
    const articleId = req.body.articleId;
    try {
        let deletedArticle = await Article.findById(articleId);
        let deleteInfo = await Article.findByIdAndDelete(articleId);
        fs.unlinkSync(path.join(process.cwd(), 'public', 'images', 'post_header_image', deletedArticle.image))
        const contents = JSON.parse(deletedArticle.content);
        contents.ops.forEach(content => {
            if (content.insert.image) {
                fs.unlinkSync(path.join(process.cwd(), 'public', content.insert.image))
            }
        })
        return res.json({
            message: 'Deleted successfully.'
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

const deleteBlogger = async(req, res, next) => {
    const bloggerID = req.params.bloggerID;
    try {
        const blogger = await Blogger.findById(bloggerID);
        const articles = await Article.find({ postedBy: bloggerID })

        // delete Blogger
        await Blogger.findByIdAndDelete(bloggerID);
        // delete Articles
        await Article.deleteMany({ postedBy: bloggerID });
        // delete blogger avatar
        fs.unlinkSync(path.join(process.cwd(), 'public', 'images', 'avatars', blogger.avatar));
        // delete header images and post images
        articles.forEach(article => {
            fs.unlinkSync(path.join(process.cwd(), 'public', 'images', 'post_header_image', article.image));
            const contents = JSON.parse(article.content);
            contents.ops.forEach(content => {
                if (content.insert.image) {
                    fs.unlinkSync(path.join(process.cwd(), 'public', content.insert.image))
                }
            })
        })
        return redirect(res, '/dashboard/getBloggers', 'Blogger deleted successfully.')
    } catch (err) {
        return redirect(res, '/dashboard/getBloggers', 'Something went wrong.')
    }
}

module.exports = {
    getDashboardPage,
    getMyPostsPage,
    getNewPostPage,
    getUpdatePostPage,
    getWhoAmIPage,
    getModifyInformationPage,
    getDetailPage,
    getBloggersPage,
    getArticle,
    resetBloggerPassword,
    updateBlogger,
    logout,
    uploadAvatar,
    uploadPost,
    saveUpdatePost,
    uploadPostImage,
    deletePostImage,
    deletePost,
    deleteBlogger
}