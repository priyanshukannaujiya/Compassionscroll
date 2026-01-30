import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, ShieldCheck, Crown, Eye, Siren,
  BookOpen, Map as MapIcon, ClipboardList, Trophy, Home,
  RefreshCw, Activity, Flame, Skull, Target
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { createClient } from '@supabase/supabase-js';

// ===== CONFIG (UNCHANGED) =====
const supabaseUrl = 'https://zstolmotbtwskczrakjy.supabase.co';
const supabaseKey = 'sb_publishable_5_zDt027YlHtMfwQ2RieAA_iFBJa22S';
const supabase = createClient(supabaseUrl, supabaseKey);
const GEMINI_KEY = 'AIzaSyBKjHNtEZLuiYealX8N6LG9aTPMMixf1FE';

// ===== STYLES =====
const styles = `
.night-vision { filter: sepia(100%) hue-rotate(90deg) brightness(0.8) contrast(1.2); background:#001a00;}
.night-vision * { color:#00ff00 !important; border-color:#00ff0033 !important;}
.scan-line{width:100%;height:2px;background:#10b981;position:absolute;animation:scan 2s linear infinite;box-shadow:0 0 15px #10b981;}
@keyframes scan{0%{top:0}100%{top:100%}}
`;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ===== MANUAL =====
const IntelManual = () => (
  <div className="space-y-3">
    {[
      { t: "Fracture SOP", i: <Activity />, d: "Immobilize limb, keep warm" },
      { t: "Heat Stroke", i: <Flame />, d: "Move to shade, cool slowly" },
      { t: "CPR Logic", i: <Heart />, d: "100–120 compressions/min" },
      { t: "Toxin Intake", i: <Skull />, d: "Flush eyes, call vet" }
    ].map((x, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 }}
        whileHover={{ scale: 1.02 }}
        className="bg-white p-4 rounded-2xl border shadow flex gap-3"
      >
        {x.i}
        <div>
          <b>{x.t}</b>
          <p className="text-sm text-gray-500">{x.d}</p>
        </div>
      </motion.div>
    ))}
  </div>
);

// ===== REGISTRY =====
const RegistryVault = ({ refreshKey }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    supabase.from('animalwelfare__2')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setLogs(data || []));
  }, [refreshKey]);

  return (
    <div className="space-y-3">
      {logs.map((l, i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.02 }}
          className="bg-[#0b1220] text-white p-4 rounded-2xl shadow"
        >
          <div className="text-lg font-bold">{l.breed}</div>
          <div className="text-green-400">{l.status}</div>
          <div className="text-xs opacity-60 mt-1">{l.location}</div>
        </motion.div>
      ))}
    </div>
  );
};

