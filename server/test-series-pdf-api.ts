import express from 'express';
import multer from 'multer';
import { supabase } from '../client/src/lib/supabaseClient'; // Adjust path as needed
import { isAdmin } from './middleware/isAdmin'; // Assuming you have an isAdmin middleware

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET all test series PDFs
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('test_series_pdfs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Get test series PDFs error:', error);
    res.status(500).json({ error: 'Failed to fetch test series PDFs' });
  }
});

// POST create a new test series PDF
router.post('/', isAdmin, upload.single('pdf'), async (req, res) => {
  try {
    const { title, subject } = req.body;
    const pdfFile = req.file;

    if (!title || !subject || !pdfFile) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const fileName = `${Date.now()}_${pdfFile.originalname}`;
    const { data: fileData, error: fileError } = await supabase.storage
      .from('test-series-pdfs')
      .upload(fileName, pdfFile.buffer, {
        contentType: pdfFile.mimetype,
      });

    if (fileError) {
      throw fileError;
    }

    const { data: publicUrlData } = supabase.storage
      .from('test-series-pdfs')
      .getPublicUrl(fileName);

    const { data, error } = await supabase
      .from('test_series_pdfs')
      .insert([{ title, subject, pdf_url: publicUrlData.publicUrl }])
      .select();

    if (error) {
      throw error;
    }

    res.status(201).json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Create test series PDF error:', error);
    res.status(500).json({ error: 'Failed to create test series PDF' });
  }
});

// DELETE a test series PDF
router.delete('/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // First, fetch the PDF URL to delete from storage
        const { data: pdfData, error: fetchError } = await supabase
            .from('test_series_pdfs')
            .select('pdf_url')
            .eq('id', id)
            .single();

        if (fetchError || !pdfData) {
            return res.status(404).json({ error: 'Test series PDF not found' });
        }

        // Delete the file from Supabase Storage
        const fileName = pdfData.pdf_url.split('/').pop();
        if (fileName) {
            await supabase.storage.from('test-series-pdfs').remove([fileName]);
        }

        // Delete the record from the database
        const { error } = await supabase
            .from('test_series_pdfs')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        res.json({ success: true, message: 'Test series PDF deleted successfully' });
    } catch (error) {
        console.error('Delete test series PDF error:', error);
        res.status(500).json({ error: 'Failed to delete test series PDF' });
    }
});


export default router;
