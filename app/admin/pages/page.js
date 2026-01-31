import { getContent } from '../../../lib/utils';
import ContentEditor from './ContentEditor';

export default async function PagesAdmin() {
    const content = await getContent();

    return <ContentEditor initialContent={content} />;
}
