import React from "react";
import { ConvertTimeElapsed } from "./MainPageDisplay";
import {findLinks} from "./PostPage.js";

export default function PostsDisplay({model, posts, pageSwitch, isCommunityPage, user}) {
    const {communitiesData, postsData, commentsData, linkflairsData} = model;

    function MapPosts({posts, pageName, model, pageSwitch}) {
      return (
        posts.map((post, index) => (
          <Post 
              key={post._id}
              index={index} 
              post={post} 
              model={model} 
              pageName={pageName}
              pageSwitch={pageSwitch}
          />
        ))
      );
    }

    let postDisplays = "";
    if (isCommunityPage) {
        postDisplays = <MapPosts posts={posts} pageName="community" model={model} pageSwitch={pageSwitch}/>;
    }
    else if (user) {
        // groups a given arr of posts into user/other, defaults to postData if 'posts' prop is not given
        const {userPosts, otherPosts} = groupUserPosts(
            {user, 
            communities: communitiesData, 
            posts: posts ?? postsData
            }
        );
        let userDisplay = "";
        let otherDisplay = "";
        if (userPosts.length !== 0) {
            userDisplay = (
            <>
                <h4>My Communities</h4>
                <div className="mini-divider"></div>
                <MapPosts posts={userPosts} model={model} pageSwitch={pageSwitch}/>
            </>);
        }
        if(otherPosts.length !== 0) {
            otherDisplay = (
            <>
                <h4>Other Communities</h4>
                <div className="mini-divider"></div>
                <MapPosts posts={otherPosts} model={model} pageSwitch={pageSwitch}/>
            </>);
        }
        postDisplays = (
          <>
            {userDisplay}
            {otherDisplay}
          </>
        );
    } else {
        postDisplays = <MapPosts posts={posts ?? postsData} model={model} pageSwitch={pageSwitch}/>;
    }


    return(
        <div>
            {postDisplays}
        </div>
    );
}

export function Post({model,post,pageSwitch,index,pageName}) {
    const {communitiesData, postsData, commentsData, linkflairsData} = model;
    //console.log(post.linkFlairID);
    //console.log(linkflairsData);
    let linkFlair = linkflairsData.find(l => l._id === post.linkFlairID);
    //console.log("linkFlair: " + linkFlair);
    if(!linkFlair) linkFlair = "";
    let preview = findLinks(post.content);
    let divider = <strong>{"\u00A0\u00A0•\u00A0\u00A0"}</strong>;
    return(
        <div className="post-container" onClick={() => pageSwitch({pageName: "post", postID: post._id})}>
            <PostMetrics
                pageName={pageName}
                model={model} 
                post={post} 
                index={index}
            />
            <h3 className="post-title"> {post.title}</h3>
            <p className="post-flair">{linkFlair.content}</p>
            <p className="post-preview"dangerouslySetInnerHTML={{ __html: preview }}></p>
            <p className="post-metrics">
              Views: {post.views}
              {divider}
              💬 Comments: {postComments(model, post)}
              {divider}
              <span 
              style={
                {
                  color:"rgb(253, 101, 25)",
                  fontSize:"16px",
                }
              }>🡅</span> Votes: {post.votes}
              </p>
            <div className="post-divider"></div>
        </div>
    );
}

export function postComments(model, post)
{
    let commentCount = 0;
    post.commentIDs.forEach(commentID => {
        const count = commentInCommentCounter(model, commentID);
        //console.log("comments: " + count);
        commentCount += count;
    })
    return commentCount;
}

function commentInCommentCounter(model, commentID)
{
  const {commentsData} = model;
  const comment = commentsData.find(c => c._id === commentID);
  if (!comment) 
  {
    return 0; 
  }
  if (comment.commentIDs.length === 0) 
  {
    return 1; 
  }
  let count = 1;
  comment.commentIDs.forEach(replyID => {
    const replyCount = commentInCommentCounter(model, replyID);
    if (typeof replyCount === 'number' && !isNaN(replyCount)) {
      count += replyCount;
    }
  });

  return count;
}
export function PostCount({pageName, model, comm}) {
  const {communitiesData, postsData, commentsData, linkflairsData} = model;
  let numPosts = 0;
  let memberCount = "";
  
    if (pageName == "community") {
        numPosts = comm.postIDs.length;
        memberCount = comm.members.length;
    }
    else {
        postsData.forEach(() => {
            numPosts++;
        });
    }

  return (
      <h2 className="post-count">
        {numPosts} {numPosts===1 ? ' post':'posts'} {memberCount===""? "":"  ·  "+memberCount+" members"}
      </h2>
  );
}

function PostMetrics({model, post, index, pageName}) {
    const {communitiesData} = model;
    let foundComm = "";
    communitiesData.forEach(c => {
      if (c.postIDs.some(id => String(id) === String(post._id))) {
        foundComm = c.name;
      }
    });
    const currTime = new Date();
    const postedDate = new Date(post.postedDate); 
    
    const ago = ConvertTimeElapsed(Math.abs(currTime-postedDate));
    let metrics = "";
    if (pageName==="community") {
      metrics = post.postedBy + " | " + ago;
    }
    else {
      metrics = foundComm + " | " + post.postedBy + " | " + ago;
    }

    return (
        <p className="post-info" id={`post-info-${index}`}>
            {metrics}
        </p>
    );
}

function getPostsByCommunity({comm, posts}){
  return posts.filter(post => comm.postIDs.some(id => id === post._id));
}

export function groupUserPosts({user, communities, posts}) {
  const userPosts = [];
  const otherPosts = [];
  if (!user) return {userPosts,otherPosts};

  const userCommPostIDs = new Set(
    communities.filter(c => c.members.includes(user.displayName)).flatMap(c => c.postIDs)
  );
  for (const post of posts) {
    if (userCommPostIDs.has(post._id)) {
      userPosts.push(post);
    }
    else {
      otherPosts.push(post);
    }
  }

  /*
  console.log("my community posts: ");
  console.log(userPosts);
  console.log("other community posts: ");
  console.log(otherPosts);
  */
  return {userPosts, otherPosts}
}
