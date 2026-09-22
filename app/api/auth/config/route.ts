import {setting} from '@/lib/server/settings';
import {reply} from '@/lib/server/runtime';

export const dynamic = 'force-dynamic';

export async function GET() {
  const googleClientId = setting('GOOGLE_CLIENT_ID');
  return reply({
    google: {
      enabled: !!googleClientId,
      clientId: googleClientId || ''
    }
  });
}
