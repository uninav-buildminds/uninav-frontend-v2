import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { fetchAllUsers } from "@/api/user.api";
import { UserProfile } from "@/lib/types/user.types";
import { UserRole } from "@/lib/types/response.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Users,
  Verified,
  Search,
  ChevronLeft,
  ChevronRight,
  Activity,
  Filter,
  Mail,
  UserCheck,
  Calendar,
} from "lucide-react";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const UserManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [verifiedUsers, setVerifiedUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [signupData, setSignupData] = useState<{ name: string; users: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const debouncedSearch = useDebounce(searchQuery, 400);
  const limitPerPage = 50;

  const loadUsers = useCallback(
    async (page: number, search: string, role: string) => {
      setIsLoading(true);
      try {
        const result = await fetchAllUsers(page, limitPerPage, search);
        const rawUsers = result.data;
        const filtered = role === "all" ? rawUsers : rawUsers.filter((u) => u.role === role);
        setUsers(filtered);
        setTotalUsers(result.total);
        setTotalPages(Math.max(1, Math.ceil(result.total / limitPerPage)));
        const verifiedCount = filtered.filter((u) => u.auth?.emailVerified).length;
        setVerifiedUsers(verifiedCount);
        const signupCounts: Record<string, number> = {};
        filtered.forEach((u) => {
          const date = new Date(u.createdAt).toLocaleDateString();
            signupCounts[date] = (signupCounts[date] || 0) + 1;
        });
        setSignupData(Object.entries(signupCounts).map(([name, users]) => ({ name, users })));
      } catch (e) {
        toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
        setUsers([]);
        setTotalUsers(0);
        setVerifiedUsers(0);
        setSignupData([]);
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    // Reset to page 1 if search or filter changes
    setCurrentPage(1);
  }, [debouncedSearch, roleFilter]);

  useEffect(() => {
    loadUsers(currentPage, debouncedSearch, roleFilter);
  }, [currentPage, debouncedSearch, roleFilter, loadUsers]);

  // Access control
  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR)) {
    return null;
  }

  const handlePreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Browse, filter, and analyze user accounts.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Roles</option>
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.MODERATOR}>Moderator</option>
              <option value={UserRole.STUDENT}>Student</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">All registered accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Verified (Page)</CardTitle>
            <Verified className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedUsers}</div>
            <p className="text-xs text-muted-foreground">Email verified on this page</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active (Placeholder)</CardTitle>
            <Activity className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-muted-foreground">Metrics coming soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Filter</CardTitle>
            <Filter className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Role filter active: <span className="font-medium capitalize">{roleFilter}</span></div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Users</CardTitle>
          <CardDescription>Showing {users.length} of {totalUsers} users</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Department</TableHead>
                  <TableHead className="hidden lg:table-cell">Level</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead className="hidden xl:table-cell">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!isLoading && users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      {debouncedSearch || roleFilter !== "all" ? "No users match your filters." : "No users found."}
                    </TableCell>
                  </TableRow>
                )}
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      Loading users...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && users.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{u.firstName} {u.lastName}</span>
                        <span className="text-xs text-muted-foreground md:hidden">{u.username}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{u.username}</TableCell>
                    <TableCell className="text-sm flex items-center gap-2">
                      <Mail size={14} className="text-muted-foreground" /> {u.email}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">{u.department?.name || '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell">{u.level}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                        u.role === UserRole.ADMIN ? 'bg-red-100 text-red-700' :
                        u.role === UserRole.MODERATOR ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>{u.role}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        u.auth?.emailVerified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>{u.auth?.emailVerified ? 'Yes' : 'No'}</span>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm flex items-center gap-1">
                      <Calendar size={14} className="text-muted-foreground" />
                      {new Date(u.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-t bg-muted/30 flex-col sm:flex-row">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1 || isLoading}>
                <ChevronLeft size={14} /> Prev
              </Button>
              <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages || isLoading}>
                Next <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementPage;