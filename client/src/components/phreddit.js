import {useState, useEffect} from 'react';
import axios from 'axios';
import React from 'react';
import Banner from './Banner.js';
import NavBar from './NavBar.js';
import MainPageDisplay from './MainPageDisplay.js';

async function incrementViews(post) {
  try {
    await axios.post(`http://localhost:8000/api/posts/${post._id}/views`, post._id);
  } catch (err) {
    console.error('Error incrementing views:', err);
  }
}
export default function Phreddit({model, updateHooks}) {
    const {communitiesData, postsData, commentsData, linkflairsData, usersData} = model;
    const [currPage, setCurrPage] = useState("welcome");
    const [currComm, setCurrComm] = useState("");
    const [currPost, setCurrPost] = useState("");
    const [currComment, setCurrComment] = useState("");
    const [currQuery, setCurrQuery] = useState("");
    const [lastViewedPost, setLastViewedPost] = useState(null);
    const [user, setUser] = useState(null);
    const [postSortMethod, setPostSort] = useState("newest");
    const [currUser, setCurrUser] = useState("");
    const [currReply, setCurrReply] = useState("");
    const [currUserClicked, setCurrUserClicked] = useState("");

    //console.log(postsData);
    const handlePageSwitch = ({pageName,commID,postID,commentID,query,userID,replyID, userClicked}) => {
        console.log("page switch called: " + pageName + " " + commID + " " + postID + " " + commentID + " " + query + " " + userID + " " + replyID + " " + userClicked);
        let newCommID = commID ?? "";
        let newCommentID = commentID ?? "";
        let newQuery = query ?? "";
        let newPostID = postID ?? "";
        let newUserID = userID ?? "";
        let newReplyID = replyID ?? "";
        let newUserClicked = userClicked ?? "";
        if (postID) {
            const comm = communitiesData.find(c => c.postIDs.includes(postID));
            if (comm) newCommID = comm._id;
        }
        if (!pageName || pageName === "home") {
            setCurrPage("home");
            setPostSort("newest");
            setCurrComm("");
            setCurrPost("");
        } else {
            setCurrPage(pageName);
            setPostSort("newest");
            setCurrComm(newCommID);
            setCurrPost(newPostID);
            setCurrComment(newCommentID);
            setCurrQuery(newQuery);
            setCurrUser(newUserID);
            setCurrReply(newReplyID);
            setCurrUserClicked(newUserClicked);
        }
    };

    const handleLogout = async () => {
      try {
        await axios.post('api/auth/logout');
        setCurrPage("welcome");
      } catch (err) {
        console.log("logout fail");
        alert("Failed to log out.");
      }
    }

    const toggleCommunityMember = async ({comm, user}) => {
      try {
        if (!user) {
          alert("Error joining community: not logged in");
          setCurrPage("welcome");
          return;
        }

        const isMember = comm.members.includes(user.displayName);
        const toggle = isMember ? "leave" : "join"; 
        const res = await axios.post(`/api/communities/${comm._id}/${toggle}`,
          {displayName: user.displayName}
        );

        const updated = res.data;
        updateHooks.updateCommunities(
          prevState => prevState.map(comm => comm._id === updated._id ? updated : comm)
        );
      } catch(err) {
        alert("Error joining community: " + err.message);
        setCurrPage("welcome");
      }
    }
    
    const updatePostVotes = async ({user, post, voteType}) => {
      if (!["upvote","downvote"].includes(voteType)) return;
      try {
        const res = await axios.post(`http://localhost:8000/api/posts/${post._id}/votes`, {vote: voteType, userId: user._id});
        const updated = res.data;
        updateHooks.updatePosts(
          prevState => prevState.map(post => post._id === updated._id ? updated : post)
        );
      } catch (err) {
        console.error('Error updating post votes:', err);
      }
    }

    const updateCommentVotes = async ({user, comment, voteType}) => {
      if (!["upvote","downvote"].includes(voteType)) return;
      try {
        const res = await axios.post(`http://localhost:8000/api/comments/${comment._id}/votes`, {vote: voteType, userId: user._id});
        const updated = res.data;
        updateHooks.updateComments(
          prevState => prevState.map(comment => comment._id === updated._id ? updated : comment)
        );
      } catch (err) {
        console.error('Error updating post votes:', err);
      }
    }

    const pageName = currPage;
    const commID = currComm;
    const postID = currPost;
    const commentID = currComment;
    const query = currQuery;
    const replyID = currReply;
    let community, post, comment, reply, userClicked;
    const pageFlags = {
      isHome: pageName === "home", 
      isNewPost: pageName === 'new-post', 
      isNewCommunity: pageName === 'new-community',
      isComm: pageName === "community",
      hideNavBar: pageName === "welcome" || pageName === "register" || pageName === "login"
    }
    
    useEffect(() => {
      const sessionCheck = async () => {
        try {
          const userData = await axios.get('http://localhost:8000/api/auth/me');
          setUser(userData.data);
        } catch (err) {
          setUser(null);
          //setCurrPage('welcome');
        }
      };
      sessionCheck();

      if (pageName === "post" && postID) {
        const currentPost = postsData.find(p => p._id === postID);
        if (currentPost) {

          if (lastViewedPost !== postID) {
            const updatedPosts = postsData.map(p => 
              p._id === postID ? {...p, views: p.views + 1} : p
            );
            const {updatePosts} = updateHooks;
            updatePosts(updatedPosts);
            incrementViews(currentPost);
            setLastViewedPost(postID);
          }
        }
      } else if (pageName !== "post") {
        setLastViewedPost(null);
      }

      
      if (['welcome','register','login'].includes(currPage)) {
        document.body.classList.add("noscroll");
      }
      else {
        document.body.classList.remove("noscroll");
      }
      
    }, [postID, pageName, postsData, communitiesData, commentsData, linkflairsData, lastViewedPost, updateHooks]);
    
    switch (pageName) {
      case "community":
        community = communitiesData.find(c => c._id === commID);
        break;
      case "edit-community":
        community = communitiesData.find(c => c._id === commID);
        break;
      case "post":
        //post = postsData.find(p => p._id === postID);
        community = communitiesData.find(c => c._id === commID);
        // View incrementing moved to useEffect above
        break;
      case "edit-post":
        post = postsData.find(p => p._id === postID);
        break;
      case "edit-comment":
        post = postsData.find(p => p._id === postID);
        comment = commentsData.find(c => c._id === commentID);
      case "new-comment":
        post = postsData.find(p => p._id === postID);
        comment = commentsData.find(c => c._id === commentID);
        break;
      case "edit-reply":
        post = postsData.find(p => p._id === postID);
        comment = commentsData.find(c => c._id === commentID);
        reply = commentsData.find(c => c._id === replyID);
        break;
      case "admin-user-view":
        userClicked = currUserClicked
      case "reply":
        post = postsData.find(p => p._id === postID);
        comment = commentsData.find(c => c._id === commentID);
        break;
      default:
        break;
    }

    const comm = community;
    const postContexts={comment,comm,post: postsData.find(p => p._id === postID),reply, userClicked};
    return (
      <>
        {!pageFlags.hideNavBar && (
          <>
            <Banner 
              pageSwitch={handlePageSwitch} 
              isPost={pageFlags.isNewPost} 
              user={user}
              handleLogout={handleLogout}
            />
            <NavBar 
              communitiesData={communitiesData} 
              pageSwitch={handlePageSwitch} 
              {...pageFlags} 
              commID={commID}
              user={user}
            />
          </>
        )}
        <MainPageDisplay 
            model={model}
            pageSwitch={handlePageSwitch}
            pageName={pageName}
            
            postContexts={postContexts}
            query={query}
            updateHooks={updateHooks}
            user={user}
            memberToggle={toggleCommunityMember}
            sortingHooks={{postSortMethod, setPostSort}}
            updateVotes={updatePostVotes}
            updateCommentVotes={updateCommentVotes}
        />
      </>
    );
}