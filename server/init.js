/* server/init.js
** You must write a script that will create documents in your database according
** to the datamodel you have defined for the application.  Remember that you 
** must at least initialize an admin user account whose credentials are derived
** from command-line arguments passed to this script. But, you should also add
** some communities, posts, comments, and link-flairs to fill your application
** some initial content.  You can use the initializeDB.js script from PA03 as 
** inspiration, but you cannot just copy and paste it--you script has to do more
** to handle the addition of users to the data model.
*/

/*
    node server/init.js mongodb://127.0.0.1:27017/phreddit 
*/
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const CommunityModel = require('./models/communities');
const PostModel= require('./models/posts');
const CommentModel = require('./models/comments');
const LinkFlairModel = require('./models/linkflairs');
const UserModel = require('./models/users');


let userArgs = process.argv.slice(2);

if (!userArgs[0] || !userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    console.log('Usage: node init.js <mongodb-url> <admin-email> <admin-displayname> <admin-password>');
    return;
}

if (userArgs.length < 4) {
    console.log('ERROR: Missing required admin user parameters');
    console.log('Usage: node init.js <mongodb-url> <admin-email> <admin-displayname> <admin-password>');
    return;
}
let mongoDB = userArgs[0];
let adminEmail = userArgs[1];
let adminDisplayName = userArgs[2];
let adminPassword = userArgs[3];

mongoose.connect(mongoDB);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

function createLinkFlair(linkFlairObj) {
    let newLinkFlairDoc = new LinkFlairModel({
        content: linkFlairObj.content,
    });
    return newLinkFlairDoc.save();
}

function createComment(commentObj) {
    let newCommentDoc = new CommentModel({
        content: commentObj.content,
        commentedBy: commentObj.commentedBy,
        commentedDate: commentObj.commentedDate,
        commentIDs: commentObj.commentIDs,
        votes: commentObj.votes,
    });
    return newCommentDoc.save();
}

function createPost(postObj) {
    let newPostDoc = new PostModel({
        title: postObj.title,
        content: postObj.content,
        postedBy: postObj.postedBy,
        postedDate: postObj.postedDate,
        views: postObj.views,
        linkFlairID: postObj.linkFlairID,
        commentIDs: postObj.commentIDs,
        votes: postObj.votes,
        usersVoted: postObj.usersVoted
    });
    return newPostDoc.save();
}

function createCommunity(communityObj) {
    let newCommunityDoc = new CommunityModel({
        name: communityObj.name,
        description: communityObj.description,
        postIDs: communityObj.postIDs,
        startDate: communityObj.startDate,
        members: communityObj.members,
        creator: communityObj.creator,
    });
    return newCommunityDoc.save();
}

async function createUser(userObj) {
    const hashedPassword = await bcrypt.hash(userObj.password, 10);
    let newUserDoc = new UserModel({
        firstName: userObj.firstName,
        lastName: userObj.lastName,
        displayName: userObj.displayName,
        email: userObj.email,
        passwordHash: hashedPassword,
        reputation: userObj.reputation,
        userType: userObj.userType,
        createdDate: userObj.createdDate,
    });
    return newUserDoc.save();
}

