import { createClient } from '@/utils/supabase/server';
import AppShell from '@/components/layout/AppShell';
import DashboardClient from './DashboardClient';
import { getBalanceSummary, getUpcomingAssignments, getTodayClasses, getPinnedNotes, getActiveFocusSession } from './actions';

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
  const initial = username.charAt(0).toUpperCase();

  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';

  const [
    { balance, error: balanceError },
    { data: assignments, error: assignmentsError },
    { data: classes, error: classesError },
    { data: notes, error: notesError },
    { data: activeFocusSession }
  ] = await Promise.all([
    getBalanceSummary(),
    getUpcomingAssignments(),
    getTodayClasses(),
    getPinnedNotes(),
    getActiveFocusSession()
  ]);

  return (
    <AppShell>
      <DashboardClient 
        username={username}
        initial={initial}
        greeting={greeting}
        balance={balance}
        assignments={assignments || []}
        classes={classes || []}
        notes={notes || []}
        activeFocusSession={activeFocusSession}
      />
    </AppShell>
  );
}
