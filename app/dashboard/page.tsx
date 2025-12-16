"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createPost,
  getPosts,
  getComments,
  addComment,
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
}

/* ================= PAGE ================= */

export default function DashboardPage() {
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [openCreate, setOpenCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [openComments, setOpenComments] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  /* ================= LOAD POSTS ================= */

  async function loadPosts() {
    setLoading(true);
    try {
      const data = await getPosts();
      setPosts(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  /* ================= ACTIONS ================= */

  async function handleCreatePost() {
    if (!title || !description) return;

    await createPost(title, description);
    await loadPosts();

    setTitle("");
    setDescription("");
    setOpenCreate(false);
  }

  async function openCommentsModal(post: Post) {
    setSelectedPost(post);
    setOpenComments(true);
    setLoadingComments(true);

    const data = await getComments(post.id);
    setComments(data);
    setLoadingComments(false);
  }

  async function handleAddComment() {
    if (!newComment || !selectedPost) return;

    await addComment(selectedPost.id, newComment);
    const data = await getComments(selectedPost.id);
    setComments(data);
    setNewComment("");
  }

  function handleLogout() {
    localStorage.removeItem("authToken");
    router.push("/login");
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-muted/40">
      {/* HEADER */}
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-semibold">Dashboard</h1>

          <div className="flex gap-4">
            <Button onClick={() => setOpenCreate(true)}>Create Post</Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarFallback>ME</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={handleLogout}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* POSTS */}
      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <p>Loading posts...</p>
        ) : posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                  <CardDescription>
                    {post.author} • {post.date}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <p className="text-sm">{post.description}</p>
                </CardContent>

                <CardFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openCommentsModal(post)}
                  >
                    View Comments
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* CREATE POST MODAL */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
            <DialogDescription>Add a new post</DialogDescription>
          </DialogHeader>

          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePost}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* COMMENTS MODAL */}
      <Dialog open={openComments} onOpenChange={setOpenComments}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedPost?.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {loadingComments ? (
              <p>Loading...</p>
            ) : comments.length === 0 ? (
              <p>No comments yet.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id}>
                  <p>{c.text}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.author} • {c.date}
                  </p>
                  <Separator className="mt-2" />
                </div>
              ))
            )}
          </div>

          <Textarea
            placeholder="Add comment..."
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
