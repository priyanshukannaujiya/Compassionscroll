import React, { useState, useEffect, useMemo } from 'react';
import { 
  Heart, Share2, MessageCircle, User, MapPin, ArrowLeft, Search, Bell, 
  PawPrint, Plus, X, LogOut, Upload, Image as ImageIcon, Stethoscope, Siren, 
  Phone, Navigation, Award, Zap, ChevronRight, BookOpen, Star, Shield, Trophy, 
  Link as LinkIcon, Send, Crown, CheckCircle2, TrendingUp, HandHeart, Globe, 
  Target, RefreshCw, Activity, ShieldCheck, ClipboardList, Sparkles, 
  Dog, Cat, Bird, Check, Copy, Eye, Clock, Bookmark, AlertTriangle, Newspaper, Home,
  Flame, Skull, Droplets, Newspaper as NewsIcon, Package, Radar, Map
} from 'lucide-react';

// --- MAP IMPORTS ---
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- CUSTOM STYLES FOR ANIMATIONS ---
const styles = `
  @keyframes scan-vertical {
    0% { transform: translateY(0%); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translateY(800px); opacity: 0; }
  }
  .animate-scan {
    animation: scan-vertical 4s linear infinite;
  }
  @keyframes sonar-ripple {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(3); opacity: 0; }
  }
  .sonar-pulse {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    border-radius: 50%;
    border: 2px solid currentColor;
    animation: sonar-ripple 2s infinite;
  }
`;

