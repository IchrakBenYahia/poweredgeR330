import React from 'react';
import SNMPData from './SNMPData';
import Footer from './footer';
import Header from './header';
import './App.css'; // Import the CSS file
import TemperatureLineChartHour from './SimpleLineChartHour';
import TemperatureLineChartDay from './temLineChartDay';

const App = () => {
    return (
        <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <SNMPData />
            </div>
            <div className="chart-container">
                <div style={{ flex: 1 }}>
                    <TemperatureLineChartHour />
                </div>
                <div style={{ flex: 1 }}>
                    <TemperatureLineChartDay />
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default App;
