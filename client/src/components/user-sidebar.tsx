import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ExternalLink, Users } from "lucide-react";

interface OnlineUser {
  id: number;
  displayName: string;
  status: string;
  profilePicture?: string | null;
}

export default function UserSidebar() {
  const { data: onlineUsers = [] } = useQuery<OnlineUser[]>({
    queryKey: ["/api/users/online"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

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

  return (
    <aside className="w-64 border-r p-4 hidden lg:block" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "#374151" }}>
      <nav className="space-y-3 mb-8">
        <a
          href="https://whatsapp.com/channel/0029Vb6AZrY2f3EMgD8kRQ01"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-700 transition-colors glow-border"
        >
          <ExternalLink className="h-4 w-4" style={{ color: "var(--matrix-green)" }} />
          <span>📢 Join Our Channel</span>
        </a>
        
        <a
          href="https://chat.whatsapp.com/GceMJ4DG4aW2n12dGrH20A?mode=ac_t"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-700 transition-colors glow-border"
        >
          <ExternalLink className="h-4 w-4" style={{ color: "var(--matrix-green)" }} />
          <span>💬 Join Group Chat</span>
        </a>
        
        <a
          href="https://github.com/horlapookie"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-700 transition-colors glow-border"
        >
          <ExternalLink className="h-4 w-4" style={{ color: "var(--matrix-green)" }} />
          <span>⭐ Follow on GitHub</span>
        </a>
        
        <a
          href="https://github.com/horlapookie/WhisperRoyalty"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-700 transition-colors glow-border"
        >
          <ExternalLink className="h-4 w-4" style={{ color: "var(--matrix-green)" }} />
          <span>🍴 Fork Bot Repo</span>
        </a>
        
        <a
          href="https://2048-git-master-horlapookie.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-700 transition-colors glow-border"
        >
          <ExternalLink className="h-4 w-4" style={{ color: "var(--matrix-green)" }} />
          <span>🎮 Game to Play</span>
        </a>
        
        <a
          href="https://horlapair-olamilekans-projects-1c056653.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-700 transition-colors glow-border"
        >
          <ExternalLink className="h-4 w-4" style={{ color: "var(--matrix-green)" }} />
          <span>💕 Pairing Site</span>
        </a>
      </nav>
      
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center space-x-2" style={{ color: "var(--text-secondary)" }}>
          <Users className="h-4 w-4" />
          <span>Royal Members</span>
        </h3>
        <div className="space-y-2">
          {onlineUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-black text-sm font-bold"
                style={{ background: getAvatarGradient(user.status) }}
              >
                {user.profilePicture || user.displayName[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium truncate">{user.displayName}</span>
                  {getStatusBadge(user.status)}
                </div>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--matrix-green)" }}></div>
              </div>
            </div>
          ))}
          
          {onlineUsers.length === 0 && (
            <div className="text-center py-4" style={{ color: "var(--text-secondary)" }}>
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No users online</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
