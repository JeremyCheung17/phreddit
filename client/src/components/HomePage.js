import React from "react";
import PostsDisplay from './Posts';
import {PostCount, groupUserPosts} from './Posts';
import {SortButtons} from './MainPageDisplay';

export default function HomePage({model, posts, pageSwitch, sortClick, user}) {
    //console.log(posts);
    return (
        <div className="main-page" id="home-page">
            <HomeHeader sortClick={sortClick}/>
            <div className="page-divider"></div>
            <PostCount pageName="home" model={model}/>
            <PostsDisplay pageName="home" model={model} posts={posts} pageSwitch={pageSwitch} user={user}/>
        </div>
    );
}

function HomeHeader({sortClick}) {
    return (
        <div className="page-top-header" id="top-part">
            <h1 className="main-page-title" id="home-title">All Posts</h1>
            <SortButtons sortClick={sortClick}/>
        </div>
    );
}




