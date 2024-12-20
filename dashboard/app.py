from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import paho.mqtt.client as mqtt
import threading
import random
import time
from flask_mysql import MySQL

app = Flask(__name__, template_folder='templates', static_folder='static')
socketio = SocketIO(app)

# MySQL configuration
app.config['MYSQL_HOST'] = 'localhost'  # MySQL server address
app.config['MYSQL_USER'] = 'your_mysql_user'
app.config['MYSQL_PASSWORD'] = 'your_mysql_password'
app.config['MYSQL_DB'] = 'pipeline_monitoring'

mysql = MySQL(app)

MQTT_BROKER = 'broker.hivemq.com'
MQTT_PORT = 1883
MQTT_TOPIC = 'pipeline/monitoring'

def simulate_sensor_data():
    client = mqtt.Client()
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    while True:
        data = {
            "temperature": round(random.uniform(20.0, 100.0), 2),
            "pressure": round(random.uniform(1.0, 10.0), 2),
            "gas": round(random.uniform(0.0, 5.0), 2),
        }
        client.publish(MQTT_TOPIC, str(data))
        time.sleep(2)

def on_connect(client, userdata, flags, rc):
    print(f"Connected to MQTT Broker with result code {rc}")
    client.subscribe(MQTT_TOPIC)

def on_message(client, userdata, msg):
    data = eval(msg.payload.decode())
    print(f"Received Data: {data}")
    
    # Insert data into MySQL
    cursor = mysql.connection.cursor()
    cursor.execute("INSERT INTO sensor_data (temperature, pressure, gas) VALUES (%s, %s, %s)", 
                   (data['temperature'], data['pressure'], data['gas']))
    mysql.connection.commit()
    cursor.close()

    # Emit data to frontend
    socketio.emit('sensor_data', data)

mqtt_client = mqtt.Client()
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message
mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)

threading.Thread(target=mqtt_client.loop_forever).start()
threading.Thread(target=simulate_sensor_data).start()

@app.route('/')
def index():
    return render_template('dashboard.html')

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)
