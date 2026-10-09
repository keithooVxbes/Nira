import AppShell from '@/components/layout/AppShell';
import AssignmentsClient from './AssignmentsClient';
import { getAssignments } from './actions';

export default async function Assignments() {
  const { data: assignments } = await getAssignments();

  return (
    <AppShell>
      <AssignmentsClient initialAssignments={assignments || []} />
    </AppShell>
  );
}
