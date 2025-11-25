import React from 'react';
import './PhoneMockup.css';

const PhoneMockup = ({ imageSrc, altText }) => {
    return (
        <div className="phone-mockup">
            <div className="phone-frame">
                <div className="phone-notch">
                    <div className="camera"></div>
                    <div className="speaker"></div>
                </div>
                <div className="power-btn"></div>
                <div className="volume-btn volume-up"></div>
                <div className="volume-btn volume-down"></div>
                <div className="phone-screen">
                    <img src={imageSrc} alt={altText} className="screen-content" />

                    {/* UI Overlay simulando interface do app */}
                    <div className="app-ui-overlay">
                        <div className="status-bar">
                            <span className="time">9:41</span>
                            <div className="status-icons">
                                <span className="signal">📶</span>
                                <span className="wifi">Wi-Fi</span>
                                <span className="battery">🔋</span>
                            </div>
                        </div>

                        <div className="app-nav-bar">
                            <div className="nav-icon home active">🏠</div>
                            <div className="nav-icon scan">📸</div>
                            <div className="nav-icon profile">👤</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhoneMockup;
