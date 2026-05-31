import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const savedToken = typeof window !== 'undefined' ? localStorage.getItem('dispensaryToken') : null;
        if (savedToken) {
            router.replace('/');
        }
    }, [router]);

    async function submitForm(event) {
        event.preventDefault();
        setLoading(true);
        setMessage('');

        const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim().toLowerCase(), password })
        });

        const result = await response.json();
        setLoading(false);

        if (response.ok) {
            localStorage.setItem('dispensaryToken', result.token);
            router.push('/');
        } else {
            setMessage(result.error || 'Unable to proceed.');
        }
    }

    return (
        <main className="login-shell">
            <div className="login-glass fade-in-up">
                <div className="brand-banner pulse-card">
                    <h1>Bharat Traders And Garage</h1>
                    <p>Login or register to manage your stock with one clean, responsive tool.</p>
                </div>

                <div className="auth-panel">
                    <div className="auth-header">
                        <button className={mode === 'login' ? 'tab active' : 'tab'} onClick={() => setMode('login')}>
                            Login
                        </button>
                        <button className={mode === 'register' ? 'tab active' : 'tab'} onClick={() => setMode('register')}>
                            Register
                        </button>
                    </div>

                    <form onSubmit={submitForm} className="auth-form">
                        <label>
                            Email
                            <input autoComplete="username" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                        </label>
                        <label>
                            Password
                            <input autoComplete={mode === 'login' ? 'current-password' : 'new-password'} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} required />
                        </label>
                        <button type="submit" className="primary-button" disabled={loading}>
                            {loading ? 'Processing…' : mode === 'login' ? 'Login' : 'Create account'}
                        </button>
                        <p className="auth-note">{mode === 'login' ? 'New here? Create an account to save inventory online.' : 'Already have an account? Login to access shared stock.'}</p>
                        {message ? <p className="error-text">{message}</p> : null}
                    </form>
                </div>
            </div>
        </main>
    );
}
