import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getContent } from '../../../lib/utils';

import EditMakesClient from './EditMakesClient';

export default async function EditMakesPage() {
    const cookieStore = await cookies();
    const isLoggedIn = cookieStore.get('admin_session')?.value === 'true';

    if (!isLoggedIn) {
        redirect('/admin/login');
    }

    const content = await getContent();

    return <EditMakesClient initialData={content.makes} fullContent={content} />;
}
