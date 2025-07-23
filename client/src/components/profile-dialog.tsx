import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useSocket } from "@/hooks/use-socket";
import { apiRequest } from "@/lib/queryClient";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { LogOut, Trash2 } from "lucide-react";
import { updateUserSchema, type UpdateUser } from "@shared/schema";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch available avatars
  const { data: avatars = [] } = useQuery<string[]>({
    queryKey: ["/api/avatars"],
  });

  const form = useForm<UpdateUser>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      bio: user?.bio || "",
      profilePicture: user?.profilePicture || "",
      whatsappNumber: user?.whatsappNumber || "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        displayName: user.displayName,
        bio: user.bio || "",
        profilePicture: user.profilePicture || "",
        whatsappNumber: user.whatsappNumber || "",
      });
      setSelectedAvatar(user.profilePicture || "");
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateUser) => {
      const res = await apiRequest("PUT", "/api/user/profile", data);
      return res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/online"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      
      // Broadcast profile update via WebSocket
      if (socket) {
        socket.send(JSON.stringify({
          type: "profile_update",
          data: updatedUser
        }));
      }
      
      onOpenChange(false);
      toast({ title: "Success", description: "Profile updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", "/api/user/account", {});
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Account Deleted", description: "Your account has been permanently deleted" });
      logout();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete account", variant: "destructive" });
    },
  });

  const onSubmit = (data: UpdateUser) => {
    const formData = { ...data, profilePicture: selectedAvatar };
    updateProfileMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--matrix-green)" }}>
        <DialogHeader>
          <DialogTitle style={{ color: "var(--matrix-green)" }}>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="block text-sm font-medium mb-2">Avatar</Label>
            <div className="grid grid-cols-8 gap-2 p-4 rounded-lg" style={{ backgroundColor: "var(--bg-tertiary)" }}>
              {avatars.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all hover:scale-110 ${
                    selectedAvatar === avatar ? "ring-2 ring-green-500 bg-green-500/20" : "hover:bg-gray-700"
                  }`}
                  onClick={() => setSelectedAvatar(avatar)}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Display Name</Label>
            <Input
              className="focus:border-green-500"
              style={{ backgroundColor: "var(--bg-tertiary)", borderColor: "#6b7280" }}
              placeholder="Enter your display name"
              {...form.register("displayName")}
            />
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Bio</Label>
            <Textarea
              className="focus:border-green-500 resize-none"
              style={{ backgroundColor: "var(--bg-tertiary)", borderColor: "#6b7280" }}
              placeholder="Tell us about yourself..."
              rows={3}
              {...form.register("bio")}
            />
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">WhatsApp Number (Optional)</Label>
            <Input
              type="tel"
              className="focus:border-green-500"
              style={{ backgroundColor: "var(--bg-tertiary)", borderColor: "#6b7280" }}
              placeholder="+1234567890"
              {...form.register("whatsappNumber")}
            />
          </div>

          {/* Account Actions */}
          <div className="border-t pt-6 space-y-4" style={{ borderColor: "#374151" }}>
            <h3 className="text-lg font-semibold" style={{ color: "var(--matrix-green)" }}>Account Actions</h3>
            
            <div className="flex flex-col space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  logout();
                }}
                className="flex items-center justify-center space-x-2 border-orange-500 text-orange-500 hover:bg-orange-500/10"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
              
              <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center justify-center space-x-2 border-red-500 text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Account</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--matrix-green)" }}>
                  <AlertDialogHeader>
                    <AlertDialogTitle style={{ color: "var(--text-primary)" }}>Delete Account</AlertDialogTitle>
                    <AlertDialogDescription style={{ color: "var(--text-secondary)" }}>
                      This action cannot be undone. This will permanently delete your account, all your messages, and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel 
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        deleteAccountMutation.mutate();
                        setShowDeleteConfirm(false);
                      }}
                      disabled={deleteAccountMutation.isPending}
                      className="bg-red-500 text-white hover:bg-red-600"
                    >
                      {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back</span>
            </Button>
            
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-500 text-black hover:bg-green-600 flex items-center space-x-2"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Update Profile</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}