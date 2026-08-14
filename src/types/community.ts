export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: 'city' | 'interest';
  city: string | null;
  interest: string | null;
  image_url: string | null;
  cover_image_url: string | null;
  rules: string | null;
  member_count: number;
  is_featured: boolean;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
}

export interface Discussion {
  id: string;
  community_id: string;
  user_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  created_at: string;
  updated_at: string;
  // Attachment support
  attachment_url?: string | null;
  attachment_type?: 'image' | 'video' | 'file' | null;
  attachment_name?: string | null;
  // Resolved author info
  author_name?: string | null;
  author_email?: string;
}

export interface DiscussionComment {
  id: string;
  discussion_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  like_count: number;
  created_at: string;
  updated_at: string;
  // Attachment support
  attachment_url?: string | null;
  attachment_type?: 'image' | 'video' | 'file' | null;
  attachment_name?: string | null;
  // Resolved author info
  author_name?: string | null;
  author_email?: string;
}

export interface CommunityEvent {
  id: string;
  community_id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  location: string | null;
  is_virtual: boolean;
  virtual_link: string | null;
  image_url: string | null;
  max_attendees: number | null;
  rsvp_count: number;
  created_at: string;
  updated_at: string;
}

export interface EventRsvp {
  id: string;
  event_id: string;
  user_id: string;
  status: 'going' | 'interested' | 'not_going';
  created_at: string;
}

export interface ContentReport {
  id: string;
  content_type: 'discussion' | 'comment' | 'event' | 'member';
  content_id: string;
  community_id: string | null;
  reporter_id: string;
  reason: string;
  details: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_note: string | null;
  created_at: string;
}

export interface MemberFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

// Interest categories for communities
export const INTEREST_CATEGORIES = [
  { id: 'students', name: 'Students', icon: '🎓' },
  { id: 'professionals', name: 'Professionals', icon: '💼' },
  { id: 'entrepreneurs', name: 'Entrepreneurs', icon: '🚀' },
  { id: 'parents', name: 'Parents', icon: '👨‍👩‍👧' },
  { id: 'seniors', name: 'Seniors', icon: '👴' },
  { id: 'women', name: 'Women', icon: '👩' },
  { id: 'tech', name: 'Tech & IT', icon: '💻' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
  { id: 'arts', name: 'Arts & Culture', icon: '🎨' },
  { id: 'sports', name: 'Sports & Fitness', icon: '⚽' },
  { id: 'food', name: 'Food & Cooking', icon: '🍳' },
  { id: 'spirituality', name: 'Spirituality', icon: '🕉️' },
];
