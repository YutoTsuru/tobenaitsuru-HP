import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getContent } from '../../../../lib/utils';
import EditWorksClient from './EditWorksClient';

export default async function EditWorksPage() {
    const cookieStore = await cookies();
    const isLoggedIn = cookieStore.get('admin_session')?.value === 'true';

    if (!isLoggedIn) {
        redirect('/admin/login');
    }

    const content = await getContent();
    const worksData = content?.works || { title: '', status: '', items: [] };

    return <EditWorksClient initialData={worksData} />;
}
