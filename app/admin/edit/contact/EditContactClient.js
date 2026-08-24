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
        twitter: initialData.twitter || '',
        zenn: initialData.zenn || '',
        note: initialData.note || ''
    });
    const [status, setStatus] = useState('');
    const formatLinkText = (url) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

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

                    <div className={styles.formGroup}>
                        <label htmlFor="zenn" className={styles.label}>Zenn URL</label>
                        <input
                            type="url"
                            id="zenn"
                            name="zenn"
                            value={formData.zenn}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="https://zenn.dev/username"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="note" className={styles.label}>note URL</label>
                        <input
                            type="url"
                            id="note"
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="https://note.com/username"
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
                                    {formatLinkText(formData.github)}
                                </a>
                            </div>
                        )}
                        {formData.twitter && (
                            <div className={styles.previewItem}>
                                <span className={styles.previewLabel}>Twitter / X</span>
                                <a href={formData.twitter} target="_blank" rel="noopener noreferrer" className={styles.previewLink}>
                                    {formatLinkText(formData.twitter)}
                                </a>
                            </div>
                        )}
                        {formData.zenn && (
                            <div className={styles.previewItem}>
                                <span className={styles.previewLabel}>Zenn</span>
                                <a href={formData.zenn} target="_blank" rel="noopener noreferrer" className={styles.previewLink}>
                                    {formatLinkText(formData.zenn)}
                                </a>
                            </div>
                        )}
                        {formData.note && (
                            <div className={styles.previewItem}>
                                <span className={styles.previewLabel}>note</span>
                                <a href={formData.note} target="_blank" rel="noopener noreferrer" className={styles.previewLink}>
                                    {formatLinkText(formData.note)}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
