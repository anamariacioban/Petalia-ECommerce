import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './FavoritesPage.css';

function FavoritesPage() {
    const [favorite, setFavorite] = useState([]);
    const navigate = useNavigate();
    const idUser = localStorage.getItem('idUser');

    useEffect(() => {
        // Fetch către endpoint-ul de backend (pasul de mai jos)
        if (idUser) {
            fetch(`http://localhost:5000/api/favorite/${idUser}`)
                .then(res => res.json())
                .then(data => setFavorite(data))
                .catch(err => console.error("Eroare la încărcarea favoritelor:", err));
        }
    }, [idUser]);

    return (
        <div className="favorites-page-wrapper">
            <div className="favorites-card">
                <div className="favorites-header">
                    <ArrowLeft 
                        className="back-arrow" 
                        onClick={() => navigate('/client-home')} 
                    />
                    <h1 className="favorites-title">Preferate</h1>
                </div>

                <div className="favorites-scroll-area">
                    {favorite.length > 0 ? (
                        favorite.map((item, index) => (
                            <div key={index} className="favorite-row">
                                <div className="favorite-info">
                                    <span className="flower-name">{item.nume}</span>
                                    <span className="flower-details">{item.culoare}</span>
                                </div>
                                <div className="favorite-price">
                                    {item.pret} RON
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="empty-message">Nu ai adăugat nicio floare la preferate.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FavoritesPage;