async function initializeDB() {
    // user objects
    const user0 = { 
        displayName: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@phreddit.com',
        password: 'ownerpassword', 
        reputation: 1000,
        userType: 'admin',
        createdDate: new Date('August 5, 2010 04:18:00'),
    };
    const user1 = { 
        displayName: adminDisplayName,
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        password: adminPassword, 
        reputation: 1000,
        userType: 'admin',
        createdDate: new Date(),
    };
    const user2 = { 
        displayName: 'MarcoArelius',
        firstName: 'Marco',
        lastName: 'Arelius',
        email: 'MarcoArelius@gmail.com',
        password: 'TheGladiator', 
        reputation: 100,
        userType: 'user',
        createdDate: new Date('August 13, 2016 04:18:00'),
    };
    const user3 = { 
        displayName: 'rollo',
        firstName: 'Roland',
        lastName: 'Lobert',
        email: 'rollo@gmail.com',
        password: 'rolling', 
        reputation: 100,
        userType: 'user',
        createdDate: new Date('August 5, 2014 04:18:00'),
    };
    const user4 = { 
        displayName: 'shemp',
        firstName: 'Sherman',
        lastName: 'Parker',
        email: 'shemp@gmail.com',
        password: 'iloveshrimp', 
        reputation: 100,
        userType: 'user',
        createdDate: new Date('October 14, 2015 04:18:00'),
    };
    const user5 = { 
        displayName: 'catlady13',
        firstName: 'Taylor',
        lastName: 'Swift',
        email: 'catlady13@gmail.com',
        password: 'shakeitoff', 
        reputation: 100,
        userType: 'user',
        createdDate: new Date('December 10, 2015 04:18:00'),
    };
    const user6 = { 
        displayName: 'astyanax',
        firstName: 'Aster',
        lastName: 'Nax',
        email: 'astyana@phreddit.com',
        password: 'nocluewhattodowiththis', 
        reputation: 100,
        userType: 'user',
        createdDate: new Date('February 23, 2016 04:18:00'),
    };
    const user7 = { 
        displayName: 'outtheretruth47',
        firstName: 'Joseph',
        lastName: 'McCarthy',
        email: 'outtheretruth47@gmail.com',
        password: 'conspiracytheory', 
        reputation: 100,
        userType: 'user',
        createdDate: new Date('March 10, 2016 04:18:00'),
    };
    const user8 = { 
        displayName: 'bigfeet',
        firstName: 'Big',
        lastName: 'Foot',
        email: 'bigfeet@gmail.com',
        password: 'bigfootisreal', 
        reputation: 100,
        userType: 'user',
        createdDate: new Date('March 30, 2016 04:18:00'),
    };
    const user9 = { 
        displayName: 'trucknutz69',
        firstName: 'Hank',
        lastName: 'Hill',
        email: 'trucknutz69@gmail.com',
        password: 'propanelover', 
        reputation: 100,
        userType: 'user',
        createdDate: new Date('August 13, 2016 04:18:00'),
    };

    let userRef0 = await createUser(user0);
    let userRef1 = await createUser(user1);
    let userRef2 = await createUser(user2);
    let userRef3 = await createUser(user3);
    let userRef4 = await createUser(user4);
    let userRef5 = await createUser(user5);
    let userRef6 = await createUser(user6);
    let userRef7 = await createUser(user7);
    let userRef8 = await createUser(user8);
    let userRef9 = await createUser(user9);
    // link flair objects
    const linkFlair1 = { // link flair 1
        linkFlairID: 'lf1',
        content: 'The jerkstore called...', 
    };
    const linkFlair2 = { //link flair 2
        linkFlairID: 'lf2',
        content: 'Literal Saint',
    };
    const linkFlair3 = { //link flair 3
        linkFlairID: 'lf3',
        content: 'They walk among us',
    };
    const linkFlair4 = { //link flair 4
        linkFlairID: 'lf4',
        content: 'Worse than Hitler',
    };
    let linkFlairRef1 = await createLinkFlair(linkFlair1);
    let linkFlairRef2 = await createLinkFlair(linkFlair2);
    let linkFlairRef3 = await createLinkFlair(linkFlair3);
    let linkFlairRef4 = await createLinkFlair(linkFlair4);
    
    // comment objects
    const comment7 = { // comment 7
        commentID: 'comment7',
        content: 'Generic poster slogan #42',
        commentIDs: [],
        commentedBy: 'bigfeet',
        commentedDate: new Date('September 10, 2024 09:43:00'),
        votes: 0,
    };
    let commentRef7 = await createComment(comment7);
    
    const comment6 = { // comment 6
        commentID: 'comment6',
        content: 'I want to believe.',
        commentIDs: [commentRef7],
        commentedBy: 'outtheretruth47',
        commentedDate: new Date('September 10, 2024 07:18:00'),
        votes: 0,
    };
    let commentRef6 = await createComment(comment6);
    
    const comment5 = { // comment 5
        commentID: 'comment5',
        content: 'The same thing happened to me. I guest this channel does still show real history.',
        commentIDs: [],
        commentedBy: 'bigfeet',
        commentedDate: new Date('September 09, 2024 017:03:00'),
        votes: 0,
    }
    let commentRef5 = await createComment(comment5);
    
    const comment4 = { // comment 4
        commentID: 'comment4',
        content: 'The truth is out there.',
        commentIDs: [commentRef6],
        commentedBy: "astyanax",
        commentedDate: new Date('September 10, 2024 6:41:00'),
        votes: 0,
    };
    let commentRef4 = await createComment(comment4);
    
    const comment3 = { // comment 3
        commentID: 'comment3',
        content: 'My brother in Christ, are you ok? Also, YTJ.',
        commentIDs: [],
        commentedBy: 'rollo',
        commentedDate: new Date('August 23, 2024 09:31:00'),
        votes: 0,
    };
    let commentRef3 = await createComment(comment3);
    
    const comment2 = { // comment 2
        commentID: 'comment2',
        content: 'Obvious rage bait, but if not, then you are absolutely the jerk in this situation. Please delete your Tron vehicle and leave is in peace.  YTJ.',
        commentIDs: [],
        commentedBy: 'astyanax',
        commentedDate: new Date('August 23, 2024 10:57:00'),
        votes: 0,
    };
    let commentRef2 = await createComment(comment2);
    
    const comment1 = { // comment 1
        commentID: 'comment1',
        content: 'There is no higher calling than the protection of Tesla products.  God bless you sir and God bless Elon Musk. Oh, NTJ.',
        commentIDs: [commentRef3],
        commentedBy: 'shemp',
        commentedDate: new Date('August 23, 2024 08:22:00'),
        votes: 0,
    };
    let commentRef1 = await createComment(comment1);
    
    // post objects
    const post1 = { // post 1
        postID: 'p1',
        title: 'AITJ: I parked my cybertruck in the handicapped spot to protect it from bitter, jealous losers.',
        content: 'Recently I went to the store in my brand new Tesla cybertruck. I know there are lots of haters out there, so I wanted to make sure my truck was protected. So I parked it so it overlapped with two of those extra-wide handicapped spots.  When I came out of the store with my beef jerky some Karen in a wheelchair was screaming at me.  So tell me prhreddit, was I the jerk?',
        linkFlairID: linkFlairRef1,
        postedBy: 'trucknutz69',
        postedDate: new Date('August 23, 2024 01:19:00'),
        commentIDs: [commentRef1, commentRef2],
        views: 14,
        votes: 0,
        usersVoted: []
    };
    const post2 = { // post 2
        postID: 'p2',
        title: "Remember when this was a HISTORY channel?",
        content: 'Does anyone else remember when they used to show actual historical content on this channel and not just an endless stream of alien encounters, conspiracy theories, and cryptozoology? I do.\n\nBut, I am pretty sure I was abducted last night just as described in that show from last week, "Finding the Alien Within".  Just thought I\'d let you all know.',
        linkFlairID: linkFlairRef3,
        postedBy: 'MarcoArelius',
        postedDate: new Date('December 9, 2024 14:24:00'),
        commentIDs: [commentRef4, commentRef5],
        views: 1023,
        votes: 0,
        usersVoted: []
    };
    let postRef1 = await createPost(post1);
    let postRef2 = await createPost(post2);
    
    // community objects
    const community1 = {// community object 1
        communityID: 'community1',
        name: 'Am I the Jerk?',
        description: 'A practical application of the principles of justice.',
        postIDs: [postRef1],
        startDate: new Date('August 10, 2014 04:18:00'),
        members: ['rollo', 'shemp', 'catlady13', 'astyanax', 'trucknutz69'],
        memberCount: 4,
        creator: 'rollo',
    };
    const community2 = { // community object 2
        communityID: 'community2',
        name: 'The History Channel',
        description: 'A fantastical reimagining of our past and present.',
        postIDs: [postRef2],
        startDate: new Date('May 4, 2017 08:32:00'),
        members: ['MarcoArelius', 'astyanax', 'outtheretruth47', 'bigfeet'],
        memberCount: 4,
        creator: 'MarcoArelius',
    };
    let communityRef1 = await createCommunity(community1);
    let communityRef2 = await createCommunity(community2);
    
    if (db) {
        db.close();
    }
    console.log("done");
}

initializeDB()
    .catch((err) => {
        console.log('ERROR: ' + err);
        console.trace();
        if (db) {
            db.close();
        }
    });

console.log('processing...');