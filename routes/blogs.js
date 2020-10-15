const express = require('express')
const router = express.Router()
const { ensureAuth} = require('../middleware/auth')
const Blog = require('../models/Blog')


//Show add page
//GET /blogs/add
router.get('/add', ensureAuth, (req, res) => {
    res.render('blogs/add')
})

//POST /blogs
router.post('/', ensureAuth, async (req, res) => {
    req.session.message = {
        type: 'created'
    }

    try {
        req.body.user = req.user.id
        await Blog.create(req.body)
        res.redirect('/dashboard')
    } catch (error) {
        console.error(error)
        res.render('error/500')
    }
})

//Show all blogs
//GET /blogs
router.get('/', ensureAuth, async (req, res) => {
    try {
        const blogs = await Blog.find({ status: 'public' })
        .populate('user')
        .sort({ createdAt: 'desc' })
        .lean()

        res.render('blogs/index', {
            blogs,
        })
    } catch (error) {
        console.error(error)
        res.render('error/500')
    }
})

//Show single blog
//GET /blogs/:id
router.get('/:id', ensureAuth, async (req, res) => {
    try {
        let blog = await Blog.findById(req.params.id)
            .populate('user')
            .lean()

        if(!blog){
            return res.render('error/404')
        }

        res.render('blogs/show', {
            blog
        })
    } catch (error) {
        console.error(error)
        res.render('error/404')
    }
})

//Show edit page
//GET /blogs/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
    try {
        const blog = await Blog.findOne({
            _id: req.params.id
        }).lean()
    
        if(!blog) {
            return res.render('error/404')
        }
    
        if(blog.user != req.user.id){
            res,redirect('blogs')
        }else{
            res.render('blogs/edit', {
                blog,
            })
        }
    } catch (error) {
        console.error(error)
        res.render(error/500)
    } 
})

//Update blog
//PUT /blogs/:id
router.put('/:id', ensureAuth, async (req, res) => {
    req.session.message = {
        type: 'success'
    }

    let blog = await Blog.findById(req.params.id).lean()

    try {
        if(!blog) {
            return res.render('error/404')
        }
    
        if(blog.user != req.user.id){
            res.redirect('/blogs')
        }else{
            blog = await Blog.findOneAndUpdate({ _id: req.params.id}, req.body, {
                new: true,
                runValidators: true,
            })
    
            res.redirect('/dashboard')
        }
    } catch (error) {
            console.error(error)
            res.render(error/500)   
    } 
})

//Delete blog
//DELETE /blogs/:id
router.delete('/:id', ensureAuth, async (req, res) => {
    req.session.message = {
        type: 'danger'
    }
    try {
        await Blog.remove({ _id: req.params.id})
        res.redirect('/dashboard')
    } catch (error) {
        console.error(error)
        res.render(error/500)   
    }
})

//User blogs
//GET /blogs/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
    try {
        const blogs = await Blog.find({
            user: req.params.userId,
            status: 'public'
        })
        .populate('user')
        .lean()

        res.render('blogs/index', {
            blogs,
        })
    } catch (error) {
        console.error(error)
        res.render('error/500')
    }
})

module.exports = router