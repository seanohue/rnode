class RedditComment {
  constructor(comment) {
    this.source = comment;
    this.title = comment[0].data.children[0].data.title;
    this.author = comment[0].data.children[0].data.author;
    this.comments = comment[1].data.children;
  }
}

module.exports = RedditComment;