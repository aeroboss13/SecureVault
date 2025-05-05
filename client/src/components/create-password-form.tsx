import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Eye, EyeOff } from "lucide-react";
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

export default function CreatePasswordForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  
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
    onSuccess: (share) => {
      // Reset form and show success message
      form.reset();
      
      // Copy share link to clipboard
      const shareUrl = `${window.location.origin}/view/${share.shareToken}`;
      navigator.clipboard.writeText(shareUrl).catch(console.error);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/passwords"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shares"] });
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      toast({
        title: "Password shared",
        description: "Password created and share link copied to clipboard",
      });
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
  
  return (
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
                    onClick={() => form.getValues().password && handlePasswordGeneration(form.getValues().password)}
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
  );
}
