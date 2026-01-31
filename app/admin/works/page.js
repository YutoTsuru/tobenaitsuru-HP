import { getContent } from '../../lib/utils';
import WorksEditor from './WorksEditor';

export default async function WorksAdmin() {
    const content = await getContent();

    return <WorksEditor initialContent={content?.works || {}} />;
}
