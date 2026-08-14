import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare, Plus, Pin, Lock, Clock, Video, Image as ImageIcon,
  Paperclip, Trash2, Bold, Italic, List, Quote, Link2, X, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { uploadDiscussionMedia, getAttachmentType } from "@/hooks/useDiscussions";

interface CommunityDiscussionsProps {
  communityId: string;
  communitySlug: string;
  discussions: Discussion[];
  isMember: boolean;
  isModerator?: boolean;
  currentUserId?: string;
  onCreateDiscussion: (
    title: string,
    content: string,
    attachment?: { url: string; type: 'image' | 'video' | 'file'; name: string } | null
  ) => Promise<{ error?: string }>;
  onDeleteDiscussion?: (id: string) => Promise<{ error?: string }>;
}

const AttachmentPreview = ({ url, type, name }: { url: string; type: string; name?: string }) => {
  if (type === 'image') {
    return (
      <img
        src={url}
        alt={name || 'attachment'}
        className="mt-3 rounded-lg max-h-48 w-auto object-cover border border-border"
      />
    );
  }
  if (type === 'video') {
    return (
      <video
        src={url}
        controls
        className="mt-3 rounded-lg max-h-48 w-full border border-border"
      />
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 flex items-center gap-2 text-sm text-primary hover:underline"
    >
      <Paperclip className="h-4 w-4" />
      {name || 'Attachment'}
    </a>
  );
};

// Minimal rich text editor using contenteditable
const RichTextEditor = ({
  value,
  onChange,
  placeholder = "What's on your mind? Share links, images, or files!",
  minHeight = "120px",
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

  const handleInput = () => {
    onChange(editorRef.current?.innerHTML || '');
  };

  const insertLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) execCommand('createLink', url);
  };

  return (
    <div className="border border-input rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-ring">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 bg-muted/50 border-b border-border flex-wrap">
        {[
          { icon: <Bold className="h-3.5 w-3.5" />, cmd: 'bold', title: 'Bold' },
          { icon: <Italic className="h-3.5 w-3.5" />, cmd: 'italic', title: 'Italic' },
          { icon: <span className="text-xs font-bold underline">T</span>, cmd: 'underline', title: 'Underline' },
          { icon: <List className="h-3.5 w-3.5" />, cmd: 'insertUnorderedList', title: 'List' },
          { icon: <span className="text-xs font-mono">&lt;&gt;</span>, cmd: 'formatBlock', title: 'Code' },
          { icon: <Quote className="h-3.5 w-3.5" />, cmd: 'formatBlock', title: 'Quote' },
        ].map(({ icon, cmd, title }) => (
          <button
            key={title}
            type="button"
            title={title}
            onMouseDown={(e) => {
              e.preventDefault();
              if (cmd === 'formatBlock') {
                execCommand(cmd, title === 'Code' ? 'pre' : 'blockquote');
              } else {
                execCommand(cmd);
              }
            }}
            className="p-1.5 rounded hover:bg-background transition-colors text-muted-foreground hover:text-foreground"
          >
            {icon}
          </button>
        ))}
        <div className="w-px h-4 bg-border mx-1" />
        <button
          type="button"
          title="Link"
          onMouseDown={(e) => { e.preventDefault(); insertLink(); }}
          className="p-1.5 rounded hover:bg-background transition-colors text-muted-foreground hover:text-foreground"
        >
          <Link2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="px-4 py-3 text-sm text-foreground focus:outline-none prose prose-sm max-w-none dark:prose-invert"
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
        [contenteditable] pre {
          background: hsl(var(--muted));
          padding: 0.5rem;
          border-radius: 0.375rem;
          font-family: monospace;
          font-size: 0.875rem;
        }
        [contenteditable] a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

const CommunityDiscussions = ({
  communityId,
  communitySlug,
  discussions,
  isMember,
  isModerator = false,
  currentUserId,
  onCreateDiscussion,
  onDeleteDiscussion,
}: CommunityDiscussionsProps) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [attachmentType, setAttachmentType] = useState<'image' | 'video' | 'file' | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setAttachment(file);
    setAttachmentType(getAttachmentType(file));
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      setAttachmentPreview(URL.createObjectURL(file));
    } else {
      setAttachmentPreview(null);
    }
  };

  const clearAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
    setAttachmentType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (mediaInputRef.current) mediaInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const plainText = content.replace(/<[^>]+>/g, '').trim();
    if (!title.trim() || !plainText) {
      toast({ title: "Please fill in title and content", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    let uploadedAttachment = null;

    if (attachment) {
      setUploading(true);
      const { url, error: uploadError } = await uploadDiscussionMedia(attachment, 'discussions');
      setUploading(false);
      if (uploadError || !url) {
        toast({ title: "Upload failed", description: uploadError || "Could not upload file", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      uploadedAttachment = { url, type: getAttachmentType(attachment), name: attachment.name };
    }

    const { error } = await onCreateDiscussion(title, content, uploadedAttachment);
    setIsSubmitting(false);

    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } else {
      toast({ title: "Discussion created!" });
      setTitle("");
      setContent("");
      clearAttachment();
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
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Start a Discussion</DialogTitle>
                <p className="text-sm text-muted-foreground">Share your thoughts and engage with the community</p>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <Input
                  placeholder="Discussion title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="text-base font-medium"
                />

                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  minHeight="140px"
                />

                {/* Media toolbar row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Attach:</span>
                  <input ref={mediaInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                  <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                  <input ref={fileInputRef} type="file" className="hidden" onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                  <Button type="button" variant="outline" size="sm" className="gap-1 h-7 text-xs" onClick={() => mediaInputRef.current?.click()}>
                    <ImageIcon className="h-3.5 w-3.5" /> Image
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="gap-1 h-7 text-xs" onClick={() => videoInputRef.current?.click()}>
                    <Video className="h-3.5 w-3.5" /> Video
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="gap-1 h-7 text-xs" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip className="h-3.5 w-3.5" /> File
                  </Button>
                </div>

                {/* Attachment Preview */}
                {attachment && (
                  <div className="relative border border-border rounded-lg p-3 bg-muted/30">
                    <button type="button" onClick={clearAttachment} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                    {attachmentType === 'image' && attachmentPreview && (
                      <img src={attachmentPreview} alt="preview" className="max-h-40 rounded-md object-cover" />
                    )}
                    {attachmentType === 'video' && attachmentPreview && (
                      <video src={attachmentPreview} controls className="max-h-40 rounded-md w-full" />
                    )}
                    {attachmentType === 'file' && (
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Paperclip className="h-4 w-4 text-primary" />
                        {attachment.name}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || uploading}>
                    {uploading ? "Uploading..." : isSubmitting ? "Creating..." : "Create Discussion"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {discussions.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-2xl border border-dashed border-border">
          <MessageSquare className="h-14 w-14 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium text-foreground mb-2">No discussions yet</p>
          <p className="text-sm text-muted-foreground mb-6">Be the first to start a conversation in this community.</p>
          {isMember ? (
            <Button onClick={() => setIsDialogOpen(true)}>
              Start the First Discussion
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">Join the community to start a discussion</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {discussions.map((discussion) => {
            const isAuthor = currentUserId === discussion.user_id;
            const canDelete = isAuthor || isModerator;

            return (
              <div
                key={discussion.id}
                className="bg-card border border-border rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all group"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
                    {(discussion.author_name || 'U').charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {discussion.author_name || 'Community Member'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {discussion.is_pinned && (
                            <Badge variant="secondary" className="gap-1 text-xs py-0">
                              <Pin className="h-2.5 w-2.5" /> Pinned
                            </Badge>
                          )}
                          {discussion.is_locked && (
                            <Badge variant="outline" className="gap-1 text-xs py-0">
                              <Lock className="h-2.5 w-2.5" /> Locked
                            </Badge>
                          )}
                        </div>
                      </div>
                      {canDelete && onDeleteDiscussion && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if (confirm('Delete this discussion?')) onDeleteDiscussion(discussion.id);
                          }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-foreground mt-2 text-base">
                      {discussion.title}
                    </h3>

                    {/* Content preview */}
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: discussion.content }}
                    />

                    {/* Attachment preview */}
                    {discussion.attachment_url && discussion.attachment_type && (
                      <div className="mt-3">
                        {discussion.attachment_type === 'image' && (
                          <img
                            src={discussion.attachment_url}
                            alt={discussion.attachment_name || 'image'}
                            className="rounded-lg max-h-52 w-auto object-cover border border-border"
                          />
                        )}
                        {discussion.attachment_type === 'video' && (
                          <video
                            src={discussion.attachment_url}
                            controls
                            className="rounded-lg max-h-52 w-full border border-border"
                          />
                        )}
                        {discussion.attachment_type === 'file' && (
                          <a href={discussion.attachment_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline border border-border rounded-lg px-3 py-2 bg-muted/30 mt-2">
                            <Paperclip className="h-4 w-4" />
                            {discussion.attachment_name || 'Attachment'}
                          </a>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {discussion.reply_count} {discussion.reply_count === 1 ? 'reply' : 'replies'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
                        </span>
                      </div>

                      <Link
                        to={`/community/${communitySlug}/discussion/${discussion.id}`}
                        className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors group-hover:underline"
                      >
                        Read & Reply
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommunityDiscussions;
