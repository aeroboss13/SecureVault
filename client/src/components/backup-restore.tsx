import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function BackupRestore() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const exportMutation = useMutation({
    mutationFn: async () => {
      // Use a simple approach that works with authentication
      const link = document.createElement("a");
      link.href = "/api/backup/export";
      link.download = `passwords-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    onSuccess: () => {
      toast({
        title: "Export Successful",
        description: "Password data has been exported successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("backup", file);
      
      const response = await fetch("/api/backup/import", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to import data");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Import Successful",
        description: `Imported ${data.importedCount} password entries successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/passwords"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setSelectedFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      importMutation.mutate(selectedFile);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>
            Download all your password data as a backup file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            className="w-full"
          >
            {exportMutation.isPending ? "Exporting..." : "Export All Passwords"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
          <CardDescription>
            Upload a backup file to restore password data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="backup-file">Select Backup File</Label>
            <Input
              id="backup-file"
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              disabled={importMutation.isPending}
            />
          </div>
          
          {selectedFile && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{selectedFile.name}</span>
              <span>({(selectedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}

          <Button 
            onClick={handleImport}
            disabled={!selectedFile || importMutation.isPending}
            className="w-full"
          >
            {importMutation.isPending ? "Importing..." : "Import Data"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}