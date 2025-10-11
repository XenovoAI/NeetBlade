import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

export default function AdminMaterialUploadModal({ open, onOpenChange, onUploaded }: { open: boolean, onOpenChange: (v: boolean) => void, onUploaded: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Please select a file.");
      return;
    }
    setLoading(true);
    const { data: storageData, error: storageError } = await supabase.storage.from("materials").upload(`public/${Date.now()}_${file.name}`, file);
    if (storageError) {
      setError(storageError.message);
      setLoading(false);
      return;
    }
    const url = storageData?.path ? supabase.storage.from("materials").getPublicUrl(storageData.path).data.publicUrl : "";
    const { error: dbError } = await supabase.from("materials").insert({ title, description, url });
    setLoading(false);
    if (dbError) {
      setError(dbError.message);
    } else {
      setTitle("");
      setDescription("");
      setFile(null);
      onUploaded();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>Upload Study Material</DialogHeader>
        <form onSubmit={handleUpload} className="space-y-4">
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <Input
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <Input
            type="text"
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <Input
            type="file"
            onChange={e => setFile(e.target.files?.[0] || null)}
            required
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
