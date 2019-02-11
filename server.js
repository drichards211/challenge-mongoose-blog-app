"use strict";

const express = require('express')
// const morgan = require('morgan')
const mongoose = require("mongoose"); // new for mongoose
mongoose.Promise = global.Promise; // new for mongoose

const {PORT, DATABASE_URL} = require('./config'); // new for mongoose
const {Author, BlogPosts} = require('./models')

const app = express()

app.use(express.json()); // required, or else POST req.body will be "undefined"
// applicationCache.use(morgan('common'))

const router = express.Router()
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

// Creating some blog posts so there's something to GET
/* BlogPost.create('The World\'s Oceans', 'There are five of them', 'D.R.', '01-05-2019') */

app.get("/blogs", (req, res) => {
  BlogPosts.find()
    .then(blogposts => {
      res.json({
        blogposts: blogposts.map(blogpost => blogpost.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

app.get("/blogs/:id", (req, res) => {
  console.log(req.params)
  BlogPosts
    .findById(req.params.id)
    .then(blogpost => res.json(blogpost.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

app.post("/blogs", (req, res) => {
  const requiredFields = ["title", "content", "author"];
  console.log(req.body)
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  BlogPosts.create({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  })
    .then(blogpost => res.status(201).json(blogpost.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

app.put("/blogs/:id", (req, res) => {
  console.log(req.body)
  console.log(req.body.id)
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message =
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`;
    console.error(message);
    return res.status(400).json({ message: message });
  }

  const toUpdate = {};
  const updateableFields = ["title", "content", "author"];
  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  BlogPosts
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(updatedPost => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});

app.delete("/blogs/:id", (req, res) => {
  BlogPosts.findByIdAndRemove(req.params.id)
    .then(() => {
    console.log(`Deleted blog post with id \`${req.params.id}\``);
    res.status(204).end()
    })
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});

// Adding CRUD operations for authors:
app.get('/authors', (req, res) => {
  Author
    .find()
    .then(authors => {
      res.json(authors.map(author => {
        return {
          id: author._id,
          name: `${author.firstName} ${author.lastName}`,
          userName: author.userName
        };
      }));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});

app.post('/authors', (req, res) => {
  const requiredFields = ['firstName', 'lastName', 'userName'];
  requiredFields.forEach(field => {
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  });

  Author
    .findOne({ userName: req.body.userName })
    .then(author => {
      if (author) {
        const message = `Username already taken`;
        console.error(message);
        return res.status(400).send(message);
      }
      else {
        Author
          .create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName
          })
          .then(author => res.status(201).json({
              _id: author.id,
              name: `${author.firstName} ${author.lastName}`,
              userName: author.userName
            }))
          .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Something went wrong' });
          });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went horribly awry' });
    });
});

app.put('/authors/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['firstName', 'lastName', 'userName'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Author
    .findOne({ userName: updated.userName || '', _id: { $ne: req.params.id } })
    .then(author => {
      if(author) {
        const message = `Username already taken`;
        console.error(message);
        return res.status(400).send(message);
      }
      else {
        Author
          .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
          .then(updatedAuthor => {
            res.status(200).json({
              id: updatedAuthor.id,
              name: `${updatedAuthor.firstName} ${updatedAuthor.lastName}`,
              userName: updatedAuthor.userName
            });
          })
          .catch(err => res.status(500).json({ message: err }));
      }
    });
});

app.delete('/authors/:id', (req, res) => {
  BlogPost
    .remove({ author: req.params.id })
    .then(() => {
      Author
        .findByIdAndRemove(req.params.id)
        .then(() => {
          console.log(`Deleted blog posts owned by and author with id \`${req.params.id}\``);
          res.status(204).json({ message: 'success' });
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});


// Original, express app API calls
/* app.get('/blog-posts', (req, res) => {
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
 */

let server

// old runserver
/* function runServer() {
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
 */
function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    console.log(databaseUrl)
    mongoose.connect(
      databaseUrl,
      err => {
        if (err) {
          return reject(err);
        }
        server = app
          .listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve();
          })
          .on("error", err => {
            mongoose.disconnect();
            reject(err);
          });
      }
    );
  });
}
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log("Closing server");
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// old closeServer()
/* function closeServer() {
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
 */

if (require.main === module) {
  // you must import DATABASE_URL here as an argument:
  runServer(DATABASE_URL).catch(err => console.error(err)) 
}

module.exports = { app, runServer, closeServer }
