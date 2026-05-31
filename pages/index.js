import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

const suggestions = [
    'Solar 2T 500 ml',
    'Solar 2T 1 Litre',
    'IMAX 2T 500 ml',
    'IMAX 2T 1 Litre',
    'MAK 2T 500 ml',
    'MAK 2T 1 Litre',
    'Sarvoday 2T 500 ml',
    'Sarvoday 2T 1 Litre',
    'Bosch 100 ml',
    'Bosch 250 ml',
    'HP 4T 900 ml'
];

export default function Home() {
    const router = useRouter();
    const [token, setToken] = useState('');
    const [items, setItems] = useState([]);
    const [name, setName] = useState('');
    const [count, setCount] = useState(1);
    const [editingItem, setEditingItem] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const totalCount = useMemo(() => items.reduce((total, item) => total + Number(item.count), 0), [items]);

    useEffect(() => {
        const savedToken = typeof window !== 'undefined' ? localStorage.getItem('dispensaryToken') : null;
        if (!savedToken) {
            router.push('/login');
            return;
        }
        setToken(savedToken);
        loadItems(savedToken);
    }, [router]);

    async function loadItems(atoken) {
        setLoading(true);
        const response = await fetch('/api/items', {
            headers: { Authorization: `Bearer ${atoken}` }
        });
        if (response.ok) {
            const data = await response.json();
            setItems(data.items);
        } else {
            localStorage.removeItem('dispensaryToken');
            router.push('/login');
        }
        setLoading(false);
    }

    async function saveItem(event) {
        event.preventDefault();
        if (!name.trim() || count < 0) {
            setMessage('Please enter a valid item name and count.');
            return;
        }

        const response = await fetch('/api/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ name: name.trim(), count: Number(count) })
        });

        if (response.ok) {
            setMessage(editingItem ? `${editingItem} updated.` : 'Item saved successfully.');
            setName('');
            setCount(1);
            setEditingItem(null);
            loadItems(token);
        } else {
            setMessage('Could not save item. Please refresh and try again.');
        }
    }

    async function removeItem(itemName) {
        const response = await fetch('/api/items', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ name: itemName })
        });
        if (response.ok) {
            setMessage('Item removed.');
            loadItems(token);
        }
    }

    function editItem(item) {
        setEditingItem(item.name);
        setName(item.name);
        setCount(item.count);
        setMessage(`Editing ${item.name}. Update the count and save.`);
    }

    function pickSuggestion(suggestion) {
        setName(suggestion);
        setCount(1);
        setMessage(`Ready to add ${suggestion}.`);
    }

    function signOut() {
        localStorage.removeItem('dispensaryToken');
        router.push('/login');
    }

    return (
        <main className="page-shell">
            <section className="hero-panel fade-in-up">
                <div className="hero-copy">
                    <p className="eyebrow">Bharat Traders And Garage</p>
                    <h1>Bharat Traders And Garage inventory management</h1>
                    <p className="hero-description">
                        Add items, update counts, choose suggested lubricant stock, and keep your inventory neat and easy to manage.
                    </p>
                    <div className="hero-stats">
                        <div>
                            <span>{items.length}</span>
                            <small>Items</small>
                        </div>
                        <div>
                            <span>{totalCount}</span>
                            <small>Total count</small>
                        </div>
                    </div>
                    <button className="ghost-button" type="button" onClick={signOut}>
                        Sign out
                    </button>
                </div>

                <div className="hero-card pulse-card">
                    <div className="card-top">New stock</div>
                    <form onSubmit={saveItem} className="item-form">
                        <label>
                            Item name
                            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Bosch 250 ml" />
                        </label>
                        <label>
                            Count
                            <input type="number" min="0" value={count} onChange={(event) => setCount(Number(event.target.value))} />
                        </label>
                        <button type="submit">{editingItem ? 'Update item' : 'Add / Update item'}</button>
                    </form>
                    <p className="status-text">{message}</p>
                </div>
            </section>

            <section className="content-grid fade-in-up delay-1">
                <div className="panel suggestions-panel">
                    <div className="panel-header">
                        <h2>Suggested items</h2>
                        <p>Tap any suggested stock to prefill the form.</p>
                    </div>
                    <div className="suggestion-grid">
                        {suggestions.map((suggestion) => (
                            <button key={suggestion} type="button" className="suggestion-pill" onClick={() => pickSuggestion(suggestion)}>
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="panel inventory-panel">
                    <div className="panel-header">
                        <h2>Current inventory</h2>
                        <p>Update counts instantly using the same item name in the form.</p>
                    </div>
                    <div className="inventory-list">
                        {loading ? (
                            <div className="loader">Loading inventory...</div>
                        ) : items.length === 0 ? (
                            <div className="empty-state">Your inventory is empty. Start by adding an item.</div>
                        ) : (
                            items.map((item) => (
                                <div key={item.name} className="inventory-row glow-card">
                                    <div>
                                        <strong>{item.name}</strong>
                                        <small>{item.count} units</small>
                                    </div>
                                    <div className="inventory-actions">
                                        <button className="edit-button" type="button" onClick={() => editItem(item)}>
                                            Edit
                                        </button>
                                        <button className="delete-button" type="button" onClick={() => removeItem(item.name)}>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
