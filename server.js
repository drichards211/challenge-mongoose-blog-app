const express = require('express')
const mongoose = require("mongoose"); // new for mongoose
mongoose.Promise = global.Promise; // new for mongoose
const {PORT, DATABASE_URL} = require('./config'); // new for mongoose
const {Restaurant} = require('./models');  // new for mongoose
const router = express.Router()
// const morgan = require('morgan')
const bodyParser = require('body-parser')
const {BlogPosts} = require('./models')
const jsonParser = bodyParser.json()
const app = express()
// applicationCache.use(morgan('common'))

// Creating some blog posts so there's something to GET
BlogPosts.create('The World\'s Oceans', 'There are five of them', 'D.R.', '01-05-2019')

app.get('/blog-posts', (req, res) => {
  res.json(BlogPosts.get())
})

app.post('/blog-posts', jsonParser, (req, res) => {
  // ensure `name` and `budget` are in request body
  const requiredFields = ['title', 'content', 'author', 'publishDate']
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i]
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message)
      return res.status(400).send(message)
    }
  }
  const item = BlogPosts.create(req.body.title, req.body.content, req.body.author, req.body.publishDate)
  res.status(201).json(item)
})

app.delete('/blog-posts/:id', (req, res) => {
  BlogPosts.delete(req.params.id)
  console.log(`Deleted blog post \`${req.params.id}\``)
  res.status(204).end()
})

app.put('/blog-posts/:id', jsonParser, (req, res) => {
  const requiredFields = ['id', 'title', 'content', 'author', 'publishDate']
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  if (req.params.id !== req.body.id) {
    const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
    console.error(message);
    return res.status(400).send(message);
  }
  console.log(`Updating blog post \`${req.params.id}\``);
  BlogPosts.update({
    id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    publishDate: req.body.publishDate
  });
  res.status(204).end();
})


let server

function runServer() {
  const port = process.env.PORT || 8080
  return new Promise((resolve, reject) => {
    server = app
      .listen(port, () => {
        console.log(`Your app is listening on port ${port}`)
        resolve(server)
      })
      .on("error", err => {
        reject(err)
      })
  })
}

function closeServer() {
  return new Promise((resolve, reject) => {
    console.log("Closing server")
    server.close(err => {
      if (err) {
        reject(err)
        // so we don't also call `resolve()`
        return
      }
      resolve()
    })
  })
}


if (require.main === module) {
  runServer().catch(err => console.error(err))
}

module.exports = { app, runServer, closeServer }
