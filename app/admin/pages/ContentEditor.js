'use client';

import { useState } from 'react';
import { savePageContent } from '../../actions';
import styles from './page.module.css';

export default function ContentEditor({ initialContent }) {
    const [activeSection, setActiveSection] = useState('home');
    const [formData, setFormData] = useState(initialContent?.[activeSection] || {});
    const [status, setStatus] = useState('');

    const handleSectionChange = (section) => {
        setActiveSection(section);
        setFormData(initialContent?.[section] || {});
        setStatus('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Saving...');
        const result = await savePageContent(activeSection, formData);
        if (result.success) {
            setStatus('Saved successfully!');
            // Update local "initialContent" notion? 
            // In a real app we might revalidate. For now simple feedback is enough.
        } else {
            setStatus('Error saving: ' + result.error);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Edit Pages</h1>

            <div className={styles.tabs}>
                {['home', 'about', 'contact'].map(section => (
                    <button
                        key={section}
                        className={`${styles.tab} ${activeSection === section ? styles.activeTab : ''}`}
                        onClick={() => handleSectionChange(section)}
                    >
                        {section.charAt(0).toUpperCase() + section.slice(1)}
                    </button>
                ))}
            </div>

            <div className={styles.editor}>
                <h2 className={styles.sectionTitle}>Editing: {activeSection}</h2>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Dynamic form fields based on current data keys. Simple implementation. */}
                    {Object.keys(formData).map(key => {
                        // Skip complex objects like arrays via simplistic check, or handle specific keys
                        if (typeof formData[key] === 'object') return null;

                        return (
                            <div key={key} className={styles.field}>
                                <label className={styles.label}>{key}</label>
                                {key === 'content' || key.length > 50 ? (
                                    <textarea
                                        name={key}
                                        value={formData[key] || ''}
                                        onChange={handleChange}
                                        className={styles.textarea}
                                        rows={6}
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        name={key}
                                        value={formData[key] || ''}
                                        onChange={handleChange}
                                        className={styles.input}
                                    />
                                )}
                            </div>
                        );
                    })}

                    <button type="submit" className={styles.saveBtn}>Save Changes</button>
                    {status && <p className={styles.status}>{status}</p>}
                </form>
            </div>
        </div>
    );
}
