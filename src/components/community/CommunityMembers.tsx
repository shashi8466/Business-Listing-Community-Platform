import { useState, useEffect } from "react";
import { Users, Shield, Crown, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CommunityMember } from "@/types/community";

interface CommunityMembersProps {
  communityId: string;
}

const CommunityMembers = ({ communityId }: CommunityMembersProps) => {
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('community_members')
          .select('*')
          .eq('community_id', communityId)
          .order('role', { ascending: true })
          .order('joined_at', { ascending: true });

        if (error) throw error;
        setMembers((data as CommunityMember[]) || []);
      } catch (err) {
        console.error('Error fetching members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [communityId]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-accent" />;
      case 'moderator':
        return <Shield className="h-4 w-4 text-primary" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-accent text-accent-foreground">Admin</Badge>;
      case 'moderator':
        return <Badge variant="secondary">Moderator</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl animate-pulse">
            <div className="w-12 h-12 bg-muted rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-muted rounded w-1/3 mb-2" />
              <div className="h-3 bg-muted rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const admins = members.filter((m) => m.role === 'admin');
  const moderators = members.filter((m) => m.role === 'moderator');
  const regularMembers = members.filter((m) => m.role === 'member');

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-6">
        Members ({members.length})
      </h2>

      {members.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-xl">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No members yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Admins */}
          {admins.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Admins ({admins.length})
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {admins.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            </div>
          )}

          {/* Moderators */}
          {moderators.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Moderators ({moderators.length})
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {moderators.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            </div>
          )}

          {/* Members */}
          {regularMembers.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Members ({regularMembers.length})
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {regularMembers.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MemberCard = ({ member }: { member: CommunityMember }) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <User className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">
            Member
          </span>
          {member.role !== 'member' && (
            <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
              {member.role}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Joined {new Date(member.joined_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default CommunityMembers;
