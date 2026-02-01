import styles from './page.module.css';

import { redirect } from 'next/navigation';

export default function AdminRoot() {
    // Redirect to the main dashboard
    redirect('/admin/dashboard');
}
