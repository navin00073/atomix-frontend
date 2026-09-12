import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  Cpu,
  Wifi,
  Terminal,
  Send,
  CheckCircle2,
  AlertTriangle,
  Server,
  Activity,
  Fingerprint,
  Key,
  ShieldCheck,
  Zap,
  Code2,
  Copy,
  Check,
  Unlock,
  Sliders,
  RefreshCw,
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

export const IotDeviceCenter: React.FC = () => {
  const { iotDevices, pingDevice, rebootDevice, addAuditLog, staff, toggleStaffStatus, theme } = useHospital();

  const [activeView, setActiveView] = useState<'API_TESTER' | 'FIRMWARE_CODE'>('API_TESTER');
  const [selectedApiEndpoint, setSelectedApiEndpoint] = useState('/api/iot/fingerprint/scan');
  const [apiPayload, setApiPayload] = useState(
    JSON.stringify(
      {
        nodeId: 'ESP32-BIO-01',
        location: 'Main Entrance & ICCU Air-Lock',
        sensorModel: 'R307 Optical 508 DPI',
        mode: 'IDENTIFY_1_TO_N',
        fingerSlot: 1,
        personnelId: 'DOC-01',
        triggerRelay: true,
      },
      null,
      2
    )
  );
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isExecutingApi, setIsExecutingApi] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Switch payload template
  const handleEndpointSelect = (endpoint: string) => {
    setSelectedApiEndpoint(endpoint);
    setApiResponse(null);

    switch (endpoint) {
      case '/api/iot/fingerprint/scan':
        setApiPayload(
          JSON.stringify(
            {
              nodeId: 'ESP32-BIO-01',
              location: 'Main Entrance & ICCU Air-Lock',
              sensorModel: 'R307 Optical 508 DPI',
              mode: 'IDENTIFY_1_TO_N',
              fingerSlot: 1,
              personnelId: 'DOC-01',
              triggerRelay: true,
              relayPulseMs: 3000,
            },
            null,
            2
          )
        );
        break;
      case '/api/iot/fingerprint/match':
        setApiPayload(
          JSON.stringify(
            {
              nodeId: 'ESP32-BIO-01',
              templateHex: 'F5A1994B82E1...512BYTES',
              thresholdConfidence: 75.0,
              purpose: 'STAFF_ATTENDANCE_OR_PATIENT_QUEUE',
            },
            null,
            2
          )
        );
        break;
      case '/api/iot/fingerprint/enroll':
        setApiPayload(
          JSON.stringify(
            {
              nodeId: 'ESP32-BIO-01',
              targetSlot: 5,
              personnelId: 'DOC-02',
              fingerName: 'Right Index',
              dualPassVerified: true,
              storageTarget: 'R307_ONBOARD_FLASH',
            },
            null,
            2
          )
        );
        break;
      case '/api/iot/door/relay':
        setApiPayload(
          JSON.stringify(
            {
              nodeId: 'ESP32-BIO-01',
              relayPin: 'GPIO_26',
              durationSeconds: 3,
              triggerReason: 'AUTHORIZED_BIOMETRIC_ENTRY',
            },
            null,
            2
          )
        );
        break;
      case '/api/iot/fingerprint/status':
        setApiPayload(
          JSON.stringify(
            {
              nodeId: 'ESP32-BIO-01',
              uartPort: 'UART2 (GPIO 16 RX, GPIO 17 TX)',
              baudRate: 57600,
              query: ['CAPACITY', 'ENROLLED_COUNT', 'SECURITY_LEVEL', 'CHIP_ID'],
            },
            null,
            2
          )
        );
        break;
      case '/api/rfid/scan':
        setApiPayload(
          JSON.stringify(
            {
              readerId: 'RFID-UHF-01',
              rfidUid: '04:A3:92:7B:11',
              antennaRssi: -52,
            },
            null,
            2
          )
        );
        break;
      case '/api/patient/checkin':
        setApiPayload(
          JSON.stringify(
            {
              patientId: 'PT-1024',
              method: 'Fingerprint + RFID',
              priority: 'Normal',
            },
            null,
            2
          )
        );
        break;
      case '/api/vending/dispense':
        setApiPayload(
          JSON.stringify(
            {
              machineId: 'VM-01',
              slotNumber: 1,
              rfidUid: '04:A3:92:7B:11',
            },
            null,
            2
          )
        );
        break;
      case '/api/biometric/scan':
        setApiPayload(
          JSON.stringify(
            {
              deviceId: 'ESP32-BIO-01',
              fingerId: 3,
              confidence: 99.4,
              staffUid: 'STF-DR-01',
            },
            null,
            2
          )
        );
        break;
      case '/api/vitals/record':
        setApiPayload(
          JSON.stringify(
            {
              sensorId: 'SENS-VITALS-01',
              patientId: 'PT-1024',
              heartRate: 74,
              bloodPressure: '120/80',
              spO2: 99,
              temperatureCelsius: 36.8,
            },
            null,
            2
          )
        );
        break;
      default:
        setApiPayload('{}');
    }
  };

  const handleExecuteApi = () => {
    setIsExecutingApi(true);
    soundEffects.playCardScan();

    setTimeout(() => {
      let resp: any = {};
      try {
        const parsed = JSON.parse(apiPayload);
        const now = new Date();

        if (selectedApiEndpoint === '/api/iot/fingerprint/scan') {
          // Find personnel or use default
          const targetStaff = (staff || []).find((s) => s.id === parsed.personnelId) || staff?.[0];
          let attendanceAction = 'CLOCK_IN';
          if (targetStaff) {
            const toggleRes = toggleStaffStatus(targetStaff.id, 'Fingerprint', parsed.nodeId || 'ESP32-BIO-01');
            attendanceAction = toggleRes.action;
          }

          resp = {
            status: 200,
            message: 'Biometric Scan Validated & Access Granted',
            timestamp: now.toISOString(),
            terminal: {
              nodeId: parsed.nodeId || 'ESP32-BIO-01',
              sensor: 'R307 Optical 508 DPI Capacitive Matrix',
              firmware: 'v3.5.2-r307-esp32',
              baudRate: 57600,
            },
            biometricResult: {
              slotMatched: parsed.fingerSlot || 1,
              confidenceScore: 99.4,
              minutiaePoints: 46,
              imageQuality: 98,
              scanLatencyMs: 142,
            },
            personnel: targetStaff
              ? {
                  id: targetStaff.id,
                  name: targetStaff.name,
                  role: targetStaff.role,
                  department: targetStaff.department,
                  dutyShift: targetStaff.dutyShift,
                }
              : {
                  id: 'DOC-01',
                  name: 'Dr. Anand Verma MD',
                  role: 'DOCTOR',
                  department: 'Critical Care & Pulmonology',
                },
            attendance: {
              action: attendanceAction,
              recordedTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              status: 'VERIFIED_OK',
            },
            solenoidRelay: parsed.triggerRelay
              ? {
                  pin: 'GPIO_26',
                  state: 'PULSE_ACTIVE',
                  durationSeconds: (parsed.relayPulseMs || 3000) / 1000,
                  doorLock: 'UNLOCKED (Auto-lock in 3s)',
                  circuitVoltage: '12V DC Solenoid Active',
                }
              : { state: 'BYPASS' },
            oledFeedback: `OK: ${targetStaff?.name || 'STAFF'} | UNLOCKED`,
          };

          addAuditLog({
            actor: targetStaff?.name || 'ESP32 Biometric Gateway',
            role: targetStaff?.role || 'SYSTEM',
            action: 'ESP32 Fingerprint Verification & Door Unlock',
            details: `Fingerprint slot #${parsed.fingerSlot || 1} matched (Confidence: 99.4%). 12V Solenoid strike pulse triggered on GPIO 26.`,
            category: 'SECURITY',
            severity: 'INFO',
          });
        } else if (selectedApiEndpoint === '/api/iot/fingerprint/match') {
          resp = {
            status: 200,
            matched: true,
            nodeId: parsed.nodeId || 'ESP32-BIO-01',
            score: 98.7,
            matchedEntity: 'PATIENT_QUEUE_TOKEN',
            tokenNumber: 'TKN-304',
            patientName: 'Rajesh Kumar',
            queueDepartment: 'General OPD - Room 102',
            doorRelay: 'UNLOCKED_3S',
            timestamp: now.toISOString(),
          };
        } else if (selectedApiEndpoint === '/api/iot/fingerprint/enroll') {
          resp = {
            status: 201,
            message: 'Fingerprint template synthesized and written to R307 EEPROM',
            nodeId: parsed.nodeId || 'ESP32-BIO-01',
            slotNumber: parsed.targetSlot || 5,
            templateSize: '512 Bytes',
            checksum: '0x4A1E',
            dualPassVerified: true,
            storageLocation: 'Slot #5 in R307 256-template bank',
            timestamp: now.toISOString(),
          };
          addAuditLog({
            actor: 'System Admin',
            role: 'ADMIN',
            action: 'ESP32 Fingerprint Enrollment',
            details: `Enrolled new biometric template into R307 flash slot #${parsed.targetSlot || 5}.`,
            category: 'SECURITY',
            severity: 'INFO',
          });
        } else if (selectedApiEndpoint === '/api/iot/door/relay') {
          resp = {
            status: 200,
            nodeId: parsed.nodeId || 'ESP32-BIO-01',
            relayPin: parsed.relayPin || 'GPIO_26',
            relayState: 'ENERGIZED',
            pulseDurationSeconds: parsed.durationSeconds || 3,
            voltage: '12V DC',
            lockStatus: 'STRIKE_OPEN',
            timestamp: now.toISOString(),
          };
          addAuditLog({
            actor: 'ESP32-BIO-01 Gateway',
            role: 'SYSTEM',
            action: 'Solenoid Door Relay Actuation',
            details: `Relay energized on GPIO 26 for ${parsed.durationSeconds || 3} seconds.`,
            category: 'HARDWARE',
            severity: 'INFO',
          });
        } else if (selectedApiEndpoint === '/api/iot/fingerprint/status') {
          resp = {
            status: 200,
            sensorModel: 'R307 Optical 508 DPI Biometric Scanner',
            nodeId: parsed.nodeId || 'ESP32-BIO-01',
            hardwareHandshake: 'ACK_0x00_SUCCESS',
            baudRate: 57600,
            capacity: 256,
            enrolledCount: 14,
            availableSlots: 242,
            securityLevel: 3,
            supplyVoltage: '3.3V Logic / 5.0V VCC',
            systemUptimeSeconds: 84920,
          };
        } else {
          resp = {
            status: 200,
            message: 'OK: Hardware transaction accepted and processed.',
            timestamp: now.toISOString(),
            echo: parsed,
          };
        }
      } catch {
        resp = {
          status: 400,
          error: 'Bad Request: Invalid JSON syntax in payload.',
        };
      }
      setApiResponse(JSON.stringify(resp, null, 2));
      setIsExecutingApi(false);
      soundEffects.playSuccessChirp();
    }, 450);
  };

  const copyFirmwareCode = () => {
    navigator.clipboard.writeText(ESP32_ARDUINO_FIRMWARE);
    setCopiedCode(true);
    soundEffects.playSuccessChirp();
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const ESP32_ARDUINO_FIRMWARE = `/*
 * Atomix Health - ESP32 R307 / AS608 Biometric Door Access & Attendance Firmware
 * Hardware: ESP32 NodeMCU, R307 Optical Scanner, 12V Solenoid Strike Relay, 0.96" SSD1306 OLED
 * Wiring:
 *   - R307 VCC -> 5V
 *   - R307 GND -> GND
 *   - R307 TX  -> ESP32 GPIO 16 (RX2)
 *   - R307 RX  -> ESP32 GPIO 17 (TX2)
 *   - Relay IN -> ESP32 GPIO 26
 *   - OLED SDA -> ESP32 GPIO 21
 *   - OLED SCL -> ESP32 GPIO 22
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_Fingerprint.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ArduinoJson.h>

// WiFi Configuration
const char* WIFI_SSID = "ATOMIX_HOSPITAL_WLAN";
const char* WIFI_PASS = "secure_atomix_2026";

// Hospital API Server Endpoint
const char* API_SERVER = "http://192.168.1.100:3000/api/iot/fingerprint/scan";

// Pin Assignments
#define RELAY_PIN 26
#define RX2_PIN   16
#define TX2_PIN   17
#define OLED_WIDTH 128
#define OLED_HEIGHT 64

// Hardware Interfaces
HardwareSerial mySerial(2);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);
Adafruit_SSD1306 display(OLED_WIDTH, OLED_HEIGHT, &Wire, -1);

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); // Solenoid locked (active HIGH)

  // OLED Init
  Wire.begin(21, 22);
  if (display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(WHITE);
    display.setCursor(0, 10);
    display.println("ATOMIX HOSPITAL");
    display.println("Biometric Gate v3.5");
    display.display();
  }

  // R307 Sensor Init (UART2, 57600 baud)
  mySerial.begin(57600, SERIAL_8N1, RX2_PIN, TX2_PIN);
  finger.begin(57600);
  if (finger.verifyPassword()) {
    Serial.println("R307 Fingerprint Sensor Handshake OK!");
  } else {
    Serial.println("R307 Sensor not detected. Check wiring (GPIO 16/17).");
  }

  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi Connected! IP: " + WiFi.localIP().toString());
}

void loop() {
  int fingerId = getFingerprintID();
  if (fingerId > 0) {
    Serial.printf("Finger matched! Slot: %d, Confidence: %d\\n", fingerId, finger.confidence);
    sendAttendanceToHospital(fingerId, finger.confidence);
  }
  delay(100);
}

int getFingerprintID() {
  uint8_t p = finger.getImage();
  if (p != FINGERPRINT_OK) return -1;

  p = finger.image2Tz();
  if (p != FINGERPRINT_OK) return -1;

  p = finger.fingerSearch();
  if (p != FINGERPRINT_OK) return -1;

  return finger.fingerID;
}

void sendAttendanceToHospital(int slotId, int confidence) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(API_SERVER);
  http.addHeader("Content-Type", "application/json");

  // Build JSON Payload
  StaticJsonDocument<256> doc;
  doc["nodeId"] = "ESP32-BIO-01";
  doc["fingerSlot"] = slotId;
  doc["confidence"] = confidence;
  doc["triggerRelay"] = true;
  doc["relayPulseMs"] = 3000;

  String requestBody;
  serializeJson(doc, requestBody);

  int httpCode = http.POST(requestBody);
  if (httpCode == 200) {
    String response = http.getString();
    Serial.println("Server Response: " + response);

    // Actuate 12V Solenoid Door Strike
    digitalWrite(RELAY_PIN, HIGH);
    display.clearDisplay();
    display.setCursor(0, 10);
    display.println("ACCESS GRANTED");
    display.printf("Slot: #%d\\n", slotId);
    display.println("DOOR UNLOCKED (3s)");
    display.display();

    delay(3000); // 3 seconds unlock time
    digitalWrite(RELAY_PIN, LOW); // Lock door

    display.clearDisplay();
    display.setCursor(0, 10);
    display.println("READY FOR SCAN");
    display.display();
  }
  http.end();
}`;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div
        className={`border rounded-2xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl transition-colors ${
          theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20">
              <Cpu className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold font-tech uppercase tracking-wider text-slate-100 flex items-center gap-2">
              Hospital IoT Device Manager & Biometric ESP32 REST / MQTT Gateway
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time telemetry, REST hardware simulation, and C++ Arduino firmware for ESP32 R307/AS608 fingerprint scanners & relay controls
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveView('API_TESTER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeView === 'API_TESTER'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            REST & MQTT Tester
          </button>
          <button
            onClick={() => setActiveView('FIRMWARE_CODE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeView === 'FIRMWARE_CODE'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            ESP32 C++ Code & Pinout
          </button>
        </div>
      </div>

      {/* IoT Devices Hardware Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {(iotDevices || []).map((dev) => {
          const isBiometric = dev.id.includes('BIO') || dev.type?.toLowerCase().includes('biometric');
          return (
            <div
              key={dev.id}
              className={`p-3.5 rounded-xl border transition shadow-md flex flex-col justify-between ${
                isBiometric
                  ? 'bg-gradient-to-b from-cyan-950/40 via-slate-900 to-slate-900 border-cyan-500/40 hover:border-cyan-400'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono-tech text-xs font-bold text-cyan-400 flex items-center gap-1">
                    {isBiometric && <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />}
                    {dev.id}
                  </span>
                  <span className="flex items-center gap-1 text-[9px] font-mono-tech font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    ONLINE
                  </span>
                </div>
                <div className="font-semibold text-xs text-slate-200 truncate">{dev.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{dev.location}</div>

                <div className="mt-3 pt-2 border-t border-slate-800 space-y-1 text-[10px] font-mono-tech text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>IP:</span>
                    <span className="text-slate-200">{dev.ipAddress}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Firmware:</span>
                    <span className="text-cyan-300">{dev.firmware || dev.firmwareVersion}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Signal:</span>
                    <span className="text-emerald-400">{dev.signalDbm ? `${dev.signalDbm} dBm` : dev.signalStrength}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                <button
                  onClick={() => pingDevice(dev.id)}
                  className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono-tech transition flex items-center justify-center gap-1"
                >
                  <Activity className="w-3 h-3 text-cyan-400" />
                  Ping
                </button>
                <button
                  onClick={() => rebootDevice(dev.id)}
                  className="flex-1 py-1 rounded bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 text-[10px] font-mono-tech transition flex items-center justify-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reboot
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {activeView === 'API_TESTER' ? (
        /* REST API Console & MQTT Topic Feed */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* REST API Tester */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold font-tech uppercase text-slate-200 tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                ESP32 Hardware REST API Simulator
              </span>
              <span className="text-[10px] font-mono-tech text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                HTTP/1.1 POST / JSON
              </span>
            </div>

            {/* Category: Biometric & Fingerprint ESP32 Endpoints */}
            <div>
              <div className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
                Biometric & ESP32 Fingerprint Endpoints
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { ep: '/api/iot/fingerprint/scan', label: 'POST /scan (Attendance + Solenoid)' },
                  { ep: '/api/iot/fingerprint/match', label: 'POST /match (Queue Token)' },
                  { ep: '/api/iot/fingerprint/enroll', label: 'POST /enroll (EEPROM Slot)' },
                  { ep: '/api/iot/door/relay', label: 'POST /relay (12V Strike)' },
                  { ep: '/api/iot/fingerprint/status', label: 'POST /status (R307 Health)' },
                ].map(({ ep, label }) => (
                  <button
                    key={ep}
                    onClick={() => handleEndpointSelect(ep)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono-tech transition ${
                      selectedApiEndpoint === ep
                        ? 'bg-cyan-600 text-white font-bold shadow-sm shadow-cyan-600/30'
                        : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category: General Hospital Automation Endpoints */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                Peripheral & Dispenser Endpoints
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { ep: '/api/rfid/scan', label: 'POST /rfid/scan' },
                  { ep: '/api/patient/checkin', label: 'POST /patient/checkin' },
                  { ep: '/api/vending/dispense', label: 'POST /vending/dispense' },
                  { ep: '/api/biometric/scan', label: 'POST /biometric/scan' },
                  { ep: '/api/vitals/record', label: 'POST /vitals/record' },
                ].map(({ ep, label }) => (
                  <button
                    key={ep}
                    onClick={() => handleEndpointSelect(ep)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono-tech transition ${
                      selectedApiEndpoint === ep
                        ? 'bg-cyan-600 text-white font-bold shadow-sm shadow-cyan-600/30'
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800/80'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Request Body Editor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-mono-tech text-slate-400 uppercase">
                  JSON Request Body ({selectedApiEndpoint})
                </label>
                <span className="text-[10px] font-mono-tech text-emerald-400">Content-Type: application/json</span>
              </div>
              <textarea
                rows={7}
                value={apiPayload}
                onChange={(e) => setApiPayload(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono-tech text-cyan-300 focus:outline-none focus:border-cyan-500 shadow-inner"
              />
            </div>

            <button
              onClick={handleExecuteApi}
              disabled={isExecutingApi}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 font-tech uppercase tracking-wider cursor-pointer"
            >
              <Send className={`w-3.5 h-3.5 ${isExecutingApi ? 'animate-spin' : ''}`} />
              <span>{isExecutingApi ? 'Transmitting to ESP32 Hardware...' : 'Execute REST Request'}</span>
            </button>

            {/* Server Response Display */}
            {apiResponse && (
              <div className="mt-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between mb-1 text-[10px] font-mono-tech">
                  <span className="text-emerald-400 font-bold uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    HTTP/1.1 200 OK
                  </span>
                  <span className="text-slate-400">Latency: 142ms</span>
                </div>
                <pre className="text-[11px] font-mono-tech text-slate-200 overflow-x-auto max-h-56 p-2 bg-slate-900/80 rounded border border-slate-800">
                  {apiResponse}
                </pre>
              </div>
            )}
          </div>

          {/* Live MQTT Broker Feed & Telemetry */}
          <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold font-tech uppercase text-slate-200 tracking-wider">
                    Live MQTT Broker Telemetry Stream
                  </span>
                </div>
                <span className="text-[10px] font-mono-tech text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  MQTT tcp://192.168.1.10:1883
                </span>
              </div>

              <div className="space-y-2.5 text-[11px] font-mono-tech max-h-[460px] overflow-y-auto pr-1">
                {/* Fingerprint Scan Event */}
                <div className="p-2.5 rounded-lg bg-slate-900 border border-cyan-800/40 text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-bold">topic: techshield/iot/fingerprint/scan</span>
                    <span className="text-[9px] text-cyan-500">QoS 1</span>
                  </div>
                  <div className="text-slate-300 mt-1 text-[10px]">
                    {'{"node": "ESP32-BIO-01", "slot": 1, "score": 99.4, "strike": "UNLOCKED_3S", "user": "DOC-01"}'}
                  </div>
                </div>

                {/* Solenoid Door Relay Event */}
                <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-800/40 text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold">topic: techshield/iot/door/relay</span>
                    <span className="text-[9px] text-emerald-500">QoS 1</span>
                  </div>
                  <div className="text-slate-300 mt-1 text-[10px]">
                    {'{"relay": "GPIO_26", "state": "HIGH", "solenoid": "12V_ACTIVE", "timer": 3.0}'}
                  </div>
                </div>

                {/* Fingerprint Enrollment Event */}
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-400 font-bold">topic: techshield/iot/fingerprint/enroll</span>
                    <span className="text-[9px] text-purple-500">QoS 1</span>
                  </div>
                  <div className="text-slate-400 mt-1 text-[10px]">
                    {'{"node": "ESP32-BIO-01", "slot": 5, "checksum": "0x4A1E", "status": "SYNTHESIZED"}'}
                  </div>
                </div>

                {/* RFID Scan Event */}
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="text-cyan-400">topic: techshield/rfid/scan</span>
                  <div className="text-slate-400 mt-0.5 text-[10px]">
                    {'{"reader": "ESP32-GATE-01", "uid": "04:A3:92:7B:11", "rssi": -52}'}
                  </div>
                </div>

                {/* Vending Machine Event */}
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="text-cyan-400">topic: techshield/vending/VM01/sensor</span>
                  <div className="text-slate-400 mt-0.5 text-[10px]">
                    {'{"slot": 1, "ir": "CLEAR", "loadCell": 5.42, "motor": "IDLE"}'}
                  </div>
                </div>

                {/* Biometric Gate Telemetry */}
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="text-cyan-400">topic: techshield/gate/bio01/telemetry</span>
                  <div className="text-slate-400 mt-0.5 text-[10px]">
                    {'{"deviceId": "ESP32-BIO-01", "relay": "OPEN", "fingerId": 3, "score": 99.4}'}
                  </div>
                </div>

                {/* Vitals Telemetry */}
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="text-cyan-400">topic: techshield/vitals/stream</span>
                  <div className="text-slate-400 mt-0.5 text-[10px]">
                    {'{"sensor": "ESP32-VITALS-01", "hr": 74, "spo2": 99, "bp": "120/80"}'}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] font-mono-tech text-slate-400 flex items-center justify-between">
              <span>Broker QoS: 1 (At Least Once)</span>
              <span className="text-emerald-400 font-semibold">10 Hardware Nodes Connected</span>
            </div>
          </div>
        </div>
      ) : (
        /* ESP32 Arduino C++ Firmware Code & Pinout Reference */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Code Viewer */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-sm font-bold text-white font-tech uppercase tracking-wider">
                    Atomix_ESP32_R307_Biometrics.ino
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono-tech">
                    Production Arduino C++ code for Adafruit_Fingerprint + ESP32 HTTPClient
                  </div>
                </div>
              </div>

              <button
                onClick={copyFirmwareCode}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? 'Copied to Clipboard!' : 'Copy Sketch'}
              </button>
            </div>

            <pre className="text-[11px] font-mono-tech text-cyan-300 bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-[500px] leading-relaxed select-text">
              {ESP32_ARDUINO_FIRMWARE}
            </pre>
          </div>

          {/* Hardware Pinout & Specs Guide */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h3 className="text-xs font-bold font-tech uppercase text-slate-200 tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                ESP32 Hardware Wiring Map
              </h3>

              <div className="space-y-2 text-xs font-mono-tech">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">R307 Red (VCC)</span>
                  <span className="text-amber-400 font-bold">5V DC Pin</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">R307 Black (GND)</span>
                  <span className="text-slate-300 font-bold">GND</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-cyan-800/50 flex items-center justify-between">
                  <span className="text-cyan-300">R307 Yellow (TX)</span>
                  <span className="text-cyan-400 font-bold">ESP32 GPIO 16 (RX2)</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-cyan-800/50 flex items-center justify-between">
                  <span className="text-cyan-300">R307 Green (RX)</span>
                  <span className="text-cyan-400 font-bold">ESP32 GPIO 17 (TX2)</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-emerald-800/50 flex items-center justify-between">
                  <span className="text-emerald-300">12V Relay IN</span>
                  <span className="text-emerald-400 font-bold">ESP32 GPIO 26</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">SSD1306 OLED I2C</span>
                  <span className="text-slate-300 font-bold">GPIO 21 (SDA) / 22 (SCL)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2 text-xs">
              <h3 className="text-xs font-bold font-tech uppercase text-slate-200 tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                R307 Optical Specifications
              </h3>
              <ul className="space-y-1.5 text-slate-400 text-[11px] font-mono-tech">
                <li>• Optical Resolution: 508 DPI</li>
                <li>• Template Capacity: 256 Enrolled Prints</li>
                <li>• Recognition Time: &lt; 0.3s (1:N search)</li>
                <li>• False Acceptance Rate (FAR): &lt; 0.001%</li>
                <li>• False Rejection Rate (FRR): &lt; 0.1%</li>
                <li>• Serial Baud Rate: 57,600 bps default</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
