'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { savePageContent } from '../../../actions';
import styles from './page.module.css';

export default function EditContactClient({ initialData }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: initialData.title || '',
        email: initialData.email || '',
        github: initialData.github || '',
        twitter: initialData.twitter || ''
    });
    const [status, setStatus] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setStatus('Saving...');

        const result = await savePageContent('contact', formData);

        if (result?.error) {
            setStatus(`Error: ${result.error}`);
        } else {
            setStatus('Saved successfully!');
            setTimeout(() => setStatus(''), 3000);
        }
    };

    const handleCancel = () => {
        router.push('/admin/dashboard');
    };

    return (
        <div className={styles.container}>
            <div className={styles.formCard}>
                <h2 className={styles.cardTitle}>Edit Contact</h2>
                <form onSubmit={handleSave} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="title" className={styles.label}>Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.label}>Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="your.email@example.com"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="github" className={styles.label}>GitHub URL</label>
                        <input
                            type="url"
                            id="github"
                            name="github"
                            value={formData.github}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="https://github.com/username"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="twitter" className={styles.label}>Twitter/X URL</label>
                        <input
                            type="url"
                            id="twitter"
                            name="twitter"
                            value={formData.twitter}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="https://twitter.com/username"
                        />
                    </div>

                    <div className={styles.actions}>
                        <button type="submit" className={styles.saveButton}>
                            Save Changes
                        </button>
                        <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                            Cancel
                        </button>
                    </div>

                    {status && <div className={styles.status}>{status}</div>}
                </form>
            </div>

            <div className={styles.previewCard}>
                <h2 className={styles.cardTitle}>Preview</h2>
                <div className={styles.preview}>
                    <h3 className={styles.previewTitle}>{formData.title || 'Contact'}</h3>

                    <div className={styles.previewList}>
                        {formData.email && (
                            <div className={styles.previewItem}>
                                <span className={styles.previewLabel}>Email</span>
                                <a href={`mailto:${formData.email}`} className={styles.previewLink}>
                                    {formData.email}
                                </a>
                            </div>
                        )}
                        {formData.github && (
                            <div className={styles.previewItem}>
                                <span className={styles.previewLabel}>GitHub</span>
                                <a href={formData.github} target="_blank" rel="noopener noreferrer" className={styles.previewLink}>
                                    {formData.github.replace('https://', '')}
                                </a>
                            </div>
                        )}
                        {formData.twitter && (
                            <div className={styles.previewItem}>
                                <span className={styles.previewLabel}>Twitter / X</span>
                                <a href={formData.twitter} target="_blank" rel="noopener noreferrer" className={styles.previewLink}>
                                    {formData.twitter.replace('https://', '')}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
