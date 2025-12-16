"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createPost,
  getPosts,
  getComments,
  addComment as addCommentApi,
} from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/* ================= TYPES ================= */

interface Comment {
  id: string;
  text: string;
  author: string;
  date: string;
}

interface Post {
  id: string;
  title: string;
  description: string;
  author: string;
  date: string;
  comments: Comment[];
}

/* ================= PAGE ================= */

export default function DashboardPage() {
  const router = useRouter();

  /* ---------------- CREATE POST ---------------- */
  const [openCreate, setOpenCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  /* ---------------- COMMENTS ---------------- */
  const [openComments, setOpenComments] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  /* ---------------- POSTS ---------------- */
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD POSTS ================= */

  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true);
        const data = await getPosts();
        setPosts(data);
      } catch (err) {
        console.error("Failed to load posts", err);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  /* ================= HANDLERS ================= */

  async function handleCreatePost() {
    if (!title.trim() || !description.trim()) return;

    try {
      await createPost(title, description);
      const updated = await getPosts();
      setPosts(updated);

      setTitle("");
      setDescription("");
      setOpenCreate(false);
    } catch (err) {
      console.error("Create post failed", err);
    }
  }

  async function openCommentModal(post: Post) {
    setSelectedPost(post);
    setOpenComments(true);
    setLoadingComments(true);

    try {
      const data = await getComments(post.id);
      setComments(data);
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setLoadingComments(false);
    }
  }

  async function handleAddComment() {
    if (!newComment.trim() || !selectedPost) return;

    try {
      await addCommentApi(selectedPost.id, newComment);

      const updatedComments = await getComments(selectedPost.id);
      setComments(updatedComments);
      setNewComment("");
    } catch (err) {
      console.error("Add comment failed", err);
    }
  }

  function handleLogout() {
    localStorage.removeItem("authToken");
    document.cookie = "token=; Max-Age=0; path=/";
    router.push("/login");
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-semibold">Dashboard</h1>

          <div className="flex items-center gap-4">
            <Button onClick={() => setOpenCreate(true)}>Create Post</Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 cursor-pointer"
                  onClick={handleLogout}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Posts */}
      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <p className="text-muted-foreground">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground">No posts yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                  <CardDescription>
                    By {post.author} • {post.date}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {post.description}
                  </p>
                </CardContent>

                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openCommentModal(post)}
                  >
                    View Comments
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* COMMENTS MODAL */}
      <Dialog open={openComments} onOpenChange={setOpenComments}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedPost?.title}</DialogTitle>
            <DialogDescription>Comments</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {loadingComments ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : comments.length ? (
              comments.map((comment) => (
                <div key={comment.id}>
                  <p className="text-sm">{comment.text}</p>
                  <p className="text-xs text-muted-foreground">
                    {comment.author} • {comment.date}
                  </p>
                  <Separator className="mt-2" />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No comments yet.
              </p>
            )}
          </div>

          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenComments(false)}>
              Close
            </Button>
            <Button onClick={handleAddComment}>Add Comment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
