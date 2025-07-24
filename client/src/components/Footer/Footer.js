import React from 'react';
import './styles.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-links">
                    <a href="#" className="footer-link">
                        About Us
                    </a>
                    <a href="#" className="footer-link">
                        Contact
                    </a>
                    <a href="#" className="footer-link">
                        FAQ
                    </a>
                    <a href="#" className="footer-link">
                        Privacy Policy
                    </a>
                    <a href="#" className="footer-link">
                        Terms of Service
                    </a>
                </div>

                <div className="footer-social">
                    <a href="#" className="social-link" aria-label="Facebook">
                        {/* Facebook SVG */}
                        <svg
                            className="social-icon"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.64l.36-4H14V7a1 1 0 0 1 1-1h3z" />
                        </svg>
                    </a>
                    <a href="#" className="social-link" aria-label="Twitter">
                        {/* Twitter SVG */}
                        <svg
                            className="social-icon"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.43.36a9.09 9.09 0 0 1-2.88 1.1A4.48 4.48 0 0 0 16.11 0c-2.5 0-4.5 2.24-4.5 5 0 .39.04.76.12 1.12A12.94 12.94 0 0 1 3 1.13a5.06 5.06 0 0 0-.61 2.52c0 1.74.87 3.28 2.19 4.18A4.48 4.48 0 0 1 2 6.13v.06c0 2.43 1.72 4.45 4.07 4.91a4.52 4.52 0 0 1-2.04.08c.58 1.88 2.26 3.25 4.25 3.29A9.05 9.05 0 0 1 1 19.54a12.94 12.94 0 0 0 7 2.06c8.39 0 13-7.72 13-14.42 0-.22 0-.43-.02-.64A9.93 9.93 0 0 0 23 3z" />
                        </svg>
                    </a>
                    <a href="#" className="social-link" aria-label="Instagram">
                        {/* Instagram SVG */}
                        <svg
                            className="social-icon"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                            <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
                        </svg>
                    </a>
                </div>

                <p className="footer-copyright">© 2024 Petopia. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
