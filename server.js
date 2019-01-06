const express = require('express')
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


app.listen(process.env.PORT || 8080, () => {
  console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});