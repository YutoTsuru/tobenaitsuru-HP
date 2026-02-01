import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getContent } from '../../../../lib/utils';
import EditSkillsClient from './EditSkillsClient';

export default async function EditSkillsPage() {
    const cookieStore = await cookies();
    const isLoggedIn = cookieStore.get('admin_session')?.value === 'true';

    if (!isLoggedIn) {
        redirect('/admin/login');
    }

    const content = await getContent();
    const skillsData = content?.skills || { title: '', items: [] };

    return <EditSkillsClient initialData={skillsData} />;
}
