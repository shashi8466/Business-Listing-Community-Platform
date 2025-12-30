import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Plus, Pin, Lock, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Discussion } from "@/types/community";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface CommunityDiscussionsProps {
  communityId: string;
  communitySlug: string;
  discussions: Discussion[];
  isMember: boolean;
  onCreateDiscussion: (title: string, content: string) => Promise<{ error?: string }>;
}

const CommunityDiscussions = ({
  communityId,
  communitySlug,
  discussions,
  isMember,
  onCreateDiscussion,
}: CommunityDiscussionsProps) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    const { error } = await onCreateDiscussion(title, content);
    setIsSubmitting(false);

    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } else {
      toast({ title: "Discussion created!" });
      setTitle("");
      setContent("");
      setIsDialogOpen(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Discussions ({discussions.length})
        </h2>
        {isMember && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Discussion
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start a Discussion</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Discussion title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="What's on your mind?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={5}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Discussion"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {discussions.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-xl">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No discussions yet</p>
          {isMember ? (
            <Button onClick={() => setIsDialogOpen(true)}>
              Start the First Discussion
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Join the community to start a discussion
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <Link
              key={discussion.id}
              to={`/community/${communitySlug}/discussion/${discussion.id}`}
              className="block bg-card border border-border rounded-xl p-5 hover:shadow-md hover:border-primary/50 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {discussion.is_pinned && (
                      <Badge variant="secondary" className="gap-1">
                        <Pin className="h-3 w-3" />
                        Pinned
                      </Badge>
                    )}
                    {discussion.is_locked && (
                      <Badge variant="outline" className="gap-1">
                        <Lock className="h-3 w-3" />
                        Locked
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 truncate">
                    {discussion.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {discussion.content}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {discussion.reply_count} replies
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityDiscussions;
