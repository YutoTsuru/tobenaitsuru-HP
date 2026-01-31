'use client';

import { useActionState } from 'react';
import { login } from '../../actions';
import styles from './page.module.css';

// Initial state for useActionState
const initialState = {
    error: null
};

export default function Login() {
    const [state, formAction] = useActionState(login, initialState);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Admin Login</h1>
                <form action={formAction} className={styles.form}>
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        className={styles.input}
                        required
                    />
                    <button type="submit" className={styles.button}>Login</button>

                    {state?.error && <p className={styles.error}>{state.error}</p>}
                </form>
            </div>
        </div>
    );
}
