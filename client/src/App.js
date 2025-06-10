// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import './stylesheets/App.css';
import Phreddit from './components/phreddit.js'
import axios from 'axios';
import {useState, useEffect} from 'react';

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;
function App() {
  const [communitiesData, updateCommunities] = useState([]);
  const [postsData, updatePosts] = useState([]);
  const [commentsData, updateComments] = useState([]);
  const [linkflairsData, updateLinkflairs] = useState([]);

  useEffect(() => {
      const getModel = async() => {
        try {
          const [communitiesRes, postsRes, commentsRes, linkflairsRes] = await Promise.all([
            axios.get('/api/communities'),
            axios.get('/api/posts'),
            axios.get('/api/comments'),
            axios.get('/api/linkflairs')
          ]);
          
          updateCommunities(communitiesRes.data);
          updatePosts(postsRes.data);
          updateComments(commentsRes.data);
          updateLinkflairs(linkflairsRes.data);
        }catch (err) {
          console.error('Error getting model: ', err);
        }
      };
      getModel();
  }, []);

  communitiesData.forEach(c => {
    c.url = `/communities/${c._id}`;
  });
  postsData.forEach(p => {
    p.url = `/posts/${p._id}`;  
  });
  linkflairsData.forEach(lf => {
    lf.url = `/linkflairs/${lf._id}`;  
  });
  commentsData.forEach(c => {
    c.url = `/comments/${c._id}`;  
  });

  const model = {communitiesData, postsData, commentsData, linkflairsData};
  const updateHooks = {updatePosts,updateCommunities,updateLinkflairs,updateComments};
  return (
    <>
      <Phreddit model={model} updateHooks={updateHooks}/>
    </>
  );
}

export default App;


