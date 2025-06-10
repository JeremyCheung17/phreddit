import React, { useState } from 'react';
import {findLinks} from "./PostPage.js";
import axios from 'axios';
export default function EditReplyPage({model, pageSwitch, post, comment, updateComments, user, reply}) {
    return (
        <div className="main-page" id="new-comment-page">
            <h1 className="main-page-title" id="new-comment-title">Edit Your Reply</h1>
            <EditReplyForm 
                model={model} 
                pageSwitch={pageSwitch}
                comment={comment}
                post={post} 
                updateComments={updateComments}
                user={user}
                reply={reply}
            />
        </div>
    );
}

function EditReplyForm({model, pageSwitch, comment, post, updateComments, user, reply}) {
    const {commentsData} = model;
    const [commentData, setCommentData] = useState({
        content: reply.content,
    });

    const [errors, setErrors] = useState({});
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleChange = (e) => {
        setCommentData({ ...commentData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        let valid = true;
        let newErrors = {};

        if (!commentData.content.trim()) {
            newErrors.content = "Content cannot be empty.*";
            valid = false;
        } else if (commentData.content.length > 500) {
            newErrors.name = "Content must be 500 characters or less.*";
            valid = false;
        }
        else if (findLinks(commentData.content.trim()) === "error")
        {
            newErrors.content = "The name of the hyperlink, the text within the [], cannot be empty. The target of the hyperlink, that is, the text within () cannot be empty and must begin with 'https://' or 'http://'.";
            valid = false;
        }
        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        const editedComment = {
            content: commentData.content,
        };
        try {
            let response = await axios.patch(`http://localhost:8000/api/comments/${comment._id}`, editedComment);
            
            let updatedComment = response.data;
            
            if (!updatedComment._id) {
                updatedComment._id = comment._id;
            }
            
            const updatedComments = model.commentsData.map(c => {
                if (c._id === comment._id) {
                    console.log('Found matching comment, updating...');
                    return updatedComment;
                }
                return c;
            });
            updateComments(updatedComments);
            let postID = post._id;
            pageSwitch({pageName: "post", postID: postID});
        } catch (err) {
            console.error('Error editing reply: ', err);
            return;
        }
    };
    const handleDelete = async () => {
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        setShowDeleteDialog(false);
        await performReplyDeletion();
    };

    const handleDeleteCancel = () => {
        setShowDeleteDialog(false);
    };

    const performReplyDeletion = async () => {
        console.log("Performing Reply deletion...");
    };
    
    return (
        <>
            <form id="new-comment" autoComplete='off'>
                <label htmlFor="ncomment-content">Comment (required): </label>
                <textarea
                    className="text-input"
                    id="ncomment-content"
                    name="content"
                    placeholder="Max 500 characters"
                    value={commentData.content}
                    onChange={handleChange}
                    required
                ></textarea>
                <div className="form-error">{errors.content}</div>

                <button className="submit-button" id="ncomment-submit" type="button" onClick={handleSubmit}>
                Submit Comment
                </button>
                <button className="submit-button" id="nc-submit" type="button" onClick={handleDelete}>
                Delete Comment
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
                            Are you sure you want to delete this reply? This action cannot be undone.
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