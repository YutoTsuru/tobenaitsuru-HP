'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { savePageContent } from '../../actions';
import TechStackInput from '../../../components/admin/TechStackInput';

import styles from './page.module.css';

export default function EditMakesClient({ initialData }) {
    const router = useRouter();
    const [title, setTitle] = useState(initialData?.title || 'Makes');
    const [items, setItems] = useState(initialData?.items || []);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [editingId, setEditingId] = useState(null); // ID of item being edited

    // Form state (used for both Add and Edit)
    const [formState, setFormState] = useState({
        title: '',
        description: '',
        thumbnail: '',
        externalUrl: '',
        techStack: [],
        isPublished: true
    });

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const result = await savePageContent('makes', { title, items });

            if (result.success) {
                setMessage({ type: 'success', text: 'Saved successfully!' });
                router.refresh();
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to save' });
            }
        } catch (error) {
            console.error('Save error:', error);
            setMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setLoading(false);
        }
    };

    // Add or Update Item
    const handleSubmitItem = (e) => {
        e.preventDefault();
        if (!formState.title || !formState.thumbnail) {
            alert('Title and Thumbnail are required');
            return;
        }

        if (editingId) {
            // Update existing item
            setItems(items.map(item =>
                item.id === editingId ? { ...formState, id: editingId } : item
            ));
            setMessage({ type: 'success', text: 'Item updated. Remember to Save All Changes.' });
        } else {
            // Add new item
            const id = crypto.randomUUID();
            const itemToAdd = { ...formState, id };
            setItems([itemToAdd, ...items]);
            setMessage({ type: 'success', text: 'New item added. Remember to Save All Changes.' });
        }

        // Reset form
        resetForm();
    };

    const resetForm = () => {
        setFormState({
            title: '',
            description: '',
            thumbnail: '',
            externalUrl: '',
            techStack: [],
            isPublished: true
        });
        setEditingId(null);
    };

    const startEdit = (item) => {
        setFormState({
            title: item.title || '',
            description: item.description || '',
            thumbnail: item.thumbnail || '',
            externalUrl: item.externalUrl || '',
            techStack: item.techStack || [],
            isPublished: item.isPublished !== false
        });
        setEditingId(item.id);

        // Scroll to top to show form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteItem = (id) => {
        if (confirm('Are you sure you want to delete this item?')) {
            setItems(items.filter(item => item.id !== id));
            // If deleting the currently edited item, reset form
            if (editingId === id) {
                resetForm();
            }
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoading(true);
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            const imageUrl = data.url;

            setFormState(prev => ({ ...prev, thumbnail: imageUrl }));
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>Manage Makes</h1>
                <button onClick={() => router.push('/admin/dashboard')} className={styles.backButton}>
                    ← Dashboard
                </button>
            </div>

            {message && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}

            <div className={styles.content}>
                {/* Form Section */}
                <div className={`${styles.card} ${editingId ? styles.editingMode : ''}`}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>
                            {editingId ? 'Edit Project' : 'Add New Project'}
                        </h2>
                        {editingId && (
                            <span className={styles.editingBadge}>Editing Mode</span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Title</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={formState.title}
                            onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                            placeholder="Project Name"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Description</label>
                        <textarea
                            className={styles.textarea}
                            value={formState.description}
                            onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                            placeholder="Short description..."
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>External URL</label>
                        <input
                            type="url"
                            className={styles.input}
                            value={formState.externalUrl}
                            onChange={(e) => setFormState({ ...formState, externalUrl: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>

                    {/* Tech Stack Input */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Tech Stack</label>
                        <TechStackInput
                            techStack={formState.techStack}
                            onChange={(newStack) => setFormState({ ...formState, techStack: newStack })}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Thumbnail Image</label>
                        <div className={styles.imageUploadWrapper}>
                            <label className={styles.fileInputLabel}>
                                📷 Choose Thumbnail
                                <input
                                    type="file"
                                    accept="image/*"
                                    className={styles.fileInput}
                                    onChange={handleImageUpload}
                                />
                            </label>
                            {formState.thumbnail && (
                                <div className={styles.preview}>
                                    <img src={formState.thumbnail} alt="Preview" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        {editingId && (
                            <button
                                onClick={resetForm}
                                className={styles.cancelButton}
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={handleSubmitItem}
                            className={styles.addButton}
                            disabled={!formState.title || !formState.thumbnail}
                        >
                            {editingId ? 'Update Project' : '+ Add Project'}
                        </button>
                    </div>
                </div>

                {/* List Section */}
                <div className={styles.listSection}>
                    <h2 className={styles.cardTitle}>Existing Makes ({items.length})</h2>
                    {items.length === 0 && <p className={styles.empty}>No makes yet.</p>}

                    <div className={styles.grid}>
                        {items.map((item) => (
                            <div key={item.id} className={`${styles.itemCard} ${editingId === item.id ? styles.activeItem : ''}`}>
                                <div className={styles.itemHeader}>
                                    <span style={{ fontWeight: 'bold' }}>
                                        {item.title}
                                    </span>
                                    <div>
                                        <button
                                            onClick={() => startEdit(item)}
                                            className={styles.editBtn}
                                            style={{ marginRight: '0.5rem', background: 'none', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(item.id)}
                                            className={styles.deleteBtn}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.itemBody}>
                                    <div className={styles.thumbnailSection}>
                                        {item.thumbnail ? (
                                            <img src={item.thumbnail} alt={item.title} className={styles.itemThumb} />
                                        ) : <div className={styles.noImage}>No Image</div>}
                                    </div>
                                    <div className={styles.detailsSection}>
                                        <p style={{ fontSize: '0.9rem', color: '#666' }}>{item.description}</p>
                                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                            {(item.techStack || []).map(t => (
                                                <span key={t} style={{ fontSize: '0.7rem', background: '#eee', padding: '2px 6px', borderRadius: '4px' }}>{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.floatingSave}>
                <button
                    onClick={handleSave}
                    className={styles.saveButton}
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>
        </div>
    );
}
