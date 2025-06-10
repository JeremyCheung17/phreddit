import React, {useState, useEffect} from "react";
import HomePage from "./HomePage.js";
import CommunityPage from "./CommunityPage.js";
import NewCommunityPage from "./NewCommunityPage.js";
import NewPostPage from "./NewPostPage.js";
import PostPage from "./PostPage.js";
import NewCommentPage from "./NewCommentPage.js";
import ReplyPage from "./ReplyPage.js";
import SearchPage from "./SearchPage.js";
import RegisterPage from "./RegisterPage.js";
import WelcomePage from './WelcomePage.js';
import LoginPage from './LoginPage.js';
import UserPage from './UserPage.js';
import AdminUserPage from './AdminUserPage.js';
import EditCommunityPage from './EditCommunity.js';
import EditPostPage from './EditPost.js';
import EditCommentPage from "./EditComment.js";
import EditReplyPage from "./EditReply.js";
import AdminViewUserPage from "./AdminViewUserPage.js";


export default function MainPageDisplay(
    {
      model,pageSwitch,pageName,
      postContexts,query,updateHooks,
      user, memberToggle,
      sortingHooks,
      updateVotes, updateCommentVotes
    }
  ) {
    const {postsData, commentsData} = model;
    const {updatePosts,updateCommunities,updateLinkflairs,updateComments} = updateHooks;
    const {comment,comm,post,reply,userClicked} = postContexts;
    const {postSortMethod, setPostSort} = sortingHooks;
    
    const handleSortClick = (sort) => {
      setPostSort(sort);
      //console.log"clicked on " + sort);
    };
    const sortPosts = (posts) => {

      const sortedPosts = [...posts];
      
      if (postSortMethod === "active") {
        //console.log"sort by active");
        for (let i = 0; i < sortedPosts.length; i++) {
          let minIndex = i;
          for (let j = i + 1; j < sortedPosts.length; j++) {
            const currDate = new Date();

            const recentJ = mostRecentComment(sortedPosts[j], commentsData);
            const recentMinIndex = mostRecentComment(sortedPosts[minIndex], commentsData);
            const diffTimeJ = Math.abs(currDate - (recentJ || new Date(sortedPosts[j].postedDate)));
            const diffTimeMinIndex = Math.abs(currDate - (recentMinIndex || new Date(sortedPosts[minIndex].postedDate)));

            if (diffTimeJ < diffTimeMinIndex) {
              minIndex = j;
            } else if (diffTimeJ === diffTimeMinIndex) {
                
              const diffTimePostJ = Math.abs(currDate - (new Date(sortedPosts[j].postedDate)));
              const diffTimePostMinIndex = Math.abs(currDate - (new Date(sortedPosts[minIndex].postedDate)));
              if (diffTimePostJ < diffTimePostMinIndex) {
                minIndex = j;
              }
            }
          }
          [sortedPosts[i], sortedPosts[minIndex]] = [sortedPosts[minIndex], sortedPosts[i]];
        }
        return sortedPosts;
      } else if (postSortMethod === "oldest") {
        //console.log"sort by oldest");
        return sortedPosts.sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate));
      } else {
        // Default case: sort by newest (this ensures posts are always sorted by newest initially)
        //console.log"sort by newest");
        return sortedPosts.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
      }
    };
    let newSortedPosts = sortPosts(postsData);
    let htmlPage = <div />;
    
    switch (pageName) {
      case "home":
        htmlPage = (
          <HomePage 
            posts={newSortedPosts} 
            model={model} 
            sortClick={handleSortClick} 
            pageSwitch={pageSwitch} 
            user={user}
          />
        );
        break;
      case "community":
        const postIDs = comm.postIDs;
        const unsortedPosts = postsData.filter(post => postIDs.includes(post._id));
        newSortedPosts = sortPosts(unsortedPosts);
        htmlPage = (
            <CommunityPage 
                posts={newSortedPosts} 
                model={model}
                comm={comm} 
                sortClick={handleSortClick} 
                pageSwitch={pageSwitch} 
                user={user}
                memberToggle={memberToggle}
            />
        );
        break;
 
      case "new-community":
        htmlPage = <NewCommunityPage 
            model={model} 
            pageSwitch={pageSwitch} 
            updateCommunities={updateCommunities}
            user={user}
            />;
        break;
        
      case "new-post":
        htmlPage = <NewPostPage 
            model={model} 
            pageSwitch={pageSwitch} 
            updatePosts={updatePosts} 
            updateCommunities={updateCommunities} 
            updateLinkflairs={updateLinkflairs}
            user={user}
            />;
        break;
        
      case "post":
        ////console.log"mainpagedisplay -> post view");
        htmlPage = <PostPage 
            model={model} 
            post={post} 
            comm={comm} 
            pageSwitch={pageSwitch} 
            updatePosts={updatePosts}
            user={user}
            updateVotes={updateVotes}
            updateCommentVotes={updateCommentVotes}
        />;
        break;

      case "new-comment":
        htmlPage = <NewCommentPage 
            model={model} 
            post={post} 
            pageSwitch={pageSwitch}
            updatePosts={updatePosts} 
            updateComments={updateComments}
            user={user}
         />;
        break;
      
      case "reply":
        htmlPage = <ReplyPage 
            model={model} 
            post={post} 
            comment={comment} 
            pageSwitch={pageSwitch}
            updateComments={updateComments}
            user={user}
            />;
        break;
      case "user":
        htmlPage = <UserPage 
            model={model} 
            pageSwitch={pageSwitch}
            user={user}
            />;
        break;
      case "admin-user":
        htmlPage = <AdminUserPage 
            model={model} 
            pageSwitch={pageSwitch}
            user={user}
            updatePosts={updatePosts} 
            updateComments={updateComments}
            updateCommunities={updateCommunities}
            />;
        break;
      case "edit-community":
        //console.logcomm)
        htmlPage = <EditCommunityPage 
            model={model} 
            pageSwitch={pageSwitch}
            updateCommunities={updateCommunities}
            user={user}
            comm={comm}
            updatePosts={updatePosts}
            updateComments={updateComments}
            />;
        break;
      case "edit-post":
        htmlPage = <EditPostPage 
            model={model} 
            pageSwitch={pageSwitch}
            updatePosts={updatePosts} 
            updateCommunities={updateCommunities}
            updateLinkflairs={updateLinkflairs}
            user={user}
            post={post}
            updateComments={updateComments}
            />;
        break;
      case "edit-comment":
        htmlPage = <EditCommentPage 
            model={model} 
            pageSwitch={pageSwitch}
            post={post}
            updatePosts={updatePosts}
            updateComments={updateComments}
            user={user}
            comment={comment}
            />;
        break;
      case "edit-reply":
        htmlPage = <EditReplyPage 
            model={model} 
            pageSwitch={pageSwitch}
            post={post}
            comment={comment}
            updateComments={updateComments}
            user={user}
            reply={reply}
            />;
          break;
      case "admin-user-view":
        htmlPage = <AdminViewUserPage
            model={model} 
            pageSwitch={pageSwitch}
            user={user}
            userClicked={userClicked}
            />;
          break;
      case "search":
        htmlPage = (
            <SearchPage 
                posts={newSortedPosts}
                model={model}
                sortClick={handleSortClick}
                pageSwitch={pageSwitch} 
                query={query} 
                user={user}
            />
        );
        break;
      case "welcome":
        htmlPage = <WelcomePage pageSwitch={pageSwitch}/>
        break;
      case "register":
        htmlPage = (
          <RegisterPage pageSwitch={pageSwitch}/>
        );
      break;
      case "login":
        htmlPage = (
          <LoginPage pageSwitch={pageSwitch}/>
        );
        break;
      default:
        htmlPage = <div />;
    }
    ////console.log"selected pagename: " + pageName);
    return <main className="page-content">{htmlPage}</main>;
};

