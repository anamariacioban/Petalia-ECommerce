import React from 'react';
import { Menu, Heart, ShoppingCart, Search } from 'lucide-react';
import './ClientHomePage.css';

import ImagineFlori from './floare.png';
import ImagineBuchete from './buchet.png';
import ImagineAranjamente from './aranjament.png';
import ImagineGhivece from './ghiveci.png';

function ClientHomePage() {
  return (
    <div className="pagina-fundal-completa">
      {/* Header cu Iconițe */}
      <div className="header-client">
        <Menu className="icon-alb" size={32} />
        <div className="header-dreapta">
          <Heart className="icon-alb" size={32} />
          <ShoppingCart className="icon-alb" size={32} />
        </div>
      </div>

      {/* Bara de Căutare */}
      <div className="container-search">
        <div className="bara-cautare">
          <Search className="icon-search" size={20} />
          <input type="text" placeholder="Caută flori..." />
        </div>
      </div>

      {/* Grid Categorii */}
      <div className="grid-categorii">
        <div className="categorie-card">
          <img src={ImagineFlori} alt="Flori" />
          <span>Flori</span>
        </div>
        <div className="categorie-card">
          <img src={ImagineBuchete} alt="Buchete" />
          <span>Buchete</span>
        </div>
        <div className="categorie-card">
          <img src={ImagineAranjamente} alt="Aranjamente" />
          <span>Aranjamente florale</span>
        </div>
        <div className="categorie-card">
          <img src={ImagineGhivece} alt="Ghivece" />
          <span>Ghivece</span>
        </div>
      </div>
    </div>
  );
}

export default ClientHomePage;