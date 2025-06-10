import React from 'react';
import {ConvertTimeElapsed} from "./MainPageDisplay";
import {postComments} from "./Posts.js";
import axios from 'axios';

export default function PostPage({model, pageSwitch, post, comm, updatePosts, updateVotes, user, updateCommentVotes}) {
    return (
        <div className="main-page" id="post-page">
        <PostHeader 
            model={model} 
            post={post} 
            comm={comm} 
            pageSwitch={pageSwitch}
            updatePosts={updatePosts}
            user={user}
            updateVotes={updateVotes}
        />
        <div className="page-divider"></div>
        <div id="post-main-comments">
        <PostComments 
            model={model} 
            post={post}  
            pageSwitch={pageSwitch}
            user={user}
            updateCommentVotes={updateCommentVotes}
        />
        </div>
        </div>
    )
}

function PostHeader({model, post, comm, pageSwitch, updateVotes, user}) {
  const currentComm = model.communitiesData.find(community => 
    community.postIDs && community.postIDs.includes(post._id)
  );
  const communityToUse = currentComm || comm;
  
  const {linkflairsData} = model;
  const postedDate = new Date(post.postedDate);
  const diffTime = ConvertTimeElapsed(Math.abs((new Date())-postedDate));
  const date = "Created "+diffTime;
  let linkFlair = linkflairsData.find(lf => lf._id === post.linkFlairID);
  if(!linkFlair)
  {
    linkFlair = "";
  }
  const postContent = findLinks(post.content);
  let userActions = userVotes({model, post, pageSwitch, updateVotes, user});

  return (
    <div id="post-top"> 
      <p id="post-comm-time">{communityToUse.name} | {date}</p>
      <p id="post-creator">Posted by: {post.postedBy}</p>
      <h1 className="main-page-title" id="post-title">{post.title}</h1>
      <p id="post-flair">{linkFlair.content}</p>
      <p id="post-content" dangerouslySetInnerHTML={{ __html: postContent }}></p>

      {userActions}
    </div>
  );
}

function userVotes({model, post, pageSwitch, updateVotes, user}) {
  let divider = <strong>{"\u00A0\u00A0•\u00A0\u00A0"}</strong>;
  if (user) {
    let addComment = <button 
      class='mp-header-buttons' 
      onClick={() => pageSwitch({pageName: "new-comment", 
      postID: post._id})}
    >Add a comment</button>;
    
    // implementation detail: 
    // users with bad rep will be allowed to unvote votes they placed before they reach <50 rep,
    // but not be able to upvote/downvote after that.
    const badRep = user.reputation < 50;

    const hasVoted = post.usersVoted.some(v => v.userID === user._id);
    let upvote = "";
    let downvote = "";

    if (hasVoted) {
      const userVote = post.usersVoted.find(v => v.userID === user._id);
      const isUpvote = userVote?.voteType === "upvote";

      upvote = <button 
        className={badRep ? "vote-buttons-low-rep" : "vote-buttons"} 
        id="upvote" 
        onClick={() => updateVotes({user, post, voteType: "upvote"})}
        disabled={!isUpvote}
        style={isUpvote ? { color: 'rgb(255, 85, 0)' } : {}}
      >🡅</button>;
      
      downvote = <button 
        className={badRep ? "vote-buttons-low-rep" : "vote-buttons"}  
        id="downvote"
        onClick={() => updateVotes({user, post, voteType: "downvote"})}
        disabled={isUpvote}
        style={!isUpvote ? { color: 'rgb(47, 0, 255)' } : {}}
        >🡇</button>;
    }
    else {
      upvote = <button 
        className={badRep ? "vote-buttons-low-rep" : "vote-buttons"} 
        id={badRep ? "" :"upvote"}
        onClick={() => updateVotes({user, post, voteType: "upvote"})}
        disabled={badRep}
      >🡅</button>;
    
      downvote = <button 
        className={badRep ? "vote-buttons-low-rep" : "vote-buttons"} 
        id={badRep ? "" : "downvote"}
        onClick={() => updateVotes({user, post, voteType: "downvote"})}
        disabled={badRep}
      >🡇</button>;
    }

    return (
      <>
        <p id="post-counts">Views: {post.views}{divider}💬 Comments: {postComments(model, post)}</p>
        <div id='vote-and-comment'>
          <div id="post-vote-box">
            {upvote}
            <div id="vote-counter">{post.votes}</div>
            {downvote}
          </div>
          {addComment}
        </div>
      </>
    );
  }
  else {
    const arrow = <span style={{ color: 'rgb(255, 85, 0)' }}>🡅</span>
    return (
      <p id="post-counts">
        Views: {post.views}{divider}
        💬 Comments: {postComments(model, post)}{divider}
        {arrow} Votes: {post.votes}
        </p>
    );
  }
  
}

