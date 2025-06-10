import React, { useState } from 'react';
import {findLinks} from "./PostPage.js";
import axios from 'axios';

export default function NewCommunityPage({model, pageSwitch, updateCommunities, user}) {
    return (
        <div className="main-page" id="new-community-page">
            <h1 className="main-page-title" id="nc-title">Create a New Community</h1>
            <NewCommunityForm model={model} pageSwitch={pageSwitch} updateCommunities={updateCommunities} user={user}/>
        </div>
    );
}

function NewCommunityForm({model, pageSwitch, updateCommunities, user}) {
    const [communityData, setCommunityData] = useState({
        name: '',
        description: '',
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setCommunityData({ ...communityData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        let valid = true;
        let newErrors = {};
        let test = findLinks(communityData.description.trim());
        console.log("findLinks: " + test);

        if (!communityData.name.trim()) {
            newErrors.name = "Community name cannot be empty.*";
            valid = false;
        } else if (communityData.name.length > 100) {
            newErrors.name = "Community name must be 100 characters or less.*";
            valid = false;
        } else if (model.communitiesData.some(comm => comm.name.toLowerCase() === communityData.name.toLowerCase().trim())) {
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

        const newCommunity = {
            name: communityData.name.trim(),
            description: communityData.description.trim(),
            creator: user.displayName
        };
        try {
            let addCommunity = await axios.post('http://localhost:8000/api/communities', newCommunity);
            let newCommunityData = addCommunity.data;
            updateCommunities([...model.communitiesData, newCommunityData]);
            pageSwitch({pageName: "community", commID: newCommunityData._id});
        }catch (err) {
            console.error('Error creating new community: ', err);
            return;
        }
    };
    return (
        <form id="new-comm" autoComplete='off'>
            <label htmlFor="nc-name">Community Name (required):</label>
            <input
                className="text-input"
                id="nc-name"
                type="text"
                name="name"
                placeholder="Max 100 characters"
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
                placeholder="Max 500 characters"
                value={communityData.description}
                onChange={handleChange}
                required
            ></textarea>
            <div className="form-error">{errors.description}</div>

            <button className="submit-button" id="nc-submit" type="button" onClick={handleSubmit}>
            Engender Community
            </button>
        </form>
    );
}