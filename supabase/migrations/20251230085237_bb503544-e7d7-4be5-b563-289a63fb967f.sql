-- Create app role enum for community roles
CREATE TYPE public.community_role AS ENUM ('admin', 'moderator', 'member');

-- Create community type enum
CREATE TYPE public.community_type AS ENUM ('city', 'interest');

-- Create content report status enum
CREATE TYPE public.report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');

-- Create RSVP status enum
CREATE TYPE public.rsvp_status AS ENUM ('going', 'interested', 'not_going');

-- =====================
-- COMMUNITIES TABLE
-- =====================
CREATE TABLE public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  type community_type NOT NULL,
  city TEXT,
  interest TEXT,
  image_url TEXT,
  cover_image_url TEXT,
  rules TEXT,
  member_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================
-- COMMUNITY MEMBERS TABLE
-- =====================
CREATE TABLE public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role community_role DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- =====================
-- DISCUSSIONS TABLE
-- =====================
CREATE TABLE public.discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================
-- DISCUSSION COMMENTS TABLE
-- =====================
CREATE TABLE public.discussion_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID NOT NULL REFERENCES public.discussions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.discussion_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================
-- DISCUSSION REACTIONS TABLE
-- =====================
CREATE TABLE public.discussion_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID NOT NULL REFERENCES public.discussions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(discussion_id, user_id, reaction_type)
);

-- =====================
-- COMMENT LIKES TABLE
-- =====================
CREATE TABLE public.comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.discussion_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- =====================
-- COMMUNITY EVENTS TABLE
-- =====================
CREATE TABLE public.community_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  is_virtual BOOLEAN DEFAULT false,
  virtual_link TEXT,
  image_url TEXT,
  max_attendees INTEGER,
  rsvp_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================
-- EVENT RSVPS TABLE
-- =====================
CREATE TABLE public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.community_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status rsvp_status NOT NULL DEFAULT 'going',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- =====================
-- CONTENT REPORTS TABLE
-- =====================
CREATE TABLE public.content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL, -- 'discussion', 'comment', 'event', 'member'
  content_id UUID NOT NULL,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status report_status DEFAULT 'pending',
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================
-- MEMBER FOLLOWS TABLE (for activity feed)
-- =====================
CREATE TABLE public.member_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- =====================
-- ENABLE RLS ON ALL TABLES
-- =====================
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_follows ENABLE ROW LEVEL SECURITY;

-- =====================
-- SECURITY DEFINER FUNCTIONS
-- =====================

-- Check if user is a community member
CREATE OR REPLACE FUNCTION public.is_community_member(_user_id UUID, _community_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_members
    WHERE user_id = _user_id AND community_id = _community_id
  )
$$;

-- Check if user has specific community role
CREATE OR REPLACE FUNCTION public.has_community_role(_user_id UUID, _community_id UUID, _role community_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_members
    WHERE user_id = _user_id 
      AND community_id = _community_id 
      AND role = _role
  )
$$;

-- Check if user is community admin or moderator
CREATE OR REPLACE FUNCTION public.is_community_moderator(_user_id UUID, _community_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_members
    WHERE user_id = _user_id 
      AND community_id = _community_id 
      AND role IN ('admin', 'moderator')
  )
$$;

-- =====================
-- RLS POLICIES - COMMUNITIES
-- =====================
CREATE POLICY "Communities are viewable by everyone" ON public.communities
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create communities" ON public.communities
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Community admins can update their community" ON public.communities
  FOR UPDATE TO authenticated
  USING (public.has_community_role(auth.uid(), id, 'admin'));

-- =====================
-- RLS POLICIES - COMMUNITY MEMBERS
-- =====================
CREATE POLICY "Members are viewable by everyone" ON public.community_members
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join communities" ON public.community_members
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND role = 'member');

CREATE POLICY "Users can leave communities" ON public.community_members
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Community admins can manage members" ON public.community_members
  FOR UPDATE TO authenticated
  USING (public.is_community_moderator(auth.uid(), community_id));

CREATE POLICY "Community admins can remove members" ON public.community_members
  FOR DELETE TO authenticated
  USING (public.is_community_moderator(auth.uid(), community_id));

-- =====================
-- RLS POLICIES - DISCUSSIONS
-- =====================
CREATE POLICY "Discussions are viewable by everyone" ON public.discussions
  FOR SELECT USING (true);

CREATE POLICY "Community members can create discussions" ON public.discussions
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND 
    public.is_community_member(auth.uid(), community_id)
  );

CREATE POLICY "Authors can update their discussions" ON public.discussions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_community_moderator(auth.uid(), community_id));

CREATE POLICY "Authors and moderators can delete discussions" ON public.discussions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_community_moderator(auth.uid(), community_id));

-- =====================
-- RLS POLICIES - COMMENTS
-- =====================
CREATE POLICY "Comments are viewable by everyone" ON public.discussion_comments
  FOR SELECT USING (true);

CREATE POLICY "Community members can create comments" ON public.discussion_comments
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM public.discussions d
      WHERE d.id = discussion_id
      AND public.is_community_member(auth.uid(), d.community_id)
    )
  );

CREATE POLICY "Authors can update their comments" ON public.discussion_comments
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authors and moderators can delete comments" ON public.discussion_comments
  FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.discussions d
      WHERE d.id = discussion_id
      AND public.is_community_moderator(auth.uid(), d.community_id)
    )
  );

