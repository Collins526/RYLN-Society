import { useState } from "react";
import { 
  useListContactMessages,
  useMarkMessageRead,
  getListContactMessagesQueryKey
} from "@workspace/api-client-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, MailOpen } from "lucide-react";

export default function DashboardMessages() {
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useListContactMessages();
  const markRead = useMarkMessageRead();

  const handleViewMessage = (message: any) => {
    setSelectedMessage(message);
    if (!message.read) {
      markRead.mutate(
        { id: message.id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListContactMessagesQueryKey() });
          }
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contact Messages</h1>
          <p className="text-muted-foreground mt-1">View messages sent through the website contact form.</p>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>From</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Loading messages...</TableCell>
              </TableRow>
            ) : data?.data && data.data.length > 0 ? (
              data.data.map((msg) => (
                <TableRow key={msg.id} className={!msg.read ? "bg-primary/5 font-medium" : ""}>
                  <TableCell>
                    {!msg.read ? (
                      <Badge className="bg-primary">New</Badge>
                    ) : (
                      <Badge variant="outline">Read</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className={!msg.read ? "font-bold text-foreground" : "font-medium"}>{msg.fullName}</div>
                    <div className="text-xs text-muted-foreground">{msg.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] sm:max-w-md truncate" title={msg.subject}>
                      {msg.subject}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(msg.createdAt), "MMM d, yyyy")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewMessage(msg)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No messages found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedMessage} onOpenChange={(o) => !o && setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl border-b pb-4">{selectedMessage.subject}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-foreground">{selectedMessage.fullName}</div>
                    <div className="text-sm text-primary">{selectedMessage.email}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(selectedMessage.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </div>
                </div>
                <div className="bg-muted/30 p-4 rounded-md whitespace-pre-wrap text-sm border">
                  {selectedMessage.message}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
