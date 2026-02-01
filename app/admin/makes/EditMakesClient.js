'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { savePageContent } from '../../actions';

import styles from './page.module.css';

export default function EditMakesClient({ initialData, fullContent }) {
    const router = useRouter();
    const [title, setTitle] = useState(initialData?.title || 'Makes');
    const [items, setItems] = useState(initialData?.items || []);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // 新規追加用フォーム状態
    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        thumbnail: '',
        externalUrl: '',
        isPublished: true
    });

    // 編集中のアイテムID (null = 新規作成モード)
    const [editingId, setEditingId] = useState(null);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const newContent = {
                ...fullContent,
                makes: {
                    title,
                    items
                }
            };

            const result = await savePageContent(newContent);

            if (result.success) {
                setMessage({ type: 'success', text: 'Saved successfully!' });
                router.refresh();
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to save' });
            }
        } catch (error) {
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

        // リセット
        setNewItem({
            title: '',
            description: '',
            thumbnail: '',
            externalUrl: '',
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
                        <label className={styles.label}>External URL (Optional)</label>
                        <input
                            type="url"
                            className={styles.input}
                            value={newItem.externalUrl}
                            onChange={(e) => setNewItem({ ...newItem, externalUrl: e.target.value })}
                            placeholder="https://GitHub, Demo, etc."
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Thumbnail Image</label>
                        <div className={styles.imageUploadWrapper}>
                            <input
                                type="text"
                                className={styles.input}
                                value={newItem.thumbnail}
                                onChange={(e) => setNewItem({ ...newItem, thumbnail: e.target.value })}
                                placeholder="/assets/image.png or URL"
                            />
                        </div>
                        {newItem.thumbnail && (
                            <div className={styles.preview}>
                                <img src={newItem.thumbnail} alt="Preview" />
                            </div>
                        )}
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
                                    <input
                                        type="text"
                                        className={styles.itemTitleInput}
                                        value={item.title}
                                        onChange={(e) => handleUpdateItem(item.id, 'title', e.target.value)}
                                    />
                                    <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className={styles.deleteBtn}
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className={styles.itemBody}>
                                    <div className={styles.thumbnailSection}>
                                        {item.thumbnail ? (
                                            <img src={item.thumbnail} alt={item.title} className={styles.itemThumb} />
                                        ) : (
                                            <div className={styles.noImage}>No Image</div>
                                        )}
                                        <input
                                            type="text"
                                            className={styles.miniInput}
                                            value={item.thumbnail}
                                            onChange={(e) => handleUpdateItem(item.id, 'thumbnail', e.target.value)}
                                            placeholder="Image URL"
                                        />
                                    </div>

                                    <div className={styles.detailsSection}>
                                        <textarea
                                            className={styles.miniTextarea}
                                            value={item.description}
                                            onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                                            placeholder="Description"
                                        />
                                        <input
                                            type="url"
                                            className={styles.miniInput}
                                            value={item.externalUrl}
                                            onChange={(e) => handleUpdateItem(item.id, 'externalUrl', e.target.value)}
                                            placeholder="External URL"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 保存ボタン (フローティング) */}
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
