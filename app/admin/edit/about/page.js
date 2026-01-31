import EditAboutClient from './EditAboutClient';
import { getContent } from '../../../../lib/utils';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function EditAbout() {
    const cookieStore = await cookies();
    const isLoggedIn = cookieStore.get('admin_session')?.value === 'true';

    if (!isLoggedIn) {
        redirect('/admin/login');
    }

    const content = await getContent();
    const aboutData = content?.about || {};

    return <EditAboutClient initialData={aboutData} />;
}
