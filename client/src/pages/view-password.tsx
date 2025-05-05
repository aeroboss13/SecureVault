import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Shield, Loader2, Clock, ExternalLink, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import CopyField from "@/components/copy-field";
import CountdownTimer from "@/components/countdown-timer";

interface SharedPassword {
  serviceName: string;
  serviceUrl: string;
  username: string;
  password: string;
  expires: string;
  viewed: boolean;
}

export default function ViewPassword() {
  const { token } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [savedConfirmed, setSavedConfirmed] = useState(false);
  
  // Fetch shared password data
  const { data, isLoading, error } = useQuery<SharedPassword>({
    queryKey: [`/api/shared/${token}`],
    staleTime: 0, // Don't cache sensitive data
    retry: 1, // Only retry once
  });
  
  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "This link has expired or is invalid.",
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  // Handle confirmed save
  const handleConfirmSave = () => {
    setSavedConfirmed(true);
    toast({
      title: "Confirmed",
      description: "You've confirmed saving these credentials.",
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto text-primary-600 animate-spin mb-4" />
          <h2 className="text-xl font-medium text-neutral-800">Loading secure credentials...</h2>
          <p className="mt-2 text-sm text-neutral-600">This may take a moment</p>
        </div>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="bg-red-500 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6" />
              <h2 className="text-xl font-bold">Link Expired or Invalid</h2>
            </div>
          </CardHeader>
          <CardContent className="pt-6 pb-8">
            <p className="mb-6 text-neutral-700">
              This secure link has expired or is invalid. Please contact the administrator who shared this password to generate a new link.
            </p>
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => window.close()}
                className="mr-4"
              >
                Close Window
              </Button>
              <Button onClick={() => navigate("/auth")}>
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-8 px-4 bg-neutral-50 flex items-center justify-center">
      <div className="fade-in w-full max-w-3xl mx-auto">
        <Card className="shadow-lg overflow-hidden">
          <div className="bg-primary-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-heading font-bold text-white flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Secure Password Transfer
              </h2>
              <CountdownTimer expiresAt={new Date(data.expires)} />
            </div>
          </div>

          <CardContent className="px-6 py-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mb-4">
                <Shield className="h-8 w-8 text-primary-700" />
              </div>
              <h3 className="text-lg font-heading font-medium text-neutral-900">{data.serviceName} Credentials</h3>
              <p className="mt-1 text-sm text-neutral-500">
                These credentials will give you access to {data.serviceName}.
                This page will self-destruct when the timer expires.
              </p>
            </div>

            <div className="space-y-6">
              {data.serviceUrl && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Service URL
                  </label>
                  <CopyField value={data.serviceUrl} type="text" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Username
                </label>
                <CopyField value={data.username} type="text" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Password
                </label>
                <CopyField value={data.password} type="password" />
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Clock className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      This link will expire when the timer runs out. Please copy these credentials immediately to a secure location.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-50 p-4 flex flex-col items-center justify-center rounded-md">
                <p className="text-xs text-neutral-500 mb-2 text-center">
                  To confirm you've saved these credentials, click the button below:
                </p>
                <Button 
                  onClick={handleConfirmSave}
                  disabled={savedConfirmed}
                  className="flex items-center"
                >
                  {savedConfirmed ? (
                    <>
                      <CheckCircle className="h-5 w-5 mr-1.5" />
                      Credentials Saved
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-1.5" />
                      I've Saved These Credentials
                    </>
                  )}
                </Button>
              </div>
              
              {data.serviceUrl && (
                <div className="text-center mt-6">
                  <a 
                    href={data.serviceUrl.startsWith('http') ? data.serviceUrl : `https://${data.serviceUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center text-primary-600 hover:text-primary-800 text-sm font-medium"
                  >
                    <ExternalLink className="h-4 w-4 mr-1.5" />
                    Go to {data.serviceName}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center mt-4 text-sm text-neutral-500">
          <p>Powered by SecureVault</p>
        </div>
      </div>
    </div>
  );
}
