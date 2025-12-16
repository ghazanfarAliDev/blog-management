import axios from "axios";

/* ================= AXIOS INSTANCE ================= */

const api = axios.create({
  baseURL: "http://localhost:3000", // backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ================= POSTS API ================= */

// Create Post
export async function createPost(title: string, description: string) {
  const res = await api.post("/posts", {
    title,
    content: description, // backend expects `content`
  });

  return res.data;
}

// Get Posts
export async function getPosts() {
  const res = await api.get("/posts");

  return res.data.map((post: any) => ({
    id: post.id,
    title: post.title,
    description: post.content,
    author: "Admin",
    date: post.createdAt
      ? new Date(post.createdAt._seconds * 1000).toLocaleDateString()
      : "",
    comments: [],
  }));
}

/* ================= COMMENTS API ================= */

// Get comments for a post
export async function getComments(postId: string) {
  const res = await api.get(`/posts/${postId}/comments`);

  return res.data.map((comment: any) => ({
    id: comment.id,
    text: comment.content,
    author: "User",
    date: comment.createdAt
      ? new Date(comment.createdAt._seconds * 1000).toLocaleDateString()
      : "",
  }));
}

// Add comment
export async function addComment(postId: string, text: string) {
  const res = await api.post(`/posts/${postId}/comments`, {
    content: text,
  });

  return res.data;
}