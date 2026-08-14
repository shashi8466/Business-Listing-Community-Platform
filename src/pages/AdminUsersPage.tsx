import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { 
  Users, Search, ShieldAlert, User, ShieldCheck, Shield, MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/types";

const AdminUsersPage = () => {
  const { users, loading, changeUserRole, deleteUserRecord } = useAdminUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const { toast } = useToast();

  const filteredUsers = users.filter((u) => {
    const matchesSearch = !searchQuery || 
      u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await changeUserRole(userId, newRole);
      toast({
        title: "Role Updated",
        description: `User role changed to ${newRole}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user record? This action cannot be undone.")) {
      try {
        await deleteUserRecord(userId);
        toast({
          title: "User Deleted",
          description: "The user record has been removed from the database.",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-500 hover:bg-purple-600"><ShieldCheck className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'business':
        return <Badge className="bg-blue-500 hover:bg-blue-600"><Shield className="h-3 w-3 mr-1" />Business</Badge>;
      case 'user':
      default:
        return <Badge variant="secondary"><User className="h-3 w-3 mr-1" />Member</Badge>;
    }
  };

  const roleCounts = {
    all: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    business: users.filter(u => u.role === 'business').length,
    user: users.filter(u => u.role === 'user').length,
  };

  return (
    <>
      <Helmet>
        <title>Manage Users | Admin | BusinessHub</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Manage Users
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage user accounts and roles
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={roleFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setRoleFilter("all")}
        >
          All Users ({roleCounts.all})
        </Button>
        <Button
          variant={roleFilter === "user" ? "default" : "outline"}
          size="sm"
          onClick={() => setRoleFilter("user")}
        >
          Members ({roleCounts.user})
        </Button>
        <Button
          variant={roleFilter === "business" ? "default" : "outline"}
          size="sm"
          onClick={() => setRoleFilter("business")}
        >
          Business Owners ({roleCounts.business})
        </Button>
        <Button
          variant={roleFilter === "admin" ? "default" : "outline"}
          size="sm"
          onClick={() => setRoleFilter("admin")}
        >
          Admins ({roleCounts.admin})
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="h-10 w-10 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No users found</h2>
              <p className="text-muted-foreground">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                          {u.displayName?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {u.displayName || 'No Name'}
                          </p>
                          <p className="text-xs text-muted-foreground max-w-[150px] truncate">
                            ID: {u.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.email}
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(u.role)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.createdAt && !isNaN(new Date(u.createdAt).getTime()) 
                        ? new Date(u.createdAt).toLocaleDateString() 
                        : 'Unknown'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                          <DropdownMenuItem 
                            onClick={() => handleRoleChange(u.id, 'user')}
                            disabled={u.role === 'user'}
                          >
                            <User className="h-4 w-4 mr-2" /> Make Member
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleRoleChange(u.id, 'business')}
                            disabled={u.role === 'business'}
                          >
                            <Shield className="h-4 w-4 mr-2" /> Make Business Owner
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleRoleChange(u.id, 'admin')}
                            disabled={u.role === 'admin'}
                          >
                            <ShieldCheck className="h-4 w-4 mr-2" /> Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(u.id)}
                            className="text-destructive"
                          >
                            <ShieldAlert className="h-4 w-4 mr-2" /> Delete Record
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default AdminUsersPage;
