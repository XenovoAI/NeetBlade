import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Upload, CheckCircle, AlertCircle, IndianRupee, Image } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminMaterialUploadModal({ 
  open, 
  onOpenChange, 
  onUploaded 
}: { 
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUploaded: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("physics");
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const razorpayBaseLink = "https://razorpay.me/@teamneetblade";

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }

    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      setError("Please enter a valid price.");
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setError("File size exceeds 50MB limit.");
      return;
    }

    // Validate thumbnail size if provided (max 5MB)
    if (thumbnail && thumbnail.size > 5 * 1024 * 1024) {
      setError("Thumbnail size exceeds 5MB limit.");
      return;
    }

    setLoading(true);

    try {
      // Upload main file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from("materials")
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) {
        console.error("Storage error:", storageError);
        throw new Error(`Upload failed: ${storageError.message}`);
      }

      // Get public URL for main file
      const { data: urlData } = supabase.storage
        .from("materials")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Upload thumbnail if provided
      let thumbnailUrl = null;
      if (thumbnail) {
        const thumbExt = thumbnail.name.split('.').pop();
        const thumbFileName = `thumb_${Date.now()}_${Math.random().toString(36).substring(7)}.${thumbExt}`;
        const thumbPath = `thumbnails/${thumbFileName}`;

        const { error: thumbError } = await supabase.storage
          .from("materials")
          .upload(thumbPath, thumbnail, {
            cacheControl: '3600',
            upsert: false
          });

        if (!thumbError) {
          const { data: thumbUrlData } = supabase.storage
            .from("materials")
            .getPublicUrl(thumbPath);
          thumbnailUrl = thumbUrlData.publicUrl;
        }
      }

      // Generate payment link
      const paymentLink = `${razorpayBaseLink}/${parseFloat(price)}`;

      // Insert material record into database
      const { error: dbError } = await supabase
        .from("materials")
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          url: publicUrl,
          subject: subject,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type || 'application/octet-stream',
          price: parseFloat(price),
          thumbnail_url: thumbnailUrl,
          payment_link: paymentLink,
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error("Database error:", dbError);
        // Try to delete the uploaded files if database insert fails
        await supabase.storage.from("materials").remove([filePath]);
        if (thumbnailUrl) {
          await supabase.storage.from("materials").remove([`thumbnails/${thumbFileName}`]);
        }
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Success!
      setSuccess(true);
      setTitle("");
      setDescription("");
      setSubject("physics");
      setFile(null);
      setThumbnail(null);
      setPrice("");
      
      // Reset file inputs
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      const thumbInput = document.getElementById('thumbnail-upload') as HTMLInputElement;
      if (thumbInput) thumbInput.value = '';

      // Call callback to refresh materials list
      onUploaded();

      // Close modal after a short delay
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
      }, 1500);

    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setThumbnail(selectedFile);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-upload-material">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Study Material
          </DialogTitle>
          <DialogDescription>
            Upload PDFs, videos, or other study materials for students.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpload} className="space-y-4 mt-4">
          {error && (
            <Alert variant="destructive" data-testid="alert-error">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-900 border-green-200" data-testid="alert-success">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Material uploaded successfully!</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., Mechanics - Laws of Motion"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              disabled={loading}
              data-testid="input-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <select
              id="subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
              disabled={loading}
              data-testid="select-subject"
            >
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="biology">Biology</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the material (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
              data-testid="textarea-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload">File *</Label>
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              required
              disabled={loading}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.mov,.mkv"
              data-testid="input-file"
            />
            {file && (
              <p className="text-sm text-muted-foreground" data-testid="text-file-info">
                Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || success}
              className="flex-1"
              data-testid="button-submit"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Uploaded!
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
