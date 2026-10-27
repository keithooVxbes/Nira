import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId') || user.id;

    // Only allow users to view their own avatar, or if needed by user id
    const candidateBuckets = ['avatars', 'receipts'];
    const extensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

    for (const bucket of candidateBuckets) {
      // 1. First try listing the folder to find exact filename
      try {
        const { data: files } = await supabase.storage.from(bucket).list(targetUserId);
        const avatarItem = files?.find(f => f.name.startsWith('avatar.'));
        if (avatarItem) {
          const { data: blob, error: dlErr } = await supabase.storage
            .from(bucket)
            .download(`${targetUserId}/${avatarItem.name}`);

          if (!dlErr && blob) {
            return new Response(blob, {
              headers: {
                'Content-Type': blob.type || 'image/jpeg',
                'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
              },
            });
          }
        }
      } catch (err) {
        // Bucket list might fail or bucket not found, continue to extension probe
      }

      // 2. Direct extension probe if list was empty or failed
      for (const ext of extensions) {
        const filePath = `${targetUserId}/avatar.${ext}`;
        const { data: blob, error } = await supabase.storage.from(bucket).download(filePath);
        if (!error && blob) {
          return new Response(blob, {
            headers: {
              'Content-Type': blob.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`,
              'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
            },
          });
        }
      }
    }

    return new Response('Avatar not found', { status: 404 });
  } catch (error) {
    console.error('Error fetching avatar:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