// --- LEAFLET ICON FIX ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- HIGH-VISIBILITY MARKER ---
const getTacticalIcon = (severity) => {
  const color = severity === 'Critical' ? '#ef4444' : (severity === 'High' ? '#f59e0b' : '#10b981'); 
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `
      <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
        <div class="sonar-pulse" style="color: ${color}; border-width: 4px;"></div>
        <div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); z-index: 10;"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

// ==========================================
// 1. NGO REGISTRY 
// ==========================================

const NGO_DATABASE = [
  { id: 1, name: "WSD Welfare of Stray Dogs", city: "Mumbai", type: "Clinical & Sterilization", phone: "919372079707", gps: "18.9827, 72.8311", image: "https://images.unsplash.com/photo-1599409636242-7500950a2794?w=800" },
  { id: 2, name: "ResQ Pune Division", city: "Pune", type: "Trauma & Emergency Hospital", phone: "919372079707", gps: "18.5204, 73.8567", image: "https://images.unsplash.com/photo-1560743641-3914f2c45636?w=800" },
  { id: 3, name: "CUPA Bangalore Hub", city: "Bangalore", type: "Shelter & Rescue", phone: "919372079707", gps: "13.0354, 77.5988", image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800" },
  { id: 4, name: "Friendicoes SECA", city: "Delhi", type: "Ambulance & Emergency Hospital", phone: "919372079707", gps: "28.6139, 77.2090", image: "https://images.unsplash.com/photo-1544568100-847a948585b9?w=800" },
  { id: 5, name: "Blue Cross India", city: "Chennai", type: "Veterinary Surgical Unit", phone: "919372079707", gps: "13.0102, 80.2157", image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800" },
  { id: 6, name: "People for Animals", city: "Hyderabad", type: "Wildlife Rehabilitation", phone: "919372079707", gps: "17.3850, 78.4867", image: "https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=800" },
];

// UPDATED: Comprehensive App Guide
const SOP_MANUAL = [
  { id: 1, title: "Mission Hub (Feed)", icon: <Newspaper className="text-amber-700" />, desc: "The central intelligence wire. View breaking news, field reports, and available adoption cases. Filter by urgency or species." },
  { id: 2, title: "Rescue Map", icon: <Map className="text-emerald-600" />, desc: "Real-time tactical grid. View active distress signals (Critical/Stuck/Hunger) in your sector via Satellite & Sonar tracking." },
  { id: 3, title: "Bio-Scan ID", icon: <Target className="text-amber-700" />, desc: "AI-powered diagnostics. Upload a photo of a stray to instantly identify breed and assess visible injuries for first-aid." },
  { id: 4, title: "NGO Registry", icon: <ShieldCheck className="text-emerald-600" />, desc: "Authorized directory of shelters and clinics. Get direct GPS navigation and emergency contact numbers for units in your city." },
  { id: 5, title: "Supply Lines", icon: <Package className="text-amber-700" />, desc: "Logistics & Crowdfunding. Don't just donate money—fund specific items like vaccines, tarps, or food for verified missions." },
  { id: 6, title: "SOS Emergency", icon: <Siren className="text-rose-600" />, desc: "One-touch distress signal. Broadcasts your exact GPS coordinates to the National Dispatch via WhatsApp for immediate extraction." }
];

// ==========================================
// 2. DATA (LOGISTICS & MAP)
// ==========================================

const SUPPLY_DROPS = [
  { id: 1, title: "Operation: Monsoon Shield", sector: "Mumbai HQ", item: "Waterproof Tarps", raised: 45000, goal: 60000, deadline: "2 Days Left", image: "https://images.unsplash.com/photo-1599409636242-7500950a2794?w=800" },
  { id: 2, title: "Vaccine Drive Alpha", sector: "Pune Outpost", item: "Anti-Rabies Vials", raised: 12000, goal: 15000, deadline: "Urgent", image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800" },
  { id: 3, title: "Nutrient Resupply", sector: "Delhi Central", item: "High-Protein Chow", raised: 8000, goal: 50000, deadline: "5 Days Left", image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800" },
];

const ACTIVE_CASES = [
  { id: 1, type: "Injury", severity: "High", lat: 19.0760, lng: 72.8777, title: "Canine Fracture", distance: "0.8km", time: "12m ago" },
  { id: 2, type: "Stuck", severity: "Medium", lat: 19.0200, lng: 72.8500, title: "Feline / Tree", distance: "2.1km", time: "45m ago" },
  { id: 3, type: "Abuse", severity: "Critical", lat: 19.1200, lng: 72.8900, title: "Reported Cruelty", distance: "1.5km", time: "2m ago" },
  { id: 4, type: "Hunger", severity: "Low", lat: 19.0500, lng: 72.8200, title: "Puppy Litter", distance: "3.2km", time: "1h ago" },
];

// ==========================================
// 3. EXPANDED CONTENT FEED
// ==========================================

const INITIAL_FEED = [
  { 
    type: 'news', id: 1, headline: "District Rescue Operations: 2026 Protocol Change", category: "BREAKING NEWS",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200", 
    author: { name: "Dr. Ananya Rai", role: "Field Director", avatar: "AR" },
    date: "JAN 29, 2026", readTime: "5 min read", status: "Active",
    content: "Official Directive: All divisions must now sync Bio-Scan data before initiating clinic transport. This ensures real-time medical logistics tracking...",
    location: "National HQ", liked: false, likesCount: 420, comments: [], verified: true 
  },
  { 
    type: 'adoption', id: 101, name: "Cooper - Case ID 104", age: "5 months", breed: "Indie Mix", 
    bio: "Subject found with minor leg trauma in Mumbai Central. Fully rehabilitated. High energy levels detected. Suitable for active patrol families.", 
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800", 
    phone: "919372079707", location: "Mumbai", liked: false, likesCount: 89, comments: [], status: "Active" 
  },
  { 
    type: 'news', id: 2, headline: "Canine Distemper Outbreak: Sector 4 Alert", category: "MEDICAL ALERT",
    image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=1200", 
    author: { name: "Ops Command", role: "Medical Unit", avatar: "OC" },
    date: "JAN 28, 2026", readTime: "3 min read", status: "Critical",
    content: "Viral pathogen detected in stray populations near North Sector. Immediate isolation protocols are in effect. Vaccination drives scheduled for 0800 hours tomorrow.",
    location: "Sector 4", liked: false, likesCount: 215, comments: [], verified: true 
  },
  { 
    type: 'adoption', id: 102, name: "Luna - Case ID 109", age: "2 Years", breed: "Husky Mix", 
    bio: "Asset recovered from abandoned breeder facility. Demeanor: Gentle but alert. Requires temperature-controlled environment. Priority rehoming status.", 
    image: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=800", 
    phone: "919372079707", location: "Bangalore", liked: false, likesCount: 156, comments: [], status: "Active" 
  },
  { 
    type: 'news', id: 3, headline: "Monsoon Logistics: Flood Relief Squads Deployed", category: "FIELD OP",
    image: "https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=1200", 
    author: { name: "Vikram S.", role: "Squad Leader", avatar: "VS" },
    date: "JAN 27, 2026", readTime: "4 min read", status: "Active",
    content: "Water levels rising in low-lying shelter zones. 4x4 response vehicles are currently extracting at-risk livestock and strays to highland safe zones.",
    location: "Coastal Belt", liked: false, likesCount: 334, comments: [], verified: true 
  },
  { 
    type: 'adoption', id: 103, name: "Shadow - Case ID 112", age: "1 Year", breed: "Bombay Cat", 
    bio: "Feline subject exhibits high intelligence and independence. recovered from rooftop entrapment. Fully vaccinated. Ideal for apartment surveillance.", 
    image: "https://images.unsplash.com/photo-1513245543132-31f507417b26?w=800", 
    phone: "919372079707", location: "Pune", liked: false, likesCount: 201, comments: [], status: "Active" 
  },
  { 
    type: 'adoption', id: 104, name: "Rusty - Case ID 115", age: "7 Years", breed: "Golden Retriever", 
    bio: "Senior asset. Retired from active service due to hip dysplasia. Requires low-impact lifestyle and medication management. extremely affectionate.", 
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800", 
    phone: "919372079707", location: "Delhi", liked: false, likesCount: 450, comments: [], status: "Active" 
  }
];

const LEADERBOARD = [
  { name: "Ankita Bind", karma: 1420, rank: 1, badge: "Grandmaster", avatar: "AB" },
  { name: "Shivam Kumar", karma: 1250, rank: 2, badge: "Elite Protector", avatar: "SK" },
  { name: "Alok Sharma", karma: 1100, rank: 3, badge: "Field Specialist", avatar: "AS" }
];

// Utility: Image Handling
const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
};

const SafeImage = ({ src, className }) => {
  const [err, setErr] = useState(false);
  if (err || !src) return (
    <div className={`bg-slate-200 flex flex-col items-center justify-center text-slate-400 ${className}`}>
      <ImageIcon className="w-8 h-8 opacity-20" />
      <span className="text-[10px] font-black uppercase mt-2 opacity-40">Offline Data</span>
    </div>
  );
  return <img src={src} className={className} alt="intel" onError={() => setErr(true)} loading="lazy" />;
};

// ==========================================
// 4. MAIN APPLICATION CORE
// ==========================================

export default function App() {
  const [screen, setScreen] = useState(() => localStorage.getItem('cs_screen') || 'auth');
  const [tab, setTab] = useState(() => localStorage.getItem('cs_tab') || 'feed');
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('cs_user')) || null);
  const [karma, setKarma] = useState(() => parseInt(localStorage.getItem('cs_karma')) || 50);
  const [feed, setFeed] = useState(() => JSON.parse(localStorage.getItem('cs_feed')) || INITIAL_FEED);
  
  // Real-time Global Ticker
  const [liveData, setLiveData] = useState({ cruelty: 14829, hunger: 52044, rescued: 128956 });

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [postForm, setPostForm] = useState({ title: '', desc: '', type: 'news', image: null, age: 'Junior' });
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [commentingOn, setCommentingOn] = useState(null);
  const [notification, setNotification] = useState(null);
  const [sosLoading, setSosLoading] = useState(false);

  // Persistence Engine
  useEffect(() => {
    localStorage.setItem('cs_screen', screen);
    localStorage.setItem('cs_tab', tab); 
    if(user) localStorage.setItem('cs_user', JSON.stringify(user));
    localStorage.setItem('cs_karma', karma.toString());
    localStorage.setItem('cs_feed', JSON.stringify(feed));

    // Stats simulation
    const ticker = setInterval(() => {
        setLiveData(prev => ({ cruelty: prev.cruelty + 1, hunger: prev.hunger + 3, rescued: prev.rescued + 1 }));
    }, 8000);
    return () => clearInterval(ticker);
  }, [screen, tab, user, karma, feed]);

  const addKarma = (pts) => {
    setKarma(prev => prev + pts);
    setNotification(`+${pts} IMPACT POINTS LOGGED`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSOS = () => {
    setSosLoading(true);
    navigator.geolocation.getCurrentPosition((pos) => {
        const msg = `SOS ALERT | Agent: ${user?.name}\nDivision: ${user?.city}\nGPS: https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
        window.open(`https://wa.me/+919820161114?text=${encodeURIComponent(msg)}`, '_blank');
        setSosLoading(false); addKarma(15);
      }, () => {
        window.open(`https://wa.me/+919820161114?text=SOS ALERT: Manual Check-in from ${user?.city}`, '_blank');
        setSosLoading(false);
    });
  };

  const handlePostSubmit = () => {
    if(!postForm.title || !postForm.desc || !postForm.image) return alert("All fields mandatory.");
    const newEntry = {
      id: Date.now(), type: postForm.type,
      headline: postForm.type === 'news' ? postForm.title : null,
      name: postForm.type === 'adoption' ? postForm.title : null,
      image: postForm.image, author: { name: user.name, avatar: user.name.substring(0,2).toUpperCase() },
      date: "JAN 2026", readTime: "2 min", content: postForm.desc,
      bio: postForm.type === 'adoption' ? postForm.desc : null,
      age: postForm.type === 'adoption' ? postForm.age : null,
      liked: false, comments: [], status: "Active", phone: "91+919820161114", category: "FIELD REPORT"
    };
    setFeed([newEntry, ...feed]); setIsModalOpen(false);
    setPostForm({ title: '', desc: '', type: 'news', image: null, age: 'Junior' });
    addKarma(25);
  };

  const filteredFeed = useMemo(() => {
    return feed
      .filter(i => filter === 'all' || i.type === filter)
      .filter(i => (i.headline || i.name || "").toLowerCase().includes(searchQuery.toLowerCase()));
  }, [feed, filter, searchQuery]);

  // --- 🛡️ AUTH (TACTICAL) ---
  if (screen === 'auth') return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-40">
        <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2000" className="w-full h-full object-cover" alt="bg" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/20 to-slate-950"></div>
      </div>
      <div className="w-full max-w-md space-y-12 animate-fade-in relative z-10">
        <div className="space-y-6">
            <div className="bg-emerald-500 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl animate-float border-4 border-white/10"><PawPrint className="text-white w-12 h-12" /></div>
            <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">Compassion<br/><span className="text-emerald-400">Scroll</span></h1>
        </div>
        <div className="space-y-5 text-left">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-4">🛡️ Identity (Email)</label>
            <input type="email" value={authForm.email} onChange={(e)=>setAuthForm({...authForm, email:e.target.value})} placeholder="agent@division.org" className="w-full p-6 bg-slate-950 border-2 border-slate-800 text-emerald-400 font-black rounded-[2rem] outline-none shadow-xl focus:border-emerald-500 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-4">🔑 Access Key (Password)</label>
            <input type="password" value={authForm.password} onChange={(e)=>setAuthForm({...authForm, password:e.target.value})} placeholder="••••••••" className="w-full p-6 bg-slate-950 border-2 border-slate-800 text-emerald-400 font-black rounded-[2rem] outline-none shadow-xl focus:border-emerald-500 transition-all" />
          </div>
          <button onClick={() => { if(!authForm.email || !authForm.password) return alert("Required."); setScreen('setup'); }} className="w-full py-7 bg-emerald-500 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] hover:bg-emerald-400 transition-all shadow-2xl active:scale-95">Initialize Session</button>
        </div>
      </div>
    </div>
  );

  // --- 🛡️ SETUP (PROFESSIONAL IMAGE) ---
  if (screen === 'setup') return (
    <div className="min-h-screen bg-emerald-600 flex items-center justify-center p-6 overflow-hidden">
      <div className="bg-white w-full max-w-6xl rounded-[4rem] shadow-2xl animate-slide-up flex flex-col md:flex-row overflow-hidden min-h-[650px] border-8 border-white/20">
        <div className="hidden md:block w-1/2 relative group">
            <img src="https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=2000" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="setup" />
            <div className="absolute inset-0 bg-emerald-950/40 mix-blend-multiply"></div>
            <div className="absolute inset-0 flex items-center justify-center p-12">
                <div className="p-10 border-4 border-white/40 rounded-[3rem] backdrop-blur-md">
                    <p className="text-white text-5xl font-black uppercase tracking-tighter leading-none text-center">Identity<br/>Establishing.</p>
                </div>
            </div>
        </div>
        <div className="w-full md:w-1/2 p-12 md:p-20 flex flex-col justify-center bg-white text-left">
            <h2 className="text-5xl font-black text-slate-950 uppercase tracking-tighter mb-4">Identity Setup</h2>
            <p className="text-slate-400 font-medium mb-12 uppercase tracking-widest text-[10px] font-black">Assign your operational district callsign.</p>
            <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 tracking-widest ml-4 uppercase">🐕 Agent Callsign Name</label>
                  <input id="s-name" placeholder="Agent Name" className="w-full p-7 bg-slate-950 text-emerald-400 font-black text-lg rounded-[2.5rem] outline-none border-2 border-transparent focus:border-emerald-500 transition-all shadow-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 tracking-widest ml-4 uppercase">🌍 Division City</label>
                  <input id="s-city" placeholder="Mumbai, Pune, Bangalore..." className="w-full p-7 bg-slate-950 text-emerald-400 font-black text-lg rounded-[2.5rem] outline-none border-2 border-transparent focus:border-emerald-500 transition-all shadow-xl" />
                </div>
                <button onClick={() => {
                    const n = document.getElementById('s-name').value;
                    const c = document.getElementById('s-city').value;
                    if(!n || !c) return alert("Required.");
                    setUser({name: n, city: c}); setScreen('app'); addKarma(50);
                }} className="w-full py-8 bg-slate-950 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-transform mt-6">Activate Profile</button>
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans pb-24 selection:bg-emerald-500 selection:text-white">
      {/* INJECT ANIMATION STYLES */}
      <style>{styles}</style>

      {notification && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-950 text-white px-10 py-5 rounded-full shadow-2xl animate-slide-up flex items-center gap-3 border border-emerald-500">
          <Zap className="text-amber-400 w-5 h-5 fill-amber-400" />
          <span className="text-[10px] font-black uppercase tracking-widest">{notification}</span>
        </div>
      )}

      {/* REFINED NAVBAR */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-10 h-24 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setTab('feed')}>
            <div className="bg-slate-950 p-2.5 rounded-2xl shadow-lg hover:rotate-12 transition-transform"><PawPrint className="w-6 h-6 text-white" /></div>
            <span className="font-black text-2xl tracking-tighter text-slate-900 hidden md:block uppercase">CompassionScroll</span>
          </div>
          <div className="hidden lg:flex items-center bg-slate-100 p-1.5 rounded-[2rem] border border-slate-200">
            {['feed', 'ops', 'ngos', 'scanner', 'manual', 'logistics', 'profile'].map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-8 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-white text-emerald-600 shadow-md scale-[1.05]' : 'text-slate-500 hover:text-slate-950'}`}>
                {/* RENAME OPS TAB IN UI ONLY */}
                {t === 'ops' ? 'RESCUE MAP' : (t === 'ngos' ? 'Registry' : t)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <Zap className="w-5 h-5 text-emerald-600 fill-emerald-600" />
            <span className="text-sm font-black text-emerald-700 uppercase">{karma} <span className="text-[10px] opacity-40">Pts</span></span>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-slate-950 text-white p-4 rounded-2xl shadow-xl hover:scale-110 transition-all"><Plus className="w-7 h-7" /></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-10 py-12 text-slate-950">
        
        {/* MISSION HUB (NEWS PORTAL STYLE) */}
        {tab === 'feed' && (
          <div className="space-y-12 animate-fade-in">
            {/* LIVE GLOBAL IMPACT TICKER */}
            <div className="bg-slate-950 p-4 rounded-2xl overflow-hidden relative border-y-4 border-emerald-500 shadow-2xl">
                <div className="flex items-center gap-12 whitespace-nowrap animate-ticker font-black text-[11px] text-white uppercase tracking-widest">
                    <span className="flex items-center gap-3"><Skull className="text-rose-500 w-4 h-4" /> Cruelty Cases Monitored: <span className="text-rose-500">{liveData.cruelty.toLocaleString()}</span></span>
                    <span className="flex items-center gap-3"><Flame className="text-orange-500 w-4 h-4" /> Hunger Incidents Identified: <span className="text-orange-500">{liveData.hunger.toLocaleString()}</span></span>
                    <span className="flex items-center gap-3"><HandHeart className="text-emerald-500 w-4 h-4" /> Lives Saved: <span className="text-emerald-500">{liveData.rescued.toLocaleString()}</span></span>
                    {/* Duplicate for scrolling loop */}
                    <span className="flex items-center gap-3"><Skull className="text-rose-500 w-4 h-4" /> Cruelty Cases Monitored: <span className="text-rose-500">{liveData.cruelty.toLocaleString()}</span></span>
                    <span className="flex items-center gap-3"><Flame className="text-orange-500 w-4 h-4" /> Hunger Incidents Identified: <span className="text-orange-500">{liveData.hunger.toLocaleString()}</span></span>
                    <span className="flex items-center gap-3"><HandHeart className="text-emerald-500 w-4 h-4" /> Lives Saved: <span className="text-emerald-500">{liveData.rescued.toLocaleString()}</span></span>
                </div>
            </div>

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-l-8 border-emerald-500 pl-8">
                <div>
                  <h2 className="text-7xl font-black text-slate-950 tracking-tighter uppercase leading-none">Mission Hub</h2>
                  <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.4em] mt-4 font-black">District Deployment: <span className="text-emerald-600">{user?.city} Command</span></p>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                    <input value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} placeholder="SEARCH CASE FILES..." className="bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-8 py-4 outline-none font-black text-[11px] text-slate-950 w-full md:w-80 shadow-inner" />
                  </div>
                  <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 font-black uppercase">
                      {['all', 'news', 'adoption'].map(f => (
                          <button key={f} onClick={() => setFilter(f)} className={`px-6 py-3 rounded-xl text-[10px] tracking-widest transition-all ${filter === f ? 'bg-slate-950 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900'}`}>{f}</button>
                      ))}
                  </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {filteredFeed.map(item => (
                <div key={item.id} className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col h-full border-b-8 border-slate-100">
                  <div className="h-72 relative overflow-hidden">
                    <SafeImage src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute top-8 left-8">
                        <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-xl ${item.type === 'news' ? 'bg-emerald-500' : 'bg-blue-600'}`}>{item.type}</span>
                    </div>
                  </div>
                  <div className="p-10 flex flex-col flex-1 font-black uppercase">
                    {item.type === 'news' ? (
                      <>
                        <div className="flex items-center gap-2 text-[9px] text-slate-400 tracking-widest mb-4">
                            <Clock className="w-3 h-3" /> {item.date} • {item.location}
                        </div>
                        <h3 className="text-3xl tracking-tight leading-tight mb-8 line-clamp-2 hover:text-emerald-600 cursor-pointer" onClick={() => setSelectedArticle(item)}>{item.headline}</h3>
                        <div className="mt-auto flex items-center justify-between pt-8 border-t border-slate-100">
                          <button onClick={() => setSelectedArticle(item)} className="text-[11px] tracking-widest text-emerald-600 flex items-center gap-2 hover:gap-4 transition-all underline decoration-4 underline-offset-8">Read Full Report</button>
                          <div className="flex gap-4">
                            <Heart onClick={() => { item.liked = !item.liked; setFeed([...feed]); addKarma(5); }} className={`w-6 h-6 cursor-pointer ${item.liked ? 'fill-rose-500 text-rose-500' : 'text-slate-200'}`} />
                            <MessageCircle onClick={() => setCommentingOn(item)} className="w-6 h-6 text-slate-200 cursor-pointer hover:text-blue-500" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-6">
                          <h3 className="text-3xl tracking-tighter leading-none">{item.name}</h3>
                          <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-xl text-[10px]">{item.age}</span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium mb-10 normal-case italic leading-relaxed">"{item.bio}"</p>
                        <button onClick={() => window.open(`https://wa.me/${item.phone}`)} className="mt-auto w-full bg-slate-950 text-white py-5 rounded-[2rem] tracking-[0.2em] text-[10px] shadow-xl hover:bg-black transition-all">Submit Query</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OPS / TACTICAL MAP TAB (HIGH VISIBILITY + ANIMATION) */}
        {tab === 'ops' && (
          <div className="space-y-8 animate-fade-in h-[calc(100vh-200px)] flex flex-col">
            <header className="flex justify-between items-end px-4">
              <div>
                <h2 className="text-6xl font-black text-slate-950 tracking-tighter uppercase leading-none">Sector Grid</h2>
                <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.4em] mt-2">Live Satellite Feed</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 text-rose-500 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse flex items-center gap-2 shadow-sm">
                  <Activity className="w-4 h-4" /> Live Tracking
                </div>
              </div>
            </header>

            <div className="flex-1 rounded-[3rem] overflow-hidden shadow-2xl border-[8px] border-white relative z-0">
              
              {/* ANIMATED SCAN LINE */}
              <div className="absolute inset-0 pointer-events-none z-[400] overflow-hidden opacity-30">
                 <div className="w-full h-1 bg-emerald-500 shadow-[0_0_20px_4px_#10b981] animate-scan"></div>
              </div>

              <MapContainer 
                center={[19.0760, 72.8777]} // Coordinates for Mumbai
                zoom={12} 
                style={{ height: '100%', width: '100%', background: '#e2e8f0' }}
                zoomControl={false}
              >
                {/* 
                    HIGH-VISIBILITY TILE LAYER: CartoDB Voyager
                    Light, crisp, professional. Great for day ops.
                */}
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {/* Render Animated Markers */}
                {ACTIVE_CASES.map((c) => (
                    <Marker key={c.id} position={[c.lat, c.lng]} icon={getTacticalIcon(c.severity)}>
                        <Popup className="tactical-popup">
                            <div className="font-sans text-slate-900 p-2">
                                <h3 className="font-black uppercase text-sm mb-1">{c.title}</h3>
                                <p className={`text-xs font-bold uppercase ${c.severity === 'Critical' ? 'text-rose-600' : 'text-amber-600'}`}>{c.type} • {c.distance}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

              </MapContainer>
              
              {/* Floating Glassmorphism UI Overlay */}
              <div className="absolute bottom-8 left-8 z-[1000] bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 text-slate-900 max-w-xs pointer-events-none shadow-xl">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                   <h5 className="text-sm font-black uppercase tracking-widest text-emerald-600">Signal Active</h5>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-bold">Connected to Ops-Sat 4. Scanning Sector 7G for active bio-signatures.</p>
              </div>
            </div>
          </div>
        )}

        {/* NGO REGISTRY */}
        {tab === 'ngos' && (
          <div className="space-y-12 animate-fade-in font-black uppercase">
             <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-l-8 border-blue-500 pl-8">
                <div>
                  <h2 className="text-6xl font-black text-slate-950 tracking-tighter uppercase leading-none">NGO Registry</h2>
                  <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.4em] mt-4 font-black">Authorized Units: <span className="text-blue-600">Mumbai, Pune, Delhi, BLR</span></p>
                </div>
             </header>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {NGO_DATABASE.map(ngo => (
                    <div key={ngo.id} className="bg-white p-10 rounded-[4rem] border border-slate-200 flex flex-col md:flex-row items-center gap-10 shadow-sm hover:border-blue-500 transition-all group">
                        <SafeImage src={ngo.image} className="w-40 h-40 rounded-[2.5rem] object-cover shadow-2xl group-hover:scale-105 transition-transform" />
                        <div className="flex-1 text-center md:text-left">
                            <h4 className="text-3xl text-slate-950 tracking-tight leading-none mb-2">{ngo.name}</h4>
                            <p className="text-[11px] text-slate-400 tracking-widest mb-6">{ngo.city} Division • {ngo.type}</p>
                            <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${ngo.gps}`)} className="bg-slate-950 text-white px-10 py-4 rounded-2xl font-black text-[10px] tracking-widest flex items-center gap-2 mx-auto md:mx-0 shadow-xl hover:bg-black transition-all"><Navigation className="w-4 h-4" /> Start Nav</button>
                        </div>
                    </div>
                ))}
             </div>
          </div>
        )}

        {/* SCANNER TAB */}
        {tab === 'scanner' && <div className="max-w-4xl mx-auto py-12 animate-slide-up"><ScannerView onScanComplete={addKarma} /></div>}

        {/* MANUAL TAB (UPDATED: GREEN/BROWN THEME & ALL FEATURES) */}
        {tab === 'manual' && (
          <div className="max-w-5xl mx-auto space-y-20 animate-fade-in font-black uppercase">
             <header className="text-center space-y-4">
                {/* Changed text color to Dark Brown */}
                <h2 className="text-7xl font-black text-amber-900 tracking-tighter leading-none">Operational SOP</h2>
                <p className="text-stone-500 font-medium text-lg tracking-widest text-[11px]">Rescuer Protocol Guidelines.</p>
             </header>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {SOP_MANUAL.map(sop => (
                    <div key={sop.id} className="bg-white p-12 rounded-[4rem] border border-stone-200 shadow-sm hover:border-emerald-600 transition-all flex flex-col items-start group">
                        <div className="bg-stone-50 p-6 rounded-[1.5rem] mb-8 shadow-inner group-hover:scale-110 transition-transform">{sop.icon}</div>
                        {/* Changed text color to Brown */}
                        <h4 className="text-3xl font-black text-amber-900 uppercase mb-4 tracking-tighter">{sop.title}</h4>
                        {/* Changed text color to Greenish-Grey */}
                        <p className="text-stone-600 leading-relaxed font-medium italic opacity-90 normal-case text-lg font-bold">"{sop.desc}"</p>
                    </div>
                ))}
             </div>
          </div>
        )}

        {/* LOGISTICS / DONATION TAB */}
        {tab === 'logistics' && (
        <div className="space-y-12 animate-fade-in font-black uppercase">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-l-8 border-amber-500 pl-8">
            <div>
                <h2 className="text-7xl font-black text-slate-950 tracking-tighter uppercase leading-none">Supply Lines</h2>
                <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.4em] mt-4">Critical Resource Allocation</p>
            </div>
            </header>

            <div className="grid grid-cols-1 gap-8">
            {SUPPLY_DROPS.map(drop => {
                const percent = Math.min(100, Math.round((drop.raised / drop.goal) * 100));
                return (
                <div key={drop.id} className="bg-white p-10 rounded-[4rem] border border-slate-200 shadow-xl hover:border-amber-400 transition-all group relative overflow-hidden">
                    {/* Background progress fill opacity */}
                    <div className="absolute left-0 bottom-0 h-2 bg-slate-100 w-full">
                    <div className="h-full bg-amber-400 transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-10 items-center">
                    <SafeImage src={drop.image} className="w-32 h-32 rounded-[2rem] object-cover shadow-lg grayscale group-hover:grayscale-0 transition-all" />
                    
                    <div className="flex-1 w-full space-y-4">
                        <div className="flex justify-between items-start">
                        <div>
                            <h4 className="text-3xl text-slate-950 tracking-tight leading-none">{drop.title}</h4>
                            <p className="text-[10px] text-slate-400 tracking-widest mt-2">{drop.sector} • {drop.item}</p>
                        </div>
                        <span className="bg-amber-100 text-amber-600 px-4 py-2 rounded-xl text-[10px] tracking-widest">{drop.deadline}</span>
                        </div>

                        <div className="space-y-2 pt-4">
                        <div className="flex justify-between text-[11px] font-black tracking-widest">
                            <span>Raised: ₹{drop.raised.toLocaleString()}</span>
                            <span>Goal: ₹{drop.goal.toLocaleString()}</span>
                        </div>
                        <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div className="h-full bg-amber-500 flex items-center justify-center text-[9px] text-white transition-all duration-1000" style={{ width: `${percent}%` }}>
                            {percent}% FUNDED
                            </div>
                        </div>
                        </div>
                    </div>

                    <button onClick={() => { addKarma(100); alert("Payment Gateway Simulated: ₹500 sent."); }} className="w-full md:w-auto bg-slate-950 text-white px-10 py-6 rounded-[2.5rem] tracking-[0.2em] text-[10px] hover:bg-amber-500 transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3">
                        <Package className="w-4 h-4" /> Deploy Funds
                    </button>
                    </div>
                </div>
                );
            })}
            </div>
        </div>
        )}

        {/* PROFILE TAB */}
        {tab === 'profile' && (
            <div className="max-w-5xl mx-auto space-y-20 animate-fade-in">
                <div className="bg-white p-16 rounded-[5rem] border border-slate-200 shadow-2xl flex flex-col md:flex-row items-center gap-16 text-center md:text-left relative overflow-hidden">
                    <div className="w-56 h-56 bg-slate-100 rounded-[4rem] flex items-center justify-center text-slate-300 border-8 border-white shadow-inner"><User className="w-24 h-24" /></div>
                    <div className="flex-1 space-y-6 font-black uppercase">
                        <h2 className="text-7xl font-black text-slate-950 uppercase tracking-tighter leading-none">{user?.name}</h2>
                        <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.4em] flex items-center justify-center md:justify-start gap-3"><MapPin className="text-rose-500 w-5 h-5" /> {user?.city} Division</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-6">
                            <div className="bg-slate-950 text-white px-12 py-6 rounded-3xl flex items-center gap-5 shadow-2xl">
                                <Zap className="text-amber-400 w-8 h-8 fill-amber-400" />
                                <span className="text-xl tracking-widest">{karma} Impact Pts</span>
                            </div>
                            <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="p-6 bg-rose-50 text-rose-600 rounded-3xl border border-rose-100 hover:bg-rose-100 transition-colors shadow-sm"><LogOut className="w-8 h-8"/></button>
                        </div>
                    </div>
                </div>

                <div className="space-y-12 font-black uppercase">
                    <h3 className="text-5xl font-black text-slate-950 tracking-tighter px-10 flex items-center gap-6"><Crown className="text-amber-500 w-12 h-12"/> Regional Elite</h3>
                    <div className="space-y-6 px-10">
                        {LEADERBOARD.map((l, i) => (
                            <div key={i} className="bg-white p-12 rounded-[4rem] border border-slate-200 flex items-center justify-between shadow-sm group hover:translate-x-4 transition-all">
                                <div className="flex items-center gap-12">
                                    <div className="text-6xl font-black text-slate-100 w-20">0{l.rank}</div>
                                    <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 text-2xl shadow-inner">{l.avatar}</div>
                                    <h4 className="text-4xl text-slate-950 tracking-tighter">{l.name}</h4>
                                </div>
                                <p className="text-5xl text-slate-950">{l.karma.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </main>

      {/* SOS EMERGENCY ACTION */}
      <button 
        onClick={handleSOS}
        className={`fixed bottom-12 right-12 z-50 w-28 h-28 rounded-[3.5rem] flex flex-col items-center justify-center text-white shadow-2xl transition-all ${sosLoading ? 'bg-slate-900 animate-spin' : 'bg-rose-600 hover:scale-110 active:scale-95 animate-pulse'}`}
      >
        <Siren className="w-12 h-12" />
        <span className="text-[10px] font-black tracking-widest mt-2 uppercase">SOS Level 1</span>
      </button>

      {/* MODAL: SUBMIT INTEL (HORIZONTAL NEWS FORM) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in text-slate-950 font-black uppercase">
          <div className="bg-white w-full max-w-3xl rounded-[5rem] p-16 shadow-2xl animate-slide-up relative max-h-[90vh] overflow-y-auto no-scrollbar border-[16px] border-white">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">File Report</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-slate-100 rounded-3xl transition-colors"><X className="w-8 h-8" /></button>
            </div>
            
            <div className="space-y-12">
              <div className="h-80 bg-slate-950 border-8 border-dashed border-slate-800 rounded-[4rem] flex flex-col items-center justify-center relative hover:bg-emerald-500/5 transition-all overflow-hidden group">
                {postForm.image ? (
                  <img src={postForm.image} className="w-full h-full object-cover" alt="preview" />
                ) : (
                  <>
                    <ImageIcon className="text-emerald-500/20 w-24 h-24 group-hover:scale-110 transition-transform" />
                    <p className="text-[12px] font-black uppercase text-emerald-500/40 mt-6 tracking-[0.5em]">Capture Visual Metadata</p>
                  </>
                )}
                <input type="file" onChange={async (e) => {
                    const b64 = await convertToBase64(e.target.files[0]);
                    setPostForm({...postForm, image: b64});
                }} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>

              <div className="flex gap-6 p-2.5 bg-slate-100 rounded-[3rem]">
                  <button onClick={() => setPostForm({...postForm, type: 'news'})} className={`flex-1 py-6 rounded-[2.5rem] text-[12px] tracking-widest transition-all ${postForm.type === 'news' ? 'bg-emerald-500 text-white shadow-xl' : 'text-slate-400 hover:text-slate-950'}`}>Mission News</button>
                  <button onClick={() => setPostForm({...postForm, type: 'adoption'})} className={`flex-1 py-6 rounded-[2.5rem] text-[12px] tracking-widest transition-all ${postForm.type === 'adoption' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400 hover:text-slate-950'}`}>Adoption Task</button>
              </div>

              <div className="space-y-8 text-left">
                <div className="space-y-2">
                    <label className="text-[11px] tracking-widest ml-6 text-slate-400 uppercase">📄 🐕 Intelligence Title</label>
                    <input value={postForm.title} onChange={(e) => setPostForm({...postForm, title: e.target.value})} placeholder="Title / Headline" className="w-full p-8 bg-slate-950 text-emerald-400 border-4 border-slate-800 rounded-[3rem] outline-none shadow-sm placeholder:text-slate-700" />
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] tracking-widest ml-6 text-slate-400 uppercase">📝 Documentation</label>
                    <textarea value={postForm.desc} onChange={(e) => setPostForm({...postForm, desc: e.target.value})} rows="5" placeholder="Operational details / Bio summary..." className="w-full p-8 bg-slate-950 text-emerald-400 border-4 border-slate-800 rounded-[3rem] outline-none shadow-sm placeholder:text-slate-700 font-bold" />
                </div>
              </div>

              <button onClick={handlePostSubmit} className="w-full py-10 bg-slate-950 text-white rounded-[3.5rem] tracking-[0.6em] text-[12px] hover:bg-black transition-all active:scale-95 shadow-2xl border-4 border-emerald-500/20">Transmit Intel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// SCANNER MODULE
const ScannerView = ({ onScanComplete }) => {
    const [image, setImage] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if(file) {
            setImage(URL.createObjectURL(file)); setAnalyzing(true);
            setTimeout(() => {
                setAnalyzing(false);
                setResult({ breed: "Indian Pariah (Indie)", condition: "Healthy", advice: "Subject stable. No clinical intervention required.", pts: 50 });
                onScanComplete(50);
            }, 3000);
        }
    };

    return (
        <div className="space-y-12 animate-fade-in text-center font-black uppercase">
            {!image ? (
                <div className="h-[550px] border-[14px] border-dashed border-slate-950 rounded-[7rem] flex flex-col items-center justify-center relative hover:bg-emerald-50 transition-all cursor-pointer shadow-inner group bg-white">
                    <ImageIcon className="w-24 h-24 text-slate-950 mb-8 group-hover:scale-110 transition-transform" />
                    <p className="text-[16px] tracking-[0.6em] text-slate-950">Initialize Bio-Scan</p>
                    <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
            ) : (
                <div className="space-y-12">
                    <div className="h-[550px] rounded-[7rem] overflow-hidden relative shadow-2xl border-[16px] border-white bg-slate-950">
                        <img src={image} className="w-full h-full object-cover" alt="target" />
                        {analyzing && <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl flex flex-col items-center justify-center text-emerald-500"><RefreshCw className="w-24 h-24 animate-spin mb-12" /><p className="text-xl tracking-[0.8em] animate-pulse">Analyzing Bio-Intel</p></div>}
                    </div>
                    {result && <div className="bg-slate-950 p-20 rounded-[7rem] text-white text-left animate-slide-up border-[12px] border-white/5 shadow-2xl"><h4 className="text-7xl leading-none mb-6 tracking-tighter">{result.breed}</h4><p className="text-emerald-400 text-3xl tracking-tighter uppercase font-black">Status: {result.condition}</p><button onClick={() => { setImage(null); setResult(null); }} className="w-full mt-10 py-10 bg-emerald-500 rounded-[3.5rem] tracking-[0.4em] shadow-xl hover:bg-emerald-400 active:scale-95 transition-all">Complete scan</button></div>}
                </div>
            )}
        </div>
    );
};
