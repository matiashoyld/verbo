import { Upload } from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";

export function SkillsUploadDialog() {
  const [uploading, setUploading] = useState(false);
  const importSkills = api.skills.importFromCsv.useMutation({
    onSuccess: () => {
      toast.success("Skills imported successfully");
      setUploading(false);
    },
    onError: () => {
      toast.error("Failed to import skills");
      setUploading(false);
    },
  });

  const handleFileUpload = async (file: File | undefined) => {
    if (!file) return;

    setUploading(true);
    try {
      const text = await file.text();
      await importSkills.mutateAsync({ csvContent: text });
    } catch {
      toast.error("Failed to parse CSV file");
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      void handleFileUpload(acceptedFiles[0]);
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-verbo-purple"
          title="Import Skills from CSV"
        >
          <Upload className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center ${
            isDragActive
              ? "border-verbo-purple bg-verbo-purple/5"
              : "border-gray-200 hover:border-verbo-purple/50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload
              className={`h-8 w-8 ${
                isDragActive ? "text-verbo-purple" : "text-gray-400"
              }`}
            />
            {isDragActive ? (
              <p className="text-sm text-verbo-purple">Drop your file here</p>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  Drag & drop your CSV file here
                </p>
                <p className="text-xs text-gray-400">
                  or click to select a file
                </p>
              </>
            )}
          </div>
          {uploading && (
            <p className="mt-2 text-sm text-verbo-purple">
              Processing your file...
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
