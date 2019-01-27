'use strict';
// this line must contain the correct database name:
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/challenge-mongoose-blog-app';
exports.PORT = process.env.PORT || 8080;