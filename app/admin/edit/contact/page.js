import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getContent } from '../../../../lib/utils';
import EditContactClient from './EditContactClient';

export default async function EditContactPage() {
    const cookieStore = await cookies();
    const isLoggedIn = cookieStore.get('admin_session')?.value === 'true';

    if (!isLoggedIn) {
        redirect('/admin/login');
    }

    const content = await getContent();
    const contactData = content?.contact || {};

    return <EditContactClient initialData={contactData} />;
}
