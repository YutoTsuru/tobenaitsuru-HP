import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getIronSession } from 'iron-session';
import { SESSION_OPTIONS } from '../../../../lib/session';
import { getContent } from '../../../../lib/utils';
import EditSkillsClient from './EditSkillsClient';

export const dynamic = 'force-dynamic';

export default async function EditSkillsPage() {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, SESSION_OPTIONS);
    const isLoggedIn = session.isLoggedIn === true;

    if (!isLoggedIn) {
        redirect('/admin/login');
    }

    const content = await getContent();
    const skillsData = content?.skills || { title: '', items: [] };

    return <EditSkillsClient initialData={skillsData} />;
}
