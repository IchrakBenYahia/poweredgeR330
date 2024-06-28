import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Footer = () => {
  return (
    <footer className="text-center bg-body-tertiary" style={{ flexShrink: 0 }}>
      <div className="container pt-2">
        <section className="mb-2">
          <a
            className="btn btn-link btn-floating btn-sm text-body"
            href="https://www.facebook.com/accompanyconsulting1/"
            role="button"
            data-mdb-ripple-color="dark"
          >
            <i className="fab fa-facebook-f"></i>
          </a>
          <a
            className="btn btn-link btn-floating btn-sm text-body"
            href="https://www.accompanyconsulting.net/"
            role="button"
            data-mdb-ripple-color="dark"
          >
            <i className="fab fa-google"></i>
          </a>
          <a
            className="btn btn-link btn-floating btn-sm text-body"
            href="https://www.linkedin.com/company/accompany-consulting/?originalSubdomain=ni"
            role="button"
            data-mdb-ripple-color="dark"
          >
            <i className="fab fa-linkedin"></i>
          </a>
          <a
            className="btn btn-link btn-floating btn-sm text-body"
            href="mailto:contact@accompanyconsulting.net"
            role="button"
            data-mdb-ripple-color="dark"
          >
            <i className="fas fa-envelope"></i> 
          </a>
        </section>
      </div>
      <div className="text-center p-3" style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
        © 2024 Copyright:
        <a className="text-body" href="https://www.accompanyconsulting.net/"> accompanyconsulting.net/</a>
      </div>
    </footer>
  );
};

export default Footer;
