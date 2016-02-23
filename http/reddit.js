var HOST = "www.reddit.com";
var TARGET_SUB_REDDIT = "/r/relationships";
var TOP_COUNT = 5;
var CLEAR_TERM = '\u001B[2J\u001B[0;0f';

var http = require("http");

var rl = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

function main() {
  getSubRedditData(TARGET_SUB_REDDIT, (result) => {
    startSubRedditGopher(result);
  });
}

//***** Classes
function RedditPost(post) {
  console.log(post);
  this.title = post.data.title;
  this.body = post.data.selftext_html;
  this.permalink = post.data.permalink;
  this.author = post.data.author;
  this.createdUtc = post.data.created_utc;
  this.name = post.data.name;
  this.commentsModel = null;

  this.setCommentsModel = function(commentsModel) {
    this.commentsModel = commentsModel;
  };
  this.getCommentsModel = function() {
    return this.commentsModel;
  };
}

function RedditCommentsModel(comment) {
  this.source = comment;
  this.title = comment[0].data.children[0].data.title;
  this.author = comment[0].data.children[0].data.author;
  this.comments = comment[1].data.children;
}

//***** Methods
function getSubRedditData(path, success) {

  var req = {
    host: HOST,
    path: path + ".json"
  };

  return http.get(req, (response) => {
    var body = "";

    response.on("data", (d) => {
      body += d;
    });

    response.on("end", () => {
      try {
        var parsed = JSON.parse(body);
        success(parsed);
      } catch (err) {
        console.log("There was an error parsing the json response:\n" +
          err);
      }
    });

    response.on("error", (e) => {
      console.log("there was an error " + e);
    });

  });
}

function getArrayOfRedditPosts(postArray) {
  var arr = [];
  postArray.forEach((item) => {
    arr.push(new RedditPost(item));
  });
  return arr;
}

function showRedditComments(item) {
  clearTerminal();
  writeHeader("comments");
  var commentModel = item.getCommentsModel();

  console.log(commentModel.title + "\n\n");

  if (commentModel.comments.length > 0) {
    var len = (commentModel.comments.length < TOP_COUNT) ?
      commentModel.comments.length : TOP_COUNT;

    for (var i = 1; i < len; i++) {
      var comment = commentModel.comments[i].data;
      console.log(" %s. [" + comment.author + "] - " + comment.body, i);
    }

  } else {
    console.log("There are no comments.");
  }

  rl.question("\nEnter to continue", function(key) {
    main();
  });
}

function startSubRedditGopher(jsonResponse) {
  var items = getArrayOfRedditPosts(jsonResponse.data.children);
  clearTerminal();
  writeHeader("topics");
  for (var i = 1; i <= TOP_COUNT; i++) {
    console.log(i + ". " + getItemRow(items[i]));
  }

  rl.question("Your Selection: ", (selection) => {
    if (selection > 0 && selection <= TOP_COUNT) {

      getSubRedditData(items[selection].permalink, function(result) {
        items[selection].setCommentsModel(new RedditCommentsModel(
          result));
        showRedditComments(items[selection]);
      });
    } else {
      main();
    }
  });
}

function writeHeader(arg) {
  console.log("Welcome to the " + TARGET_SUB_REDDIT + " Gopher system.\n");
  console.log("Here are top " + TOP_COUNT + " most recent %s:\n", arg);
}

function getItemRow(item) {
  return item.title + "\n" +
    "   by: " + item.author + " on " +
    new Date(item.createdUtc * 1000).toString() + "\n\n\n" + stripHtml(item.body);

}

function stripHtml(content) {
  return content.replace('<br/>', '\n')
                .replace(/<(?:.|\n)*?>/gm, '');

}

function clearTerminal() {
  console.log(CLEAR_TERM);
}
//***** BEGIN
main();