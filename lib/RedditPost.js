class RedditPost {
  constructor(post) {
    this.title = post.data.title;
    this.body = post.data.selftext_html || "Link post.";
    this.permalink = post.data.permalink;
    this.author = post.data.author;
    this.createdUtc = post.data.created_utc;
    this.name = post.data.name;
    this.commentsModel = null;
    console.log("post");
  }

  setCommentsModel(commentsModel) {
    this.commentsModel = commentsModel;
  }
  getCommentsModel() {
    return this.commentsModel;
  };
}

module.exports = RedditPost;