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





app.listen(process.env.PORT || 8080, () => {
  console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});