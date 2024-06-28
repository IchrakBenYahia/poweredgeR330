from flask import Flask, jsonify
from pysnmp.hlapi import *
from flask_cors import CORS
import cx_Oracle
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(app)

IP_ADDRESS = '41.226.179.43'
COMMUNITY = 'public'

OIDS = [
    '.1.3.6.1.4.1.674.10892.5.2.2.0',
    '.1.3.6.1.4.1.674.10892.5.2.3.0',
    '.1.3.6.1.4.1.674.10892.5.2.4.0',
    '.1.3.6.1.4.1.674.10892.5.4.700.20.1.6.1.1',
    '.1.3.6.1.4.1.674.10892.5.4.700.20.1.6.1.2',
    '.1.3.6.1.4.1.674.10892.5.4.600.20.1.6.1.13',
    '.1.3.6.1.4.1.674.10892.5.4.600.30.1.6.1.1',
    '.1.3.6.1.4.1.674.10892.5.4.600.30.1.6.1.3',
    '.1.3.6.1.4.1.674.10892.5.4.700.12.1.5.1.1',
    '.1.3.6.1.4.1.674.10892.5.4.700.12.1.5.1.2',
    '.1.3.6.1.4.1.674.10892.5.4.700.12.1.5.1.3',
    '.1.3.6.1.4.1.674.10892.5.4.700.12.1.5.1.4',
    '.1.3.6.1.4.1.674.10892.5.4.700.12.1.5.1.5',
    '.1.3.6.1.4.1.674.10892.5.4.700.12.1.5.1.6'
]
OID_NAME = [
    'Etat système',
    'Etat des disques',
    'Etat du serveur',
    'T° air aspiré',
    'T° processeur',
    'Tension',
    'Courant',
    'Puissance',
    'Etat ventilateur 1',
    'Etat ventilateur 2',
    'Etat ventilateur 3',
    'Etat ventilateur 4',
    'Etat ventilateur 5',
    'Etat ventilateur 6',
]

def get_snmp_data(oids, oid_names):
    result = []
    for oid, name in zip(oids, oid_names):
        iterator = getCmd(
            SnmpEngine(),
            CommunityData(COMMUNITY),
            UdpTransportTarget((IP_ADDRESS, 161)),
            ContextData(),
            ObjectType(ObjectIdentity(oid))
        )
        errorIndication, errorStatus, errorIndex, varBinds = next(iterator)
        if errorIndication:
            result.append({"name": name, "value": f"Error: {errorIndication}"})
        elif errorStatus:
            result.append({"name": name, "value": f"Error: {errorStatus.prettyPrint()}"})
        else:
            for varBind in varBinds:
                oid_value = varBind[1].prettyPrint()
                result.append({"name": name, "value": oid_value})
    return result

@app.route('/api/snmp', methods=['GET'])
def snmp():
    data = get_snmp_data(OIDS, OID_NAME)
    return jsonify(data)

def connect_to_oracle():
    connection = cx_Oracle.connect('sys/oracle@localhost/ORCL', mode=cx_Oracle.SYSDBA)
    return connection

def execute_query_hour(connection):
    cursor = connection.cursor()
    cursor.execute('SELECT heure, temperature FROM temperature_cpu_Hour order by id')
    data = cursor.fetchall()
    cursor.close()
    return data

@app.route('/api/tempData', methods=['GET'])
def database_hour():
    connection = connect_to_oracle()
    data = execute_query_hour(connection)
    return jsonify(data)

def execute_query_day(connection):
    cursor = connection.cursor()
    cursor.execute('SELECT jour, temperature FROM temperature_cpu_Day order by id')
    data = cursor.fetchall()
    cursor.close()
    return data

@app.route('/api/tempDataDay', methods=['GET'])
def database_day():
    connection = connect_to_oracle()
    data = execute_query_day(connection)
    return jsonify(data)

def insert_temperature_hour(connection, temperature):
    cursor = connection.cursor()
    current_time = datetime.now().strftime('%H:%M')  # Formatage de l'heure au format HH:MM
    cursor.execute("INSERT INTO temperature_cpu_Hour (heure, temperature) VALUES (:heure, :temperature)", {'heure': current_time, 'temperature': temperature})
    connection.commit()
    cursor.close()

def get_temperature():
    data = get_snmp_data(OIDS, OID_NAME)
    for item in data:
        if item['name'] == 'T° processeur':  # Modifier selon votre besoin
            return item['value']
    return None

def calculate_daily_average(connection):
    cursor = connection.cursor()
    cursor.execute('SELECT AVG(temperature) FROM temperature_cpu_Hour')
    avg_temperature = cursor.fetchone()[0]
    
    if avg_temperature is not None:
        current_day = datetime.now().strftime('%Y-%m-%d')
        cursor.execute("INSERT INTO temperature_cpu_Day (jour, temperature) VALUES (:jour, :temperature)",
                       {'jour': current_day, 'temperature': avg_temperature})
        connection.commit()
    
    cursor.execute('DELETE FROM temperature_cpu_Hour')
    connection.commit()
    cursor.close()

def job():
    connection = connect_to_oracle()
    temperature = get_temperature()
    if temperature is not None:
        try:
            temperature = float(temperature) / 10  # Diviser la température par 10 avant de l'enregistrer
            logging.debug(f'Temperature after division: {temperature}')
            insert_temperature_hour(connection, temperature)
        except ValueError:
            logging.error(f"Erreur : La valeur de la température '{temperature}' n'est pas un nombre.")
    connection.close()

def daily_job():
    connection = connect_to_oracle()
    calculate_daily_average(connection)
    connection.close()

scheduler = BackgroundScheduler()
scheduler.add_job(job, 'interval', minutes=1)  # Toutes les minutes hours=1
scheduler.add_job(daily_job, 'interval', minutes=10)  # Toutes les 30 minutes hours=24
scheduler.start()

if __name__ == '__main__':
    app.run(debug=True)
