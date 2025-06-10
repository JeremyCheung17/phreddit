import React, { useState } from 'react';
import {findLinks} from "./PostPage.js";
import axios from 'axios';

export default function NewPostPage({model, pageSwitch, updatePosts, updateCommunities, updateLinkflairs, user}) {
    return (
        <div className="main-page" id="new-post-page">
            <h1 className="main-page-title" id="np-header">Create a New Post</h1>
            <NewPostForm model={model} pageSwitch={pageSwitch} updatePosts={updatePosts} updateCommunities={updateCommunities} updateLinkflairs={updateLinkflairs} user={user}/>
        </div>
    ); 
}

function NewPostForm({model, pageSwitch, updatePosts, updateCommunities, updateLinkflairs, user}) {
    const [postData, setPostData] = useState({
        community: '',
        title: '',
        flair: '',
        newFlair: '',
        content: '',
    });

    const [errors, setErrors] = useState({});
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
        let newPost = {
            title: postData.title,
            content: postData.content,
            postedBy: user.displayName,
        };
    
        if (x) {
            newPost.linkFlairID = x;
        }
        try {
            let addPost = await axios.post('http://localhost:8000/api/posts', newPost);
            let newPostData = addPost.data;
            updatePosts([...model.postsData, newPostData]);
            var communityID = "";
            for(let j = 0; j < model.communitiesData.length; j++)
            {
                if(model.communitiesData[j].name === postData.community)
                {
                    communityID = model.communitiesData[j]._id;
                    break;
                }
            }
            let commUpdate = await axios.post(`http://localhost:8000/api/communities/${communityID}/postIDs`, {postID: newPostData._id});
            const updatedCommunities = model.communitiesData.map(comm => 
                comm._id === communityID ? commUpdate.data : comm
            );
            updateCommunities(updatedCommunities);
            pageSwitch({ pageName: "home" });
        }catch (err) {
            console.error('Error creating new post: ', err);
            return;
        }
    };

    return (
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
        </form>
    );
}