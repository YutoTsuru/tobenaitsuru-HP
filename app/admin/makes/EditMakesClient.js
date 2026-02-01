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
    const [editingId, setEditingId] = useState(null); // 編集中のID

    // 新規追加用フォーム状態
    const [newItem, setNewItem] = useState({
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

    const handleAddItem = (e) => {
        e.preventDefault();
        if (!newItem.title || !newItem.thumbnail) {
            alert('Title and Thumbnail are required');
            return;
        }

        const id = crypto.randomUUID();
        const itemToAdd = { ...newItem, id };

        setItems([itemToAdd, ...items]);
        setNewItem({
            title: '',
            description: '',
            thumbnail: '',
            externalUrl: '',
            techStack: [],
            isPublished: true
        });
    };

    const handleDeleteItem = (id) => {
        if (confirm('Are you sure you want to delete this item?')) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const handleUpdateItem = (id, field, value) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleImageUpload = async (e, isEditing = false, itemId = null) => {
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

            if (isEditing && itemId) {
                handleUpdateItem(itemId, 'thumbnail', imageUrl);
            } else {
                setNewItem(prev => ({ ...prev, thumbnail: imageUrl }));
            }
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
                {/* 新規追加フォーム */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Add New Make</h2>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Title</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={newItem.title}
                            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                            placeholder="Project Name"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Description</label>
                        <textarea
                            className={styles.textarea}
                            value={newItem.description}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            placeholder="Short description..."
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>External URL</label>
                        <input
                            type="url"
                            className={styles.input}
                            value={newItem.externalUrl}
                            onChange={(e) => setNewItem({ ...newItem, externalUrl: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>

                    {/* 技術スタック入力 (コンポーネント) */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Tech Stack</label>
                        <TechStackInput
                            techStack={newItem.techStack}
                            onChange={(newStack) => setNewItem({ ...newItem, techStack: newStack })}
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
                                    onChange={(e) => handleImageUpload(e)}
                                />
                            </label>
                            {newItem.thumbnail && (
                                <div className={styles.preview}>
                                    <img src={newItem.thumbnail} alt="Preview" />
                                </div>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleAddItem}
                        className={styles.addButton}
                        disabled={!newItem.title || !newItem.thumbnail}
                    >
                        + Add Project
                    </button>
                </div>

                {/* 既存リスト */}
                <div className={styles.listSection}>
                    <h2 className={styles.cardTitle}>Existing Makes ({items.length})</h2>
                    {items.length === 0 && <p className={styles.empty}>No makes yet.</p>}

                    <div className={styles.grid}>
                        {items.map((item) => (
                            <div key={item.id} className={styles.itemCard}>
                                <div className={styles.itemHeader}>
                                    <span style={{ fontWeight: 'bold' }}>
                                        {item.title}
                                    </span>
                                    <div>
                                        <button
                                            onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                                            className={styles.editBtn}
                                            style={{ marginRight: '0.5rem', background: 'none', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            {editingId === item.id ? 'Close' : 'Edit'}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(item.id)}
                                            className={styles.deleteBtn}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>

                                {/* プレビュー表示 (編集中でない場合) */}
                                {editingId !== item.id && (
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
                                )}

                                {/* 編集モード */}
                                {editingId === item.id && (
                                    <div className={styles.itemBody} style={{ flexDirection: 'column' }}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Title</label>
                                            <input
                                                type="text"
                                                className={styles.input}
                                                value={item.title}
                                                onChange={(e) => handleUpdateItem(item.id, 'title', e.target.value)}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Thumbnail</label>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                {item.thumbnail && <img src={item.thumbnail} alt="thumb" style={{ width: '60px', height: '40px', objectFit: 'cover' }} />}
                                                <label className={styles.fileInputLabel} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                                                    Change
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className={styles.fileInput}
                                                        onChange={(e) => handleImageUpload(e, true, item.id)}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Description</label>
                                            <textarea
                                                className={styles.textarea}
                                                value={item.description}
                                                style={{ height: '60px' }}
                                                onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>URL</label>
                                            <input
                                                type="url"
                                                className={styles.input}
                                                value={item.externalUrl}
                                                onChange={(e) => handleUpdateItem(item.id, 'externalUrl', e.target.value)}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Tech Stack</label>
                                            <TechStackInput
                                                techStack={item.techStack}
                                                onChange={(newStack) => handleUpdateItem(item.id, 'techStack', newStack)}
                                                isMini={true}
                                            />
                                        </div>
                                    </div>
                                )}
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
