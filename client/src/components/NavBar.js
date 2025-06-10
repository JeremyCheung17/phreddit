import React from 'react';

/* TODO: handling new community outside of this class */
export default function NavBar({communitiesData, pageSwitch, commID, isHome, isComm, isNewCommunity, user}) {

    let listDisplay = "";
    if (!user) {
        listDisplay = (
        <>
            <h3 id="nav-header">All Communities</h3>
            <CommunitiesList 
                comms={communitiesData}
                pageSwitch={pageSwitch} 
                isComm={isComm}
                commID={commID}
            />  
        </>
        ); 
    }
    else {
        const {userComms, otherComms} = groupCommunities({communitiesData, user});
        listDisplay=(
        <>
            <h3 id="nav-header">My Communities</h3>
            <CommunitiesList 
                comms={userComms}
                pageSwitch={pageSwitch} 
                isComm={isComm}
                commID={commID}
            />  
            <h3 id="nav-header" style={{marginTop:'20px'}}>Other Communities</h3>
            <CommunitiesList 
                comms={otherComms}
                pageSwitch={pageSwitch} 
                isComm={isComm}
                commID={commID}
            />  
        </>
        );
    }
    return (
        <nav className="navbar-wrap">
            <div id="nav-bar">
                <HomeButton pageSwitch={pageSwitch} isHome={isHome}/>
                <div id="nav-divider"></div>
                <CommButton pageSwitch={pageSwitch} isNC={isNewCommunity} user={user}/>
                {listDisplay}  
            </div>
        </nav>
    );
}

function HomeButton({pageSwitch, isHome}) {
    if (isHome){
        return <button 
            id="nav-home" 
            onClick={() => pageSwitch({pageName: "home"})} 
            style={{backgroundColor:'rgb(253, 101, 25)'}} 
        >
        Home</button>
    }
    return <button 
        id="nav-home" 
        onClick={() => pageSwitch({pageName: "home"})}
    >Home</button>
}

function CommButton({pageSwitch, isNC, user}) {
    if (!user) {
        return <button 
            id="create-comm" 
            style={
                {
                    backgroundColor:'rgba(0,0,0,0.3)',
                    color:'rgba(0,0,0,0.5)',
                    cursor: 'auto'
                }
            } 
        >Create Community</button>
    }
    else if (isNC)
        return <button 
            id="create-comm" 
            onClick={() => pageSwitch({pageName: "new-community"})} 
            style={{backgroundColor:'rgb(253, 101, 25)'}} 
        >Create Community</button>
    else
        return <button 
            id="create-comm" 
            onClick={() => pageSwitch({pageName: "new-community"})}
        >Create Community</button>
}

function CommunitiesList({pageSwitch,isComm,comms,commID}) {
    return (
        <div>
            <ul id="community-list">
            {comms.map((comm) => (
                <li key={comm._id} 
                onClick={() => pageSwitch({pageName: "community", commID: comm._id})}
                style={{backgroundColor: isComm && comm._id === commID ? 'rgb(253, 101, 25)': 'rgb(255,255,255)'}}
                >{comm.name}</li>
            ))}
            </ul>
        </div>
    );
}

function groupCommunities({communitiesData, user}) {
    const userComms = [];
    const otherComms = [];

    for (const comm of communitiesData) {
        if (comm.members.includes(user.displayName)) {
            userComms.push(comm);
        }
        else {
            otherComms.push(comm);
        }
    }
    return {userComms, otherComms};
}