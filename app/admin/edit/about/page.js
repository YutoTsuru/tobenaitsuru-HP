import EditAboutClient from './EditAboutClient';
import { getContent } from '../../../../lib/utils';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getIronSession } from 'iron-session';
import { SESSION_OPTIONS } from '../../../../lib/session';

export const dynamic = 'force-dynamic';

export default async function EditAboutPage() {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, SESSION_OPTIONS);
    const isLoggedIn = session.isLoggedIn === true;

    if (!isLoggedIn) {
        redirect('/admin/login');
    }

    const content = await getContent();
    const aboutData = content?.about || {};

    return <EditAboutClient initialData={aboutData} />;
}
