-- Add receipt_url to transactions
ALTER TABLE public.transactions ADD COLUMN receipt_url TEXT;

-- Create receipts storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);

-- Set up storage policies for receipts
CREATE POLICY "Users can upload their own receipts" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own receipts" ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own receipts" ON storage.objects
FOR UPDATE TO authenticated USING (
  bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own receipts" ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text
);