-- =====================
-- RLS POLICIES - REACTIONS
-- =====================
CREATE POLICY "Reactions are viewable by everyone" ON public.discussion_reactions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add reactions" ON public.discussion_reactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their reactions" ON public.discussion_reactions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- =====================
-- RLS POLICIES - COMMENT LIKES
-- =====================
CREATE POLICY "Comment likes are viewable by everyone" ON public.comment_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like comments" ON public.comment_likes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their likes" ON public.comment_likes
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- =====================
-- RLS POLICIES - EVENTS
-- =====================
CREATE POLICY "Events are viewable by everyone" ON public.community_events
  FOR SELECT USING (true);

CREATE POLICY "Community members can create events" ON public.community_events
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND 
    public.is_community_member(auth.uid(), community_id)
  );

CREATE POLICY "Event creators and moderators can update events" ON public.community_events
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_community_moderator(auth.uid(), community_id));

CREATE POLICY "Event creators and moderators can delete events" ON public.community_events
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_community_moderator(auth.uid(), community_id));

-- =====================
-- RLS POLICIES - RSVPs
-- =====================
CREATE POLICY "RSVPs are viewable by everyone" ON public.event_rsvps
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can RSVP" ON public.event_rsvps
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their RSVP" ON public.event_rsvps
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can cancel their RSVP" ON public.event_rsvps
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- =====================
-- RLS POLICIES - REPORTS
-- =====================
CREATE POLICY "Users can view their own reports" ON public.content_reports
  FOR SELECT TO authenticated
  USING (
    reporter_id = auth.uid() OR 
    public.is_community_moderator(auth.uid(), community_id)
  );

CREATE POLICY "Authenticated users can create reports" ON public.content_reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Moderators can update reports" ON public.content_reports
  FOR UPDATE TO authenticated
  USING (public.is_community_moderator(auth.uid(), community_id));

-- =====================
-- RLS POLICIES - FOLLOWS
-- =====================
CREATE POLICY "Follows are viewable by everyone" ON public.member_follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON public.member_follows
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" ON public.member_follows
  FOR DELETE TO authenticated
  USING (auth.uid() = follower_id);

-- =====================
-- TRIGGERS FOR AUTO-UPDATE
-- =====================

-- Update member count on join/leave
CREATE OR REPLACE FUNCTION public.update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.communities SET member_count = member_count + 1 WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.communities SET member_count = member_count - 1 WHERE id = OLD.community_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_member_change
  AFTER INSERT OR DELETE ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION public.update_community_member_count();

-- Update reply count on discussion
CREATE OR REPLACE FUNCTION public.update_discussion_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.discussions SET reply_count = reply_count + 1 WHERE id = NEW.discussion_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.discussions SET reply_count = reply_count - 1 WHERE id = OLD.discussion_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_comment_change
  AFTER INSERT OR DELETE ON public.discussion_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_discussion_reply_count();

-- Update RSVP count on events
CREATE OR REPLACE FUNCTION public.update_event_rsvp_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'going' THEN
    UPDATE public.community_events SET rsvp_count = rsvp_count + 1 WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'going' THEN
    UPDATE public.community_events SET rsvp_count = rsvp_count - 1 WHERE id = OLD.event_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'going' AND NEW.status != 'going' THEN
      UPDATE public.community_events SET rsvp_count = rsvp_count - 1 WHERE id = NEW.event_id;
    ELSIF OLD.status != 'going' AND NEW.status = 'going' THEN
      UPDATE public.community_events SET rsvp_count = rsvp_count + 1 WHERE id = NEW.event_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_rsvp_change
  AFTER INSERT OR DELETE OR UPDATE ON public.event_rsvps
  FOR EACH ROW EXECUTE FUNCTION public.update_event_rsvp_count();

-- Update comment like count
CREATE OR REPLACE FUNCTION public.update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.discussion_comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.discussion_comments SET like_count = like_count - 1 WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_comment_like_change
  AFTER INSERT OR DELETE ON public.comment_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_comment_like_count();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_communities_updated_at
  BEFORE UPDATE ON public.communities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discussions_updated_at
  BEFORE UPDATE ON public.discussions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.discussion_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.community_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================
-- INDEXES FOR PERFORMANCE
-- =====================
CREATE INDEX idx_communities_type ON public.communities(type);
CREATE INDEX idx_communities_city ON public.communities(city);
CREATE INDEX idx_communities_interest ON public.communities(interest);
CREATE INDEX idx_communities_slug ON public.communities(slug);
CREATE INDEX idx_community_members_user ON public.community_members(user_id);
CREATE INDEX idx_community_members_community ON public.community_members(community_id);
CREATE INDEX idx_discussions_community ON public.discussions(community_id);
CREATE INDEX idx_discussions_user ON public.discussions(user_id);
CREATE INDEX idx_discussion_comments_discussion ON public.discussion_comments(discussion_id);
CREATE INDEX idx_community_events_community ON public.community_events(community_id);
CREATE INDEX idx_community_events_date ON public.community_events(event_date);
CREATE INDEX idx_content_reports_status ON public.content_reports(status);
CREATE INDEX idx_member_follows_follower ON public.member_follows(follower_id);
CREATE INDEX idx_member_follows_following ON public.member_follows(following_id);