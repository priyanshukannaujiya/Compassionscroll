import React, { useState, useEffect, useMemo } from 'react';
import { 
  Heart, Share2, MessageCircle, User, MapPin, ArrowLeft, Search, Bell, 
  PawPrint, Plus, X, LogOut, Upload, Image as ImageIcon, Stethoscope, Siren, 
  Phone, Navigation, Award, Zap, ChevronRight, BookOpen, Star, Shield, Trophy, 
  Link as LinkIcon, Send, Crown, CheckCircle2, TrendingUp, HandHeart, Globe, 
  Target, RefreshCw, Activity, ShieldCheck, ClipboardList, Sparkles, 
  Dog, Cat, Bird, Check, Copy, Eye, Clock, Bookmark, AlertTriangle, Newspaper, Home,
  Flame, Skull, Droplets, Newspaper as NewsIcon, Package, Radar, Map,
  FileText, BarChart3, Radio, ChevronLeft, Share, Users
} from 'lucide-react';

// --- MAP IMPORTS ---
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- CUSTOM STYLES ---
const styles = `
  @keyframes scan-vertical {
    0% { transform: translateY(-100%); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translateY(500%); opacity: 0; }
  }
  .animate-scan {
    animation: scan-vertical 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    background: linear-gradient(to bottom, transparent, #10b981, transparent);
  }
  @keyframes sonar-ripple {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(4); opacity: 0; }
  }
  .sonar-pulse {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    border-radius: 50%;
    border: 2px solid currentColor;
    animation: sonar-ripple 2s infinite;
  }
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  .animate-float {
    animation: float 4s ease-in-out infinite;
  }
  @keyframes breathe {
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
    70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
  }
  .animate-breathe {
    animation: breathe 2s infinite;
  }
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// --- LEAFLET ICON FIX ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- TACTICAL MARKER ---
const getTacticalIcon = (severity, type) => {
  const color = severity === 'Critical' ? '#ef4444' : (severity === 'High' ? '#f59e0b' : '#10b981'); 
  let emoji = '🐾';
  if (type.includes('Canine') || type.includes('Dog') || type.includes('Puppy')) emoji = '🐕';
  else if (type.includes('Feline') || type.includes('Cat')) emoji = '🐈';
  else if (type.includes('Bird')) emoji = '🦅';
  else if (type.includes('Injury')) emoji = '🩹';
  
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `
      <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
        <div class="sonar-pulse" style="color: ${color}; border-width: 2px;"></div>
        <div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); z-index: 10; display: flex; align-items: center; justify-content: center; font-size: 18px;">
          ${emoji}
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

