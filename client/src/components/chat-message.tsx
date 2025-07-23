import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useSocket } from "@/hooks/use-socket";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { Reply } from "lucide-react";

interface ChatMessageProps {
  message: {
    id: number;
    content: string;
    likes: number;
    hearts: number;
    fires: number;
    createdAt: string;
    replyToId?: number | null;
    mentionedUsers?: string[] | null;
    user: {
      id: number;
      displayName: string;
      status: string;
      profilePicture?: string | null;
      email?: string;
    };
    replyTo?: {
      id: number;
      content: string;
      user: {
        id: number;
        displayName: string;
        status: string;
        profilePicture?: string | null;
      };
    };
  };
  onReply?: (messageId: number, content: string, user: { displayName: string }) => void;
}

export default function ChatMessage({ message, onReply }: ChatMessageProps) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  
  const isOwnMessage = user?.id === message.user.id;
  const isAdmin = message.user.email === 'allainacol@gmail.com';

  const reactionMutation = useMutation({
    mutationFn: async (type: string) => {
      const res = await apiRequest("POST", `/api/messages/${message.id}/react`, { type });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      
      // Broadcast reaction update via WebSocket
      if (socket) {
        socket.send(JSON.stringify({
          type: "reaction",
          data: { messageId: message.id, reactions: data }
        }));
      }
    },
  });

  const handleReaction = (type: string) => {
    if (user) {
      reactionMutation.mutate(type);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "royal":
        return <span className="status-badge royal">👑 Royal</span>;
      case "hacker":
        return <span className="status-badge hacker">💻 Hacker</span>;
      default:
        return <span className="status-badge member">👤 Member</span>;
    }
  };

  const getAvatarGradient = (status: string) => {
    switch (status) {
      case "royal":
        return "linear-gradient(45deg, var(--matrix-green), var(--matrix-dark))";
      case "hacker":
        return "linear-gradient(45deg, #3b82f6, #8b5cf6)";
      default:
        return "linear-gradient(45deg, #ec4899, #ef4444)";
    }
  };

  const displayAvatar = message.user.profilePicture || message.user.displayName[0]?.toUpperCase();

  const handleReplyClick = () => {
    if (onReply) {
      onReply(message.id, message.content, message.user);
    }
  };

  // Parse mentions in message content
  const renderMessageContent = (content: string) => {
    // Simple mention parsing - looks for @username patterns
    const mentionRegex = /@(\w+)/g;
    const parts = content.split(mentionRegex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is a username from a mention
        return (
          <span key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-1 rounded">
            @{part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className={`flex w-full mb-2 group ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-2 max-w-[80%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar - only show for others' messages */}
        {!isOwnMessage && (
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-xs flex-shrink-0 mt-auto"
            style={{ background: getAvatarGradient(message.user.status) }}
          >
            {displayAvatar}
          </div>
        )}
        
        {/* Message bubble */}
        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          {/* User name - only for others' messages */}
          {!isOwnMessage && (
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className={`font-medium text-xs ${isAdmin ? 'text-yellow-600' : 'text-primary'}`}>
                {isAdmin ? '👑 ' : ''}{message.user.displayName}
                {isAdmin && ' (Creator)'}
              </span>
            </div>
          )}
          
          {/* Reply indicator */}
          {message.replyTo && (
            <div className={`mb-2 border-l-2 border-gray-300 dark:border-gray-600 pl-2 text-xs opacity-75 ${
              isOwnMessage ? 'mr-2' : 'ml-2'
            }`}>
              <div className="flex items-center gap-1 mb-1">
                <Reply size={12} />
                <span className="font-medium">{message.replyTo.user.displayName}</span>
              </div>
              <p className="truncate max-w-xs">
                {message.replyTo.content}
              </p>
            </div>
          )}

          {/* Message bubble */}
          <div 
            className={`rounded-2xl px-3 py-2 shadow-sm max-w-full break-words relative ${
              isOwnMessage 
                ? 'bg-green-500 text-white rounded-br-md' 
                : 'bg-white dark:bg-gray-700 text-foreground rounded-bl-md border'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {renderMessageContent(message.content)}
            </p>
            
            {/* Timestamp */}
            <div className={`flex items-center justify-end gap-2 mt-1`}>
              <span className={`text-xs ${isOwnMessage ? 'text-green-100' : 'text-muted-foreground'}`}>
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {isOwnMessage && (
                <span className="text-green-100 text-xs">✓✓</span>
              )}
            </div>
          </div>
          
          {/* Reactions display */}
          {(message.likes > 0 || message.hearts > 0 || message.fires > 0) && (
            <div className="flex items-center gap-1 mt-1 px-2">
              {message.likes > 0 && (
                <span className="text-xs bg-muted rounded-full px-2 py-1 cursor-pointer" onClick={() => handleReaction("like")}>
                  👍{message.likes}
                </span>
              )}
              {message.hearts > 0 && (
                <span className="text-xs bg-muted rounded-full px-2 py-1 cursor-pointer" onClick={() => handleReaction("heart")}>
                  ❤️{message.hearts}
                </span>
              )}
              {message.fires > 0 && (
                <span className="text-xs bg-muted rounded-full px-2 py-1 cursor-pointer" onClick={() => handleReaction("fire")}>
                  🔥{message.fires}
                </span>
              )}
            </div>
          )}
          
          {/* Action buttons on hover */}
          <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReplyClick}
              className="h-auto p-1 text-xs hover:bg-secondary"
            >
              <Reply size={12} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction("like")}
              className="h-auto p-1 text-xs hover:bg-secondary"
            >
              👍
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction("heart")}
              className="h-auto p-1 text-xs hover:bg-secondary"
            >
              ❤️
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction("fire")}
              className="h-auto p-1 text-xs hover:bg-secondary"
            >
              🔥
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
