import React from "react";
import {Post} from './Posts';
import {SortButtons} from './MainPageDisplay';
import PostsDisplay from './Posts';

export default function SearchPage({model, pageSwitch, sortClick, posts, query, user}) {

      const searchTerms = query.split(" ");
      let foundPosts = []; 
      searchTerms.forEach(term => {
        posts.forEach(post => {
          let termFound = false;
          if (foundPosts.includes(post)) {
            return;
          }
          if (post.title.includes(term) || post.content.includes(term)){
            //console.log("found in post: " + post.content);
            termFound = true;
          }
          else {
            const postComments = commentList(model, post);
            postComments.forEach(comment => {
              if (comment.content.includes(term)) {
                //console.log("found in comment: " + comment.content);
                termFound = true;
              }
            });
          }
  
          if (termFound) {
            foundPosts.push(post);
          }
        });
      });
      console.log(foundPosts);
      return (
          <div className="main-page" id="home-page">
              <SearchHeader sortClick={sortClick} query={query} /> 
              <div className="page-divider"></div>
              <SearchPostCount posts={foundPosts} query={query} />
              <PostsDisplay model={model} posts={foundPosts} pageSwitch={pageSwitch} user={user}/>
          </div>
      );
}

/*
<SearchPostsDisplay 
pageName="home"
model={model} posts={foundPosts} 
pageSwitch={pageSwitch} 
/>
*/

function SearchHeader({sortClick, query}) { 
  return (
      <div className="page-top-header" id="top-part">
          <h1 className="main-page-title" id="home-title">Results For: {query}</h1>
          <SortButtons sortClick={sortClick}/>
      </div>
  )
}

function SearchPostCount({posts, query}) {
  let numPosts = posts.length;
  return (
      <h2 className="post-count">
        {numPosts === 0 ? `No results found for : ${query}` : `${numPosts} ${numPosts === 1 ? 'post' : 'posts'}`}
      </h2>
  );
}

function commentList(model, post) {
  let comments = [];
  post.commentIDs.forEach(commentID => {
      collectComments(model, commentID, comments);
  });
  return comments;
}

function collectComments(model, commentID, comments) {
  const {commentsData} = model;
  const comment = commentsData.find(c => c._id === commentID);
  if (!comment) {
      return;
  }
  comments.push(comment);
  comment.commentIDs.forEach(replyID => {
      collectComments(model, replyID, comments);
  });
}


