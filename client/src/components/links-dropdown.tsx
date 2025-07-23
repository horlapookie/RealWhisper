import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ExternalLink, Menu, Github, MessageCircle, Users, Gamepad2, Heart, Info } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export default function LinksDropdown() {
  const { theme, toggleTheme } = useTheme();

  const links = [
    {
      label: "WhatsApp Channel",
      url: "https://whatsapp.com/channel/0029Vb6AZrY2f3EMgD8kRQ01",
      icon: MessageCircle,
      description: "Join our official channel"
    },
    {
      label: "WhatsApp Group",
      url: "https://chat.whatsapp.com/GceMJ4DG4aW2n12dGrH20A?mode=ac_t",
      icon: Users,
      description: "Chat with community"
    },
    {
      label: "GitHub Profile",
      url: "https://github.com/horlapookie",
      icon: Github,
      description: "Follow on GitHub"
    },
    {
      label: "Bot Repository",
      url: "https://github.com/horlapookie/WhisperRoyalty",
      icon: Github,
      description: "Fork the bot code"
    },
    {
      label: "2048 Game",
      url: "https://2048-git-master-horlapookie.vercel.app/",
      icon: Gamepad2,
      description: "Play the game"
    },
    {
      label: "Pairing Site",
      url: "https://horlapair-olamilekans-projects-1c056653.vercel.app/",
      icon: Heart,
      description: "WhatsApp pairing tool"
    }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="h-10 px-3"
          style={{ borderColor: "var(--matrix-green)", color: "var(--matrix-green)" }}
        >
          <Menu className="h-4 w-4 mr-2" />
          Links
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-64"
        style={{ 
          backgroundColor: "var(--bg-secondary)", 
          borderColor: "var(--matrix-green)",
          color: "var(--text-primary)"
        }}
      >
        <DropdownMenuLabel className="flex items-center space-x-2" style={{ color: "var(--text-primary)" }}>
          <Info className="h-4 w-4" />
          <span>Quick Links</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator style={{ backgroundColor: "var(--matrix-green)" }} />
        
        {links.map((link, index) => (
          <DropdownMenuItem key={index} asChild>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start space-x-3 p-3 cursor-pointer hover:opacity-80 transition-colors rounded-sm"
              style={{ color: "var(--text-primary)" }}
            >
              <link.icon className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "var(--matrix-green)" }} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{link.label}</div>
                <div className="text-xs opacity-75">{link.description}</div>
              </div>
              <ExternalLink className="h-3 w-3 opacity-60 flex-shrink-0" />
            </a>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator style={{ backgroundColor: "var(--matrix-green)" }} />
        <DropdownMenuItem asChild>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center space-x-3 p-3 cursor-pointer hover:bg-opacity-80 transition-colors"
            style={{ color: "var(--text-primary)" }}
          >
            <div className="h-4 w-4 rounded-full border-2 flex-shrink-0" style={{ borderColor: "var(--matrix-green)" }}>
              <div 
                className={`h-full w-full rounded-full transition-colors ${theme === 'dark' ? 'bg-current' : 'bg-transparent'}`}
                style={{ color: "var(--matrix-green)" }}
              ></div>
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-sm">Switch to {theme === 'dark' ? 'Light' : 'Dark'}</div>
              <div className="text-xs opacity-75">{theme === 'dark' ? 'White theme' : 'Black theme'}</div>
            </div>
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}