'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function BackupsClient() {
    const router = useRouter();
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [restoring, setRestoring] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchBackups();
    }, []);

    const fetchBackups = async () => {
        try {
            const res = await fetch('/api/backups');
            if (res.ok) {
                const data = await res.json();
                setBackups(data.backups);
            }
        } catch (error) {
            console.error('Failed to fetch backups:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (filename) => {
        if (!confirm(`Are you sure you want to restore from ${filename}?\nCurrent content will be overwritten (but backed up).`)) {
            return;
        }

        setRestoring(true);
        setMessage(null);

        try {
            const res = await fetch('/api/backups/restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Restored successfully!' });
                fetchBackups(); // Refresh list (new backup created during restore)
            } else {
                setMessage({ type: 'error', text: data.error || 'Restore failed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error occurred' });
        } finally {
            setRestoring(false);
        }
    };

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatSize = (bytes) => {
        return (bytes / 1024).toFixed(2) + ' KB';
    };

    if (loading) return <div className={styles.loading}>Loading backups...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Backups & Restore</h1>
                <button onClick={() => router.push('/admin/dashboard')} className={styles.backButton}>
                    ← Dashboard
                </button>
            </div>

            {message && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}

            <div className={styles.card}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Filename</th>
                                <th>Size</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {backups.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className={styles.empty}>No backups found</td>
                                </tr>
                            ) : (
                                backups.map((backup) => (
                                    <tr key={backup.id} className={styles.row}>
                                        <td className={styles.date}>{formatDate(backup.createdAt)}</td>
                                        <td className={styles.filename}>{backup.filename}</td>
                                        <td className={styles.size}>{formatSize(backup.size)}</td>
                                        <td>
                                            <button
                                                onClick={() => handleRestore(backup.filename)}
                                                className={styles.restoreBtn}
                                                disabled={restoring}
                                            >
                                                {restoring ? 'Restoring...' : 'Restore'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
