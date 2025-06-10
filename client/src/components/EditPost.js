
import React, { useState } from 'react';
import {findLinks} from "./PostPage.js";
import axios from 'axios';

export default function EditPostPage({model, pageSwitch, updatePosts, updateCommunities, updateLinkflairs, user, post, updateComments}) {
    return (
        <div className="main-page" id="new-post-page">
            <h1 className="main-page-title" id="np-header">Edit Your Post</h1>
            <EditPostForm model={model} pageSwitch={pageSwitch} updatePosts={updatePosts} updateCommunities={updateCommunities} updateLinkflairs={updateLinkflairs} user={user} post={post} updateComments={updateComments}/>
        </div>
    ); 
}

function EditPostForm({model, pageSwitch, updatePosts, updateCommunities, updateLinkflairs, user, post, updateComments}) {
    const currComm = model.communitiesData.find(community => 
        community.postIDs.includes(post._id)
    );
    const currFlair = model.linkflairsData.find(flair => flair._id === post.linkFlairID);
    const [postData, setPostData] = useState({
        community: currComm.name,
        title: post.title,
        flair: currFlair ? currFlair.content : '',
        newFlair: '',
        content: post.content,
    });

    const [errors, setErrors] = useState({});
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const getSortedCommunities = () => {
        if (!user) return model.communitiesData;
        
        const joinedCommunities = [];
        const otherCommunities = [];
        
        model.communitiesData.forEach(community => {
            if (community.members.includes(user.displayName)) {
                joinedCommunities.push(community);
            } else {
                otherCommunities.push(community);
            }
        });
        
        return [...joinedCommunities, ...otherCommunities];
    };

    const handleChange = (e) => {
        setPostData({ ...postData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        let valid = true;
        let newErrors = {};

        if (!postData.community.trim()) {
            newErrors.community = "Must Select a Community.*";
            valid = false;
        }

        if (!postData.title.trim()) {
            newErrors.title = "Title cannot be empty.*";
            valid = false;
        } else if (postData.title.length > 100) {
            newErrors.title= "Title must be 100 characters or less.*";
            valid = false;
        }
        else if((postData.flair.trim()) && postData.newFlair.trim()) {
            
          newErrors.flair = "Cannot select and create flair.*";
          newErrors.newFlair = "Cannot select and create flair.*";
          valid = false;
        }
        else if (postData.newFlair.length > 30) {
          newErrors.newFlair = "Flair must be 30 characters or less.*";
          valid = false;
        }
        if (!postData.content.trim()) {
          newErrors.content = "Content cannot be empty.*";
          valid = false;
        }
        else if (findLinks(postData.content.trim()) === "error")
        {
            newErrors.content = "The name of the hyperlink, the text within the [], cannot be empty. The target of the hyperlink, that is, the text within () cannot be empty and must begin with 'https://' or 'http://'.";
            valid = false;
        }
        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        let x = null;
        if(postData.newFlair)
        {
          const newFlair = {
            content: postData.newFlair,
          };
          try {
            let addFlair = await axios.post('http://localhost:8000/api/linkflairs', newFlair);
            let flairData = addFlair.data;
            x = flairData._id;
            updateLinkflairs([...model.linkflairsData, flairData]);
            }catch (err) {
            console.error('Error creating new flair: ', err);
            return;
        }
        }
        else
        {
          for(let i = 0; i < model.linkflairsData.length; i++)
          {
            if(model.linkflairsData[i].content === postData.flair)
            {
              x = model.linkflairsData[i]._id;
              break;
            }
          }
        }
        const editedPost = {
            title: postData.title,
            content: postData.content,
        };
    
        if (x) {
            editedPost.linkFlairID = x;
        }
        try {
            let response = await axios.patch(`http://localhost:8000/api/posts/${post._id}`, editedPost);
            let updatedPost= response.data;
            if (!updatedPost._id) {
                updatedPost._id = post._id;
            }
            const updatedPosts = model.postsData.map(p => {
                if (p._id === post._id) {
                    return updatedPost;
                }
                return p;
            });
            updatePosts(updatedPosts);
            if(currComm.name !== postData.community)
            {
                var communityID = "";
                for(let j = 0; j < model.communitiesData.length; j++)
                {
                    if(model.communitiesData[j].name === postData.community)
                    {
                        communityID = model.communitiesData[j]._id;
                        break;
                    }
                }
                let commUpdate = await axios.post(`http://localhost:8000/api/communities/${communityID}/postIDs`, {postID: post._id});
                
                let commUpdate2 = await axios.delete(`http://localhost:8000/api/communities/${currComm._id}/postIDs/${post._id}`);
                
                const updatedCommunities = model.communitiesData.map(comm => {
                    if (comm._id === communityID) {
                        return commUpdate.data;
                    } else if (comm._id === currComm._id) {
                        return commUpdate2.data;
                    }
                    return comm; 
                });
                updateCommunities(updatedCommunities);
            }
            pageSwitch({pageName: "post", postID: post._id});
        }catch (err) {
            console.error('Error creating new post: ', err);
            return;
        }
    };

    const handleDelete = async () => {
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        setShowDeleteDialog(false);
        await performPostDeletion();
    };

    const handleDeleteCancel = () => {
        setShowDeleteDialog(false);
    };

    const performPostDeletion = async () => {
        try {
            await axios.delete(`http://localhost:8000/api/posts/${post._id}`);
            
            const updatedPosts = model.postsData.filter(p => p._id !== post._id);
            updatePosts(updatedPosts);
            const updatedComments = model.commentsData.filter(comment => 
                !isCommentAssociatedWithPost(comment._id, post, model.commentsData)
            );
            updateComments(updatedComments);
            
            const updatedCommunities = model.communitiesData.map(comm => {
                if (comm.postIDs.includes(post._id)) {
                    return {
                        ...comm,
                        postIDs: comm.postIDs.filter(id => id !== post._id)
                    };
                }
                return comm;
            });
            updateCommunities(updatedCommunities);
            
            // Navigate back to home page
            pageSwitch({pageName: "home"});
        } catch (err) {
            console.error('Error deleting post:', err);
            alert('Error deleting post. Please try again.');
        }
    };
    
    const isCommentAssociatedWithPost = (commentId, post, allComments) => {
        if (post.commentIDs.includes(commentId)) return true;
        
        for (const directCommentId of post.commentIDs) {
            if (isReplyOf(commentId, directCommentId, allComments)) return true;
        }
        
        return false;
    };
    

    const isReplyOf = (commentId, parentId, allComments) => {
        const parentComment = allComments.find(c => c._id === parentId);
        if (!parentComment) return false;
        
        if (parentComment.commentIDs.includes(commentId)) return true;
        for (const replyId of parentComment.commentIDs) {
            if (isReplyOf(commentId, replyId, allComments)) return true;
        }
        
        return false;
    };
    
    return (
        <>
            <form id="new-post" autoComplete='off'>
                <label htmlFor="np-community">Select community (required)</label>
                <select
                    className="select-input"
                    id="np-community"
                    type="text"
                    name="community"
                    value={postData.community}
                    onChange={handleChange}
                    required
                >
                    <option value="" disabled>
                    Select community (required)
                    </option>
                    {getSortedCommunities().map((community, index) => {
                        const isJoined = user && community.members.includes(user.displayName);
                        return (
                            <option key={index} value={community.name}>
                                {isJoined ? '★ ' : ''}{community.name}
                            </option>
                        );
                    })}
                </select>
                <div className="form-error">{errors.community}</div>

                <label htmlFor="np-title">Post Title: </label>
                <textarea
                    className="text-input"
                    id="np-title"
                    name="title"
                    placeholder="Max 100 characters"
                    value={postData.title}
                    onChange={handleChange}
                    required
                ></textarea>
                <div className="form-error">{errors.title}</div>

                <label htmlFor="np-flair">Select existing flair or none</label>
                <select
                    className="select-input"
                    id="np-flair"
                    type="text"
                    name="flair"
                    value={postData.flair}
                    onChange={handleChange}
                    required
                >
                    <option value="">
                    Select existing flair or none
                    </option>
                    {model.linkflairsData.map((flair, index) => (
                      <option key={index} value={flair.content}>
                          {flair.content}
                      </option>
                    ))}
                </select>
                <div className="form-error">{errors.flair}</div>

                <label htmlFor="np-new-flair">Or Create a New Flair (optional): </label>
                <textarea
                    className="text-input"
                    id="np-new-flair"
                    name="newFlair"
                    placeholder="Max 30 characters"
                    value={postData.newFlair}
                    onChange={handleChange}
                    required
                ></textarea>
                <div className="form-error">{errors.newFlair}</div>
                
                <label htmlFor="np-content">Content (required): </label>
                <input
                    className="text-input"
                    id="np-content"
                    name="content"
                    value={postData.content}
                    onChange={handleChange}
                    required
                ></input>
                <div className="form-error">{errors.content}</div>
                
                <button className="submit-button" id="np-submit" type="button" onClick={handleSubmit}>
                Submit Post
                </button>
                <button className="submit-button" id="np-submit" type="button" onClick={handleDelete}>
                Delete Post
                </button>
            </form>

            {showDeleteDialog && (
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
                            Are you sure you want to delete this post? This action cannot be undone.
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