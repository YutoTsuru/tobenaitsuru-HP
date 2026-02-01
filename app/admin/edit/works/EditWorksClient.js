'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { savePageContent } from '../../../actions';
import styles from './page.module.css';

export default function EditWorksClient({ initialData }) {
    const router = useRouter();
    const [title, setTitle] = useState(initialData.title || '');
    const [status, setStatus] = useState(initialData.status || '');
    const [items, setItems] = useState(initialData.items || []);
    const [editingIndex, setEditingIndex] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: '',
        link: ''
    });
    const [statusMsg, setStatusMsg] = useState('');

    const resetForm = () => {
        setFormData({ title: '', description: '', image: '', link: '' });
    };

    const handleAddProject = () => {
        if (!formData.title.trim() || !formData.description.trim() || !formData.image.trim()) {
            setStatusMsg('Title, Description, and Image are required');
            return;
        }

        setItems([...items, formData]);
        resetForm();
        setStatusMsg('');
    };

    const handleEditProject = (index) => {
        setEditingIndex(index);
        setFormData(items[index]);
    };

    const handleUpdateProject = () => {
        if (!formData.title.trim() || !formData.description.trim() || !formData.image.trim()) {
            setStatusMsg('Title, Description, and Image are required');
            return;
        }

        const updated = [...items];
        updated[editingIndex] = formData;
        setItems(updated);
        setEditingIndex(null);
        resetForm();
        setStatusMsg('');
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        resetForm();
        setStatusMsg('');
    };

    const handleDeleteProject = (index) => {
        if (window.confirm('Delete this project?')) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setStatusMsg('Saving...');

        const result = await savePageContent('works', { title, status, items });

        if (result?.error) {
            setStatusMsg(`Error: ${result.error}`);
        } else {
            setStatusMsg('Saved successfully!');
            setTimeout(() => setStatusMsg(''), 3000);
        }
    };

    const handleCancel = () => {
        router.push('/admin/dashboard');
    };

    return (
        <div className={styles.container}>
            <div className={styles.formCard}>
                <h2 className={styles.cardTitle}>Edit Works</h2>
                <form onSubmit={handleSave} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="title" className={styles.label}>Section Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="status" className={styles.label}>Status</label>
                        <input
                            type="text"
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className={styles.input}
                            placeholder="e.g., Available, Coming Soon"
                        />
                    </div>

                    <div className={styles.projectsSection}>
                        <h3 className={styles.sectionTitle}>Projects</h3>

                        {items.length === 0 ? (
                            <p className={styles.emptyMessage}>No projects yet. Add your first project below!</p>
                        ) : (
                            <div className={styles.projectsList}>
                                {items.map((project, index) => (
                                    <div key={index} className={styles.projectCard}>
                                        {project.image && (
                                            <img
                                                src={project.image}
                                                alt={project.title}
                                                className={styles.projectImage}
                                                onError={(e) => {
                                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="80"%3E%3Crect fill="%23ddd" width="120" height="80"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                                                }}
                                            />
                                        )}
                                        <div className={styles.projectInfo}>
                                            <span className={styles.projectTitle}>{project.title}</span>
                                            <span className={styles.projectDesc}>{project.description}</span>
                                            {project.link && (
                                                <a href={project.link} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                                                    View Project →
                                                </a>
                                            )}
                                        </div>
                                        <div className={styles.projectActions}>
                                            <button
                                                type="button"
                                                onClick={() => handleEditProject(index)}
                                                className={styles.editBtn}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteProject(index)}
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
                            {editingIndex !== null ? 'Edit Project' : 'Add New Project'}
                        </h3>

                        <div className={styles.formGroup}>
                            <label htmlFor="projectTitle" className={styles.label}>Title *</label>
                            <input
                                type="text"
                                id="projectTitle"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className={styles.input}
                                placeholder="e.g., Portfolio Website"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="projectDesc" className={styles.label}>Description *</label>
                            <textarea
                                id="projectDesc"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className={styles.textarea}
                                placeholder="Brief description of the project"
                                rows={3}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="projectImage" className={styles.label}>Image URL *</label>
                            <input
                                type="text"
                                id="projectImage"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                className={styles.input}
                                placeholder="/assets/project.jpg or https://example.com/image.jpg"
                            />
                            <small className={styles.hint}>
                                Upload image to /public/assets/ or use external URL
                            </small>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="projectLink" className={styles.label}>Project Link</label>
                            <input
                                type="url"
                                id="projectLink"
                                value={formData.link}
                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                className={styles.input}
                                placeholder="https://example.com"
                            />
                        </div>

                        <div className={styles.addActions}>
                            {editingIndex !== null ? (
                                <>
                                    <button type="button" onClick={handleUpdateProject} className={styles.addButton}>
                                        Update Project
                                    </button>
                                    <button type="button" onClick={handleCancelEdit} className={styles.cancelEditButton}>
                                        Cancel Edit
                                    </button>
                                </>
                            ) : (
                                <button type="button" onClick={handleAddProject} className={styles.addButton}>
                                    Add Project
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

                    {statusMsg && <div className={styles.status}>{statusMsg}</div>}
                </form>
            </div>

            <div className={styles.previewCard}>
                <h2 className={styles.cardTitle}>Preview</h2>
                <div className={styles.preview}>
                    <h3 className={styles.previewTitle}>{title || 'Works'}</h3>
                    <p className={styles.previewStatus}>{status || 'Coming Soon'}</p>

                    {items.length === 0 ? (
                        <p className={styles.previewEmpty}>No projects to display</p>
                    ) : (
                        <div className={styles.previewGrid}>
                            {items.map((project, index) => (
                                <div key={index} className={styles.previewProject}>
                                    {project.image && (
                                        <img
                                            src={project.image}
                                            alt={project.title}
                                            className={styles.previewImage}
                                            onError={(e) => {
                                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23ddd" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                                            }}
                                        />
                                    )}
                                    <h4 className={styles.previewProjectTitle}>{project.title}</h4>
                                    <p className={styles.previewProjectDesc}>{project.description}</p>
                                    {project.link && (
                                        <a href={project.link} target="_blank" rel="noopener noreferrer" className={styles.previewProjectLink}>
                                            View Project →
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
