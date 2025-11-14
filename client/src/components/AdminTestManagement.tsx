import { useState, useEffect, FormEvent } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { API_BASE_URL } from '@/lib/api';

interface TestSeriesPdf {
  id: string;
  title: string;
  subject: string;
  pdf_url: string;
  created_at: string;
}

export default function AdminTestManagement() {
  const [testSeries, setTestSeries] = useState<TestSeriesPdf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchTestSeries();
  }, []);

  const fetchTestSeries = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/test-series-pdfs`);

      if (!response.ok) {
        throw new Error('Failed to fetch test series');
      }

      const data = await response.json();
      setTestSeries(data.data || []);
    } catch (error) {
      console.error('Error fetching test series:', error);
      setError('Failed to load test series');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !title || !subject) {
      setError('Please fill all fields and select a file.');
      return;
    }
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('title', title);
    formData.append('subject', subject);

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch(`${API_BASE_URL}/api/test-series-pdfs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload test series');
      }

      await fetchTestSeries(); // Refresh the list
      setTitle('');
      setSubject('');
      setFile(null);
    } catch (error) {
      console.error('Error uploading test series:', error);
      setError('Failed to upload test series');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test series?')) return;

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch(`${API_BASE_URL}/api/test-series-pdfs/${testId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete test series');
      }

      setTestSeries(prev => prev.filter(ts => ts.id !== testId));
    } catch (error) {
      console.error('Error deleting test series:', error);
      setError('Failed to delete test series');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Test Series PDF Management</h2>
      </div>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      <Card className="p-6">
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="title">Test Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Physics Mock Test 1"
                required
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select value={subject} onValueChange={setSubject} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                  <SelectItem value="Full Test">Full Test</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="pdf">PDF File</Label>
              <Input id="pdf" type="file" onChange={handleFileChange} accept=".pdf" required />
            </div>
          </div>
          <Button type="submit" disabled={uploading}>
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Test Series'}
          </Button>
        </form>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Uploaded At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : testSeries.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center">No test series uploaded yet.</TableCell>
                </TableRow>
            ) : (
              testSeries.map((ts) => (
                <TableRow key={ts.id}>
                  <TableCell className="font-medium">{ts.title}</TableCell>
                  <TableCell>{ts.subject}</TableCell>
                  <TableCell>{new Date(ts.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(ts.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}