import React, { useState } from 'react';
import {findLinks} from "./PostPage.js";
import axios from 'axios';

export default function EditCommunityPage({model, pageSwitch, updateCommunities, user, comm, updatePosts, updateComments}) {
    return (
        <div className="main-page" id="new-community-page">
            <h1 className="main-page-title" id="nc-title">Edit Your Community</h1>
            <EditCommunityForm model={model} pageSwitch={pageSwitch} updateCommunities={updateCommunities} user={user} comm={comm} updatePosts={updatePosts} updateComments={updateComments}/>
        </div>
    );
}

function EditCommunityForm({model, pageSwitch, updateCommunities, user, comm, updatePosts, updateComments}) {
    const [communityData, setCommunityData] = useState({
        name: comm.name,
        description: comm.description,
    });

    const [errors, setErrors] = useState({});
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleChange = (e) => {
        setCommunityData({ ...communityData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        let valid = true;
        let newErrors = {};
        let test = findLinks(communityData.description.trim());
        //console.log("findLinks: " + test);

        if (!communityData.name.trim()) {
            newErrors.name = "Community name cannot be empty.*";
            valid = false;
        } else if (communityData.name.length > 100) {
            newErrors.name = "Community name must be 100 characters or less.*";
            valid = false;
        } else if (model.communitiesData.some(comm => comm.name.toLowerCase() === communityData.name.toLowerCase().trim()) && comm.name.toLowerCase() !== communityData.name.toLowerCase().trim()) {
            newErrors.name = "A community with this name already exists.*";
            valid = false;
        }

        if (!communityData.description.trim()) {
            newErrors.description = "Description cannot be empty.*";
            valid = false;
        } else if (communityData.description.length > 500) {
            newErrors.description = "Description must be 500 characters or less.*";
            valid = false;
        }
        else if (findLinks(communityData.description.trim()) === "error")
        {
            newErrors.description = "The name of the hyperlink, the text within the [], cannot be empty. The target of the hyperlink, that is, the text within () cannot be empty and must begin with 'https://' or 'http://'.";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const editedCommunity = {
            name: communityData.name.trim(),
            description: communityData.description.trim(),
        };
        try {
            let response = await axios.patch(`http://localhost:8000/api/communities/${comm._id}`, editedCommunity);
            let updatedCommunity= response.data;
            if (!updatedCommunity._id) {
                updatedCommunity._id = comm._id;
            }
            const updatedCommunities = model.communitiesData.map(c => {
                if (c._id === comm._id) {
                    return updatedCommunity;
                }
                return c;
            });
            updateCommunities(updatedCommunities);
            pageSwitch({pageName: "community", commID: comm._id});
        }catch (err) {
            console.error('Error creating new community: ', err);
            return;
        }
    };

    const handleDelete = async () => {
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        setShowDeleteDialog(false);
        await performCommunityDeletion();
    };

    const handleDeleteCancel = () => {
        setShowDeleteDialog(false);
    };

    const performCommunityDeletion = async () => {
        try {

            await axios.delete(`http://localhost:8000/api/communities/${comm._id}`);
            
            const updatedCommunities = model.communitiesData.filter(c => c._id !== comm._id);
            updateCommunities(updatedCommunities);
            
            const updatedPosts = model.postsData.filter(post => 
                !comm.postIDs.includes(post._id)
            );
            updatePosts(updatedPosts);
            
            const commentsToKeep = model.commentsData.filter(comment => {
                return !isCommentAssociatedWithCommunity(comment._id, comm, model);
            });
            updateComments(commentsToKeep);
            
            pageSwitch({pageName: "home"});
        } catch (err) {
            console.error('Error deleting community:', err);
            alert('Error deleting community. Please try again.');
        }
    }
     const isCommentAssociatedWithCommunity = (commentId, community, model) => {
        const communityPosts = model.postsData.filter(post => 
            community.postIDs.includes(post._id)
        );

        for (const post of communityPosts) {
            if (isCommentAssociatedWithPost(commentId, post, model.commentsData)) {
                return true;
            }
        }
        
        return false;
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
            <form id="new-comm" autoComplete='off'>
                <label htmlFor="nc-name">Community Name (required):</label>
                <input
                    className="text-input"
                    id="nc-name"
                    type="text"
                    name="name"
                    value={communityData.name}
                    onChange={handleChange}
                    required
                />
                <div className="form-error">{errors.name}</div>

                <label htmlFor="nc-desc">Community Description (required):</label>
                <textarea
                    className="text-input"
                    id="nc-desc"
                    name="description"
                    value={communityData.description}
                    onChange={handleChange}
                    required
                ></textarea>
                <div className="form-error">{errors.description}</div>

                <button className="submit-button" id="nc-submit" type="button" onClick={handleSubmit}>
                Update Community
                </button>
                <button className="submit-button" id="nc-submit" type="button" onClick={handleDelete}>
                Delete Community
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
                            Are you sure you want to delete this community? This action cannot be undone.
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