// ===== TROPHIES =====
const TrophyRoom = () => (
  <div className="grid grid-cols-2 gap-3">
    {[
      { t: "First Scan", i: <Target />, d: true },
      { t: "Medic", i: <ShieldCheck />, d: false },
      { t: "Alpha", i: <Crown />, d: false },
      { t: "Night Owl", i: <Eye />, d: true }
    ].map((b, i) => (
      <motion.div
        key={i}
        animate={b.d ? { boxShadow: ["0 0 0px #ffd700", "0 0 16px #ffd700", "0 0 0px #ffd700"] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
        className={`p-4 border rounded-2xl text-center ${b.d ? 'bg-white' : 'opacity-40 bg-gray-100'}`}
      >
        <div className="flex justify-center mb-2">{b.i}</div>
        <b>{b.t}</b>
      </motion.div>
    ))}
  </div>
);

// ===== SCANNER (LOGIC SAME, UI ANIMATED) =====
const ScannerView = ({ onScanComplete, userLoc }) => {
  const [img, setImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);

  const scan = async (file) => {
    setLoading(true);
    try {
      const base64 = await new Promise(r => {
        const fr = new FileReader();
        fr.onload = () => r(fr.result.split(',')[1]);
        fr.readAsDataURL(file);
      });

      const prompt = `
If a REAL animal is clearly visible return ONLY:
{"is_animal": true, "breed": "...", "status": "...", "details": "..."}
Otherwise return ONLY:
{"is_animal": false}
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                { inline_data: { mime_type: file.type, data: base64 } }
              ]
            }]
          })
        });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);

      if (!parsed.is_animal) {
        setRes({ breed: "Not an animal", status: "Invalid scan", details: "Upload a real animal image." });
        setLoading(false);
        return;
      }

      setRes(parsed);
      onScanComplete(150);

      await supabase.from('animalwelfare__2').insert([{
        breed: parsed.breed,
        status: parsed.status,
        details: parsed.details,
        location: userLoc.join(',')
      }]);

    } catch (e) { alert(e.message); }
    finally { setLoading(false); }
  };

  return !img ? (
    <label className="block w-full bg-green-500 text-black font-bold text-center p-5 rounded-2xl shadow-lg cursor-pointer">
      Upload Animal Image
      <input hidden type="file" onChange={e => {
        const f = e.target.files[0];
        if (!f) return;
        setImg(URL.createObjectURL(f));
        scan(f);
      }} />
    </label>
  ) : (
    <div className="relative rounded-2xl overflow-hidden shadow-xl">
      <img src={img} className="w-full opacity-60" />

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="w-16 h-16 rounded-full border-4 border-green-400 mb-3"
          />
          <RefreshCw className="animate-spin" />
          Scanning...
        </div>
      )}

      {res && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 bg-black/80 text-white flex flex-col items-center justify-center text-center p-6"
        >
          <h2 className="text-2xl font-bold">{res.breed}</h2>
          <p className="text-green-400 font-semibold">{res.status}</p>
          <p className="text-sm opacity-80 mt-2">{res.details}</p>
          <button
            className="mt-5 bg-green-500 text-black font-bold px-6 py-2 rounded-xl"
            onClick={() => { setImg(null); setRes(null); }}
          >
            Next Scan
          </button>
        </motion.div>
      )}
    </div>
  );
};

// ===== MAIN APP =====
export default function App() {
  const [tab, setTab] = useState('feed');
  const [xp, setXp] = useState(1200);
  const [night, setNight] = useState(false);
  const [loc, setLoc] = useState([19.076, 72.877]);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(p =>
      setLoc([p.coords.latitude, p.coords.longitude]));
  }, []);

  return (
    <div className={`${night ? 'night-vision' : ''} min-h-screen bg-gray-100 flex justify-center`}>
      <style>{styles}</style>

      <div className="w-full max-w-md bg-white min-h-screen rounded-3xl shadow-2xl overflow-hidden relative">

        {/* Top Bar */}
        <nav className="bg-[#0b1220] text-white px-4 py-3 flex justify-between items-center">
          <b>RESCUE.OS</b>
          <motion.div
            key={xp}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="bg-green-500 text-black font-bold px-3 py-1 rounded-full text-sm"
          >
            {xp} XP
          </motion.div>
        </nav>

        {/* Content */}
        <main className="p-4 pb-28 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
            >

              {tab === 'feed' && (
                <motion.div whileHover={{ scale: 1.02 }} className="bg-red-600 text-white p-4 rounded-2xl flex justify-between shadow">
                  <div className="flex gap-2 items-center font-semibold"><Siren />Critical Distress</div>
                  <button className="bg-white text-red-600 px-3 py-1 rounded-lg font-bold">Respond</button>
                </motion.div>
              )}

              {tab === 'scanner' && <ScannerView userLoc={loc} onScanComplete={p => setXp(x => x + p)} />}
              {tab === 'registry' && <RegistryVault refreshKey={tab} />}
              {tab === 'manual' && <IntelManual />}
              {tab === 'trophy' && <TrophyRoom />}

              {tab === 'ops' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl overflow-hidden shadow">
                  <MapContainer center={loc} zoom={13} style={{ height: '60vh' }}>
                    <TileLayer url={night
                      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"} />
                    <Marker position={loc}><Popup>My Position</Popup></Marker>
                  </MapContainer>
                </motion.div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Nav */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#0b1220] text-white flex gap-6 px-6 py-3 rounded-2xl shadow-2xl">
          {[
            { t: 'feed', i: <Home /> },
            { t: 'ops', i: <MapIcon /> },
            { t: 'scanner', i: <Target /> },
            { t: 'manual', i: <BookOpen /> },
            { t: 'registry', i: <ClipboardList /> },
          ].map(b => (
            <motion.button
              key={b.t}
              whileTap={{ scale: 0.85 }}
              animate={tab === b.t ? { y: [0, -6, 0] } : {}}
              transition={{ duration: 0.3 }}
              onClick={() => setTab(b.t)}
              className={`p-2 rounded-full ${tab === b.t ? 'bg-green-500 text-black' : ''}`}
            >
              {b.i}
            </motion.button>
          ))}
        </div>

        {/* Trophy Floating Button */}
        <motion.button
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          onClick={() => setTab('trophy')}
          className="fixed right-6 bottom-28 bg-yellow-400 text-black p-4 rounded-full shadow-xl"
        >
          <Trophy />
        </motion.button>

      </div>
    </div>
  );
}
