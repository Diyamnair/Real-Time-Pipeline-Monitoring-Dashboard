import paho.mqtt.client as mqtt
import random
import time
import json

MQTT_BROKER = 'broker.hivemq.com'
MQTT_PORT = 1883
MQTT_TOPIC = 'iot/sensors'

client = mqtt.Client()
client.connect(MQTT_BROKER, MQTT_PORT, 60)

while True:
    data = {
        "temperature": round(random.uniform(20, 30), 2),
        "pressure": round(random.uniform(1000, 1015), 2),
        "gas": round(random.uniform(200, 300), 2)
    }
    client.publish(MQTT_TOPIC, json.dumps(data))
    print("Published data:", data)
    time.sleep(2)
