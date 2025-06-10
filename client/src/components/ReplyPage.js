import React, { useState } from 'react';
import {findLinks} from "./PostPage.js";
import axios from 'axios';
export default function ReplyPage({model, pageSwitch, post, comment, updateComments, user}) {
    return (
        <div className="main-page" id="new-comment-page">
            <h1 className="main-page-title" id="new-comment-title">Add a Comment</h1>
            <ReplyForm 
                model={model} 
                pageSwitch={pageSwitch}
                comment={comment}
                post={post} 
                updateComments={updateComments}
                user={user}
            />
        </div>
    );
}

function ReplyForm({model, pageSwitch, comment, post, updateComments, user}) {
    const {commentsData} = model;
    const [commentData, setCommentData] = useState({
        content: '',
    });

    const [errors, setErrors] = useState({});

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
        const newComment = {
            content: commentData.content,
            commentedBy: user.displayName,
        };
        try {
            let addCommentResponse = await axios.post('http://localhost:8000/api/comments', newComment);
            let newReplyData = addCommentResponse.data;
            
            let updatedCommentsData = [...model.commentsData, newReplyData];
            
            let commentID = comment._id;
            let commentUpdateResponse = await axios.post(`http://localhost:8000/api/comments/${commentID}/commentIDs`, {commentID: newReplyData._id});
            updatedCommentsData = updatedCommentsData.map(comm => 
                comm._id === commentID ? commentUpdateResponse.data : comm
            );
            updateComments(updatedCommentsData);
            let postID = post._id;
            pageSwitch({pageName: "post", postID: postID});
        }catch (err) {
            console.error('Error creating new comment: ', err);
            return;
        }
    };

    return (
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
        </form>
    );
}