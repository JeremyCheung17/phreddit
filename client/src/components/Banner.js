import React, { useRef } from 'react';


export default function Banner({pageSwitch, isPost, user, handleLogout}) {
    let logout = <LogoutButton user={user} handleLogout={handleLogout}/>;
    if (!user) logout = "";
    return (
        <div className="main-banner">
            <Logo pageSwitch={pageSwitch} user={user}/>
            <SearchBar pageSwitch={pageSwitch}/>
            <div id="banner-right">
                <PostButton pageSwitch={pageSwitch} isPost={isPost} user={user}/>
                <UserProfileButton pageSwitch={pageSwitch} user={user}/>
                {logout}
            </div>
        </div>
    );
}

function Logo({pageSwitch, user}) {
    let logoHTML;
    if (!user) {
        logoHTML = (
        <div id="logo-name" onClick={() => pageSwitch({pageName: "welcome"})}>
            <p className="banner-name" id="site-name">phreddit</p>
        </div>);
    }
    else {
        logoHTML = (
            <div id="logo-name" onClick={() => pageSwitch({pageName: "home"})}>
                <p className="banner-name" id="site-name">phreddit</p>
            </div>);
    }
    return (
        <div id="banner-left">
            {logoHTML}
        </div>
    );
}

function SearchBar({pageSwitch}) {
    const inputRef = useRef();
    const handleKeyPress = (event) => {
        const query = inputRef.current.value;
        if (event.key === 'Enter' && query.trim() !== "") {
            pageSwitch({pageName: "search", query: query});
        }
    };
   
    return (
        <div id='banner-middle'>
            <input id="searchbar" type="text" placeholder="Search Phreddit..." ref={inputRef} onKeyPress={handleKeyPress}/>
        </div>
    );
}

function PostButton({pageSwitch, isPost, user}) {
    if (!user) {
        return <button 
        className="banner-button" 
        id="post-button" type="button" 
        style={
            {
                backgroundColor:'rgba(0,0,0,0.3)',
                color:'rgba(0,0,0,0.5)',
                cursor: 'auto'
            }
        }
        >Create Post</button>
    } else if (isPost) {
        return <button 
        className="banner-button" 
        id="post-button" 
        type="button" onClick={() => pageSwitch({pageName: "new-post"})} 
        style={{backgroundColor:'rgb(253, 101, 25)'}}
        >Create Post</button>
    }
    return <button className="banner-button" id="post-button" type="button" onClick={() => pageSwitch({pageName: "new-post"})}>Create Post</button>
}

function UserProfileButton({pageSwitch, user}) {
    if (!user) {
        return <button 
        className="banner-button" 
        type="button" 
        style={
            {
                backgroundColor:'rgba(0,0,0,0.3)',
                color:'rgba(0,0,0,0.5)',
                cursor: 'auto'
            }
        }
        >Guest</button>
    }
    if(user.userType === 'admin') {
        return <button className="banner-button" type="button" onClick={() => pageSwitch({pageName: "admin-user"})}>{user.displayName}</button>
    }
    return <button className="banner-button" type="button" onClick={() => pageSwitch({pageName: "user"})}>{user.displayName}</button>
}

function LogoutButton({user, handleLogout}) {
    if (!user) {
        return <button className="banner-button" type="button" style={{backgroundColor:'rgb(200, 200, 200)'}}>Logout</button>
    }
    return <button 
    className="banner-button" 
    type="button" 
    onClick={() => handleLogout()}
    >Logout</button>
}


