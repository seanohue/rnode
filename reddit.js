const HOST = "http://www.reddit.com";
const TARGET_SUB_REDDIT = "/r/news";
const TOP_COUNT = 5;
const CLEAR_TERM = '\u001B[2J\u001B[0;0f';

const fetch = require('node-fetch');
const decoder = require('html-decoder');

const RedditPost = require('./lib/RedditPost');
const RedditComment = require('./lib/RedditComment');

const rl = require("readline")
  .createInterface({
    input: process.stdin,
    output: process.stdout
  });

const divider = `
===========================================
`;

function main() {
  getSubRedditData(TARGET_SUB_REDDIT, startSubRedditGopher);
}

function getSubRedditData(path, success) {

  const url = `${HOST + TARGET_SUB_REDDIT}`;
  return fetch(url)
    .then(response => response.text(),
          error    => { throw new Error(error); });
}

function getArrayOfRedditPosts(postArray) {
  return postArray.map(item => new RedditPost(item));
}

function showRedditComments(item) {
  clearTerminal();
  writeHeader("comments");
  const commentModel = item.getCommentsModel();

  console.log(commentModel.title + "\n\n");

  if (commentModel.comments.length > 0) {
    const len = (commentModel.comments.length < TOP_COUNT) ?
      commentModel.comments.length :
      TOP_COUNT;

    for (let i = 1; i < len; i++) {
      const comment = commentModel.comments[i].data;
      console.log(` %s. [${comment.author}] - ${comment.body}


      `);
    }

  } else {
    console.log("There are no comments.");
  }

  rl.question("\nEnter to continue", main);
}

function startSubRedditGopher(jsonResponse) {
  const items = getArrayOfRedditPosts(jsonResponse.data.children);
  clearTerminal();
  writeHeader("topics");
  for (var i = 1; i <= TOP_COUNT; i++) {
    console.log(divider + i + ". " + getItemRow(items[i]));
  }

  rl.question("Your Selection: ", (selection) => {
    if (selection > 0 && selection <= TOP_COUNT) {

      getSubRedditData(items[selection].permalink, function(result) {
        items[selection].setCommentsModel(new RedditComment(
          result));
        showRedditComments(items[selection]);
      });
    } else {
      main();
    }
  });
}

function writeHeader(arg) {
  console.log(`Welcome to the ${TARGET_SUB_REDDIT} Gopher system.`);
  console.log(`Here are top ${TOP_COUNT} most recent : ${divider} ${arg}`);
}

function getItemRow(item) {
  return `${item.title}
  by: ${item.author} on ${getFormattedDateAndPost(item)}
`;
}

function getFormattedDateAndPost(item) {
  return new Date(item.createdUtc * 1000).toString() + divider + cleanHtml(item.body)
}

function cleanHtml(content) {
  return decoder.decode(content)
    .replace('-- SC_OFF --', '')
    .replace('-- SC_ON --', '');
}

function clearTerminal() {
  console.log(CLEAR_TERM);
}

//***** BEGIN
main();