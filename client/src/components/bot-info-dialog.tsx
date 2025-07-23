import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info, Bot, Zap, Shield, Gamepad2, Music, Code, Settings } from "lucide-react";

export default function BotInfoDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="h-10 px-3"
          style={{ borderColor: "var(--matrix-green)", color: "var(--matrix-green)" }}
        >
          <Info className="h-4 w-4 mr-2" />
          Bot Info
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="max-w-2xl max-h-[80vh]"
        style={{ 
          backgroundColor: "var(--bg-secondary)", 
          borderColor: "var(--matrix-green)",
          color: "var(--text-primary)"
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2" style={{ color: "var(--text-primary)" }}>
            <Bot className="h-5 w-5" style={{ color: "var(--matrix-green)" }} />
            <span>yourhïghness - WhatsApp Bot v1.0</span>
          </DialogTitle>
          <DialogDescription style={{ color: "var(--text-secondary)" }}>
            Advanced Multi-Purpose WhatsApp Bot with AI Integration
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 p-1">
            
            {/* Features Overview */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                <Zap className="h-4 w-4" style={{ color: "var(--matrix-green)" }} />
                <span>Key Features</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Bot className="h-4 w-4 mt-0.5" style={{ color: "var(--matrix-green)" }} />
                    <div>
                      <div className="font-medium">AI-Powered Intelligence</div>
                      <div className="text-sm opacity-75">Gemini AI integration for smart conversations</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Gamepad2 className="h-4 w-4 mt-0.5" style={{ color: "var(--matrix-green)" }} />
                    <div>
                      <div className="font-medium">Pokemon Universe</div>
                      <div className="text-sm opacity-75">Complete battle system with 4v4 strategic gameplay</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Shield className="h-4 w-4 mt-0.5" style={{ color: "var(--matrix-green)" }} />
                    <div>
                      <div className="font-medium">Ethical Hacking Toolkit</div>
                      <div className="text-sm opacity-75">Educational cybersecurity tools</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Music className="h-4 w-4 mt-0.5" style={{ color: "var(--matrix-green)" }} />
                    <div>
                      <div className="font-medium">Media Powerhouse</div>
                      <div className="text-sm opacity-75">Download music, videos, and social content</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Code className="h-4 w-4 mt-0.5" style={{ color: "var(--matrix-green)" }} />
                    <div>
                      <div className="font-medium">135+ Commands</div>
                      <div className="text-sm opacity-75">Comprehensive utility arsenal</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Settings className="h-4 w-4 mt-0.5" style={{ color: "var(--matrix-green)" }} />
                    <div>
                      <div className="font-medium">Auto Features</div>
                      <div className="text-sm opacity-75">View status, react, typing indicators</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Commands */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Popular Commands</h3>
              <div className="space-y-2 font-mono text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="font-semibold mb-2">🧠 AI & Intelligence</div>
                    <div className="space-y-1 text-xs opacity-75">
                      <div><code>.ai &lt;question&gt;</code> - Chat with Gemini AI</div>
                      <div><code>.translate &lt;text&gt; | &lt;lang&gt;</code> - Multi-language translation</div>
                      <div><code>.img &lt;prompt&gt;</code> - AI image generation</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold mb-2">⚔️ Pokemon Battles</div>
                    <div className="space-y-1 text-xs opacity-75">
                      <div><code>.spawnpokemon</code> - Spawn wild Pokemon</div>
                      <div><code>.catch</code> - Catch spawned Pokemon</div>
                      <div><code>.pvp challenge @user</code> - Challenge to battle</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold mb-2">🎵 Media Downloads</div>
                    <div className="space-y-1 text-xs opacity-75">
                      <div><code>.music &lt;song&gt;</code> - MP3 download</div>
                      <div><code>.yt &lt;url&gt;</code> - YouTube download</div>
                      <div><code>.tiktok &lt;url&gt;</code> - TikTok download</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold mb-2">👑 Owner Commands</div>
                    <div className="space-y-1 text-xs opacity-75">
                      <div><code>.autoview on/off</code> - Auto-view status</div>
                      <div><code>.autoreact on/off</code> - Auto-react messages</div>
                      <div><code>.chatbot on/off</code> - AI DM responses</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Performance Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                  <div className="text-xl font-bold" style={{ color: "var(--matrix-green)" }}>135+</div>
                  <div className="text-xs opacity-75">Commands</div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                  <div className="text-xl font-bold" style={{ color: "var(--matrix-green)" }}>&lt;500ms</div>
                  <div className="text-xs opacity-75">Response Time</div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                  <div className="text-xl font-bold" style={{ color: "var(--matrix-green)" }}>99.9%</div>
                  <div className="text-xs opacity-75">Uptime</div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                  <div className="text-xl font-bold" style={{ color: "var(--matrix-green)" }}>100+</div>
                  <div className="text-xs opacity-75">Languages</div>
                </div>
              </div>
            </div>

            {/* Deployment */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Deployment Platforms</h3>
              <div className="flex flex-wrap gap-2">
                {['Replit', 'Render', 'Railway', 'Vercel', 'Heroku', 'Fly.io', 'Netlify', 'Docker'].map((platform) => (
                  <div 
                    key={platform}
                    className="px-3 py-1 rounded-full text-xs border"
                    style={{ 
                      borderColor: "var(--matrix-green)", 
                      color: "var(--matrix-green)",
                      backgroundColor: "var(--bg-tertiary)"
                    }}
                  >
                    {platform}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center pt-4 border-t" style={{ borderColor: "var(--matrix-green)" }}>
              <p className="text-sm opacity-75">
                Created by <span style={{ color: "var(--matrix-green)" }}>@horlapookie</span> • Open Source on GitHub
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}