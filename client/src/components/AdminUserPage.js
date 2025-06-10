import React, { useState, useEffect } from "react";
import axios from 'axios';
import { PostCount } from "./Posts.js";
import PostsDisplay from "./Posts.js";
import { SortButtons, ConvertTimeElapsed, commentList } from './MainPageDisplay.js';
import { findLinks } from "./PostPage.js";

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;

export default function AdminUserPage({ model, pageSwitch, user, updatePosts, updateComments, updateCommunities }) {
    const [activeTab, setActiveTab] = useState("communities");
    const [usersList, setUsersList] = useState([]);
    const [userPosts, setUserPosts] = useState([]);
    const [userCommunities, setUserCommunities] = useState([]);
    const [userComments, setUserComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    
    const { communitiesData, postsData, commentsData, linkflairsData } = model;
    
    useEffect(() => {
        const verifyAdmin = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }
            
            try {
                setIsLoading(true);
                const adminCheck = await axios.get('/api/auth/admin-check');
                //console.log'Admin check successful:', adminCheck.data);
                setIsAdmin(true);
                
                try {
                    const usersResponse = await axios.get('/api/users');
                    //console.log'Users fetched successfully:', usersResponse.data.length);
                    setUsersList(usersResponse.data);
                    setActiveTab("users");
                    setError(null);
                } catch (userErr) {
                    console.error("Error fetching users:", userErr);
                    setError("Failed to load users data: " + (userErr.response?.data?.message || userErr.message));
                }
            } catch (err) {
                console.error("Admin verification failed:", err.response?.data || err.message);
                setIsAdmin(false);
                setError("Admin verification failed: " + (err.response?.data?.message || err.message));
            } finally {
                setIsLoading(false);
            }
        };

        verifyAdmin();
    }, [user]);
    
    useEffect(() => {
        if (user) {
            const filteredPosts = postsData.filter(post => post.postedBy === user.displayName);
            setUserPosts(filteredPosts);
            
            const filteredCommunities = communitiesData.filter(community => 
                community.creator === user.displayName
            );
            setUserCommunities(filteredCommunities);
            
            const filteredComments = commentsData.filter(comment => 
                comment.commentedBy === user.displayName
            );
            setUserComments(filteredComments);
        }
    }, [user, communitiesData, postsData, commentsData]);
    
    if (user && user.userType !== 'admin') {
        return (
            <div className="main-page" id="user-page">
                <h1>Access Denied</h1>
                <p>Only administrators can access this page.</p>
            </div>
        );
    }
    
    // Debug information
    //console.log"User type:", user ? user.userType : "No user");
    //console.log"Session cookie:", document.cookie);
    
    return (
        <div className="main-page" id="user-page">
            <AdminUserHeader 
                user={user} 
                setActiveTab={setActiveTab} 
                activeTab={activeTab} 
                users={usersList}
            />
            <div className="page-divider"></div>
            
            {activeTab === "users" && (
                <UserListing
                    users={usersList}
                    setUsersList={setUsersList}
                    pageSwitch={pageSwitch}
                    isLoading={isLoading}
                    error={error}
                    updatePosts={updatePosts}
                    updateComments={updateComments}
                    updateCommunities={updateCommunities}
                    model={model}
                />
            )}
            
            {activeTab === "communities" && (
                <CommunityListing 
                    communities={userCommunities} 
                    pageSwitch={pageSwitch}
                    user={user}
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
                postsData={postsData}
                pageSwitch={pageSwitch}
                />
            )}
        </div>
    );
}