function mostRecentComment(post, comments)
{
  let commentsList = commentList(post, comments);
  if (commentsList.length === 0) {
    return undefined;
  }
  ////console.logcommentsList )
  if(commentsList.length === 0)
  {
    return post.postedDate;
  }
  let mostRecent = commentsList[0];
  
  for(let i = 0; i < commentsList.length; i++)
  {
    const comment = commentsList[i];
    if (new Date(comment.commentedDate) > new Date(mostRecent.commentedDate)) {
      mostRecent = comment;
    }
  }
  ////console.logmostRecent);
  return new Date(mostRecent.commentedDate);
}

export function commentList(post, comments) {
  let commentsList = [];
  post.commentIDs.forEach(commentID => {
      collectComments(commentID, commentsList, comments);
  });
  return commentsList;
}

function collectComments(commentID, commentsList, comments) {
  const comment = comments.find(c => c._id === commentID);
  if (!comment) {
      return;
  }
  commentsList.push(comment);
  comment.commentIDs.forEach(replyID => {
      collectComments(replyID, commentsList, comments);
  });
}

export function SortButtons({sortClick}) {
    return(
        <div className="sorting">
            <button className="sort-button" onClick={() => sortClick("newest")}>Newest</button>
            <button className="sort-button" onClick={() => sortClick("oldest")}>Oldest</button>
            <button className="sort-button" onClick={() => sortClick("active")}>Active</button>
        </div>
    );
}

export function ConvertTimeElapsed(diffTime) {
    if (diffTime < 1000)
      {
        return "less than 1 second ago";
      }
      else if(diffTime < 2000)
      {
        return "1 second ago";
      }
      else if(diffTime < 60000)
      {
        const tempTime = Math.floor(diffTime / 1000);
        return tempTime + " seconds ago";
      }
      else if(diffTime < 120000)
      {
        return "1 minute ago";
      }
      else if(diffTime < 3600000)
      {
        const tempTime = Math.floor(diffTime / (1000 * 60));
        return tempTime + " minutes ago";
      }
      else if(diffTime < 7200000)
      {
        return "1 hour ago";
      }
      else if(diffTime < 86400000)
      {
        const tempTime = Math.floor(diffTime / (1000 * 60 * 60));
        return tempTime + " hours ago";
      }
      else if(diffTime < 172800000)
      {
        return "1 day ago";
      }
      else if(diffTime < 2628002880)
      {
        const tempTime = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return tempTime + " days ago";
      }
      else if(diffTime < 5256005760)
      {
        return "1 month ago";
      }
      else if(diffTime < 31536000000)
      {
        const tempTime = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.417));
        return tempTime + " months ago";
      }
      else if(diffTime < 63072000000)
      {
        return "1 year ago";
      }
      else
      {
        const tempTime = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.417 * 12));
        return tempTime + " years ago";
      }
}
