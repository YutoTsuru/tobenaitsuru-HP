'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { savePageContent } from '../../../actions';
import styles from './page.module.css';

export default function EditSkillsClient({ initialData }) {
    const router = useRouter();
    const [title, setTitle] = useState(initialData.title || '');
    const [items, setItems] = useState(initialData.items || []);
    const [editingIndex, setEditingIndex] = useState(null);
    const [formData, setFormData] = useState({ name: '', level: 'Intermediate' });
    const [status, setStatus] = useState('');

    const handleAddSkill = () => {
        if (!formData.name.trim()) {
            setStatus('Skill name is required');
            return;
        }

        setItems([...items, { name: formData.name, level: formData.level }]);
        setFormData({ name: '', level: 'Intermediate' });
        setStatus('');
    };

    const handleEditSkill = (index) => {
        setEditingIndex(index);
        setFormData(items[index]);
    };

    const handleUpdateSkill = () => {
        if (!formData.name.trim()) {
            setStatus('Skill name is required');
            return;
        }

        const updated = [...items];
        updated[editingIndex] = formData;
        setItems(updated);
        setEditingIndex(null);
        setFormData({ name: '', level: 'Intermediate' });
        setStatus('');
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setFormData({ name: '', level: 'Intermediate' });
        setStatus('');
    };

    const handleDeleteSkill = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setStatus('Saving...');

        const result = await savePageContent('skills', { title, items });

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
                <h2 className={styles.cardTitle}>Edit Skills</h2>
                <form onSubmit={handleSave} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="title" className={styles.label}>Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.skillsSection}>
                        <h3 className={styles.sectionTitle}>Skills List</h3>

                        {items.length === 0 ? (
                            <p className={styles.emptyMessage}>No skills added yet. Add your first skill below!</p>
                        ) : (
                            <div className={styles.skillsList}>
                                {items.map((skill, index) => (
                                    <div key={index} className={styles.skillItem}>
                                        <div className={styles.skillInfo}>
                                            <span className={styles.skillName}>{skill.name}</span>
                                            <span className={styles.skillLevel}>{skill.level}</span>
                                        </div>
                                        <div className={styles.skillActions}>
                                            <button
                                                type="button"
                                                onClick={() => handleEditSkill(index)}
                                                className={styles.editBtn}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteSkill(index)}
                                                className={styles.deleteBtn}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={styles.addSection}>
                        <h3 className={styles.sectionTitle}>
                            {editingIndex !== null ? 'Edit Skill' : 'Add New Skill'}
                        </h3>

                        <div className={styles.formGroup}>
                            <label htmlFor="skillName" className={styles.label}>Skill Name</label>
                            <input
                                type="text"
                                id="skillName"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={styles.input}
                                placeholder="e.g., JavaScript/React/Next.js"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="skillLevel" className={styles.label}>Level</label>
                            <select
                                id="skillLevel"
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                className={styles.select}
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>

                        <div className={styles.addActions}>
                            {editingIndex !== null ? (
                                <>
                                    <button type="button" onClick={handleUpdateSkill} className={styles.addButton}>
                                        Update Skill
                                    </button>
                                    <button type="button" onClick={handleCancelEdit} className={styles.cancelEditButton}>
                                        Cancel Edit
                                    </button>
                                </>
                            ) : (
                                <button type="button" onClick={handleAddSkill} className={styles.addButton}>
                                    Add Skill
                                </button>
                            )}
                        </div>
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
                    <h3 className={styles.previewTitle}>{title || 'My Skills'}</h3>

                    {items.length === 0 ? (
                        <p className={styles.previewEmpty}>No skills to display</p>
                    ) : (
                        <div className={styles.previewList}>
                            {items.map((skill, index) => (
                                <div key={index} className={styles.previewItem}>
                                    <span className={styles.previewName}>{skill.name}</span>
                                    <span className={styles.previewLevel}>{skill.level}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
