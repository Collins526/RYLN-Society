import { useState } from "react";
import { 
  useListLeadership,
  useCreateLeadershipMember,
  useUpdateLeadershipMember,
  useDeleteLeadershipMember,
  getListLeadershipQueryKey
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react";
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
import { apiUrl } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  position: z.string().min(1, "Position is required"),
  bio: z.string().min(1, "Bio is required"),
  photoUrl: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
});

type FormValues = z.infer<typeof formSchema>;

export default function DashboardLeadership() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useListLeadership();
  const createLeader = useCreateLeadershipMember();
  const updateLeader = useUpdateLeadershipMember();
  const deleteLeader = useDeleteLeadershipMember();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      position: "",
      bio: "",
      photoUrl: "",
      sortOrder: 0,
    },
  });

  const uploadPhotoFile = async () => {
    if (!selectedFile) return undefined;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      const token = localStorage.getItem("ryln_token");
      const response = await fetch(apiUrl("/api/leadership/upload"), {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error ?? response.statusText);
      }

      const result = await response.json();
      return result.imageUrl as string;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    let photoUrl = values.photoUrl;

    if (!editingId && !selectedFile) {
      toast({ title: "Please upload a photo file.", variant: "destructive" });
      return;
    }

    if (selectedFile) {
      try {
        photoUrl = await uploadPhotoFile();
      } catch (error) {
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Unable to upload image.",
          variant: "destructive",
        });
        return;
      }
    }

    const payload = {
      ...values,
      photoUrl,
    };

    if (editingId) {
      updateLeader.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => {
            toast({ title: "Leadership member updated" });
            queryClient.invalidateQueries({ queryKey: getListLeadershipQueryKey() });
            setIsDialogOpen(false);
            form.reset();
            setSelectedFile(null);
            setEditingId(null);
          },
        }
      );
    } else {
      createLeader.mutate(
        { data: payload },
        {
          onSuccess: () => {
            toast({ title: "Leadership member added" });
            queryClient.invalidateQueries({ queryKey: getListLeadershipQueryKey() });
            setIsDialogOpen(false);
            form.reset();
            setSelectedFile(null);
          },
        }
      );
    }
  };

  const handleEdit = (leader: any) => {
    setEditingId(leader.id);
    form.reset({
      name: leader.name,
      position: leader.position,
      bio: leader.bio,
      photoUrl: leader.photoUrl || "",
      sortOrder: leader.sortOrder,
    });
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleDelete = () => {
    if (!deletingId) return;
    deleteLeader.mutate(
      { id: deletingId },
      {
        onSuccess: () => {
          toast({ title: "Leadership member deleted" });
          queryClient.invalidateQueries({ queryKey: getListLeadershipQueryKey() });
          setDeletingId(null);
        },
      }
    );
  };

  const openNewDialog = () => {
    setEditingId(null);
    form.reset({ name: "", position: "", bio: "", photoUrl: "", sortOrder: 0 });
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leadership Team</h1>
          <p className="text-muted-foreground mt-1">Manage the society's leadership profiles shown on the About page.</p>
        </div>
        <Button onClick={openNewDialog}>
          <Plus className="mr-2 h-4 w-4" /> Add Team Member
        </Button>
      </div>

      <div className="bg-card rounded-lg shadow-sm border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Photo</TableHead>
              <TableHead>Name & Position</TableHead>
              <TableHead>Bio Snippet</TableHead>
              <TableHead className="w-20 text-center">Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Loading team members...</TableCell>
              </TableRow>
            ) : data && data.length > 0 ? (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={item.photoUrl || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {item.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.position}</div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate text-sm text-muted-foreground" title={item.bio}>
                      {item.bio}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-medium">{item.sortOrder}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeletingId(item.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No leadership members found. Add one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input placeholder="Chairperson" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3 space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Photo File
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setSelectedFile(file);
                      if (file) {
                        form.setValue("photoUrl", "");
                      }
                    }}
                  />
                  <p className="text-sm text-muted-foreground">
                    {selectedFile ? `Selected: ${selectedFile.name}` : "Upload a profile photo for this leadership member."}
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biography</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief biography..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end pt-4">
                <Button type="button" variant="outline" className="mr-2" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createLeader.isPending || updateLeader.isPending || isUploading}>
                  {editingId ? "Save Changes" : "Add Member"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this leadership member profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
