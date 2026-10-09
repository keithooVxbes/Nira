import AppShell from '@/components/layout/AppShell';
import NotesClient from '@/components/notes/NotesClient';
import { getNotes, getFolders } from './actions';

export default async function Notes() {
  const [{ data: initialNotes }, { data: initialFolders }] = await Promise.all([
    getNotes(),
    getFolders()
  ]);

  return (
    <AppShell>
      <NotesClient initialNotes={initialNotes || []} initialFolders={initialFolders || []} />
    </AppShell>
  );
}
