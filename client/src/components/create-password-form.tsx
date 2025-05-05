import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Eye, EyeOff, Copy, Share2 } from "lucide-react";
import { createPasswordSchema, type CreatePasswordForm } from "@shared/schema";

import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PasswordGeneratorForm from "@/components/password-generator-form";
import PasswordStrengthMeter from "@/components/password-strength-meter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CreatePasswordForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareInfo, setShareInfo] = useState({
    serviceName: "",
    username: "",
    recipientEmail: ""
  });
  
  const form = useForm<CreatePasswordForm>({
    resolver: zodResolver(createPasswordSchema),
    defaultValues: {
      serviceName: "",
      serviceUrl: "",
      username: "",
      password: "",
      recipientEmail: "",
    },
  });
  
  // Create password entry mutation
  const createPasswordMutation = useMutation({
    mutationFn: async (data: CreatePasswordForm) => {
      const res = await apiRequest("POST", "/api/passwords", data);
      return await res.json();
    },
    onSuccess: (passwordEntry) => {
      // Now create a share
      return createShareMutation.mutate({
        entryId: passwordEntry.id,
        recipientEmail: form.getValues().recipientEmail,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create password: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Create share mutation
  const createShareMutation = useMutation({
    mutationFn: async ({ entryId, recipientEmail }: { entryId: number, recipientEmail: string }) => {
      const res = await apiRequest("POST", "/api/shares", { entryId, recipientEmail });
      return await res.json();
    },
    onSuccess: (share, variables) => {
      // Generate share URL
      const url = `${window.location.origin}/view/${share.shareToken}`;
      
      // Set state for dialog
      setShareUrl(url);
      setShareInfo({
        serviceName: form.getValues().serviceName,
        username: form.getValues().username,
        recipientEmail: variables.recipientEmail
      });
      
      // Open the dialog
      setShareDialogOpen(true);
      
      // Reset form
      form.reset();
      
      // Copy to clipboard
      navigator.clipboard.writeText(url).catch(console.error);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/passwords"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shares"] });
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create share: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: CreatePasswordForm) => {
    if (!user) return;
    
    createPasswordMutation.mutate({
      ...data,
      serviceUrl: data.serviceUrl || "", // Handle empty URL
    });
  };
  
  // Handle password generation
  const handlePasswordGeneration = (generatedPassword: string) => {
    form.setValue("password", generatedPassword);
  };
  
  // Handle toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Function to handle copying of the share URL
  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl).catch(console.error);
    toast({
      title: "Link copied",
      description: "Share link copied to clipboard",
    });
  };

  return (
    <>
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Password Share Link Created</DialogTitle>
            <DialogDescription>
              Use this link to share the password for {shareInfo.serviceName} with {shareInfo.recipientEmail}.
              The link will expire in 1 hour.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            <div className="grid flex-1 gap-2">
              <Input
                readOnly
                value={shareUrl}
                className="font-mono text-sm"
              />
            </div>
            <Button type="button" size="sm" onClick={copyShareUrl}>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" onClick={() => setShareDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <FormField
              control={form.control}
              name="serviceName"
              render={({ field }) => (
                <FormItem className="sm:col-span-3">
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input placeholder="AWS, GitHub, Dropbox, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceUrl"
              render={({ field }) => (
                <FormItem className="sm:col-span-3">
                  <FormLabel>Service URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="sm:col-span-3">
                  <FormLabel>Username/Email</FormLabel>
                  <FormControl>
                    <Input placeholder="username@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recipientEmail"
              render={({ field }) => (
                <FormItem className="sm:col-span-3">
                  <FormLabel>Recipient Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="recipient@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="sm:col-span-4">
                  <FormLabel>Password</FormLabel>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <div className="relative flex-grow">
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          className="rounded-r-none"
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-neutral-500" />
                        ) : (
                          <Eye className="h-5 w-5 text-neutral-500" />
                        )}
                      </button>
                    </div>
                    <Button
                      type="button"
                      className="rounded-l-none"
                      onClick={() => handlePasswordGeneration(form.getValues().password || "")}
                    >
                      Generate
                    </Button>
                  </div>
                  <PasswordStrengthMeter password={field.value} className="mt-2" />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="sm:col-span-2">
              <FormLabel className="block text-sm font-medium text-neutral-700">
                Password Generator Options
              </FormLabel>
              <div className="mt-1">
                <PasswordGeneratorForm onGenerate={handlePasswordGeneration} />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={createPasswordMutation.isPending || createShareMutation.isPending}
            >
              Create and Share
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}