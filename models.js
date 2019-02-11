"use strict";

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

// don't need this line because the mongo database takes care of assigning IDs:
// const uuid = require('uuid');  



// We no longer construct blog posts this way. We specify
// a Mongo schema and then reference that with a variable
// called BlogPosts:

/* function StorageException(message) {
   this.message = message;
   this.name = "StorageException";
} */

/* const BlogPosts = {
  create: function(title, content, author, publishDate) {
    const post = {
      id: uuid.v4(),
      title: title,
      content: content,
      author: author,
      publishDate: publishDate || Date.now()
    };
    this.posts.push(post);
    return post;
  },
  get: function(id=null) {
    // if id passed in, retrieve single post,
    // otherwise send all posts.
    if (id !== null) {
      return this.posts.find(post => post.id === id);
    }
    // return posts sorted (descending) by
    // publish date
    return this.posts.sort(function(a, b) {
      return b.publishDate - a.publishDate
    });
  },
  delete: function(id) {
    const postIndex = this.posts.findIndex(
      post => post.id === id);
    if (postIndex > -1) {
      this.posts.splice(postIndex, 1);
    }
  },
  update: function(updatedPost) {
    const {id} = updatedPost;
    const postIndex = this.posts.findIndex(
      post => post.id === updatedPost.id);
    if (postIndex === -1) {
      throw new StorageException(
        `Can't update item \`${id}\` because doesn't exist.`)
    }
    this.posts[postIndex] = Object.assign(
      this.posts[postIndex], updatedPost);
    return this.posts[postIndex];
  }
};
 */

 /* function createBlogPostsModel() {
  const storage = Object.create(BlogPosts);
  storage.posts = [];
  return storage;
} */

var commentsSchema = mongoose.Schema({ content: 'string' });

var authorSchema = mongoose.Schema({
  firstName: 'string',
  lastName: 'string',
  userName: {
    type: 'string',
    unique: true
  }
});

const blogPostsSchema = mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String},
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
  comments: [commentsSchema],
  created: {type: Date, default: Date.now}
});

blogPostsSchema.pre('find', function(next) {
  this.populate('author');
  next();
});

blogPostsSchema.pre('findOne', function(next) {
  this.populate('author');
  next();
});

blogPostsSchema.virtual("authorString").get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogPostsSchema.methods.serialize = function() {
  return {
    id: this._id,
    title: this.title,
    content: this.content,
    author: this.authorString,
    comments: this.comments,
    created: this.created
  };
};

const BlogPosts = mongoose.model("blogposts", blogPostsSchema); // "blogposts" is the name of the db.collection???
// Absolutely zero guidance from the course materials. I may as well be working with magic.
var Author = mongoose.model('authors', authorSchema);

/* module.exports = {BlogPosts: createBlogPostsModel()}; */
module.exports = { BlogPosts };