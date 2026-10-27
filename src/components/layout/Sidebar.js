import { createClient } from '@/utils/supabase/server';
import SidebarClient from './SidebarClient';

export default async function Sidebar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userMetadata = user?.user_metadata || {};
  const username = userMetadata.username || user?.email?.split('@')[0] || 'User';
  const fullName = userMetadata.full_name || username;
  const bio = userMetadata.bio || '';
  const avatarUrl = userMetadata.avatar_url || '';
  const initial = (fullName || username).charAt(0).toUpperCase();

  return (
    <SidebarClient 
      initial={initial} 
      username={username} 
      fullName={fullName}
      bio={bio}
      avatarUrl={avatarUrl}
      email={user?.email} 
    />
  );
}
