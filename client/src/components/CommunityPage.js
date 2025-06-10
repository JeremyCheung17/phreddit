import React from "react";
import {PostCount} from "./Posts.js";
import PostsDisplay from "./Posts.js";
import {SortButtons} from './MainPageDisplay';
import {ConvertTimeElapsed} from "./MainPageDisplay";
import {findLinks} from "./PostPage.js";

export default function CommunityPage({model, pageSwitch, sortClick, comm, posts, user, memberToggle}) {
    return (
        <div className="main-page" id="community-page">
            <CommunityHeader comm={comm} sortClick={sortClick} user={user} memberToggle={memberToggle}/>
            <div className="page-divider"></div>
            <PostCount pageName="community" model={model} comm={comm}/>
            <PostsDisplay 
                pageName="community" 
                posts={posts} 
                model={model} 
                comm={comm} 
                pageSwitch={pageSwitch} 
                isCommunityPage={true}
            />
        </div>
    );
}

function CommunityHeader({comm, sortClick, user, memberToggle}) {
    const title = comm.name;
    const startDate = new Date(comm.startDate);
    const diffTime = ConvertTimeElapsed(Math.abs((new Date())-startDate));
    const date = diffTime;
    const descriptionContent = findLinks(comm.description);
    let joinButton = "";
    if (user) {
        const isMember = comm.members.includes(user.displayName);
        const toggle = isMember ? "Leave" : "Join";

        joinButton = <button 
            className="mp-header-buttons" type="button" 
            onClick={() => memberToggle({comm, user})}
        >{toggle} Community</button> 
    }
    return (
        <div className="page-top-header" id="comm-top">
            <div id="comm-top-left">
                <h1 className="main-page-title" id="comm-title">{title}</h1>
                <div id="comm-desc"dangerouslySetInnerHTML={{ __html: descriptionContent }}></div>
                <div id="comm-date">Created by {comm.creator} • {date}</div>
                <div id="comm-members">{comm.members.length} Members</div>
                {joinButton}
            </div>
            <div id="comm-top-right">
                <SortButtons sortClick={sortClick}/>
            </div>
        </div>
    );
}

