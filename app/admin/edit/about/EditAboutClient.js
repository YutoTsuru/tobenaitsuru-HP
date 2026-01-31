'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { savePageContent } from '../../../actions';
import Gear from '../../../../components/Gear';
import styles from './page.module.css';

export default function EditAboutClient({ initialData }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: initialData.title || '',
        profile: initialData.profile || '',
        content: initialData.content || ''
    });
    const [status, setStatus] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setStatus('Saving...');

        try {
            const result = await savePageContent('about', formData);
            if (result.success) {
                setStatus('Saved successfully! ✓');
                setTimeout(() => setStatus(''), 3000);
            } else {
                setStatus('Error: ' + (result.error || 'Failed to save'));
            }
        } catch (error) {
            setStatus('Error: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        router.push('/admin/dashboard');
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Gear size={50} duration={10} color="var(--c-accent-1)" />
                    <h1 className={styles.title}>Edit About Section</h1>
                </div>
                <button onClick={handleCancel} className={styles.cancelBtn}>
                    ← Back to Dashboard
                </button>
            </div>

            <div className={styles.mainContent}>
                <div className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>Edit Content</h2>
                    <form onSubmit={handleSave} className={styles.form}>
                        <div className={styles.field}>
                            <label className={styles.label}>Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="About Me"
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Profile</label>
                            <input
                                type="text"
                                name="profile"
                                value={formData.profile}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Software Engineer / Designer"
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Content</label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                className={styles.textarea}
                                rows={8}
                                placeholder="Write about yourself..."
                            />
                        </div>

                        <div className={styles.actions}>
                            <button
                                type="submit"
                                className={styles.saveBtn}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className={styles.cancelBtnSecondary}
                            >
                                Cancel
                            </button>
                        </div>

                        {status && (
                            <p className={`${styles.status} ${status.includes('Error') ? styles.error : styles.success}`}>
                                {status}
                            </p>
                        )}
                    </form>
                </div>

                <div className={styles.previewSection}>
                    <h2 className={styles.sectionTitle}>Preview</h2>
                    <div className={styles.preview}>
                        <h1 className={styles.previewTitle}>{formData.title || 'About Me'}</h1>
                        <p className={styles.previewProfile}>{formData.profile || 'Your profile'}</p>
                        <p className={styles.previewContent}>{formData.content || 'Your content will appear here...'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
