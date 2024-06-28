import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SNMPData.css';
import { faCheck, faTimes, faFan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const SNMPData = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [fanStates, setFanStates] = useState([]);
    const [etatDisque, setEtatDisque] = useState([]);
    const [etatSystem, setEtatSystem] = useState([]);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/api/snmp');
            setData(response.data);
            filterFanStates(response.data);
            filterEtatSystem(response.data);
            filterEtatDisque(response.data);
            setError(null);
        } catch (err) {
            setError('Error fetching data');
            setData([]);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filterFanStates = (data) => {
        const fanStates = data.filter(item => item.name.includes('Etat ventilateur'));
        setFanStates(fanStates);
    };

    const filterEtatDisque = (data) => {
        const EtatDisque = data.filter(item => item.name.includes('Etat des disques'));
        setEtatDisque(EtatDisque);
    };

    const filterEtatSystem = (data) => {
        const EtatSystem = data.filter(item => item.name.includes('Etat système'));
        setEtatSystem(EtatSystem);
    };

    const renderFanIcon = (fan) => {
        if (fan.name.includes('Etat ventilateur')) {
            return (
                <FontAwesomeIcon 
                    icon={faFan} 
                    className="fan-icon" 
                    style={{ color: fan.value === '3' ? 'green' : 'red' }} 
                    title={`Fan state for ${fan.name}`} 
                />
            );
        } else if (fan.name.includes('Etat système') && fan.value !== '3') {
            return (
                <div className="warning-icon">
                    <img className="warning-icon" style={{ width: '136px' }}  src={`${process.env.PUBLIC_URL}/triangle_Danger.png`} alt="Warning: System state" />
                </div>
            );
        } else {
            return null;
        }
    };

    const renderOverallIcons = () => {
        const hasWarning =  etatDisque.some(item => item.value !== '3');
        const icon = hasWarning ? faTimes : faCheck;
        const color = hasWarning ? 'red' : 'green';
    
        return (
            <div className="overall-icons">
                {Array.from({ length: 4 }).map((_, index) => (
                    <FontAwesomeIcon 
                        key={index}
                        icon={icon} 
                        className="overall-icon" 
                        style={{ color, fontSize: '20px', margin: '0 50px' }}  // Adjusted margin here
                        title={hasWarning ? 'Error detected' : 'All systems operational'} 
                    />
                ))}
            </div>
        );
    };

    const getUnit = (name) => {
        switch (name) {
            case 'T° air aspiré':
            case 'T° processeur':
                return '°c';
            case 'Tension':
                return 'Volt';
            case 'Courant':
                return 'Ampere';
            case 'Puissance':
                return 'Watt';
            default:
                return '';
        }
    };

    const getThresholds = (name) => {
        switch (name) {
            case 'T° air aspiré':
                return { max: 30 };
            case 'T° processeur':
                return { max: 50 };
            case 'Tension':
                return { min: 220, max: 244 };
            case 'Courant':
                return { max: 1 };
            case 'Puissance':
                return { max: 220 };
            default:
                return { min: -Infinity, max: Infinity };
        }
    };
    
    const renderValue = (value, name) => {
        let val = value;
        const thresholds = getThresholds(name);
    
        switch (name) {
            case 'Etat du serveur':
                if (value !== '3') {
                    val = (
                        <>
                            <FontAwesomeIcon icon={faTimes} style={{ color: 'red' }} /> Off
                        </>
                    );
                } else {
                    val = (
                        <>
                            <FontAwesomeIcon icon={faCheck} style={{ color: 'green' }} /> On
                        </>
                    );
                }
                break;
            case 'T° air aspiré':
            case 'T° processeur':
                val = Math.round(parseFloat(value) / 10);
                break;
            case 'Tension':
                val = Math.round(parseFloat(value) / 1000);
                break;
            case 'Courant':
                val = (parseFloat(value) / 10).toFixed(1);
                break;
            default:
                break;
        }
    
        const isOutOfRange = parseFloat(val) < thresholds.min || parseFloat(val) > thresholds.max;
    
        if (name === 'Etat du serveur') {
            return val;
        } else {
            return (
                <span style={{ color: isOutOfRange ? 'red' : 'green' }}>
                    {val}
                </span>
            );
        }
    };
    

    return (
        <div className="snmp-container">
            <div className="content">
                <div className="left-content">
                    <div className="image-container">
                        {etatDisque.length > 0 && renderOverallIcons()}
                        <img className="centered-image" src={`${process.env.PUBLIC_URL}/PowerEdgeR330.jpg`} alt="PowerEdgeR330" />
                        <div>
                            {etatSystem.map((fan, index) => renderFanIcon(fan, index))}
                        </div>
                        <div>
                            {etatDisque.map((fan, index) => renderFanIcon(fan, index))}
                        </div>
                        <div className="icon-row">
                            {fanStates.map((fan, index) => renderFanIcon(fan, index))}
                        </div>
                    </div>
                </div>
                <div className="right-content">
                    <div className="table-container">
                        {data.length > 0 ? (
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th colSpan="2" scope="col">Paramètre</th>
                                        <th scope="col">Valeur</th>
                                        <th scope="col">Unité</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item) => (
                                        !item.name.includes('Etat ventilateur') && !item.name.includes('Etat des disques') && (
                                            item.name.includes('Etat système') ? (
                                                item.value === '3' && (
                                                    <tr key={item.name}>
                                                        <td colSpan="2">{item.name}</td>
                                                        <td>OK</td>
                                                        <td></td>
                                                    </tr>
                                                )
                                            ) : (
                                                <tr key={item.name}>
                                                    <td colSpan="2">{item.name}</td>
                                                    <td>{renderValue(item.value, item.name)}</td>
                                                    <td>{getUnit(item.name)}</td>
                                                </tr>
                                            )
                                        )
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No data fetched yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SNMPData;
