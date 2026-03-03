import { useState, useEffect } from 'react';
// @ts-ignore
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// --- ตั้งค่า Icon หมุด ---
const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapController({ position, trigger }: { position: [number, number] | null, trigger: number }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 19, { duration: 1.5 }); 
    }
  }, [trigger]); 
  return null;
}

export default function App() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [floor, setFloor] = useState<string>("1");
  const [trigger, setTrigger] = useState(0); 
  
  const destination = { lat: 13.8225, lng: 100.5135 }; 

  const getGPS = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setTrigger(prev => prev + 1); 
      },
      (err) => alert("ไม่สามารถดึง GPS ได้: " + err.message),
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    getGPS();
    const interval = setInterval(getGPS, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSendData = async () => {
  if (!position) return alert("รอพิกัดแป๊บนึงนะนัท...");

  // 1. ปรับโครงสร้างข้อมูล (JSON Body) ตามที่ทีเคบอก (x, y, floor_id)
  const payload = {
    x: position[0],        // lat เปลี่ยนเป็น x
    y: position[1],        // lng เปลี่ยนเป็น y
    floor_id: Number(floor) // ต้องเป็นตัวเลข (ใส่ชั้นที่นัทเลือก)
  };

  try {
    // 2. เปลี่ยน URL เป็นตัวใหม่ที่ทีเคให้มา (อย่าลืมใส่ https:// นำหน้าลิงก์ ngrok ของเพื่อน)
    const response = await axios.post('https://shanelle-unestranged-jase.ngrok-free.dev/api/graph/snap', payload);
    
    console.log("Response from TK:", response.data);
    alert("✅ ส่งพิกัด Snap ให้ทีเคสำเร็จแล้ว!");
  } catch (err) {
    console.error(err);
    alert("❌ ส่งไม่สำเร็จ! ลองเช็คลิงก์ ngrok หรือถามทีเคว่ารัน Server อยู่ไหม");
  }
};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', position: 'relative', fontFamily: 'monospace' }}>
      
      {/* --- ส่วน UI ด้านบน --- */}
      <div style={{ 
        position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', 
        zIndex: 1000, background: 'white', padding: '15px', borderRadius: '15px',
        width: '95%', maxWidth: '450px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', border: '1px solid #ddd'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px', fontSize: '0.85rem' }}>
          
          <div style={{ background: '#f0f4f8', padding: '8px', borderRadius: '8px' }}>
            <div style={{ color: '#0056b3', fontWeight: 'bold', marginBottom: '4px' }}>📍 คุณ (น้ำเงิน)</div>
            <div style={{ color: '#000' }}>Lat: <b>{position ? position[0].toFixed(6) : "รอ..."}</b></div>
            <div style={{ color: '#000' }}>Lng: <b>{position ? position[1].toFixed(6) : "รอ..."}</b></div>
          </div>

          <div style={{ background: '#fff0f0', padding: '8px', borderRadius: '8px' }}>
            <div style={{ color: '#c82333', fontWeight: 'bold', marginBottom: '4px' }}>🎯 เป้าหมาย (แดง)</div>
            <div style={{ color: '#000' }}>Lat: <b>{destination.lat.toFixed(6)}</b></div>
            <div style={{ color: '#000' }}>Lng: <b>{destination.lng.toFixed(6)}</b></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {/* >>> ปุ่มเลือกชั้นที่เปลี่ยนสีใหม่ <<< */}
          <select 
            value={floor} 
            onChange={(e) => setFloor(e.target.value)}
            style={{ 
              flex: 1, 
              padding: '10px', 
              borderRadius: '8px', 
              border: '2px solid #ff9800', // ขอบสีส้ม
              fontSize: '16px', 
              color: '#000', 
              backgroundColor: '#fff9c4', // พื้นหลังสีเหลืองอ่อน
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {[1,2,3,4,5,6,7].map(f => <option key={f} value={f}>ชั้น {f}</option>)}
          </select>
          
          <button 
            onClick={handleSendData}
            style={{ 
              flex: 2, background: '#28a745', color: 'white', border: 'none', 
              borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px'
            }}
          >
            🚀 ส่งพิกัดปัจจุบัน
          </button>
        </div>
      </div>

      {/* --- แผนที่ --- */}
      <div style={{ flex: 1, width: '100%' }}>
        <MapContainer center={[13.8193, 100.5141]} zoom={18} maxZoom={21} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxNativeZoom={19} maxZoom={21} />
          
          {position && <Marker position={position} icon={blueIcon}><Popup>คุณอยู่ที่นี่</Popup></Marker>}
          <Marker position={[destination.lat, destination.lng]} icon={redIcon}><Popup>ตึก 81</Popup></Marker>

          <MapController position={position} trigger={trigger} />
        </MapContainer>
      </div>

      <button onClick={getGPS} style={{
          position: 'absolute', bottom: '30px', right: '20px', zIndex: 1000,
          width: '65px', height: '65px', borderRadius: '50%', background: '#007bff',
          color: 'white', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          cursor: 'pointer', fontSize: '14px', fontWeight: 'bold'
      }}>GPS</button>
    </div>
  );
}