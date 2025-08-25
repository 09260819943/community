import axios from 'axios';

const API_URL = 'http://10.0.0.47:8000/api/'; // your LAN IP

const API = axios.create({
  baseURL: API_URL,
});

export const getPosts = () => API.get('posts/');
export const createPost = (formData) => {
  // explicitly set multipart/form-data
  return API.post('posts/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const createComment = (formData) => {
  return API.post('comments/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const reactComment = async (commentId, type) => {
  return axios.post(`http://10.0.0.47:8000/comments/${commentId}/react/`, { reaction_type: type });
};


export const likePost = (id) => API.post(`posts/${id}/like/`);
export const reactPost = (postId, reactionType) =>
  API.post(`posts/${postId}/react/`, { reaction_type: reactionType });

export const getFullImageUrl = (path) => {
  if (!path) return null;
  // Use your server LAN IP and port
  return `http://10.0.0.47:8000${path}`;
};


export const updatePost = async (postId, data, isMultipart = false) => {
  try {
    if (isMultipart) {
      return await axios.put(
        `http://10.0.0.47:8000/posts/${postId}/`,
        data,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
    } else {
      return await axios.put(
        `http://10.0.0.47:8000/posts/${postId}/`,
        data
      );
    }
  } catch (err) {
    console.log('API updatePost error:', err.response?.data || err.message);
    throw err;
  }
};

export const deletePost = async (postId) => {
  return await axios.delete(`http://10.0.0.47:8000/posts/${postId}/`);
};
