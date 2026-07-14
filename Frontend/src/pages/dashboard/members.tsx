import { useEffect, useState } from "react";
import { 
  useListMembers, 
  useUpdateMember, 
  useDeleteMember,
  MemberStatus,
  ListMembersStatus
} from "@workspace/api-client-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListMembersQueryKey } from "@workspace/api-client-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreHorizontal, Search, Trash2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DashboardMembers() {
  const [statusFilter, setStatusFilter] = useState<ListMembersStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const queryParams = {
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(debouncedSearch && { search: debouncedSearch }),
  };

  const { data, isLoading } = useListMembers(queryParams);
  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();

  const handleUpdateStatus = (id: number, status: MemberStatus) => {
    updateMember.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          toast({ title: `Member status updated to ${status}` });
          queryClient.invalidateQueries({ queryKey: getListMembersQueryKey() });
        },
        onError: () => {
          toast({ title: "Failed to update member status", variant: "destructive" });
        }
      }
    );
  };

  const handleDelete = () => {
    if (!memberToDelete) return;
    deleteMember.mutate(
      { id: memberToDelete },
      {
        onSuccess: () => {
          toast({ title: "Member deleted successfully" });
          setMemberToDelete(null);
          queryClient.invalidateQueries({ queryKey: getListMembersQueryKey() });
        },
        onError: () => {
          toast({ title: "Failed to delete member", variant: "destructive" });
          setMemberToDelete(null);
        }
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">Active</Badge>;
      case "pending": return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20">Pending</Badge>;
      case "suspended": return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20">Suspended</Badge>;
      case "rejected": return <Badge className="bg-muted text-muted-foreground border-border">Rejected</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground mt-1">Manage society members and their registration status.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-card p-4 rounded-lg shadow-sm border border-border/50">
        <Tabs defaultValue="all" onValueChange={(v) => setStatusFilter(v as any)} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="suspended">Suspended</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name & Contact</TableHead>
              <TableHead>ID & Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Loading members...</TableCell>
              </TableRow>
            ) : data?.data && data.data.length > 0 ? (
              data.data.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="font-medium">{member.fullName}</div>
                    <div className="text-xs text-muted-foreground">{member.email}</div>
                    <div className="text-xs text-muted-foreground">{member.phone}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">ID: {member.nationalId}</div>
                    <div className="text-xs text-muted-foreground">{member.occupation}</div>
                    <div className="text-xs text-muted-foreground">{member.address}</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(member.status)}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(member.createdAt), "MMM d, yyyy")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {member.status !== "active" && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(member.id, "active")}>
                            <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
                            Approve/Activate
                          </DropdownMenuItem>
                        )}
                        
                        {member.status !== "suspended" && member.status !== "pending" && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(member.id, "suspended")}>
                            <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                            Suspend
                          </DropdownMenuItem>
                        )}
                        
                        {member.status === "pending" && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(member.id, "rejected")}>
                            <XCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                            Reject
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => setMemberToDelete(member.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!memberToDelete} onOpenChange={(o) => !o && setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the member
              account and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
