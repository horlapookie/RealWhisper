import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useSocket } from "@/hooks/use-socket";
import { apiRequest } from "@/lib/queryClient";
import { insertMessageSchema, type InsertMessage } from "@shared/schema";
import { Send, X, Reply, User } from "lucide-react";

interface ReplyingTo {
  messageId: number;
  content: string;
  user: { displayName: string };
}

interface EnhancedMessageInputProps {
  replyingTo?: ReplyingTo | null;
  onCancelReply?: () => void;
}

export default function EnhancedMessageInput({ replyingTo, onCancelReply }: EnhancedMessageInputProps) {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const { socket } = useSocket();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertMessage>({
    resolver: zodResolver(insertMessageSchema),
    defaultValues: { content: "", replyToId: undefined, mentionedUsers: [] },
  });

  // Fetch all users for mentions
  const { data: allUsers = [] } = useQuery<Array<{
    id: number;
    displayName: string;
    status: string;
    profilePicture?: string | null;
  }>>({
    queryKey: ["/api/users"],
  });

  // Filter users based on mention query
  const filteredUsers = allUsers.filter(u => 
    u.displayName.toLowerCase().includes(mentionQuery.toLowerCase()) && u.id !== user?.id
  );

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: InsertMessage) => {
      const res = await apiRequest("POST", "/api/messages", data);
      return res.json();
    },
    onSuccess: (newMessage) => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      
      // Broadcast via WebSocket
      if (socket) {
        socket.send(JSON.stringify({
          type: "new_message",
          data: newMessage
        }));
      }

      // Cancel reply if active
      if (onCancelReply) {
        onCancelReply();
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertMessage) => {
    if (data.content.trim()) {
      // Extract mentioned users from content
      const mentionRegex = /@(\w+)/g;
      const mentions: string[] = [];
      let match: RegExpExecArray | null;
      while ((match = mentionRegex.exec(data.content)) !== null) {
        const mentionedUser = allUsers.find(u => u.displayName.toLowerCase() === match![1].toLowerCase());
        if (mentionedUser) {
          mentions.push(mentionedUser.id.toString());
        }
      }

      sendMessageMutation.mutate({
        content: data.content,
        replyToId: replyingTo?.messageId,
        mentionedUsers: mentions.length > 0 ? mentions : undefined,
      });
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart;
    
    form.setValue("content", value);
    setCursorPosition(position);

    // Check for @ mentions
    const textBeforeCursor = value.slice(0, position);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      if (!textAfterAt.includes(' ') && textAfterAt.length <= 20) {
        setMentionQuery(textAfterAt);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (username: string) => {
    const currentValue = form.getValues("content");
    const textBeforeCursor = currentValue.slice(0, cursorPosition);
    const textAfterCursor = currentValue.slice(cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const newValue = currentValue.slice(0, lastAtIndex) + `@${username} ` + textAfterCursor;
      form.setValue("content", newValue);
      setShowMentions(false);
      
      // Focus back to textarea
      setTimeout(() => {
        textareaRef.current?.focus();
        const newPosition = lastAtIndex + username.length + 2;
        textareaRef.current?.setSelectionRange(newPosition, newPosition);
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Enter key to submit
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
    
    // Handle Escape to close mentions or cancel reply
    if (e.key === 'Escape') {
      if (showMentions) {
        setShowMentions(false);
      } else if (replyingTo && onCancelReply) {
        onCancelReply();
      }
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [form.watch("content")]);

  return (
    <div className="relative">
      {/* Reply indicator */}
      {replyingTo && (
        <Card className="p-2 mb-2 bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Reply size={16} />
              <span className="text-muted-foreground">Replying to</span>
              <span className="font-medium">{replyingTo.user.displayName}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelReply}
              className="h-auto p-1"
            >
              <X size={16} />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {replyingTo.content}
          </p>
        </Card>
      )}

      {/* Mentions dropdown */}
      {showMentions && filteredUsers.length > 0 && (
        <Card className="absolute bottom-full mb-2 p-2 max-h-40 overflow-y-auto z-10 w-full">
          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <User size={12} />
            Mention someone
          </div>
          {filteredUsers.slice(0, 5).map((user) => (
            <button
              key={user.id}
              onClick={() => insertMention(user.displayName)}
              className="w-full text-left p-2 rounded hover:bg-muted flex items-center gap-2"
            >
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                style={{ 
                  backgroundColor: user.status === 'royal' ? '#f59e0b' : 
                                  user.status === 'hacker' ? '#3b82f6' : '#ec4899'
                }}
              >
                {user.profilePicture || user.displayName[0]?.toUpperCase()}
              </div>
              <span className="text-sm">{user.displayName}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {user.status === 'royal' ? '👑' : user.status === 'hacker' ? '💻' : '👤'}
              </span>
            </button>
          ))}
        </Card>
      )}

      {/* Message input */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            {...form.register("content")}
            placeholder="Type a message... Use @username to mention someone"
            className={`min-h-[40px] max-h-32 resize-none pr-12 ${
              replyingTo ? 'rounded-lg' : 'rounded-2xl'
            }`}
            onKeyDown={handleKeyDown}
            onChange={handleTextareaChange}
            ref={textareaRef}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!form.watch("content")?.trim() || sendMessageMutation.isPending}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full p-0"
          >
            <Send size={16} />
          </Button>
        </div>
      </form>
      
      {/* Help text */}
      <div className="text-xs text-muted-foreground mt-1 px-1">
        Press Enter to send • Shift+Enter for new line • @ to mention • Reply to messages
      </div>
    </div>
  );
}