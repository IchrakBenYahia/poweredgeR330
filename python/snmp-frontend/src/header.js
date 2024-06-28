import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Header = () => {
  return (
    <>
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow fixed-top">
        <div className="container d-flex justify-content-between align-items-center">
          <a href="#" className="order-1 order-lg-2">
            <img src={`${process.env.PUBLIC_URL}/logo-accompanyconsulting-tnp.png`} alt="Accompany Logo" style={{ height: '40px', marginRight: '10px' }} />
          </a>
          <a className="navbar-brand order-2 order-lg-1" href="#">
            SERVEUR POWEREDGE R330
          </a>
        </div>
      </nav>
      <div style={{ height: '70px' }} />
    </>
  );
};

export default Header;