// New function to handle comment voting with same rules as post voting
function commentVotes({comment, user, updateCommentVotes}) {
  if (!user) return "";

  // Same reputation rule as posts
  const badRep = user.reputation < 50;

  // Initialize usersVoted array if it doesn't exist
  if (!comment.usersVoted) {
    comment.usersVoted = [];
  }

  // Check if user has voted on this comment
  const hasVoted = comment.usersVoted.some(v => v.userID === user._id);
  let upvote = "";
  let downvote = "";

  if (hasVoted) {
    const userVote = comment.usersVoted.find(v => v.userID === user._id);
    const isUpvote = userVote?.voteType === "upvote";

    upvote = <button 
      onClick={() => updateCommentVotes({user, comment, voteType: "upvote"})}
      disabled={!isUpvote}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '2px',
        fontSize: '18px',
        color: isUpvote ? 'rgb(255, 85, 0)' : 'rgb(120, 120, 120)',
        opacity: badRep && !isUpvote ? 0.5 : 1
      }}
    >🡅</button>;
    
    downvote = <button 
      onClick={() => updateCommentVotes({user, comment, voteType: "downvote"})}
      disabled={isUpvote}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '2px',
        fontSize: '18px',
        color: !isUpvote ? 'rgb(47, 0, 255)' : 'rgb(120, 120, 120)',
        opacity: badRep && isUpvote ? 0.5 : 1
      }}
    >🡇</button>;
  }
  else {
    upvote = <button 
      onClick={() => updateCommentVotes({user, comment, voteType: "upvote"})}
      disabled={badRep}
      style={{
        background: 'none',
        border: 'none',
        cursor: badRep ? 'not-allowed' : 'pointer',
        padding: '2px',
        fontSize: '18px',
        color: 'rgb(120, 120, 120)',
        opacity: badRep ? 0.3 : 1
      }}
    >🡅</button>;
  
    downvote = <button 
      onClick={() => updateCommentVotes({user, comment, voteType: "downvote"})}
      disabled={badRep}
      style={{
        background: 'none',
        border: 'none',
        cursor: badRep ? 'not-allowed' : 'pointer',
        padding: '2px',
        fontSize: '18px',
        color: 'rgb(120, 120, 120)',
        opacity: badRep ? 0.3 : 1
      }}
    >🡇</button>;
  }

  return (
    <div className="comment-vote-box" style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      marginLeft: '10px',
      fontSize: '12px'
    }}>
      {upvote}
      <span className="comment-vote-counter">{comment.votes || 0}</span>
      {downvote}
    </div>
  );
}

function findCommentByID(model, commentID) {
    const {commentsData} = model;
    return commentsData.find(comment => comment._id === commentID);
}

function PostComments({model, post, pageSwitch, user, updateCommentVotes}) {
  const sortedCommentIDs = [...post.commentIDs].sort((a, b) => {
    const commentA = findCommentByID(model, a);
    const commentB = findCommentByID(model, b);
    
    if (!commentA || !commentB) return 0;

    const dateA = new Date(commentA.commentedDate).getTime();
    const dateB = new Date(commentB.commentedDate).getTime();
    
    return dateB - dateA;
  });

  return (
    <div>
      {sortedCommentIDs.map(commentID => {
        const comment = findCommentByID(model, commentID);
        return comment ? renderComment(model, comment, 0, pageSwitch, post, user, updateCommentVotes) : null;
      })}
    </div>
  );
}

function renderComment(model, comment, depth, pageSwitch, post, user, updateCommentVotes) {
  if (!comment) return null;

  const commentedDate = new Date(comment.commentedDate);
  const timeSinceComment = ConvertTimeElapsed(Math.abs(new Date() - commentedDate));
  const commentContent = findLinks(comment.content);
  const clickReply = () => pageSwitch({pageName: "reply", postID: post._id, commentID: comment._id});
  
  // Get comment votes UI
  const commentVotingUI = commentVotes({comment, user, updateCommentVotes});
  
  // Create a combined button row with Reply and Voting buttons
  const buttonRow = user ? (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      marginTop: '5px'
    }}>
      <p style={{color: "blue", cursor: "pointer", margin: 0}} onClick={clickReply}>Reply</p>
      {commentVotingUI}
    </div>
  ) : "";

  return (
    <div key={comment._id} style={{ marginLeft: `${depth + 15}px`, marginTop: "5px", fontFamily: 'Roboto, sans-serif' }}>
      <div style={{
        borderLeft: "2px solid #696969",
        padding: "5px",
      }}>
        <p>{comment.commentedBy} | {timeSinceComment}</p>
        <p dangerouslySetInnerHTML={{ __html: commentContent }}></p>
        {buttonRow}
      </div>
      {[...comment.commentIDs].sort((a, b) => {
        const replyA = findCommentByID(model, a);
        const replyB = findCommentByID(model, b);
        
        if (!replyA || !replyB) return 0;
        
        const dateA = new Date(replyA.commentedDate).getTime();
        const dateB = new Date(replyB.commentedDate).getTime();
        
        return dateB - dateA;
      }).map(replyID => {
        const reply = findCommentByID(model, replyID);
        return reply ? renderComment(model, reply, depth + 1, pageSwitch, post, user, updateCommentVotes) : null;
      })}
    </div>
  );
}

export function findLinks(content) {
  const regex = /\[([^\]]*)\]\(([^)]*)\)/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const [fullMatch, text, url] = match;
    if (!text.trim() || !url.trim() || (!url.startsWith("http://") && !url.startsWith("https://"))) {
      return "error";
    }
  }

  return content.replace(regex, (match, text, url) => {
    return `<a href="${url}" target="_blank">${text}</a>`;
  });
}