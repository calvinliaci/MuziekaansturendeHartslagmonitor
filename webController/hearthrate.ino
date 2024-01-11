/***************************************************************************
* voorbeeld voor Lilygo TTGO Lora32 T3 V2.1 board 
* (selecteer in arduino het bord TTGO Lora32-OLED)
* gebruikte library : PubSubClient by Nick O'Leary Versie 2.8
***************************************************************************/
#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include "MAX30105.h"

#include "heartRate.h"
WiFiClient espClient;
PubSubClient mqttClient(espClient);
MAX30105 particleSensor;

const byte RATE_SIZE = 4; //Increase this for more averaging. 4 is good.
byte rates[RATE_SIZE]; //Array of heart rates
byte rateSpot = 0;
long lastBeat = 0; //Time at which the last beat occurred

float beatsPerMinute;
int beatAvg;
const char* SSIDName = "Boven";
const char* Password = "PreMet123.";
const int ledPin = 25;
unsigned long startMillis = 0;
unsigned long lastMessageMillis = 0;
const int ecgPin = A0;
unsigned long lastPeakTime = 0;
unsigned int peakInterval = 600;
int threshold = 100;

const char* MQTT_SERVER = "linuxservermh.northeurope.cloudapp.azure.com";
const int MQTT_PORT = 1883;

const String MQTT_CLIENTID = "ESP32-" + String(random(0xffff), HEX);

int counter = 0;


void setup() {
  Serial.begin(115200);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSIDName, Password);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(1000);
  }
  Serial.println(WiFi.localIP());
  
  Serial.println("Initializing...");

  // Initialize sensor
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) //Use default I2C port, 400kHz speed
  {
    Serial.println("MAX30105 was not found. Please check wiring/power. ");
    while (1);
  }
  Serial.println("Place your index finger on the sensor with steady pressure.");

  particleSensor.setup(); //Configure sensor with default settings
  particleSensor.setPulseAmplitudeRed(0x0A); //Turn Red LED to low to indicate sensor is running
  particleSensor.setPulseAmplitudeGreen(0); //Turn off Green LED
}

void connectMQTT() {
  Serial.println("Connecting to MQTT Server ... ");
  mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
 

  if (mqttClient.connect(MQTT_CLIENTID.c_str())) {
    Serial.print("Connected to MQTT Server with Clientid : ");
    Serial.println(MQTT_CLIENTID);

    String topic = "ucll/muziekaansturendehartslagmonitor";
    if (mqttClient.subscribe(topic.c_str())) {
      Serial.print("Subscribed to topic : ");
      Serial.println(topic);
    }
  } else {
    Serial.println("Connection failed !");
    Serial.println(mqttClient.state());
  }
}


void loop() {
  unsigned long currentMillis = millis();
   float heartRate = 0.0;
  if ((WiFi.status() != WL_CONNECTED) && (currentMillis - startMillis >= 30000)) {
    Serial.println("Reconnecting WiFi");
    digitalWrite(ledPin, LOW);
    WiFi.disconnect();
    WiFi.reconnect();
    startMillis = currentMillis;
  }

  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(ledPin, HIGH);

    if (!mqttClient.connected()) {
      connectMQTT();
    }

    mqttClient.loop();

    long irValue = particleSensor.getIR();

  if (checkForBeat(irValue) == true)
  {
    //We sensed a beat!
    long delta = millis() - lastBeat;
    lastBeat = millis();

    beatsPerMinute = 60 / (delta / 1000.0);

    if (beatsPerMinute < 255 && beatsPerMinute > 20)
    {
      rates[rateSpot++] = (byte)beatsPerMinute; //Store this reading in the array
      rateSpot %= RATE_SIZE; //Wrap variable

      //Take average of readings
      beatAvg = 0;
      for (byte x = 0 ; x < RATE_SIZE ; x++)
        beatAvg += rates[x];
      beatAvg /= RATE_SIZE;
    }
  }

  
  Serial.print("BPM=");
  Serial.print(beatsPerMinute);
  Serial.print(", Avg BPM=");
  Serial.print(beatAvg);


  Serial.println();

    
      counter++;
      String msg =  String(beatsPerMinute);
      String topic = "ucll/muziekaansturendehartslagmonitor";
      mqttClient.publish(topic.c_str(), msg.c_str());
      
    }
  }

