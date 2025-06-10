import React, { useState, useEffect } from "react";
import { PostCount } from "./Posts.js";
import PostsDisplay from "./Posts.js";
import { SortButtons, ConvertTimeElapsed, commentList } from './MainPageDisplay.js';
import { findLinks } from "./PostPage.js";
import axios from 'axios';

export default function AdminViewUserPage({ model, pageSwitch, user, userClicked }) {
    const [activeTab, setActiveTab] = useState("posts");
    const [userPosts, setUserPosts] = useState([]);
    const [userCommunities, setUserCommunities] = useState([]);
    const [userComments, setUserComments] = useState([]);
    
    // Extract data from the model
    const { communitiesData, postsData, commentsData, linkflairsData } = model;
    
    useEffect(() => {
        if (userClicked) {
            // Filter data based on the current userClicked
            const filteredPosts = postsData.filter(post => post.postedBy === userClicked.displayName);
            setUserPosts(filteredPosts);
            
            const filteredCommunities = communitiesData.filter(community => 
                community.creator === userClicked.displayName
            );
            setUserCommunities(filteredCommunities);
            
            const filteredComments = commentsData.filter(comment => 
                comment.commentedBy === userClicked.displayName
            );
            setUserComments(filteredComments);
        }
    }, [userClicked, communitiesData, postsData, commentsData]);
    
    return (
        <div className="main-page" id="user-page">
            <AdminViewUserHeader user={user} setActiveTab={setActiveTab} activeTab={activeTab} userClicked={userClicked} pageSwitch={pageSwitch}/>
            <div className="page-divider"></div>
            
            {activeTab === "communities" && (
                <CommunityListing 
                    communities={userCommunities} 
                    pageSwitch={pageSwitch}
                    userClicked={userClicked}
                />
            )}
            
            {activeTab === "posts" && (
                <PostListing 
                    posts={userPosts} 
                    pageSwitch={pageSwitch}
                />
            )}
            
            {activeTab === "comments" && (
                <CommentListing 
                    comments={userComments} 
                    posts={postsData}
                    commentsData={commentsData}
                    pageSwitch={pageSwitch}
                />
            )}
        </div>
    );
}

async function fetchUserData(userId) {
    const response = await axios.get(`/api/users/${userId}`);
    return response.data;
}

function AdminViewUserHeader({ user, setActiveTab, activeTab, userClicked, pageSwitch }) {
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const title = userClicked.displayName;
    const email = userClicked.email;
    const date = convertDate(userClicked.createdDate);
    
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const userX = await fetchUserData(userClicked._id);
                setUserData(userX);
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        if (userClicked._id) {
            fetchData();
        }
    }, [userClicked._id]);
    
    const rep = userData ? userData.reputation : userClicked.reputation;
    
    return (
        <div className="page-top-header" id="user-top">
            <div id="user-top-left">
                <button className={"back-button"} onClick={() => pageSwitch({pageName: "admin-user"})}>← Return To Profile</button>
                <h1 className="main-page-title" id="user-title">{title}</h1>
                <div id="user-email">Email Address: {email}</div>
                <div id="user-date">Member since {date}</div>
                <div id="user-rep">
                    {isLoading ? 'Loading...' : rep} Reputation
                </div>
            </div>
            <div id="user-top-right">
                <div className="sorting">
                    <button 
                        className={`sort-button ${activeTab === "communities" ? "active" : ""}`}
                        onClick={() => setActiveTab("communities")}
                    >
                        Communities
                    </button>
                    <button 
                        className={`sort-button ${activeTab === "posts" ? "active" : ""}`}
                        onClick={() => setActiveTab("posts")}
                    >
                        Posts
                    </button>
                    <button 
                        className={`sort-button ${activeTab === "comments" ? "active" : ""}`}
                        onClick={() => setActiveTab("comments")}
                    >
                        Comments
                    </button>
                </div>
            </div>
        </div>
    );
}

function CommunityListing({ communities, pageSwitch, userClicked }) {
    const handleCommunityClick = (communityId) => {
        pageSwitch({pageName: "edit-community", commID: communityId});
    };
    
    return (
        <div className="user-communities-list">
            <h2>Communities Created</h2>
            {communities.length === 0 ? (
                <p>You haven't created any communities yet.</p>
            ) : (
                <div className="communities-list">
                    {communities.map(community => (
                        <div key={community._id} className="admin-lists-top">
                            <div 
                                className="user-lists-top-left" 
                                onClick={() => handleCommunityClick(community._id)}
                            >
                                <h3>{community.name}</h3>
                                <p className="description">{community.description}</p>
                                <div className="community-details">
                                    <span>Members: {community.members.length} </span>
                                    <span>Created: {convertDate(community.startDate)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function PostListing({ posts, pageSwitch }) {
    const handlePostClick = (postId) => {
        pageSwitch({pageName: "edit-post", postID: postId});
    };
    
    return (
        <div className="user-posts-list">
            <h2>Posts Created</h2>
            {posts.length === 0 ? (
                <p>You haven't created any posts yet.</p>
            ) : (
                <div className="posts-list">
                    {posts.map(post => (
                        <div key={post._id} className="admin-lists-top">
                            <div 
                                className="user-lists-top-left" 
                                onClick={() => handlePostClick(post._id)}
                            >
                                <h3>{post.title}</h3>
                                <div className="post-details">
                                    <span>Posted: {convertDate(post.postedDate)} </span>
                                    <span>Views: {post.views} </span>
                                    <span>Votes: {post.votes} </span>
                                    <span>Comments: {post.commentIDs.length}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function CommentListing({ comments, posts, commentsData, pageSwitch }) {
    const findPostForComment = (commentId) => {
        return posts.find(post => {
            const allPostComments = commentList(post, commentsData);
            return allPostComments.some(comment => comment._id === commentId);
        });
    };
    
    const handleCommentClick = (commentId) => {
        const post = findPostForComment(commentId);
        if (post) {
            pageSwitch({pageName: "edit-comment", postID: post._id, commentID: commentId});
        }
        else {
            
            const reply = commentsData.find(c => c._id === commentId);
            pageSwitch({pageName: "edit-reply", commentID: commentId, postID: post._id, replyID: reply._id});
        }
    };
    
    return (
        <div className="user-comments-list">
            <h2>Comments</h2>
            {comments.length === 0 ? (
                <p>You haven't made any comments yet.</p>
            ) : (
                <div className="comments-list">
                    {comments.map(comment => {
                        const post = findPostForComment(comment._id);
                        return (
                            <div key={comment._id} className="admin-lists-top">
                                <div 
                                    className="user-lists-top-left" 
                                    onClick={() => handleCommentClick(comment._id)}
                                >
                                    <h3>On: {post ? post.title : "Unknown Post"}</h3>
                                    <p className="comment-content">{comment.content}</p>
                                    <div className="comment-details">
                                        <span>Posted: {convertDate(comment.commentedDate)} </span>
                                        <span>Votes: {comment.votes}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function convertDate(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const month = months[dateObj.getMonth()];
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();

    return `${month} ${day}, ${year}`;
}