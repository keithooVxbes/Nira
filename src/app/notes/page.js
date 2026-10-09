import AppShell from '@/components/layout/AppShell';
import NotesClient from '@/components/notes/NotesClient';

export default function Notes() {
  return (
    <AppShell>
      <NotesClient />
    </AppShell>
  );
}
