Usage Instructions: 

Make sure Node.js is installed before running via https://nodejs.org/en 
Also make sure MongoDB is installed via the instructions found here: https://www.mongodb.com/docs/manual/administration/install-community/
To run, follow these steps in order:  
1. Run the command npm install
2. In the main directory, run the command npm install jest -g
3. add "scripts": {
    "test": "jest"
  } to package.json, if not already present
4. In the server directory (stay here for the following steps until otherwise states), run the command npm install express
5. Run the command npm install mongoose
6. Run the command npm install -g nodemon
7. Run the command npm install cors
8. Run the command npm install express-session
9. Run the command npm install bcrypt
10. Run the command npm install connect-mongo
11. Navigate to the client directory and run the command npm install axios
12. Start mongod using the command mongod
13. Run the command node server/init.js mongodb://127.0.0.1:27017/phreddit \<admin email address\> \<admin display name\> \<admin password\> to initialize the database (replacing each <> with the desired item)  
14. Run the command npx nodemon server/server.js to start the server (starts at http://localhost:8000)  
15. Run the command npm start in the client directory to start client (starts at http://localhost:3000)  

All packages use default configurations.  


## Team Member 1 Contribution
Chris Tan  

Cases 1-15  
User schema, user routing, authentication routing, session setup  
WelcomePage, RegisterPage, LoginPage  
NewCommunityPage, CommunityPage and community joining/leaving  
Banner and Navbar updates  
dynamic post display/sorting for Home/Community/Search Pages  
post voting/post creator rep  
major css additions/updates to the above pages  

## Team Member 2 Contribution
Jeremy Cheung  
Express Routing
Server setup
Axios functionality and compatibility
MongoDB schemas and database functionality
CSS and functionality for user/admin user pages  
Deleting/editing communities/posts/comments  
Deleting Users  
Reputation for comments  
Fixed authentication routing and setup  
UML Diagrams  
Init.js  
Jest Unit Testing  
README  

