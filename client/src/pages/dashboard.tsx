import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useSocket } from "@/hooks/use-socket";
import { useTheme } from "@/hooks/use-theme";
import ChatMessage from "@/components/chat-message";
import UserSidebar from "@/components/user-sidebar";
import ProfileDialog from "@/components/profile-dialog";
import LinksDropdown from "@/components/links-dropdown";
import BotInfoDialog from "@/components/bot-info-dialog";
import ChatBinaryBackground from "@/components/chat-binary-background";
import EnhancedMessageInput from "@/components/enhanced-message-input";
import { Moon, Sun, User, Eye, Users, MessageSquare } from "lucide-react";

interface ReplyingTo {
  messageId: number;
  content: string;
  user: { displayName: string };
}

export default function Dashboard() {
  // Removed announcement functionality
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ReplyingTo | null>(null);
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const { theme, toggleTheme } = useTheme();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Remove old form as it's now handled in EnhancedMessageInput

  // Fetch messages
  const { data: messages = [] } = useQuery<Array<{
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
  }>>({
    queryKey: ["/api/messages"],
  });

  // Remove announcement - no longer needed

  // Fetch stats
  const { data: stats } = useQuery<{ onlineUsers: number; visitorCount: number }>({
    queryKey: ["/api/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Remove old send message mutation as it's now handled in EnhancedMessageInput

  // Removed announcement mutation

  const scrollToBottom = () => {
    // Use smooth scrolling to the messages end reference
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleReply = (messageId: number, content: string, user: { displayName: string }) => {
    setReplyingTo({ messageId, content, user });
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  // Removed announcement save handler

  // Removed announcement functionality

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for real-time updates
  useEffect(() => {
    if (socket) {
      const handleMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        
        if (data.type === "new_message") {
          queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
        } else if (data.type === "online_users_update") {
          queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
        } else if (data.type === "reaction_update") {
          queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
        } else if (data.type === "profile_update") {
          queryClient.invalidateQueries({ queryKey: ["/api/users/online"] });
          queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
        }
      };

      socket.addEventListener("message", handleMessage);
      return () => socket.removeEventListener("message", handleMessage);
    }
  }, [socket, queryClient]);

  // Removed old handleKeyPress as it's now handled in EnhancedMessageInput

  // Removed old dragging functionality as we now use fixed enhanced message input

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      <ChatBinaryBackground />
      
      {/* Fixed Header - Always visible at top */}
      <header className="flex-shrink-0 border-b border-border bg-card/95 backdrop-blur-md p-3 md:p-4 relative z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <h1 className="text-lg md:text-xl font-medium bg-gradient-to-r from-primary to-secondary-teal bg-clip-text text-transparent">
              your hïghñëss
            </h1>
            <div className="hidden md:block">
              <BotInfoDialog />
            </div>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2">
            {/* Stats - compact on mobile */}
            <div className="hidden sm:flex items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground mr-2">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden md:inline">{stats?.onlineUsers || 0} online</span>
                <span className="md:hidden">{stats?.onlineUsers || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden md:inline">{stats?.visitorCount || 0} total</span>
                <span className="md:hidden">{stats?.visitorCount || 0}</span>
              </div>
            </div>
            
            {/* Links Dropdown */}
            <LinksDropdown />
            
            {/* Profile Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProfileDialog(true)}
              className="relative hover:bg-secondary p-1.5 md:p-2"
            >
              <User className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="relative hover:bg-secondary p-1.5 md:p-2"
            >
              {theme === "light" ? <Moon className="h-3 w-3 md:h-4 md:w-4" /> : <Sun className="h-3 w-3 md:h-4 md:w-4" />}
            </Button>
            
            {/* Logout Button */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={logout}
              className="border-border hover:bg-secondary text-xs md:text-sm px-2 md:px-3"
            >
              <span className="hidden md:inline">Logout</span>
              <span className="md:hidden">Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area - Fills remaining height */}
      <div className="flex-1 flex flex-row overflow-hidden">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden md:block flex-shrink-0">
          <UserSidebar />
        </div>

        {/* Chat Area - Scrollable messages only */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Scrollable Messages Area */}
          <div 
            className="flex-1 overflow-y-auto overflow-x-hidden px-3 md:px-4 scroll-smooth"
            style={{ 
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="py-4 space-y-2 pb-20 min-h-full">
              <div className="relative z-10 max-w-4xl mx-auto">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} onReply={handleReply} />
                ))}
                {messages.length === 0 && (
                  <div className="text-center py-8 md:py-12">
                    <MessageSquare className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground text-sm md:text-base">No messages yet. Start the conversation!</p>
                  </div>
                )}
                {/* Invisible element to scroll to */}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>

          {/* Fixed Message Input at Bottom */}
          <div className="flex-shrink-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border/20">
            <div className="max-w-4xl mx-auto">
              <EnhancedMessageInput 
                replyingTo={replyingTo} 
                onCancelReply={handleCancelReply} 
              />
            </div>
          </div>
        </main>
      </div>

      {/* Profile Dialog */}
      <ProfileDialog open={showProfileDialog} onOpenChange={setShowProfileDialog} />
    </div>
  );
}