function AdminUserHeader({ user, setActiveTab, activeTab, users }) {
    const title = user.displayName;
    const email = user.email;
    const date = convertDate(user.createdDate);
    console.log(users.find(u => u._id === user._id))
    //const userX = users.find(u => u._id === user._id);
    let userX = users.find(u => u._id === user._id)
    let rep = userX ? userX.reputation : user.reputation;
    return (
        <div className="page-top-header" id="user-top">
            <div id="user-top-left">
                <h1 className="main-page-title" id="user-title">{title}</h1>
                <div id="user-email">Email Address: {email}</div>
                <div id="user-date">Member since {date}</div>
                <div id="user-rep">{rep} Reputation</div>
            </div>
            <div id="user-top-right">
                <div className="sorting">
                <button 
                        className={`sort-button ${activeTab === "users" ? "active" : ""}`}
                        onClick={() => setActiveTab("users")}
                    >
                        Phreddit Accounts
                    </button>
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

function UserListing({ users, setUsersList, pageSwitch, isLoading, error, updatePosts, updateComments, updateCommunities, model }) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const handleUserClick = (userClicked) => {
        pageSwitch({pageName: "admin-user-view", userClicked: userClicked});
    };

    const handleDelete = async (userToDeleteData) => {
        setUserToDelete(userToDeleteData);
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        setShowDeleteDialog(false);
        await performUserDeletion();
    };

    const handleDeleteCancel = () => {
        setShowDeleteDialog(false);
        setUserToDelete(null);
    };

    const performUserDeletion = async () => {
        try {
            await axios.delete(`/api/users/${userToDelete._id}`);
            
            setUsersList(users.filter(u => u._id !== userToDelete._id));
            
            const userCreatedCommunities = model.communitiesData.filter(comm => 
                comm.creator === userToDelete.displayName
            );
            const communityIdsToRemove = userCreatedCommunities.map(comm => comm._id);
            
            const updatedCommunities = model.communitiesData
                .filter(comm => !communityIdsToRemove.includes(comm._id))
                .map(comm => ({
                    ...comm,
                    members: comm.members.filter(member => member !== userToDelete.displayName)
                }));
            updateCommunities(updatedCommunities);
            
            const postsToRemove = model.postsData.filter(post => {
                if (post.postedBy === userToDelete.displayName) return true;
                
                const postCommunity = model.communitiesData.find(comm => 
                    comm.postIDs.includes(post._id)
                );
                return postCommunity && communityIdsToRemove.includes(postCommunity._id);
            });
            const postIdsToRemove = postsToRemove.map(post => post._id);
            const updatedPosts = model.postsData.filter(post => 
                !postIdsToRemove.includes(post._id)
            );
            updatePosts(updatedPosts);
            
            const commentsToRemove = model.commentsData.filter(comment => {
                if (comment.commentedBy === userToDelete.displayName) return true;
                
                return isCommentOnDeletedPosts(comment, postIdsToRemove, model.commentsData);
            });
            const commentIdsToRemove = commentsToRemove.map(comment => comment._id);
            const updatedComments = model.commentsData.filter(comment => 
                !commentIdsToRemove.includes(comment._id)
            );
            updateComments(updatedComments);
            
            setUserToDelete(null);
        } catch (err) {
            console.error('Error deleting user:', err);
            alert('Error deleting user. Please try again.');
        }
    };
    
    const isCommentOnDeletedPosts = (comment, deletedPostIds, allComments) => {
        const foundInPost = deletedPostIds.some(postId => {
            const post = model.postsData.find(p => p._id === postId);
            return post && post.commentIDs.includes(comment._id);
        });
        
        if (foundInPost) return true;
        
        const parentComment = allComments.find(c => 
            c.commentIDs && c.commentIDs.includes(comment._id)
        );
        
        if (parentComment) {
            return parentComment.commentedBy === userToDelete.displayName ||
                   isCommentOnDeletedPosts(parentComment, deletedPostIds, allComments);
        }
        
        return false;
    };
    
    if (isLoading) {
        return (
            <div className="user-list">
                <h2>List of Phreddit Users: </h2>
                <p>Loading users data...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="user-list">
                <h2>List of Phreddit Users: </h2>
                <p className="error-message">{error}</p>
            </div>
        );
    }
    
    return (
        <>
            <div className="user-list">
                <h2 style={{ fontSize: '25px' }}>List of Phreddit Users:</h2>
                {users && users.length > 0 ? (
                    <div className="users-list">
                        {users.map(user => (
                            <div key={user._id} className="admin-lists-top">
                                <div 
                                    className="user-top-left" 
                                    onClick={() => handleUserClick(user)}
                                >
                                    <h3>{user.displayName}</h3>
                                    <p className="email">Email: {user.email}</p>
                                    <p className="reputation">Reputation: {user.reputation}</p>
                                    <p className="user-type">Type: {user.userType}</p>
                                </div>
                                <div id="user-list-top-right">
                                    <button 
                                        className="sort-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(user);
                                        }}
                                    >
                                        Delete User
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No users found or you don't have permission to view this data.</p>
                )}
            </div>
            {showDeleteDialog && userToDelete && (
                <div className="dialog-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div className="dialog-box" style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '24px',
                        maxWidth: '400px',
                        width: '90%',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Confirm Delete</h3>
                        <p style={{ marginBottom: '24px' }}>
                            Are you sure you want to delete the user "{userToDelete.displayName}"? This action cannot be undone.
                        </p>
                        <div className="dialog-buttons" style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'flex-end'
                        }}>
                            <button 
                                className="cancel-button"
                                onClick={handleDeleteCancel}
                                style={{
                                    padding: '8px 16px',
                                    border: '1px solid #ccc',
                                    backgroundColor: 'white',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                className="confirm-delete-button"
                                onClick={handleDeleteConfirm}
                                style={{
                                    padding: '8px 16px',
                                    border: 'none',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function CommunityListing({ communities, pageSwitch, user }) {
    const handleCommunityClick = (communityId) => {
        pageSwitch({pageName: "edit-community", commID: communityId});
    };
    
    return (
        <div className="user-communities-list">
            <h2 style={{ fontSize: '25px' }}>Your Communities</h2>
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
            <h2 style={{ fontSize: '25px' }}>Your Posts</h2>
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

function CommentListing({ comments, posts, commentsData, pageSwitch, postsData }) {
    const findPostForComment = (commentId) => {
        return posts.find(post => {
            const allPostComments = commentList(post, commentsData);
            return allPostComments.some(comment => comment._id === commentId);
        });
    };
    
    const handleCommentClick = (commentId) => {;
        const post = findPostForComment(commentId);
        if (post) {
            pageSwitch({pageName: "edit-comment", postID: post._id, commentID: commentId});
        }
        else {
            
            const reply = commentsData.find(c => c._id === commentId);
            pageSwitch({pageName: "edit-reply", commentID: commentId, postID: post._id, replyID: reply._id});
        }
    };
    const truncateComment = (Comment) => {
        if (Comment.length <= 20) {
            return Comment;
        }
        return Comment.substring(0, 20) + '...';
    };
    return (
        <div className="user-comments-list">
            <h2 style={{ fontSize: '25px' }}>Your Comments</h2>
            {comments.length === 0 ? (
                <p>You haven't made any comments yet.</p>
            ) : (
                <div className="comments-list">
                    {comments.map(comment => {
                        const post = findPostForComment(comment._id);
                        const truncatedComment = truncateComment(comment.content);
                        return (
                            <div key={comment._id} className="admin-lists-top">
                                <div 
                                    className="user-lists-top-left" 
                                    onClick={() => handleCommentClick(comment._id)}
                                >
                                    <h3>On: {post ? post.title : "Unknown Post"}</h3>
                                    <p className="comment-content">{truncatedComment}</p>
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