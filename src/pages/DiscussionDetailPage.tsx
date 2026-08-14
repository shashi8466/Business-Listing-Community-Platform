import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft, MessageSquare, Clock, Trash2, Heart, Bold, Italic,
  List, Quote, Link2, Image as ImageIcon, Video, Paperclip, X,
  Lock, Pin, MoreVertical, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useDiscussion, uploadDiscussionMedia, getAttachmentType } from "@/hooks/useDiscussions";
import { useCommunity } from "@/hooks/useCommunities";
import { formatDistanceToNow } from "date-fns";
import { DiscussionComment } from "@/types/community";

// ---------- Rich Text Editor (shared minimal implementation) ----------
const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Write your reply...",
  minHeight = "100px",
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    onChange(editorRef.current?.innerHTML || '');
  };

  const insertLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) execCommand('createLink', url);
  };

  const clearEditor = () => {
    if (editorRef.current) editorRef.current.innerHTML = '';
    onChange('');
  };

  // Expose clearEditor through the value prop being '' 
  useEffect(() => {
    if (value === '' && editorRef.current) {
      editorRef.current.innerHTML = '';
    }
  }, [value]);

  return (
    <div className="border border-input rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-ring">
      <div className="flex items-center gap-1 px-3 py-2 bg-muted/50 border-b border-border flex-wrap">
        {[
          { icon: <Bold className="h-3.5 w-3.5" />, cmd: 'bold', title: 'Bold' },
          { icon: <Italic className="h-3.5 w-3.5" />, cmd: 'italic', title: 'Italic' },
          { icon: <span className="text-xs font-bold underline">T</span>, cmd: 'underline', title: 'Underline' },
          { icon: <List className="h-3.5 w-3.5" />, cmd: 'insertUnorderedList', title: 'Bulleted List' },
          { icon: <span className="font-mono text-xs">1.</span>, cmd: 'insertOrderedList', title: 'Numbered List' },
          { icon: <Quote className="h-3.5 w-3.5" />, cmd: 'formatBlock', title: 'Quote' },
        ].map(({ icon, cmd, title }) => (
          <button
            key={title}
            type="button"
            title={title}
            onMouseDown={(e) => {
              e.preventDefault();
              cmd === 'formatBlock' ? execCommand(cmd, 'blockquote') : execCommand(cmd);
            }}
            className="p-1.5 rounded hover:bg-background transition-colors text-muted-foreground hover:text-foreground"
          >
            {icon}
          </button>
        ))}
        <div className="w-px h-4 bg-border mx-1" />
        <button type="button" title="Link" onMouseDown={(e) => { e.preventDefault(); insertLink(); }}
          className="p-1.5 rounded hover:bg-background transition-colors text-muted-foreground hover:text-foreground">
          <Link2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML || '')}
        className="px-4 py-3 text-sm text-foreground focus:outline-none"
        style={{ minHeight }}
        data-placeholder={placeholder}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
        [contenteditable] blockquote {
          border-left: 3px solid hsl(var(--primary));
          padding-left: 0.75rem;
          color: hsl(var(--muted-foreground));
          margin: 0.5rem 0;
        }
        [contenteditable] a { color: hsl(var(--primary)); text-decoration: underline; }
        [contenteditable] ul { list-style: disc; padding-left: 1.5rem; }
        [contenteditable] ol { list-style: decimal; padding-left: 1.5rem; }
      `}</style>
    </div>
  );
};

// ---------- Attachment display component ----------
const AttachmentDisplay = ({ url, type, name }: { url: string; type: string; name?: string }) => {
  if (type === 'image') {
    return <img src={url} alt={name || 'image'} className="mt-3 rounded-xl max-h-96 w-auto object-cover border border-border" />;
  }
  if (type === 'video') {
    return <video src={url} controls className="mt-3 rounded-xl max-h-96 w-full border border-border" />;
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:underline border border-border rounded-lg px-3 py-2 bg-muted/30">
      <Paperclip className="h-4 w-4" />
      {name || 'Attachment'}
    </a>
  );
};

// ---------- Reply card ----------
const ReplyCard = ({
  comment,
  currentUserId,
  isModerator,
  onDelete,
  onLike,
}: {
  comment: DiscussionComment;
  currentUserId?: string;
  isModerator?: boolean;
  onDelete: (id: string) => void;
  onLike: (id: string) => void;
}) => {
  const isAuthor = currentUserId === comment.user_id;
  const canDelete = isAuthor || isModerator;

  return (
    <div className="bg-card border border-border rounded-xl p-5 group">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
          {(comment.author_name || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">{comment.author_name || 'Member'}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </p>
            </div>
            {canDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => confirm('Delete this reply?') && onDelete(comment.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Reply
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div
            className="mt-2 text-sm text-foreground prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: comment.content }}
          />

          {comment.attachment_url && comment.attachment_type && (
            <AttachmentDisplay url={comment.attachment_url} type={comment.attachment_type} name={comment.attachment_name || ''} />
          )}

          <button
            onClick={() => onLike(comment.id)}
            className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors"
          >
            <Heart className="h-3.5 w-3.5" />
            {comment.like_count > 0 && <span>{comment.like_count}</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Main Page ----------
const DiscussionDetailPage = () => {
  const { slug, discussionId } = useParams<{ slug: string; discussionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { discussion, comments, loading, error, addComment, deleteComment, likeComment } = useDiscussion(discussionId);
  const { community, membership } = useCommunity(slug);

  const isModerator = membership?.role === 'admin' || membership?.role === 'moderator' || membership?.role === 'owner';
  const isMember = !!membership;

  // Reply composer state
  const [replyContent, setReplyContent] = useState('');
  const [replyAttachment, setReplyAttachment] = useState<File | null>(null);
  const [replyAttachmentPreview, setReplyAttachmentPreview] = useState<string | null>(null);
  const [replyAttachmentType, setReplyAttachmentType] = useState<'image' | 'video' | 'file' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleAttachFile = (file: File) => {
    setReplyAttachment(file);
    setReplyAttachmentType(getAttachmentType(file));
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      setReplyAttachmentPreview(URL.createObjectURL(file));
    } else {
      setReplyAttachmentPreview(null);
    }
  };

  const clearReplyAttachment = () => {
    setReplyAttachment(null);
    setReplyAttachmentPreview(null);
    setReplyAttachmentType(null);
  };

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please sign in to reply", variant: "destructive" });
      navigate('/auth');
      return;
    }
    const plainText = replyContent.replace(/<[^>]+>/g, '').trim();
    if (!plainText && !replyAttachment) {
      toast({ title: "Please write something or add an attachment", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    let uploadedAttachment = null;

    if (replyAttachment) {
      setUploading(true);
      const { url, error: uploadError } = await uploadDiscussionMedia(replyAttachment, 'replies');
      setUploading(false);
      if (uploadError || !url) {
        toast({ title: "Upload failed", description: uploadError || "Could not upload file", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      uploadedAttachment = { url, type: getAttachmentType(replyAttachment), name: replyAttachment.name };
    }

    const { error } = await addComment(replyContent, uploadedAttachment);
    setIsSubmitting(false);

    if (error) {
      toast({ title: "Failed to post reply", description: error, variant: "destructive" });
    } else {
      toast({ title: "Reply posted!" });
      setReplyContent('');
      clearReplyAttachment();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground animate-pulse">
          <MessageSquare className="h-10 w-10 opacity-40" />
          <p>Loading discussion...</p>
        </div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center text-center">
          <div>
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Discussion Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || "This discussion doesn't exist."}</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{discussion.title} | {community?.name || 'Community'}</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 max-w-3xl">

            {/* Back link */}
            <Link
              to={`/community/${slug}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {community?.name || 'Community'}
            </Link>

            {/* ---- Original Discussion ---- */}
            <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-sm">
              {/* Author header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                  {(discussion.author_name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{discussion.author_name || 'Community Member'}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
                        <span className="mx-1">·</span>
                        {discussion.view_count} views
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {discussion.is_pinned && (
                        <Badge variant="secondary" className="gap-1 text-xs"><Pin className="h-3 w-3" /> Pinned</Badge>
                      )}
                      {discussion.is_locked && (
                        <Badge variant="outline" className="gap-1 text-xs"><Lock className="h-3 w-3" /> Locked</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-foreground mb-4">{discussion.title}</h1>

              {/* Content */}
              <div
                className="text-base text-foreground prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: discussion.content }}
              />

              {/* Attachment */}
              {discussion.attachment_url && discussion.attachment_type && (
                <AttachmentDisplay
                  url={discussion.attachment_url}
                  type={discussion.attachment_type}
                  name={discussion.attachment_name || ''}
                />
              )}
            </div>

            {/* ---- Replies ---- */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Replies ({discussion.reply_count})
              </h2>

              {comments.length === 0 ? (
                <div className="text-center py-10 bg-muted/30 rounded-xl border border-dashed border-border">
                  <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-muted-foreground">No replies yet. Be the first to respond!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <ReplyCard
                      key={comment.id}
                      comment={comment}
                      currentUserId={user?.id}
                      isModerator={isModerator}
                      onDelete={deleteComment}
                      onLike={likeComment}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ---- Reply Composer ---- */}
            {discussion.is_locked ? (
              <div className="bg-muted/40 border border-border rounded-xl p-5 text-center text-muted-foreground flex items-center justify-center gap-2">
                <Lock className="h-4 w-4" />
                This discussion is locked. No new replies are allowed.
              </div>
            ) : user && isMember ? (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Add a reply
                </h3>

                <form onSubmit={submitReply} className="space-y-4">
                  {/* Rich text editor */}
                  <RichTextEditor
                    value={replyContent}
                    onChange={setReplyContent}
                    placeholder="Write your reply..."
                    minHeight="120px"
                  />

                  {/* Media attachment buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">Attach:</span>
                    <input ref={imageInputRef} type="file" accept="image/*" className="hidden"
                      onChange={e => e.target.files?.[0] && handleAttachFile(e.target.files[0])} />
                    <input ref={videoInputRef} type="file" accept="video/*" className="hidden"
                      onChange={e => e.target.files?.[0] && handleAttachFile(e.target.files[0])} />
                    <input ref={fileInputRef} type="file" className="hidden"
                      onChange={e => e.target.files?.[0] && handleAttachFile(e.target.files[0])} />

                    <Button type="button" variant="outline" size="sm" className="gap-1 h-7 text-xs"
                      onClick={() => imageInputRef.current?.click()}>
                      <ImageIcon className="h-3.5 w-3.5" /> Image
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="gap-1 h-7 text-xs"
                      onClick={() => videoInputRef.current?.click()}>
                      <Video className="h-3.5 w-3.5" /> Video
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="gap-1 h-7 text-xs"
                      onClick={() => fileInputRef.current?.click()}>
                      <Paperclip className="h-3.5 w-3.5" /> File
                    </Button>
                  </div>

                  {/* Attachment preview */}
                  {replyAttachment && (
                    <div className="relative border border-border rounded-xl p-3 bg-muted/30">
                      <button type="button" onClick={clearReplyAttachment}
                        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                      {replyAttachmentType === 'image' && replyAttachmentPreview && (
                        <img src={replyAttachmentPreview} alt="preview" className="max-h-40 rounded-lg object-cover" />
                      )}
                      {replyAttachmentType === 'video' && replyAttachmentPreview && (
                        <video src={replyAttachmentPreview} controls className="max-h-40 rounded-lg w-full" />
                      )}
                      {replyAttachmentType === 'file' && (
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Paperclip className="h-4 w-4 text-primary" />
                          {replyAttachment.name}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting || uploading} className="gap-2 px-6">
                      {uploading ? "Uploading..." : isSubmitting ? "Posting..." : "Post Reply"}
                    </Button>
                  </div>
                </form>
              </div>
            ) : !user ? (
              <div className="bg-muted/40 border border-border rounded-xl p-6 text-center">
                <p className="text-muted-foreground mb-4">Sign in to join the conversation</p>
                <Button asChild>
                  <Link to="/auth">Login to Reply</Link>
                </Button>
              </div>
            ) : (
              <div className="bg-muted/40 border border-border rounded-xl p-5 text-center text-muted-foreground">
                Join this community to reply to discussions.
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default DiscussionDetailPage;
