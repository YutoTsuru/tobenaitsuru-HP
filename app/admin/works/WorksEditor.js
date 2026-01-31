'use client';

import { useState } from 'react';
import { savePageContent } from '../../actions';
import styles from './page.module.css';

export default function WorksEditor({ initialContent }) {
    const [data, setData] = useState({
        title: initialContent.title || 'Works',
        status: initialContent.status || 'Coming Soon',
        items: initialContent.items || []
    });
    const [status, setStatus] = useState('');

    // New Item State
    const [newItem, setNewItem] = useState({ title: '', description: '', url: '' });

    const handleMainChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const addItem = () => {
        if (!newItem.title) return;
        setData(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }));
        setNewItem({ title: '', description: '', url: '' });
    };

    const deleteItem = (index) => {
        setData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        setStatus('Saving...');
        const result = await savePageContent('works', data);
        if (result.success) {
            setStatus('Saved successfully!');
        } else {
            setStatus('Error saving: ' + result.error);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Manage Works</h1>

            <div className={styles.section}>
                <h2>General Settings</h2>
                <div className={styles.field}>
                    <label>Page Title</label>
                    <input
                        type="text"
                        name="title"
                        value={data.title}
                        onChange={handleMainChange}
                        className={styles.input}
                    />
                </div>
                <div className={styles.field}>
                    <label>Status Message (if empty)</label>
                    <input
                        type="text"
                        name="status"
                        value={data.status}
                        onChange={handleMainChange}
                        className={styles.input}
                    />
                </div>
            </div>

            <div className={styles.section}>
                <h2>Items</h2>
                <div className={styles.list}>
                    {data.items.map((item, index) => (
                        <div key={index} className={styles.item}>
                            <div className={styles.itemInfo}>
                                <strong>{item.title}</strong>
                                <span>{item.description}</span>
                            </div>
                            <button
                                onClick={() => deleteItem(index)}
                                className={styles.deleteBtn}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>

                <div className={styles.addItem}>
                    <h3>Add New Item</h3>
                    <input
                        type="text"
                        placeholder="Title"
                        value={newItem.title}
                        onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                        className={styles.input}
                    />
                    <input
                        type="text"
                        placeholder="Description"
                        value={newItem.description}
                        onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                        className={styles.input}
                    />
                    <input
                        type="text"
                        placeholder="URL (optional)"
                        value={newItem.url}
                        onChange={e => setNewItem({ ...newItem, url: e.target.value })}
                        className={styles.input}
                    />
                    <button onClick={addItem} className={styles.addBtn}>Add Item</button>
                </div>
            </div>

            <div className={styles.actions}>
                <button onClick={handleSave} className={styles.saveBtn}>Save All Changes</button>
                {status && <span className={styles.status}>{status}</span>}
            </div>
        </div>
    );
}
