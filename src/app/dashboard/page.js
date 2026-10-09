import { createClient } from '@/utils/supabase/server';
import AppShell from '@/components/layout/AppShell';
import DashboardClient from './DashboardClient';

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
  const initial = username.charAt(0).toUpperCase();

  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';

  return (
    <AppShell>
      <DashboardClient 
        username={username}
        initial={initial}
        greeting={greeting}
      />
    </AppShell>
  );
}
