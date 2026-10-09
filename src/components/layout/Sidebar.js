import { createClient } from '@/utils/supabase/server';
import SidebarClient from './SidebarClient';

export default async function Sidebar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
  const initial = username.charAt(0).toUpperCase();

  return (
    <SidebarClient initial={initial} username={username} email={user?.email} />
  );
}
