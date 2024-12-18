"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { uploadDocument } from "@/api/action";
import { useToast } from "@/hooks/use-toast";

export function DocumentUploadField() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setFile(selectedFile || null);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file before uploading.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadDocument(formData);

      toast({
        title: "Upload Successful",
        description: `File "${file.name}" has been uploaded.`,
      });

      setFile(null);
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload Failed",
        description:
          "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <div className="flex items-center gap-2">
        <Input
          id="document"
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => document.getElementById("document")?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          {file ? file.name : "Select File"}
        </Button>
      </div>
      {file && (
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-muted-foreground">
            Selected file: {file.name}
          </p>
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      )}
    </div>
  );
}