// --- DATASETS ---
const NGO_DATABASE = [
  { id: 1, name: "WSD Welfare of Stray Dogs", city: "Mumbai", type: "Clinical & Sterilization", phone: "919372079707", gps: "18.9827, 72.8311", image: "https://images.unsplash.com/photo-1599409636242-7500950a2794?w=800" },
  { id: 2, name: "ResQ Pune Division", city: "Pune", type: "Trauma & Emergency Hospital", phone: "919372079707", gps: "18.5204, 73.8567", image: "https://images.unsplash.com/photo-1560743641-3914f2c45636?w=800" },
  { id: 3, name: "CUPA Bangalore Hub", city: "Bangalore", type: "Shelter & Rescue", phone: "919372079707", gps: "13.0354, 77.5988", image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800" },
  { id: 4, name: "Friendicoes SECA", city: "Delhi", type: "Ambulance & Emergency Hospital", phone: "919372079707", gps: "28.6139, 77.2090", image: "https://images.unsplash.com/photo-1544568100-847a948585b9?w=800" },
  { id: 5, name: "Blue Cross India", city: "Chennai", type: "Veterinary Surgical Unit", phone: "919372079707", gps: "13.0102, 80.2157", image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800" },
  { id: 6, name: "People for Animals", city: "Hyderabad", type: "Wildlife Rehabilitation", phone: "919372079707", gps: "17.3850, 78.4867", image: "https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=800" },
];

const APP_PROTOCOLS = [
  { id: 1, title: "Mission Hub", icon: <Newspaper className="text-amber-700 w-6 h-6" />, desc: "Central intelligence. Filter real-time news, rescue updates, and adoption cases." },
  { id: 2, title: "Sector Grid", icon: <Map className="text-emerald-600 w-6 h-6" />, desc: "Live tactical map. Tracks distress signals (SOS) and active cases via satellite." },
  { id: 3, title: "Bio-Scan ID", icon: <Target className="text-amber-700 w-6 h-6" />, desc: "AI-Diagnostics. Identify breed and assess injury severity instantly via camera." },
  { id: 4, title: "NGO Registry", icon: <ShieldCheck className="text-emerald-600 w-6 h-6" />, desc: "Verified database. Get direct GPS nav and emergency hotlines for local units." },
  { id: 5, title: "Supply Lines", icon: <Package className="text-amber-700 w-6 h-6" />, desc: "Logistics network. Fund specific critical items (Vaccines/Food) directly." },
  { id: 6, title: "SOS Beacon", icon: <Siren className="text-rose-600 w-6 h-6" />, desc: "Emergency link. Broadcast GPS coords to National Dispatch via WhatsApp." },
  { id: 7, title: "Agent Profile", icon: <User className="text-slate-600 w-6 h-6" />, desc: "Track your impact. View Karma points, rank, and regional leaderboard status." },
  { id: 8, title: "Intel Report", icon: <FileText className="text-blue-600 w-6 h-6" />, desc: "Submit data. Create new rescue or adoption files via the (+) Action Button." },
];

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

const INITIAL_FEED = [
  { 
    type: 'news', id: 1, headline: "District Rescue Operations: 2026 Protocol Change", category: "BREAKING NEWS",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200", 
    author: { name: "Dr. Ananya Rai", role: "Field Director", avatar: "AR" },
    date: "JAN 29, 2026", readTime: "5 min read", status: "Active",
    content: "Official Directive: All divisions must now sync Bio-Scan data before initiating clinic transport. This ensures real-time medical logistics tracking for high-priority subjects. \n\nField agents are advised to update their firmware to version 4.2. Failure to comply may result in delayed dispatch coordination. The new protocol prioritizes 'Critical' flagged cases in the Sector Grid.",
    location: "National HQ", liked: false, likesCount: 420, comments: [], verified: true 
  },
  { 
    type: 'adoption', id: 101, name: "Cooper - Case ID 104", age: "5 months", breed: "Indie Mix", 
    bio: "Subject found with minor leg trauma in Mumbai Central. Fully rehabilitated. High energy levels detected. Suitable for active patrol families. Cooper excels in agility drills and responds to basic tactical commands. Vaccination status: Complete.", 
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800", 
    phone: "919372079707", location: "Mumbai", liked: false, likesCount: 89, comments: [], status: "Active" 
  },
  { 
    type: 'news', id: 2, headline: "Canine Distemper Outbreak: Sector 4 Alert", category: "MEDICAL ALERT",
    image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=1200", 
    author: { name: "Ops Command", role: "Medical Unit", avatar: "OC" },
    date: "JAN 28, 2026", readTime: "3 min read", status: "Critical",
    content: "Viral pathogen detected in stray populations near North Sector. Immediate isolation protocols are in effect. Vaccination drives scheduled for 0800 hours tomorrow. \n\nAll units are requested to carry extra disinfectant and PPE. Do not approach symptomatic subjects without full protective gear. Report sightings immediately via the SOS module.",
    location: "Sector 4", liked: false, likesCount: 215, comments: [], verified: true 
  },
];

const LEADERBOARD = [
  { name: "Ankita Bind", karma: 1420, rank: 1, badge: "Grandmaster", avatar: "AB" },
  { name: "Shivam Kumar", karma: 1250, rank: 2, badge: "Elite Protector", avatar: "SK" },
  { name: "Alok Sharma", karma: 1100, rank: 3, badge: "Field Specialist", avatar: "AS" }
];

// Utility
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
  
  // FOLLOW SYSTEM STATE
  const [following, setFollowing] = useState(() => JSON.parse(localStorage.getItem('cs_following')) || []);
  const [followersCount, setFollowersCount] = useState(128); // Dummy start count

  const [liveData, setLiveData] = useState({ cruelty: 14829, hunger: 52044, rescued: 128956 });
  const [searchQuery, setSearchQuery] = useState('');
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [postForm, setPostForm] = useState({ title: '', desc: '', type: 'news', image: null, age: 'Junior' });
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // THE "BLOG VIEW" STATE
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  
  const [notification, setNotification] = useState(null);
  const [sosLoading, setSosLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('cs_screen', screen);
    localStorage.setItem('cs_tab', tab); 
    if(user) localStorage.setItem('cs_user', JSON.stringify(user));
    localStorage.setItem('cs_karma', karma.toString());
    localStorage.setItem('cs_feed', JSON.stringify(feed));
    localStorage.setItem('cs_following', JSON.stringify(following));

    const ticker = setInterval(() => {
        setLiveData(prev => ({ cruelty: prev.cruelty + 1, hunger: prev.hunger + 3, rescued: prev.rescued + 1 }));
    }, 8000);
    return () => clearInterval(ticker);
  }, [screen, tab, user, karma, feed, following]);

  const addKarma = (pts) => {
    setKarma(prev => prev + pts);
    setNotification(`+${pts} IMPACT POINTS LOGGED`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleFollow = (authorName) => {
    if (following.includes(authorName)) {
        setFollowing(following.filter(name => name !== authorName));
        setNotification(`Unfollowed Agent ${authorName}`);
    } else {
        setFollowing([...following, authorName]);
        setNotification(`Now Following Agent ${authorName}`);
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleShare = () => {
    if (navigator.share) {
        navigator.share({
            title: selectedArticle.headline || selectedArticle.name,
            text: "Check out this mission report from PAWsitive.",
            url: window.location.href,
        }).catch(console.error);
    } else {
        setNotification("Link copied to clipboard");
        setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleComment = () => {
    if (!commentInput.trim()) return;
    const newComment = {
        id: Date.now(),
        text: commentInput,
        author: user.name,
        avatar: user.name.substring(0,2).toUpperCase(),
        time: "Just now"
    };
    
    // Update local feed state to persist comment
    const updatedFeed = feed.map(item => {
        if (item.id === selectedArticle.id) {
            const updatedItem = { ...item, comments: [...item.comments, newComment] };
            setSelectedArticle(updatedItem); // Update modal view
            return updatedItem;
        }
        return item;
    });
    setFeed(updatedFeed);
    setCommentInput("");
    addKarma(5);
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
      id: Date.now(), 
      type: postForm.type,
      headline: postForm.type === 'news' ? postForm.title : null,
      name: postForm.type === 'adoption' ? postForm.title : null,
      image: postForm.image, 
      author: { name: user.name, role: "Field Agent", avatar: user.name.substring(0,2).toUpperCase() },
      date: "JUST NOW", 
      readTime: "2 min read", 
      content: postForm.desc,
      bio: postForm.type === 'adoption' ? postForm.desc : null,
      age: postForm.type === 'adoption' ? postForm.age : null,
      liked: false, 
      comments: [], 
      status: "Active", 
      phone: "91+919820161114", 
      category: "FIELD REPORT",
      location: user?.city || "Unknown"
    };
    setFeed([newEntry, ...feed]); 
    setIsModalOpen(false);
    setPostForm({ title: '', desc: '', type: 'news', image: null, age: 'Junior' });
    addKarma(25);
    if(newEntry.type === 'news') setSelectedArticle(newEntry);
  };

  const filteredFeed = useMemo(() => {
    return feed
      .filter(i => filter === 'all' || i.type === filter)
      .filter(i => (i.headline || i.name || "").toLowerCase().includes(searchQuery.toLowerCase()));
  }, [feed, filter, searchQuery]);

  // --- 🛡️ AUTH SCREEN ---
  if (screen === 'auth') return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-40">
        <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2000" className="w-full h-full object-cover" alt="bg" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/20 to-slate-950"></div>
      </div>
      <div className="w-full max-w-md space-y-12 animate-fade-in relative z-10">
        <div className="space-y-6">
            <div className="bg-emerald-500 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl animate-float border-4 border-white/10"><PawPrint className="text-white w-12 h-12" /></div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">PAWsitive<br/><span className="text-emerald-400">Connect</span></h1>
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

  // --- 🛡️ SETUP SCREEN ---
  if (screen === 'setup') return (
    <div className="min-h-screen bg-emerald-600 flex items-center justify-center p-4 md:p-6 overflow-hidden">
      <div className="bg-white w-full max-w-6xl rounded-[2.5rem] md:rounded-[4rem] shadow-2xl animate-slide-up flex flex-col md:flex-row overflow-hidden min-h-[650px] border-4 md:border-8 border-white/20">
        <div className="hidden md:block w-1/2 relative group">
            <img src="https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=2000" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="setup" />
            <div className="absolute inset-0 bg-emerald-950/40 mix-blend-multiply"></div>
            <div className="absolute inset-0 flex items-center justify-center p-12">
                <div className="p-10 border-4 border-white/40 rounded-[3rem] backdrop-blur-md animate-float">
                    <p className="text-white text-5xl font-black uppercase tracking-tighter leading-none text-center">Identity<br/>Establishing.</p>
                </div>
            </div>
        </div>
        <div className="w-full md:w-1/2 p-8 md:p-20 flex flex-col justify-center bg-white text-left">
            <h2 className="text-4xl md:text-5xl font-black text-slate-950 uppercase tracking-tighter mb-4">Identity Setup</h2>
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
    <div className="min-h-screen bg-white font-sans pb-32 selection:bg-emerald-500 selection:text-white relative">
      {/* INJECT ANIMATION STYLES */}
      <style>{styles}</style>

      {notification && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-950 text-white px-6 md:px-10 py-4 md:py-5 rounded-full shadow-2xl animate-slide-up flex items-center gap-3 border border-emerald-500 w-max max-w-[90%]">
          <Zap className="text-amber-400 w-4 md:w-5 h-4 md:h-5 fill-amber-400" />
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{notification}</span>
        </div>
      )}

      {/* REFINED NAVBAR */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 md:px-10 h-auto py-4 md:py-0 md:h-24 flex flex-col md:flex-row md:items-center justify-between shadow-sm gap-4">
        
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setTab('feed')}>
            <div className="bg-slate-950 p-2 md:p-2.5 rounded-2xl shadow-lg hover:rotate-12 transition-transform"><PawPrint className="w-5 h-5 md:w-6 md:h-6 text-white" /></div>
            <span className="font-black text-xl md:text-2xl tracking-tighter text-slate-900 uppercase">PAWsitive</span>
          </div>
          
          <div className="flex items-center gap-3 md:hidden">
            <div className="bg-emerald-50 px-3 py-2 rounded-2xl border border-emerald-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              <span className="text-xs font-black text-emerald-700 uppercase">{karma}</span>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="bg-slate-950 text-white p-2 rounded-xl shadow-xl active:scale-90 transition-transform"><Plus className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-[2rem] border border-slate-200 w-max mx-auto md:mx-0">
            {[
              { id: 'feed', label: 'Feed 📰' },
              { id: 'ops', label: 'Map 🚁' },
              { id: 'ngos', label: 'Registry 🏥' },
              { id: 'scanner', label: 'Scanner 🧬' },
              { id: 'manual', label: 'Protocol 📜' },
              { id: 'logistics', label: 'Supply 📦' },
              { id: 'profile', label: 'Profile 💂' }
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 md:px-6 py-2 md:py-2.5 rounded-[1.5rem] text-[10px] md:text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap ${tab === t.id ? 'bg-white text-emerald-600 shadow-sm border border-slate-100 scale-[1.02]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <Zap className="w-5 h-5 text-emerald-600 fill-emerald-600" />
            <span className="text-sm font-black text-emerald-700 uppercase">{karma} <span className="text-[10px] opacity-40">Pts</span></span>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-slate-950 text-white p-4 rounded-2xl shadow-xl hover:scale-110 transition-all active:scale-95"><Plus className="w-7 h-7" /></button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-12 text-slate-950">
        
        {/* MISSION HUB (FEED) */}
        {tab === 'feed' && (
          <div className="space-y-8 md:space-y-12 animate-fade-in">
            
            {/* LIVE GLOBAL IMPACT TICKER (MOBILE FIXED) */}
            <div className="bg-slate-950 p-3 md:p-4 rounded-2xl overflow-hidden relative border-y-4 border-emerald-500 shadow-2xl w-full max-w-full">
                <div className="flex items-center gap-6 md:gap-12 whitespace-nowrap animate-ticker font-black text-[9px] md:text-[11px] text-white uppercase tracking-widest">
                    <span className="flex items-center gap-2 md:gap-3"><Skull className="text-rose-500 w-3 h-3 md:w-4 md:h-4" /> Cruelty Cases: <span className="text-rose-500">{liveData.cruelty.toLocaleString()}</span></span>
                    <span className="flex items-center gap-2 md:gap-3"><Flame className="text-orange-500 w-3 h-3 md:w-4 md:h-4" /> Hunger Alerts: <span className="text-orange-500">{liveData.hunger.toLocaleString()}</span></span>
                    <span className="flex items-center gap-2 md:gap-3"><HandHeart className="text-emerald-500 w-3 h-3 md:w-4 md:h-4" /> Lives Saved: <span className="text-emerald-500">{liveData.rescued.toLocaleString()}</span></span>
                    {/* Duplicate for seamless loop */}
                    <span className="flex items-center gap-2 md:gap-3"><Skull className="text-rose-500 w-3 h-3 md:w-4 md:h-4" /> Cruelty Cases: <span className="text-rose-500">{liveData.cruelty.toLocaleString()}</span></span>
                </div>
            </div>

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 border-l-4 md:border-l-8 border-emerald-500 pl-4 md:pl-8">
                <div>
                  <h2 className="text-4xl md:text-7xl font-black text-slate-950 tracking-tighter uppercase leading-none">Mission Hub 📡</h2>
                  <p className="text-slate-400 font-bold uppercase text-[9px] md:text-[11px] tracking-[0.4em] mt-2 md:mt-4 font-black">District Deployment: <span className="text-emerald-600">{user?.city} Command</span></p>
                </div>
                <div className="flex flex-col gap-3 md:gap-4 w-full md:w-auto">
                  <div className="relative w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 md:w-5 md:h-5" />
                    <input value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} placeholder="SEARCH INTEL..." className="bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 md:pl-14 pr-6 md:pr-8 py-3 md:py-4 outline-none font-black text-[10px] md:text-[11px] text-slate-950 w-full md:w-80 shadow-inner focus:border-emerald-500 transition-colors" />
                  </div>
                  <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 font-black uppercase overflow-x-auto no-scrollbar">
                      {['all', 'news', 'adoption'].map(f => (
                          <button key={f} onClick={() => setFilter(f)} className={`flex-1 px-4 md:px-6 py-2 md:py-3 rounded-xl text-[9px] md:text-[10px] tracking-widest transition-all whitespace-nowrap ${filter === f ? 'bg-slate-950 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900'}`}>{f === 'news' ? 'News 📢' : f === 'adoption' ? 'Adopt 🏠' : 'All 📂'}</button>
                      ))}
                  </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
              {filteredFeed.map(item => (
                <div key={item.id} className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-200 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col h-full border-b-8 border-slate-100">
                  <div className="h-56 md:h-72 relative overflow-hidden" onClick={() => item.type === 'news' ? setSelectedArticle(item) : null}>
                    <SafeImage src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 cursor-pointer" />
                    <div className="absolute top-6 left-6 md:top-8 md:left-8">
                        <span className={`px-3 md:px-4 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white shadow-xl ${item.type === 'news' ? 'bg-emerald-500' : 'bg-blue-600'}`}>{item.type === 'news' ? 'INTEL 📢' : 'RESCUE 🐾'}</span>
                    </div>
                  </div>
                  <div className="p-6 md:p-10 flex flex-col flex-1 font-black uppercase">
                    {item.type === 'news' ? (
                      <>
                        <div className="flex items-center gap-2 text-[8px] md:text-[9px] text-slate-400 tracking-widest mb-3 md:mb-4">
                            <Clock className="w-3 h-3" /> {item.date} • {item.location}
                        </div>
                        <h3 className="text-2xl md:text-3xl tracking-tight leading-tight mb-6 md:mb-8 line-clamp-2 hover:text-emerald-600 cursor-pointer" onClick={() => setSelectedArticle(item)}>{item.headline}</h3>
                        <div className="mt-auto flex items-center justify-between pt-6 md:pt-8 border-t border-slate-100">
                          <button onClick={() => setSelectedArticle(item)} className="text-[10px] md:text-[11px] tracking-widest text-emerald-600 flex items-center gap-2 hover:gap-4 transition-all underline decoration-4 underline-offset-8">Read Full Report</button>
                          <div className="flex gap-4">
                            <Heart onClick={() => { item.liked = !item.liked; setFeed([...feed]); addKarma(5); }} className={`w-5 h-5 md:w-6 md:h-6 cursor-pointer hover:scale-110 transition-transform ${item.liked ? 'fill-rose-500 text-rose-500' : 'text-slate-200'}`} />
                            <MessageCircle onClick={() => setCommentingOn(item)} className="w-5 h-5 md:w-6 md:h-6 text-slate-200 cursor-pointer hover:text-blue-500 hover:scale-110 transition-transform" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-4 md:mb-6">
                          <h3 className="text-2xl md:text-3xl tracking-tighter leading-none">{item.name}</h3>
                          <span className="bg-blue-50 text-blue-600 px-3 md:px-4 py-1.5 rounded-xl text-[9px] md:text-[10px]">{item.age}</span>
                        </div>
                        <p className="text-slate-500 text-xs md:text-sm font-medium mb-8 md:mb-10 normal-case italic leading-relaxed">"{item.bio}"</p>
                        <button onClick={() => window.open(`https://wa.me/${item.phone}`)} className="mt-auto w-full bg-slate-950 text-white py-4 md:py-5 rounded-[2rem] tracking-[0.2em] text-[9px] md:text-[10px] shadow-xl hover:bg-black transition-all active:scale-95">Submit Query</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OPS / TACTICAL MAP TAB */}
        {tab === 'ops' && (
          <div className="space-y-6 md:space-y-8 animate-fade-in h-[calc(100vh-220px)] md:h-[calc(100vh-200px)] flex flex-col">
            <header className="flex flex-col md:flex-row md:items-end justify-between px-2 md:px-4 gap-4">
              <div>
                <h2 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tighter uppercase leading-none">Sector Grid 🚁</h2>
                <p className="text-slate-400 font-bold uppercase text-[9px] md:text-[11px] tracking-[0.4em] mt-2">Live Satellite Feed</p>
              </div>
              <div className="flex gap-4 self-start md:self-auto">
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 text-rose-500 px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest animate-pulse-slow flex items-center gap-2 shadow-sm">
                  <Activity className="w-3 h-3 md:w-4 md:h-4" /> Live Tracking
                </div>
              </div>
            </header>

            <div className="flex-1 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-[4px] md:border-[8px] border-white relative z-0">
              <div className="absolute inset-0 pointer-events-none z-[400] overflow-hidden opacity-30">
                 <div className="w-full h-full bg-transparent animate-scan shadow-[0_0_20px_4px_#10b981]"></div>
              </div>

              <MapContainer center={[19.0760, 72.8777]} zoom={12} style={{ height: '100%', width: '100%', background: '#e2e8f0' }} zoomControl={false}>
                <TileLayer attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                {ACTIVE_CASES.map((c) => (
                    <Marker key={c.id} position={[c.lat, c.lng]} icon={getTacticalIcon(c.severity, c.title)}>
                        <Popup className="tactical-popup">
                            <div className="font-sans text-slate-900 p-2">
                                <h3 className="font-black uppercase text-sm mb-1">{c.title}</h3>
                                <p className={`text-xs font-bold uppercase ${c.severity === 'Critical' ? 'text-rose-600' : 'text-amber-600'}`}>{c.type} • {c.distance}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
              </MapContainer>
              
              <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 z-[1000] bg-white/80 backdrop-blur-xl p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-white/50 text-slate-900 max-w-[200px] md:max-w-xs pointer-events-none shadow-xl animate-float">
                <div className="flex items-center gap-2 md:gap-3 mb-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                   <h5 className="text-xs md:text-sm font-black uppercase tracking-widest text-emerald-600">Signal Active</h5>
                </div>
                <p className="text-[8px] md:text-[10px] text-slate-500 leading-relaxed font-bold">Connected to Ops-Sat 4. Scanning Sector 7G for active bio-signatures.</p>
              </div>
            </div>
          </div>
        )}

        {/* NGO REGISTRY */}
        {tab === 'ngos' && (
          <div className="space-y-8 md:space-y-12 animate-fade-in font-black uppercase">
             <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-l-4 md:border-l-8 border-blue-500 pl-4 md:pl-8">
                <div>
                  <h2 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tighter uppercase leading-none">NGO Registry 🏥</h2>
                  <p className="text-slate-400 font-bold uppercase text-[9px] md:text-[11px] tracking-[0.4em] mt-2 md:mt-4 font-black">Authorized Units: <span className="text-blue-600">Mumbai, Pune, Delhi, BLR</span></p>
                </div>
             </header>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                {NGO_DATABASE.map(ngo => (
                    <div key={ngo.id} className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] border border-slate-200 flex flex-col md:flex-row items-center gap-6 md:gap-10 shadow-sm hover:border-blue-500 transition-all group text-center md:text-left">
                        <SafeImage src={ngo.image} className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] md:rounded-[2.5rem] object-cover shadow-2xl group-hover:scale-105 transition-transform" />
                        <div className="flex-1 w-full">
                            <h4 className="text-2xl md:text-3xl text-slate-950 tracking-tight leading-none mb-2">{ngo.name}</h4>
                            <p className="text-[9px] md:text-[11px] text-slate-400 tracking-widest mb-4 md:mb-6">{ngo.city} Division • {ngo.type}</p>
                            <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${ngo.gps}`)} className="w-full md:w-auto bg-slate-950 text-white px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-xl hover:bg-black transition-all active:scale-95"><Navigation className="w-4 h-4" /> Start Nav</button>
                        </div>
                    </div>
                ))}
             </div>
          </div>
        )}

        {/* SCANNER TAB */}
        {tab === 'scanner' && <div className="max-w-4xl mx-auto py-6 md:py-12 animate-slide-up"><ScannerView onScanComplete={addKarma} /></div>}

        {/* PROTOCOL TAB */}
        {tab === 'manual' && (
          <div className="max-w-6xl mx-auto space-y-12 md:space-y-20 animate-fade-in font-black uppercase">
             <header className="text-center space-y-4">
                <h2 className="text-4xl md:text-7xl font-black text-amber-900 tracking-tighter leading-none">Operational Protocol 📖</h2>
                <p className="text-stone-500 font-medium text-sm md:text-lg tracking-widest text-[9px] md:text-[11px]">Field Guide & System Capabilities.</p>
             </header>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {APP_PROTOCOLS.map(prot => (
                    <div key={prot.id} className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-stone-200 shadow-sm hover:border-emerald-600 hover:shadow-xl transition-all flex flex-col items-center text-center group h-full">
                        <div className="bg-stone-50 p-4 rounded-[1.5rem] mb-4 shadow-inner group-hover:scale-110 transition-transform">{prot.icon}</div>
                        <h4 className="text-lg md:text-xl font-black text-amber-900 uppercase mb-2 tracking-tighter">{prot.title}</h4>
                        <p className="text-stone-500 leading-relaxed font-bold text-xs md:text-sm normal-case">{prot.desc}</p>
                    </div>
                ))}
             </div>
          </div>
        )}

        {/* LOGISTICS / DONATION TAB */}
        {tab === 'logistics' && (
        <div className="space-y-8 md:space-y-12 animate-fade-in font-black uppercase">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-l-4 md:border-l-8 border-amber-500 pl-4 md:pl-8">
            <div>
                <h2 className="text-4xl md:text-7xl font-black text-slate-950 tracking-tighter uppercase leading-none">Supply Lines 📦</h2>
                <p className="text-slate-400 font-bold uppercase text-[9px] md:text-[11px] tracking-[0.4em] mt-2 md:mt-4">Critical Resource Allocation</p>
            </div>
            </header>

            <div className="grid grid-cols-1 gap-6 md:gap-8">
            {SUPPLY_DROPS.map(drop => {
                const percent = Math.min(100, Math.round((drop.raised / drop.goal) * 100));
                return (
                <div key={drop.id} className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] border border-slate-200 shadow-xl hover:border-amber-400 transition-all group relative overflow-hidden">
                    <div className="absolute left-0 bottom-0 h-2 bg-slate-100 w-full">
                    <div className="h-full bg-amber-400 transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center">
                    <SafeImage src={drop.image} className="w-full md:w-32 h-40 md:h-32 rounded-[2rem] object-cover shadow-lg grayscale group-hover:grayscale-0 transition-all" />
                    
                    <div className="flex-1 w-full space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-2 md:gap-0">
                        <div>
                            <h4 className="text-2xl md:text-3xl text-slate-950 tracking-tight leading-none">{drop.title}</h4>
                            <p className="text-[9px] md:text-[10px] text-slate-400 tracking-widest mt-2">{drop.sector} • {drop.item}</p>
                        </div>
                        <span className="bg-amber-100 text-amber-600 px-3 md:px-4 py-1 md:py-2 rounded-xl text-[9px] md:text-[10px] tracking-widest self-start md:self-auto">{drop.deadline}</span>
                        </div>

                        <div className="space-y-2 pt-2 md:pt-4">
                        <div className="flex justify-between text-[9px] md:text-[11px] font-black tracking-widest">
                            <span>Raised: ₹{drop.raised.toLocaleString()}</span>
                            <span>Goal: ₹{drop.goal.toLocaleString()}</span>
                        </div>
                        <div className="h-5 md:h-6 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div className="h-full bg-amber-500 flex items-center justify-center text-[8px] md:text-[9px] text-white transition-all duration-1000" style={{ width: `${percent}%` }}>
                            {percent}% FUNDED
                            </div>
                        </div>
                        </div>
                    </div>

                    <button onClick={() => { addKarma(100); alert("Payment Gateway Simulated: ₹500 sent."); }} className="w-full md:w-auto bg-slate-950 text-white px-8 md:px-10 py-5 md:py-6 rounded-[2.5rem] tracking-[0.2em] text-[10px] hover:bg-amber-500 transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3">
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
            <div className="max-w-5xl mx-auto space-y-12 md:space-y-20 animate-fade-in">
                <div className="bg-white p-8 md:p-16 rounded-[3rem] md:rounded-[5rem] border border-slate-200 shadow-2xl flex flex-col md:flex-row items-center gap-8 md:gap-16 text-center md:text-left relative overflow-hidden">
                    <div className="w-40 h-40 md:w-56 md:h-56 bg-slate-100 rounded-[3rem] md:rounded-[4rem] flex items-center justify-center text-slate-300 border-4 md:border-8 border-white shadow-inner"><User className="w-16 h-16 md:w-24 md:h-24" /></div>
                    <div className="flex-1 space-y-4 md:space-y-6 font-black uppercase">
                        <h2 className="text-4xl md:text-7xl font-black text-slate-950 uppercase tracking-tighter leading-none">{user?.name}</h2>
                        <p className="text-slate-400 font-bold uppercase text-[9px] md:text-[11px] tracking-[0.4em] flex items-center justify-center md:justify-start gap-3"><MapPin className="text-rose-500 w-4 h-4 md:w-5 md:h-5" /> {user?.city} Division</p>
                        
                        {/* SOCIAL STATS */}
                        <div className="flex justify-center md:justify-start gap-8 border-t border-b border-slate-100 py-6 my-4">
                            <div className="text-center md:text-left">
                                <p className="text-3xl font-black text-slate-900">{followersCount}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Followers</p>
                            </div>
                            <div className="text-center md:text-left">
                                <p className="text-3xl font-black text-slate-900">{following.length}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Following</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-center md:justify-start gap-4 md:gap-6 pt-4 w-full">
                            <div className="bg-slate-950 text-white px-8 md:px-12 py-4 md:py-6 rounded-3xl flex items-center justify-center gap-3 md:gap-5 shadow-2xl w-full md:w-auto">
                                <Zap className="text-amber-400 w-6 h-6 md:w-8 md:h-8 fill-amber-400" />
                                <span className="text-lg md:text-xl tracking-widest">{karma} Impact Pts</span>
                            </div>
                            <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="p-4 md:p-6 bg-rose-50 text-rose-600 rounded-3xl border border-rose-100 hover:bg-rose-100 transition-colors shadow-sm w-full md:w-auto flex justify-center active:scale-95"><LogOut className="w-6 h-6 md:w-8 md:h-8"/></button>
                        </div>
                    </div>
                </div>

                <div className="space-y-8 md:space-y-12 font-black uppercase">
                    <h3 className="text-3xl md:text-5xl font-black text-slate-950 tracking-tighter px-4 md:px-10 flex items-center gap-4 md:gap-6"><Crown className="text-amber-500 w-8 h-8 md:w-12 md:h-12"/> Regional Elite 🏆</h3>
                    <div className="space-y-4 md:space-y-6 px-0 md:px-10">
                        {LEADERBOARD.map((l, i) => (
                            <div key={i} className="bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border border-slate-200 flex items-center justify-between shadow-sm group hover:translate-x-4 transition-all">
                                <div className="flex items-center gap-4 md:gap-12">
                                    <div className="text-4xl md:text-6xl font-black text-slate-100 w-12 md:w-20">0{l.rank}</div>
                                    <div className="w-12 h-12 md:w-20 md:h-20 bg-slate-100 rounded-2xl md:rounded-3xl flex items-center justify-center text-slate-400 text-lg md:text-2xl shadow-inner">{l.avatar}</div>
                                    <h4 className="text-xl md:text-4xl text-slate-950 tracking-tighter">{l.name}</h4>
                                </div>
                                <p className="text-2xl md:text-5xl text-slate-950">{l.karma.toLocaleString()}</p>
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
        className={`fixed bottom-12 right-6 md:right-12 z-50 w-20 h-20 md:w-28 md:h-28 rounded-full md:rounded-[3.5rem] flex flex-col items-center justify-center text-white shadow-2xl transition-all ${sosLoading ? 'bg-slate-900 animate-spin' : 'bg-rose-600 hover:scale-110 active:scale-95 animate-breathe'}`}
      >
        <Siren className="w-8 h-8 md:w-12 md:h-12" />
        <span className="text-[8px] md:text-[10px] font-black tracking-widest mt-1 md:mt-2 uppercase">SOS</span>
      </button>

      {/* NEW: FULL SCREEN ARTICLE VIEW (BLOGGING STYLE) */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[200] bg-white overflow-y-auto animate-fade-in no-scrollbar">
          {/* Article Header Image */}
          <div className="relative h-72 md:h-[50vh] w-full">
            <img src={selectedArticle.image} className="w-full h-full object-cover" alt="hero" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent"></div>
            
            {/* Nav & Actions */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center text-white">
                <button onClick={() => setSelectedArticle(null)} className="p-3 bg-black/30 backdrop-blur-md rounded-full hover:bg-black/50 transition-all"><ChevronLeft className="w-6 h-6" /></button>
                <div className="flex gap-3">
                    <button onClick={handleShare} className="p-3 bg-black/30 backdrop-blur-md rounded-full hover:bg-black/50 transition-all"><Share className="w-5 h-5" /></button>
                    <button className="p-3 bg-black/30 backdrop-blur-md rounded-full hover:bg-black/50 transition-all"><Bookmark className="w-5 h-5" /></button>
                </div>
            </div>

            {/* Bottom Title Area */}
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white">
                <div className="max-w-4xl mx-auto">
                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4 inline-block shadow-lg">
                        {selectedArticle.category || "FIELD REPORT"}
                    </span>
                    <h1 className="text-3xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-4 shadow-black drop-shadow-lg">
                        {selectedArticle.headline || selectedArticle.name}
                    </h1>
                    <div className="flex items-center gap-4 text-xs md:text-sm font-bold uppercase tracking-widest text-slate-300">
                        <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {selectedArticle.date}</span>
                        <span>•</span>
                        <span>{selectedArticle.readTime || "3 MIN READ"}</span>
                        <span>•</span>
                        <span>{selectedArticle.location}</span>
                    </div>
                </div>
            </div>
          </div>

          {/* Article Body */}
          <div className="max-w-3xl mx-auto p-6 md:p-12 pb-32">
             {/* Author Bio & Follow */}
             <div className="flex items-center justify-between border-b border-slate-100 pb-8 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white font-black shadow-lg">
                        {selectedArticle.author?.avatar || "HQ"}
                    </div>
                    <div>
                        <p className="text-sm font-black uppercase text-slate-900">{selectedArticle.author?.name || "Command Center"}</p>
                        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{selectedArticle.author?.role || "System Admin"}</p>
                    </div>
                </div>
                <button 
                    onClick={() => handleFollow(selectedArticle.author?.name || "Command Center")}
                    className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${following.includes(selectedArticle.author?.name) ? 'bg-emerald-500 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}
                >
                    {following.includes(selectedArticle.author?.name) ? "Following" : "Follow Agent"}
                </button>
             </div>

             {/* Main Content */}
             <div className="prose prose-lg prose-slate max-w-none">
                <p className="text-xl font-bold text-slate-900 leading-relaxed mb-8 first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-3">
                    {selectedArticle.content || selectedArticle.bio || "No intelligence data provided for this file. Please contact the field agent directly for more information."}
                </p>
                
                {/* Simulated Extra Content for "Blog Feel" */}
                <h3 className="text-2xl font-black uppercase text-slate-900 mb-4 mt-12 tracking-tight">Tactical Assessment</h3>
                <p className="text-slate-600 leading-loose mb-6">
                    Initial scans indicate stability in the subject's vital signs. The recovery team deployed standard containment protocols (SCP-Alpha) to ensure minimal stress during transport. Local weather conditions were optimal for the extraction.
                </p>
                <div className="bg-slate-50 border-l-4 border-emerald-500 p-6 my-8 italic text-slate-700 font-medium">
                    "Speed and precision are the cornerstones of this unit. We secured the target 14 minutes after the distress signal was broadcast."
                </div>
                <p className="text-slate-600 leading-loose">
                    Post-rescue, the subject has been transferred to the nearest holding facility for a full medical workup (Bio-Scan ID pending). We advise all nearby units to remain vigilant for similar cases in the Sector 4 grid.
                </p>
             </div>

             {/* COMMENTS SECTION */}
             <div className="mt-16 pt-8 border-t border-slate-200">
                <h4 className="text-xl font-black uppercase text-slate-900 mb-6 flex items-center gap-2"><MessageCircle className="w-5 h-5"/> Intel Chatter ({selectedArticle.comments?.length || 0})</h4>
                
                <div className="space-y-6 mb-8">
                    {selectedArticle.comments && selectedArticle.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-xs font-black text-slate-400">{comment.avatar}</div>
                            <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none flex-1">
                                <p className="text-[10px] font-black uppercase text-slate-900 mb-1">{comment.author} <span className="text-slate-400 opacity-50 ml-2">{comment.time}</span></p>
                                <p className="text-sm font-medium text-slate-600">{comment.text}</p>
                            </div>
                        </div>
                    ))}
                    {(!selectedArticle.comments || selectedArticle.comments.length === 0) && (
                        <p className="text-slate-400 italic text-sm">No intel reports filed yet. Be the first to update.</p>
                    )}
                </div>

                <div className="flex gap-3">
                    <input 
                        value={commentInput} 
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Add tactical update..." 
                        className="flex-1 bg-slate-100 p-4 rounded-2xl outline-none font-medium text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                    <button onClick={handleComment} className="bg-slate-900 text-white p-4 rounded-2xl hover:scale-105 transition-transform"><Send className="w-5 h-5" /></button>
                </div>
             </div>

             {/* Footer Actions */}
             <div className="mt-16 pt-8 border-t border-slate-200">
                <h4 className="text-xl font-black uppercase text-slate-900 mb-6">Mission Actions</h4>
                <div className="flex flex-col md:flex-row gap-4">
                    <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2">
                        <HandHeart className="w-4 h-4" /> Volunteer for this Case
                    </button>
                    <button className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all shadow-xl flex items-center justify-center gap-2">
                        <Package className="w-4 h-4" /> Send Supplies
                    </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT INTEL (HORIZONTAL NEWS FORM) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 animate-fade-in text-slate-950 font-black uppercase">
          <div className="bg-white w-full max-w-3xl rounded-[3rem] md:rounded-[5rem] p-6 md:p-16 shadow-2xl animate-slide-up relative max-h-[90vh] overflow-y-auto no-scrollbar border-[8px] md:border-[16px] border-white">
            <div className="flex justify-between items-center mb-6 md:mb-12">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">File Report 📂</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-3 md:p-4 hover:bg-slate-100 rounded-3xl transition-colors"><X className="w-6 h-6 md:w-8 md:h-8" /></button>
            </div>
            
            <div className="space-y-8 md:space-y-12">
              <div className="h-48 md:h-80 bg-slate-950 border-4 md:border-8 border-dashed border-slate-800 rounded-[2.5rem] md:rounded-[4rem] flex flex-col items-center justify-center relative hover:bg-emerald-500/5 transition-all overflow-hidden group">
                {postForm.image ? (
                  <img src={postForm.image} className="w-full h-full object-cover" alt="preview" />
                ) : (
                  <>
                    <ImageIcon className="text-emerald-500/20 w-16 h-16 md:w-24 md:h-24 group-hover:scale-110 transition-transform" />
                    <p className="text-[9px] md:text-[12px] font-black uppercase text-emerald-500/40 mt-4 md:mt-6 tracking-[0.5em]">Capture Visual Metadata 📸</p>
                  </>
                )}
                <input type="file" onChange={async (e) => {
                    const b64 = await convertToBase64(e.target.files[0]);
                    setPostForm({...postForm, image: b64});
                }} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>

              <div className="flex gap-4 md:gap-6 p-2 bg-slate-100 rounded-[2rem] md:rounded-[3rem]">
                  <button onClick={() => setPostForm({...postForm, type: 'news'})} className={`flex-1 py-4 md:py-6 rounded-[2rem] md:rounded-[2.5rem] text-[9px] md:text-[12px] tracking-widest transition-all ${postForm.type === 'news' ? 'bg-emerald-500 text-white shadow-xl' : 'text-slate-400 hover:text-slate-950'}`}>Mission News 📢</button>
                  <button onClick={() => setPostForm({...postForm, type: 'adoption'})} className={`flex-1 py-4 md:py-6 rounded-[2rem] md:rounded-[2.5rem] text-[9px] md:text-[12px] tracking-widest transition-all ${postForm.type === 'adoption' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400 hover:text-slate-950'}`}>Adoption Task 🐶</button>
              </div>

              <div className="space-y-6 md:space-y-8 text-left">
                <div className="space-y-2">
                    <label className="text-[9px] md:text-[11px] tracking-widest ml-4 md:ml-6 text-slate-400 uppercase">📄 🐕 Intelligence Title</label>
                    <input value={postForm.title} onChange={(e) => setPostForm({...postForm, title: e.target.value})} placeholder="Title / Headline" className="w-full p-6 md:p-8 bg-slate-950 text-emerald-400 border-4 border-slate-800 rounded-[2.5rem] md:rounded-[3rem] outline-none shadow-sm placeholder:text-slate-700 text-sm md:text-base" />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] md:text-[11px] tracking-widest ml-4 md:ml-6 text-slate-400 uppercase">📝 Documentation</label>
                    <textarea value={postForm.desc} onChange={(e) => setPostForm({...postForm, desc: e.target.value})} rows="5" placeholder="Operational details / Bio summary..." className="w-full p-6 md:p-8 bg-slate-950 text-emerald-400 border-4 border-slate-800 rounded-[2.5rem] md:rounded-[3rem] outline-none shadow-sm placeholder:text-slate-700 font-bold text-sm md:text-base" />
                </div>
              </div>

              <button onClick={handlePostSubmit} className="w-full py-8 md:py-10 bg-slate-950 text-white rounded-[3rem] md:rounded-[3.5rem] tracking-[0.6em] text-[10px] md:text-[12px] hover:bg-black transition-all active:scale-95 shadow-2xl border-4 border-emerald-500/20">Transmit Intel 📡</button>
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
                setResult({ breed: "Indian Pariah (Indie) 🐕", condition: "Healthy ✅", advice: "Subject stable. No clinical intervention required.", pts: 50 });
                onScanComplete(50);
            }, 3000);
        }
    };

    return (
        <div className="space-y-8 md:space-y-12 animate-fade-in text-center font-black uppercase">
            {!image ? (
                <div className="h-[400px] md:h-[550px] border-[8px] md:border-[14px] border-dashed border-slate-950 rounded-[4rem] md:rounded-[7rem] flex flex-col items-center justify-center relative hover:bg-emerald-50 transition-all cursor-pointer shadow-inner group bg-white mx-4 md:mx-0">
                    <ImageIcon className="w-16 h-16 md:w-24 md:h-24 text-slate-950 mb-6 md:mb-8 group-hover:scale-110 transition-transform animate-float" />
                    <p className="text-[12px] md:text-[16px] tracking-[0.6em] text-slate-950">Initialize Bio-Scan 🧬</p>
                    <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
            ) : (
                <div className="space-y-8 md:space-y-12 px-4 md:px-0">
                    <div className="h-[400px] md:h-[550px] rounded-[4rem] md:rounded-[7rem] overflow-hidden relative shadow-2xl border-[8px] md:border-[16px] border-white bg-slate-950">
                        <img src={image} className="w-full h-full object-cover" alt="target" />
                        {analyzing && <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl flex flex-col items-center justify-center text-emerald-500"><RefreshCw className="w-16 h-16 md:w-24 md:h-24 animate-spin mb-8 md:mb-12" /><p className="text-lg md:text-xl tracking-[0.8em] animate-pulse">Analyzing Bio-Intel...</p></div>}
                    </div>
                    {result && <div className="bg-slate-950 p-10 md:p-20 rounded-[3rem] md:rounded-[7rem] text-white text-left animate-slide-up border-[8px] md:border-[12px] border-white/5 shadow-2xl"><h4 className="text-4xl md:text-7xl leading-none mb-4 md:mb-6 tracking-tighter">{result.breed}</h4><p className="text-emerald-400 text-xl md:text-3xl tracking-tighter uppercase font-black">Status: {result.condition}</p><button onClick={() => { setImage(null); setResult(null); }} className="w-full mt-8 md:mt-10 py-8 md:py-10 bg-emerald-500 rounded-[2.5rem] md:rounded-[3.5rem] tracking-[0.4em] shadow-xl hover:bg-emerald-400 active:scale-95 transition-all text-xs md:text-base">Complete scan ✅</button></div>}
                </div>
            )}
        </div>
    );
};
