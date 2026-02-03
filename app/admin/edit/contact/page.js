import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getIronSession } from 'iron-session';
import { SESSION_OPTIONS } from '../../../../lib/session';
import { getContent } from '../../../../lib/utils';
import EditContactClient from './EditContactClient';

export const dynamic = 'force-dynamic';

export default async function EditContactPage() {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, SESSION_OPTIONS);
    const isLoggedIn = session.isLoggedIn === true;

    if (!isLoggedIn) {
        redirect('/admin/login');
    }

    const content = await getContent();
    const contactData = content?.contact || {};

    return <EditContactClient initialData={contactData} />;
}
