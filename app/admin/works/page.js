import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getIronSession } from 'iron-session';
import { SESSION_OPTIONS } from '../../../lib/session';
import { getContent } from '../../../lib/utils';
import WorksEditor from './WorksEditor';

export const dynamic = 'force-dynamic';

export default async function WorksAdmin() {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, SESSION_OPTIONS);
    if (!session.isLoggedIn) {
        redirect('/admin/login');
    }

    const content = await getContent();

    return <WorksEditor initialContent={content?.works || {}} />;
}
