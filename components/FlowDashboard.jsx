'use client';
import { useState, useRef, useEffect } from "react";
import { contacts as contactsApi, conversations as convsApi, tasks as tasksApi, events as eventsApi, notifications as notifsApi, channels as channelsApi, org as orgApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

const C = {
  navy: "#0d1f3c", navyMid: "#1a3254", blue: "#1e5fa8", blueLight: "#3a8fe8",
  cyan: "#4ab8f5", cream: "#f5f0e8", rust: "#c0614a", gold: "#b89440",
  slate: "#4a6070", white: "#ffffff", green: "#22c55e", red: "#ef4444", orange: "#f97316",
};

const LEAD_STATUSES = ["חדש", "בטיפול", "נשלח הצעת מחיר", "לקוח עתידי", "לא רלוונטי"];
const CUSTOMER_STATUSES = ["נשלח הצעת מחיר", "הזמנה פעילה", "מוכן למסירה", "ממתין לתשלום", "סגור"];
const TASK_PRIORITIES = ["גבוהה", "בינונית", "נמוכה"];
const TASK_STATUSES = ["פתוח", "בטיפול", "הושלם"];

const mockTasks = [
  { id: 1, title: "לשלוח הצעת מחיר לדניאל", contact: "דניאל כהן", priority: "גבוהה", status: "פתוח", due: "היום", fromMsg: "שלום, אני מעוניין לשמוע על השירות שלכם", channel: "whatsapp", assignedTo: ["main"], subtasks: [], description: "" },
  { id: 2, title: "לחזור למיכל לגבי מסמכים", contact: "מיכל לוי", priority: "בינונית", status: "בטיפול", due: "מחר", fromMsg: "קיבלתם את המסמכים ששלחתי?", channel: "email", assignedTo: ["u2"], subtasks: [], description: "" },
  { id: 3, title: "לקבוע פגישה עם יוסי", contact: "יוסי מזרחי", priority: "בינונית", status: "פתוח", due: "27/04", fromMsg: "מתי נוכל לקבוע פגישה?", channel: "instagram", assignedTo: ["u3"], subtasks: [], description: "" },
  { id: 4, title: "פולואפ אחרי סגירה", contact: "שירה אברהם", priority: "נמוכה", status: "הושלם", due: "אתמול", fromMsg: "תודה רבה על השירות המעולה!", channel: "facebook", assignedTo: ["main","u2"], subtasks: [], description: "" },
];

const mockLeads = [
  { id: 1, name: "דניאל כהן", business: "סוכנות ביטוח", status: "חדש", value: "₪4,500", time: "לפני 10 דק'", avatar: "ד", color: "#3a8fe8", channel: "whatsapp" },
  { id: 2, name: "מיכל לוי", business: "קליניקה פרטית", status: "בטיפול", value: "₪2,800", time: "לפני 1 שעה", avatar: "מ", color: "#c0614a", channel: "email" },
  { id: 3, name: "יוסי מזרחי", business: "נדל\"ן", status: "לקוח", subStatus: "הזמנה פעילה", value: "₪8,200", time: "לפני 3 שעות", avatar: "י", color: "#b89440", channel: "instagram" },
  { id: 4, name: "שירה אברהם", business: "מכון כושר", status: "לקוח", subStatus: "סגור", value: "₪1,900", time: "אתמול", avatar: "ש", color: "#7c5cbf", channel: "facebook" },
  { id: 5, name: "רון גולדברג", business: "עורך דין", status: "חדש", value: "₪6,100", time: "לפני 5 דק'", avatar: "ר", color: "#22c55e", channel: "whatsapp" },
  { id: 6, name: "תמר ביטון", business: "סלון יופי", status: "לא רלוונטי", value: "₪0", time: "לפני יומיים", avatar: "ת", color: "#4a6070", channel: "instagram" },
];

const mockTeam = [
  { id: "main", name: "נירו", role: "ראשי", avatar: "נ", color: "#1e5fa8" },
  { id: "u2", name: "שרה", role: "נציגה", avatar: "ש", color: "#c0614a" },
  { id: "u3", name: "דוד", role: "נציג", avatar: "ד", color: "#22c55e" },
];

const mockMessages = [
  { id: 1, from: "דניאל כהן", text: "שלום, אני מעוניין לשמוע על השירות שלכם", time: "10:32", channel: "whatsapp", unread: 2, avatar: "ד", color: "#3a8fe8", type: "ליד", subStatus: "חדש", assignedTo: "main" },
  { id: 2, from: "מיכל לוי", text: "קיבלתם את המסמכים ששלחתי?", time: "09:15", channel: "email", unread: 0, avatar: "מ", color: "#c0614a", type: "ליד", subStatus: "בטיפול", assignedTo: "u2" },
  { id: 3, from: "יוסי מזרחי", text: "מתי נוכל לקבוע פגישה?", time: "אתמול", channel: "instagram", unread: 1, avatar: "י", color: "#b89440", type: "לקוח", subStatus: "הזמנה פעילה", assignedTo: "u3" },
  { id: 4, from: "שירה אברהם", text: "תודה רבה על השירות המעולה!", time: "אתמול", channel: "facebook", unread: 0, avatar: "ש", color: "#7c5cbf", type: "לקוח", subStatus: "סגור", assignedTo: "main" },
];

const mockEvents = [
  { id: 1, title: "פגישה עם משה", time: "12:00", duration: "30 דק'", color: "#1e5fa8", contact: "משה לוי" },
  { id: 2, title: "שיחת אפיון – Flow", time: "14:30", duration: "45 דק'", color: "#22c55e", contact: "" },
  { id: 3, title: "פולואפ – דניאל כהן", time: "17:00", duration: "15 דק'", color: "#b89440", contact: "דניאל כהן" },
];

const TimeList = ({ selected, onSelect, listRef }) => {
  const times = Array.from({ length: 96 }, (_, i) => {
    const h = Math.floor(i / 4).toString().padStart(2, "0");
    const m = ((i % 4) * 15).toString().padStart(2, "0");
    return h + ":" + m;
  });
  return (
    <div ref={listRef} style={{ height: 72, overflowY: "auto", border: "1.5px solid rgba(0,0,0,0.1)", borderRadius: 8, background: "#fff" }}>
      {times.map(val => (
        <div key={val} onClick={() => onSelect(val)}
          style={{ padding: "7px 16px", fontSize: 13, cursor: "pointer", fontWeight: selected === val ? 700 : 400, color: selected === val ? "#fff" : "#0d1f3c", background: selected === val ? "#0d1f3c" : "transparent" }}>
          {val}
        </div>
      ))}
    </div>
  );
};

const ChannelIcon = ({ channel, size = 14 }) => {
  const icons = { whatsapp: { bg: "#25D366", label: "W" }, email: { bg: "#3a8fe8", label: "✉" }, instagram: { bg: "#E1306C", label: "IG" }, facebook: { bg: "#1877F2", label: "f" } };
  const ch = icons[channel] || icons.whatsapp;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size + 6, height: size + 6, borderRadius: "50%", background: ch.bg, color: "#fff", fontSize: size - 4, fontWeight: 700, flexShrink: 0 }}>
      {ch.label}
    </span>
  );
};

const TypeBadge = ({ type }) => (
  <span style={{ background: type === "לקוח" ? "#0d1f3c" : "#e8f0fe", color: type === "לקוח" ? "#fff" : "#1e5fa8", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
    {type}
  </span>
);

const SubBadge = ({ type, sub }) => {
  const lm = { "חדש": ["#dcfce7","#16a34a"], "בטיפול": ["#dbeafe","#1e5fa8"], "נשלח הצעת מחיר": ["#fef9c3","#ca8a04"], "לקוח עתידי": ["#f3e8ff","#7c3aed"], "לא רלוונטי": ["#fee2e2","#dc2626"] };
  const cm = { "נשלח הצעת מחיר": ["#fef9c3","#ca8a04"], "הזמנה פעילה": ["#dbeafe","#1e5fa8"], "מוכן למסירה": ["#dcfce7","#16a34a"], "ממתין לתשלום": ["#fee2e2","#dc2626"], "סגור": ["#f3f4f6","#4a6070"] };
  const map = type === "לקוח" ? cm : lm;
  const [bg, color] = map[sub] || ["#f3f4f6","#4a6070"];
  return (
    <span style={{ background: bg, color, fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
      {sub || (type === "לקוח" ? "הזמנה פעילה" : "חדש")}
    </span>
  );
};

const Av = ({ letter, color, size = 38 }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.37, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
    {letter}
  </div>
);

const BarChart = ({ data, color }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: "100%", borderRadius: "4px 4px 0 0", background: i === data.length - 1 ? color : color + "55", height: (d.value / max) * 70 + "px" }} />
          <div style={{ fontSize: 9, color: "#4a6070" }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
};

const DonutChart = ({ segments }) => {
  let cum = 0;
  const total = segments.reduce((s, g) => s + g.value, 0);
  const r = 40, circ = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 100 100" style={{ width: 100, height: 100 }}>
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const offset = circ * (1 - cum);
        const dash = circ * pct;
        cum += pct;
        return <circle key={i} cx={50} cy={50} r={r} fill="none" stroke={seg.color} strokeWidth={16} strokeDasharray={dash + " " + (circ - dash)} strokeDashoffset={offset} style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }} />;
      })}
      <text x="50" y="54" textAnchor="middle" fontSize="14" fontWeight="900" fill="#0d1f3c">{total}</text>
    </svg>
  );
};

// ── DATE PICKER ──
const DatePicker = ({ value, onChange, placeholder = "בחר תאריך" }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const [viewDate, setViewDate] = React.useState(() => {
    if (value && value !== "ללא תאריך") {
      const parts = value.split("/");
      if (parts.length === 3) return new Date(parts[2], parts[1]-1, parts[0]);
    }
    return new Date();
  });

  const HEB_MONTHS = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
  const HEB_DAYS = ["א","ב","ג","ד","ה","ו","ש"];

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const isSelected = (d) => {
    if (!value || value === "ללא תאריך") return false;
    const parts = value.split("/");
    return parts.length === 3 && parseInt(parts[0]) === d && parseInt(parts[1]) === month+1 && parseInt(parts[2]) === year;
  };
  const isToday = (d) => today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;

  const selectDay = (d) => {
    const dd = String(d).padStart(2,"0");
    const mm = String(month+1).padStart(2,"0");
    onChange(`${dd}/${mm}/${year}`);
    setOpen(false);
  };

  const displayValue = () => {
    if (!value || value === "ללא תאריך") return null;
    // convert dd/mm/yyyy to היום/מחר labels if applicable
    const parts = value.split("/");
    if (parts.length === 3) {
      const d = new Date(parts[2], parts[1]-1, parts[0]);
      const diff = Math.round((d - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000);
      if (diff === 0) return "היום";
      if (diff === 1) return "מחר";
      if (diff === -1) return "אתמול";
      return value;
    }
    return value;
  };

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", direction: "rtl" }} onClick={e => e.stopPropagation()}>
      <div onClick={() => setOpen(!open)}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 20, border: "1px solid rgba(0,0,0,0.1)", fontSize: 12, fontWeight: 600, cursor: "pointer", background: value && value !== "ללא תאריך" ? "#eff6ff" : "#f8f9fb", color: value && value !== "ללא תאריך" ? "#1e5fa8" : "#9ca3af", userSelect: "none", minWidth: 100 }}>
        <span>📅</span>
        <span>{displayValue() || placeholder}</span>
        <span style={{ fontSize: 9, opacity: 0.5, marginRight: "auto" }}>▾</span>
      </div>

      {open && (
        <div onClick={e => e.stopPropagation()} style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 300, background: "#fff", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", border: "1px solid rgba(0,0,0,0.08)", padding: 14, width: 280, direction: "rtl" }}>
          {/* ללא תאריך */}
          <div onClick={() => { onChange("ללא תאריך"); setOpen(false); }}
            style={{ textAlign: "center", padding: "6px", marginBottom: 10, borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", color: !value || value === "ללא תאריך" ? "#fff" : "#4a6070", background: !value || value === "ללא תאריך" ? "#64748b" : "#f0ede8" }}>
            ללא תאריך
          </div>
          {/* Month nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <button onClick={() => setViewDate(new Date(year, month-1, 1))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#4a6070", padding: "0 6px" }}>‹</button>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#0d1f3c" }}>{HEB_MONTHS[month]} {year}</span>
            <button onClick={() => setViewDate(new Date(year, month+1, 1))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#4a6070", padding: "0 6px" }}>›</button>
          </div>
          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
            {HEB_DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "#9ca3af", padding: "2px 0" }}>{d}</div>)}
          </div>
          {/* Days grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={"e"+i} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const sel = isSelected(d);
              const tod = isToday(d);
              return (
                <div key={d} onClick={() => selectDay(d)}
                  style={{ textAlign: "center", padding: "6px 2px", borderRadius: 8, fontSize: 12, fontWeight: sel || tod ? 800 : 400, cursor: "pointer", background: sel ? "#1e5fa8" : tod ? "#eff6ff" : "transparent", color: sel ? "#fff" : tod ? "#1e5fa8" : "#0d1f3c", transition: "all 0.1s" }}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.background = "#f0ede8"; }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.background = tod ? "#eff6ff" : "transparent"; }}>
                  {d}
                </div>
              );
            })}
          </div>
          {/* Shortcuts */}
          <div style={{ display: "flex", gap: 4, marginTop: 10, borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 10 }}>
            {[
              { label: "היום", d: 0 },
              { label: "מחר", d: 1 },
              { label: "שבוע", d: 7 },
            ].map(({ label, d }) => {
              const dt = new Date(today.getFullYear(), today.getMonth(), today.getDate() + d);
              const dd = String(dt.getDate()).padStart(2,"0");
              const mm = String(dt.getMonth()+1).padStart(2,"0");
              const val = `${dd}/${mm}/${dt.getFullYear()}`;
              return (
                <div key={label} onClick={() => { onChange(val); setOpen(false); }}
                  style={{ flex: 1, textAlign: "center", padding: "5px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "#f0ede8", color: "#4a6070" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#0d1f3c" }
                  onMouseLeave={e => e.currentTarget.style.background = "#f0ede8" }
                  >{label}</div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default function FlowDashboard() {
  const mob = () => window.innerWidth < 640;

  const tabs = [
    { id: "inbox", label: "Inbox", icon: "💬", badge: 3 },
    { id: "tasks", label: "משימות", icon: "✅", badge: 3 },
    { id: "funnel", label: "לידים", icon: "👥", badge: null },
    { id: "calendar", label: "יומן", icon: "📅", badge: null },
    { id: "payments", label: "תשלומים", icon: "💳", badge: null },
    { id: "ai", label: "מזכירה AI", icon: "🤖", badge: null },
    { id: "stats", label: "סטטיסטיקות", icon: "📈", badge: null },
    { id: "settings", label: "הגדרות", icon: "⚙️", badge: null },
  ];

  const { user: authUser, logout } = useAuth();
  const router = useRouter();

  const [currentUser] = useState("main"); // "main" = חשבון ראשי
  const [team, setTeam] = useState([]);
  const [assignFilter, setAssignFilter] = useState("הכל"); // "הכל" / "שלי"
  const [unreadFilter, setUnreadFilter] = useState(false);
  const [showAssignDrop, setShowAssignDrop] = useState(false);
  const [showCustomerPanel, setShowCustomerPanel] = useState(false);
  const [panelMinimized, setPanelMinimized] = useState(false);
  const [taskView, setTaskView] = useState("kanban");
  const [taskSort, setTaskSort] = useState("due");
  const [taskSearch, setTaskSearch] = useState("");
  const [taskPrioFilter, setTaskPrioFilter] = useState("הכל");
  const [taskTeamFilter, setTaskTeamFilter] = useState("הכל");
  const [editingTask, setEditingTask] = useState(null);
  const [editDraft, setEditDraft] = useState({});
  const [openTaskPanel, setOpenTaskPanel] = useState(null); // task id
  const [taskPanelComment, setTaskPanelComment] = useState("");
  const [taskComments, setTaskComments] = useState({}); // { [taskId]: [{id,text,time,author}] }
  const [cpNewTask, setCpNewTask] = useState("");
  const [cpNewNote, setCpNewNote] = useState("");
  const [cpEditTask, setCpEditTask] = useState(null);
  const [cpEditNote, setCpEditNote] = useState(null);
  const [cpNotes, setCpNotes] = useState({});  // { [contactName]: [{id,text,time}] }
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotifs, setReadNotifs] = useState(new Set());

  const [activeTab, setActiveTab] = useState("inbox");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [messages, setMessages] = useState([]);
  const [activeMessage, setActiveMessage] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", contact: "", priority: "בינונית", due: "", notes: "", fromMsg: "", channel: "" });
  const [taskFilter, setTaskFilter] = useState("הכל");
  const [msgContextMenu, setMsgContextMenu] = useState(null); // { msgText, contact, channel, x, y, fromMe }
  const [taskSidePanel, setTaskSidePanel] = useState(null); // { msgText, contact, channel } — פאנל צד
  const [aiSuggestLoading, setAiSuggestLoading] = useState(false);
  const [aiSuggestText, setAiSuggestText] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [openMsgDrop, setOpenMsgDrop] = useState(null);
  const [openChatDrop, setOpenChatDrop] = useState(null);
  const [chFilter, setChFilter] = useState("הכל");
  const [typeFilter, setTypeFilter] = useState("הכל");
  const [statFilter, setStatFilter] = useState("הכל");
  const [showInboxFilter, setShowInboxFilter] = useState(false);
  const [leads, setLeads] = useState([]);
  const [openLeadDrop, setOpenLeadDrop] = useState(null);
  const [hoveredLead, setHoveredLead] = useState(null);
  const [events, setEvents] = useState([]);
  const [showMeeting, setShowMeeting] = useState(false);
  const [meetForm, setMeetForm] = useState({ title: "", date: "", time: "", duration: "30 דק'", notes: "", contact: "" });
  const [editEvent, setEditEvent] = useState(null);
  const [viewEvent, setViewEvent] = useState(null);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [calTab, setCalTab] = useState("today"); // today | future
  const [meetSaved, setMeetSaved] = useState(false);
  const [payModal, setPayModal] = useState(null);
  const [payForm, setPayForm] = useState({ clientName: "", amount: "", description: "", dueDate: "" });
  const [paySent, setPaySent] = useState(false);
  const [payHistory, setPayHistory] = useState([
    { id:1, type:"request", client:"דניאל כהן", amount:4500, date:"27/03/2026", status:"שולם" },
    { id:2, type:"quote", client:"מיכל לוי", amount:2800, date:"25/03/2026", status:"פתוח" },
    { id:3, type:"request", client:"יוסי מזרחי", amount:8200, date:"24/03/2026", status:"ממתין" },
    { id:4, type:"quote", client:"שירה אברהם", amount:1900, date:"15/02/2026", status:"סגור" },
    { id:5, type:"request", client:"רון גולדברג", amount:6100, date:"10/02/2026", status:"שולם" },
    { id:6, type:"quote", client:"תמר ביטון", amount:3200, date:"05/02/2026", status:"פתוח" },
    { id:7, type:"request", client:"דניאל כהן", amount:2200, date:"20/01/2026", status:"שולם" },
    { id:8, type:"quote", client:"מיכל לוי", amount:5500, date:"12/01/2026", status:"פתוח" },
  ]);
  const [payMonthFilter, setPayMonthFilter] = useState("הכל");
  const [payStatusFilter, setPayStatusFilter] = useState("הכל");
  const [payDocModal, setPayDocModal] = useState(null);
  const [aiInput, setAiInput] = useState("");
  const [aiChat, setAiChat] = useState([{ role: "assistant", text: "שלום! אני כאן לעזור. מה תרצה שאעשה?" }]);
  const [aiLoading, setAiLoading] = useState(false);
  const [businessAddress, setBusinessAddress] = useState("רחוב הרצל 1, תל אביב");
  const [chatMessages, setChatMessages] = useState({});
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState({ whatsapp: false, instagram: false, facebook: false, gmail: false });
  const [connecting, setConnecting] = useState(null);
  const [waModal, setWaModal] = useState({ open: false, step: 'disclaimer', qr: null, error: null, channelId: null });
  const waPollerRef = useRef(null);
  const [profile, setProfile] = useState({ name: "נירו", business: "Flow", email: "niro@flowapp.co.il", phone: "050-0000000" });
  const [profileSaved, setProfileSaved] = useState(false);
  const [contactInfoMap, setContactInfoMap] = useState({}); // { [msgId]: { phone, email, notes } }
  const [editingContact, setEditingContact] = useState(false);
  const [blockedToast, setBlockedToast] = useState(false);

  // ─── Data fetching from real API ─────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [convsData, tasksData, eventsData, notifsData, leadsData] = await Promise.allSettled([
          convsApi.list({}),
          tasksApi.list({ limit: 100 }),
          eventsApi.list({ limit: 50 }),
          notifsApi.list(),
          contactsApi.list({ limit: 100 }),
        ]);

        if (convsData.status === 'fulfilled' && convsData.value.conversations) {
          const mapped = convsData.value.conversations.map(c => ({
            id: c.id,
            from: c.contact?.name || c.contact?.full_name || 'לא ידוע',
            text: c.last_message || '',
            time: c.updated_at ? new Date(c.updated_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : '',
            channel: c.channel || 'whatsapp',
            unread: c.unread_count || 0,
            avatar: (c.contact?.name || c.contact?.full_name || 'X')[0],
            color: '#3a8fe8',
            type: c.contact?.type === 'customer' ? 'לקוח' : 'ליד',
            subStatus: c.contact?.status || '',
            assignedTo: c.assigned_to || 'main',
          }));
          setMessages(mapped);
          setActiveMessage(mapped[0] || null);
        }

        if (tasksData.status === 'fulfilled' && tasksData.value.tasks) {
          const priorityMap = { high: 'גבוהה', medium: 'בינונית', low: 'נמוכה' };
          const statusMap = { pending: 'פתוח', in_progress: 'בטיפול', done: 'הושלם' };
          const mapped = tasksData.value.tasks.map(t => ({
            id: t.id,
            title: t.title,
            contact: t.contact?.name || t.contact?.full_name || '',
            priority: priorityMap[t.priority] || 'בינונית',
            status: statusMap[t.status] || 'פתוח',
            due: t.due_date ? new Date(t.due_date).toLocaleDateString('he-IL') : '',
            fromMsg: '',
            channel: 'whatsapp',
            assignedTo: [t.assigned_to || 'main'],
            subtasks: [],
            description: t.description || '',
          }));
          setTasks(mapped);
        }

        if (eventsData.status === 'fulfilled' && eventsData.value.events) {
          const mapped = eventsData.value.events.map(e => ({
            id: e.id,
            title: e.title,
            time: e.start_time ? new Date(e.start_time).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : '',
            duration: '30 דק\'',
            color: '#1e5fa8',
            contact: e.contact?.name || e.contact?.full_name || '',
          }));
          setEvents(mapped);
        }

        if (notifsData.status === 'fulfilled' && notifsData.value.notifications) {
          const mapped = notifsData.value.notifications.map(n => ({
            id: n.id,
            text: n.body || n.title,
            time: n.created_at ? new Date(n.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : '',
            read: n.is_read,
          }));
          setNotifications(mapped);
        }

        if (leadsData.status === 'fulfilled' && leadsData.value.contacts) {
          const statusColors = { lead: '#3a8fe8', customer: '#22c55e', inactive: '#4a6070' };
          const mapped = leadsData.value.contacts.map(c => ({
            id: c.id,
            name: c.name || c.full_name,
            business: c.business_name || '',
            status: c.type === 'customer' ? 'לקוח' : 'ליד',
            subStatus: c.status || '',
            value: c.deal_value ? `₪${c.deal_value.toLocaleString()}` : '',
            time: c.created_at ? new Date(c.created_at).toLocaleDateString('he-IL') : '',
            avatar: (c.name || c.full_name || 'X')[0],
            color: statusColors[c.type] || '#3a8fe8',
            channel: c.source_channel || 'whatsapp',
          }));
          setLeads(mapped);
        }
      } catch (err) {
        console.error('Data load error:', err);
      }
    };
    load();

    // Load WhatsApp connection status
    channelsApi.whatsappStatus().then(data => {
      if (data?.status === 'connected') {
        setConnected(p => ({ ...p, whatsapp: true }));
        if (data?.channel_id) setWaModal(p => ({ ...p, channelId: data.channel_id }));
      }
    }).catch(() => {});

    // Load real team members
    orgApi.team().then(data => {
      if (data?.team?.length) {
        const roleLabels = { main: 'ראשי', manager: 'מנהל', agent: 'נציג' };
        const colors = ['#1e5fa8', '#c0614a', '#22c55e', '#b89440', '#7c5cbf', '#3a8fe8'];
        const mapped = data.team.map((u, i) => ({
          id: u.id,
          name: u.name || u.email,
          role: roleLabels[u.role] || u.role,
          avatar: (u.name || u.email || 'U')[0].toUpperCase(),
          color: colors[i % colors.length],
        }));
        setTeam(mapped);
      }
    }).catch(() => {});
  }, []);

  // חישוב התראות מ-state אמיתי – חייב להיות אחרי כל ה-state
  const computedNotifs = (() => {
    const notifs = [...notifications];
    const now = new Date();

    // פגישות שמתחילות בעוד 30 דקות
    events.forEach(ev => {
      if (!ev.time) return;
      const [h, m] = ev.time.split(":").map(Number);
      const evDate = new Date();
      evDate.setHours(h, m, 0, 0);
      const diff = (evDate - now) / 60000;
      if (diff > 0 && diff <= 30) {
        notifs.push({ id: `ev-${ev.id}`, icon: "📅", text: `הפגישה "${ev.title}" מתחילה בעוד ${Math.round(diff)} דקות`, time: ev.time, type: "meeting" });
      }
    });

    // משימות שהוקצו אליי
    tasks.filter(t => t.assignedTo?.includes(currentUser) && t.status !== "הושלם").forEach(t => {
      notifs.push({ id: `task-assign-${t.id}`, icon: "✅", text: `משימה הוקצתה אליך: "${t.title}"`, time: t.due || "", type: "task" });
    });

    // משימות שמתקרבות לדדליין
    tasks.filter(t => t.status !== "הושלם" && (t.due === "היום" || t.due === "מחר")).forEach(t => {
      notifs.push({ id: `task-due-${t.id}`, icon: "⏰", text: `המשימה "${t.title}" מתקרבת לדדליין – ${t.due}`, time: t.due, type: "deadline" });
    });

    // מסמכים פתוחים
    payHistory.filter(p => p.status === "פתוח" || p.status === "ממתין").forEach(p => {
      notifs.push({ id: `doc-${p.id}`, icon: "📋", text: `${p.type === "quote" ? "הצעת מחיר" : "בקשת תשלום"} פתוחה עבור ${p.client} – ₪${p.amount.toLocaleString()}`, time: p.date, type: "doc" });
    });

    return notifs;
  })();

  const unreadCount = computedNotifs.filter(n => !readNotifs.has(n.id)).length;

  const showBlockedToast = () => {
    setBlockedToast(true);
    setTimeout(() => setBlockedToast(false), 2500);
  };

  const saveProfile = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const hasOpenDocs = (clientName) =>
    payHistory.some(p => p.client === clientName && (p.status === "פתוח" || p.status === "ממתין"));

  // מחזיר סטטוס אוטומטי לפי מסמך פתוח
  const getAutoStatus = (clientName, msgType) => {
    const openDoc = payHistory.find(p => p.client === clientName && (p.status === "פתוח" || p.status === "ממתין"));
    if (!openDoc) return null;
    if (openDoc.type === "quote") return { type: "ליד", subStatus: "נשלח הצעת מחיר" };
    if (openDoc.type === "request") return { type: "לקוח", subStatus: "ממתין לתשלום" };
    return null;
  };

  const updateMsg = (id, type, sub) => {
    const msg = messages.find(m => m.id === id);
    if (msg && hasOpenDocs(msg.from)) return; // חסום – יש מסמכים פתוחים
    setMessages(p => p.map(m => m.id === id ? { ...m, type, subStatus: sub } : m));
    if (activeMessage?.id === id) setActiveMessage(p => ({ ...p, type, subStatus: sub }));
    setOpenMsgDrop(null);
    setOpenChatDrop(null);
  };

  const updateLead = (id, status, sub = null) => {
    setLeads(p => p.map(l => l.id === id ? { ...l, status, subStatus: status === "לקוח" ? sub : null } : l));
    setOpenLeadDrop(null);
  };

  const timeListRef = useRef(null);

  useEffect(() => {
    if (showMeeting) {
      setTimeout(() => {
        if (timeListRef.current) {
          const now = new Date();
          const roundedMins = Math.ceil((now.getHours() * 60 + now.getMinutes()) / 15) * 15;
          const index = Math.min(Math.floor(roundedMins / 15), 95);
          timeListRef.current.scrollTop = index * 40;
        }
      }, 50);
    }
  }, [showMeeting]);

  const openMeet = (pre = "") => {
    setMeetForm({ title: pre ? "פגישה עם " + pre : "", date: "", time: "", duration: "30 דק'", notes: "", locationType: "", locationValue: "", contact: pre || "" });
    setMeetSaved(false);
    setShowMeeting(true);
  };

  const saveMeet = () => {
    if (!meetForm.title || !meetForm.time) return;
    const colors = ["#1e5fa8","#22c55e","#b89440","#c0614a","#7c3aed"];
    const dateVal = meetForm.date && meetForm.date !== "ללא תאריך" ? meetForm.date : "";
    setEvents(p => [...p, { id: Date.now(), title: meetForm.title, time: meetForm.time, duration: meetForm.duration, color: colors[Math.floor(Math.random() * colors.length)], contact: meetForm.contact || "", date: dateVal }]);
    setMeetSaved(true);
  };

  const sendAI = async () => {
    if (!aiInput.trim()) return;
    const msg = { role: "user", text: aiInput };
    setAiChat(p => [...p, msg]);
    setAiInput("");
    setAiLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: "אתה מזכירה AI של Flow. ענה בעברית. היה תמציתי.", messages: [...aiChat.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text })), { role: "user", content: aiInput }] }),
      });
      const data = await res.json();
      setAiChat(p => [...p, { role: "assistant", text: data.content?.[0]?.text || "שגיאה." }]);
    } catch {
      setAiChat(p => [...p, { role: "assistant", text: "שגיאת חיבור." }]);
    }
    setAiLoading(false);
  };

  const doConnect = (ch) => {
    if (ch === 'whatsapp') {
      setWaModal({ open: true, step: 'disclaimer', qr: null, error: null, channelId: null });
      return;
    }
    // Other channels: placeholder
    setConnecting(ch);
    setTimeout(() => { setConnected(p => ({ ...p, [ch]: true })); setConnecting(null); }, 2000);
  };

  const startWaPolling = (channelId) => {
    if (waPollerRef.current) clearInterval(waPollerRef.current);
    waPollerRef.current = setInterval(async () => {
      try {
        const data = await channelsApi.whatsappStatus();
        if (data?.status === 'connected' || data?.session_status === 'ready') {
          clearInterval(waPollerRef.current);
          waPollerRef.current = null;
          setConnected(p => ({ ...p, whatsapp: true }));
          setWaModal({ open: false, step: 'disclaimer', qr: null, error: null, channelId: null });
        } else if (data?.qr) {
          setWaModal(p => ({ ...p, qr: data.qr }));
        }
      } catch {}
    }, 3000);
  };

  const acceptWaDisclaimer = async () => {
    setWaModal(p => ({ ...p, step: 'loading', error: null }));
    try {
      const data = await channelsApi.whatsappQr(true);
      if (data?.status === 'qr_pending' && data?.qr) {
        setWaModal(p => ({ ...p, step: 'qr', qr: data.qr, channelId: data.channel_id }));
        startWaPolling(data.channel_id);
      } else if (data?.status === 'already_connected') {
        setConnected(p => ({ ...p, whatsapp: true }));
        setWaModal({ open: false, step: 'disclaimer', qr: null, error: null, channelId: null });
      } else {
        // Initializing — poll for QR
        setWaModal(p => ({ ...p, step: 'qr', qr: null, channelId: data?.channel_id }));
        startWaPolling(data?.channel_id);
      }
    } catch (err) {
      setWaModal(p => ({ ...p, step: 'disclaimer', error: 'שגיאה בחיבור. נסה שוב.' }));
    }
  };

  const closeWaModal = () => {
    if (waPollerRef.current) { clearInterval(waPollerRef.current); waPollerRef.current = null; }
    setWaModal({ open: false, step: 'disclaimer', qr: null, error: null, channelId: null });
  };

  const assignTo = (msgId, userId) => {
    const user = team.find(u => u.id === userId);
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, assignedTo: userId } : m));
    if (activeMessage?.id === msgId) {
      setActiveMessage(prev => ({ ...prev, assignedTo: userId }));
    }
    if (userId !== currentUser && user) {
      setNotifications(prev => [...prev, { id: Date.now(), text: `שיחה חדשה שויכה ל${user.name}`, time: "עכשיו" }]);
    }
    setShowAssignDrop(false);
  };

  const handlePaySend = () => {
    if (!payForm.clientName || !payForm.amount) return;
    setPayHistory(prev => [{
      id: Date.now(),
      type: payModal,
      client: payForm.clientName,
      amount: parseInt(payForm.amount.replace(/[,₪]/g,"")) || 0,
      date: new Date().toLocaleDateString("he-IL", { day:"2-digit", month:"2-digit", year:"numeric" }).replace(/\./g,"/"),
      status: payModal === "quote" ? "פתוח" : "ממתין",
    }, ...prev]);
    setPaySent(true);
  };

  const isMyChat = (msg) => msg.assignedTo === currentUser;
  const isMain = currentUser === "main";

  // ── INBOX ──
  const renderInbox = () => {
    const chMap = { WA: "whatsapp", IG: "instagram", FB: "facebook", Email: "email" };
    const filtered = messages.filter(m => {
      if (chFilter !== "הכל" && m.channel !== chMap[chFilter]) return false;
      if (typeFilter !== "הכל" && (m.type || "ליד") !== typeFilter) return false;
      if (statFilter !== "הכל" && m.subStatus !== statFilter) return false;
      if (assignFilter === "שלי" && m.assignedTo !== currentUser) return false;
      if (unreadFilter && !(m.unread > 0)) return false;
      return true;
    });
    const statOpts = typeFilter === "לקוח" ? CUSTOMER_STATUSES : typeFilter === "ליד" ? LEAD_STATUSES : [];
    const hasFilter = chFilter !== "הכל" || typeFilter !== "הכל" || statFilter !== "הכל";

    return (
      <div style={{ display: "flex", gap: mob() ? 0 : 16, height: "calc(100vh - 130px)", margin: mob() ? "0 -24px" : 0 }} onClick={() => { setOpenMsgDrop(null); setOpenChatDrop(null); setShowInboxFilter(false); }}>
        {/* List */}
        <div style={{ width: mob() ? "100%" : 280, display: mob() && showChat ? "none" : "flex", flexDirection: "column", background: "#fff", borderRadius: mob() ? 0 : 16, overflow: "hidden", flexShrink: 0, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid rgba(0,0,0,0.06)", flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0d1f3c" }}>כל ההודעות</div>
              <div style={{ position: "relative" }}>
                <button onClick={e => { e.stopPropagation(); setShowInboxFilter(!showInboxFilter); }}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontFamily: "'Heebo',sans-serif", fontSize: 11, fontWeight: 700, background: hasFilter ? "#0d1f3c" : "#f0ede8", color: hasFilter ? "#fff" : "#0d1f3c" }}>
                  🔽 סינון
                  {hasFilter && <span style={{ background: "#c0614a", color: "#fff", borderRadius: "50%", width: 14, height: 14, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>{[chFilter!=="הכל",typeFilter!=="הכל",statFilter!=="הכל"].filter(Boolean).length}</span>}
                </button>
                {showInboxFilter && (
                  <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: "110%", left: 0, zIndex: 200, background: "#fff", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", border: "1px solid rgba(0,0,0,0.08)", minWidth: 220, padding: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#4a6070", marginBottom: 6 }}>פלטפורמה</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
                      {["הכל","WA","IG","FB","Email"].map(f => (
                        <span key={f} onClick={() => setChFilter(f)} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, cursor: "pointer", fontWeight: 600, background: chFilter===f ? "#0d1f3c" : "#f0ede8", color: chFilter===f ? "#fff" : "#0d1f3c" }}>{f}</span>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#4a6070", marginBottom: 6 }}>סוג</div>
                    <div style={{ display: "flex", gap: 4, marginBottom: statOpts.length ? 12 : 8 }}>
                      {["הכל","ליד","לקוח"].map(f => (
                        <span key={f} onClick={() => { setTypeFilter(f); setStatFilter("הכל"); }} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, cursor: "pointer", fontWeight: 600, background: typeFilter===f ? "#1e5fa8" : "#f0ede8", color: typeFilter===f ? "#fff" : "#0d1f3c" }}>{f}</span>
                      ))}
                    </div>
                    {statOpts.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#4a6070", marginBottom: 6 }}>סטטוס</div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                          {["הכל",...statOpts].map(s => (
                            <span key={s} onClick={() => setStatFilter(s)} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, cursor: "pointer", fontWeight: 600, background: statFilter===s ? "#b89440" : "#f0ede8", color: statFilter===s ? "#fff" : "#0d1f3c" }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <button onClick={() => { setChFilter("הכל"); setTypeFilter("הכל"); setStatFilter("הכל"); setShowInboxFilter(false); }} style={{ width: "100%", padding: "7px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)", background: "transparent", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif", color: "#4a6070" }}>נקה סינונים</button>
                  </div>
                )}
              </div>
            </div>
            {/* assign filter */}
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              {["הכל", "שלי"].map(f => (
                <div key={f} onClick={() => setAssignFilter(f)}
                  style={{ flex: 1, textAlign: "center", padding: "5px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer",
                    background: assignFilter === f ? "#0d1f3c" : "#f0ede8",
                    color: assignFilter === f ? "#fff" : "#4a6070" }}>
                  {f === "שלי" ? "👤 שלי" : "🌐 הכל"}
                </div>
              ))}
              <div onClick={() => setUnreadFilter(!unreadFilter)}
                style={{ flex: 1, textAlign: "center", padding: "5px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer",
                  background: unreadFilter ? "#1e5fa8" : "#f0ede8",
                  color: unreadFilter ? "#fff" : "#4a6070" }}>
                🔵 לא נקראו
              </div>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filtered.length === 0 && <div style={{ textAlign: "center", padding: "32px 16px", color: "#4a6070", fontSize: 13 }}>אין שיחות</div>}
            {filtered.map(msg => (
              <div key={msg.id} onClick={() => {
                setActiveMessage(msg); setShowChat(true); setEditingContact(false);
                // Load chat history from DB, or sync from WhatsApp if empty
                if (!chatMessages[msg.id]) {
                  const mapMessages = (msgs) => msgs.map(m => ({
                    id: m.id,
                    from: m.direction === 'in' ? 'them' : 'me',
                    type: m.type || 'text',
                    text: m.content || '',
                    time: m.created_at ? new Date(m.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : '',
                    media_url: m.media_url,
                  }));
                  convsApi.messages(msg.id).then(data => {
                    if (data?.messages?.length > 0) {
                      setChatMessages(prev => ({ ...prev, [msg.id]: mapMessages(data.messages) }));
                    } else {
                      // No messages in DB — sync from WhatsApp
                      setChatMessages(prev => ({ ...prev, [msg.id]: '__syncing__' }));
                      convsApi.syncHistory(msg.id).then(syncData => {
                        setChatMessages(prev => ({ ...prev, [msg.id]: mapMessages(syncData?.messages || []) }));
                      }).catch(() => {
                        setChatMessages(prev => ({ ...prev, [msg.id]: [] }));
                      });
                    }
                  }).catch(() => {});
                }
              }}
                style={{ display: "flex", gap: 10, padding: "12px 14px", cursor: "pointer", background: activeMessage?.id === msg.id ? "#f0f4ff" : "transparent", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <Av letter={msg.avatar} color={msg.color} size={38} />
                  <div style={{ position: "absolute", bottom: -2, left: -2 }}><ChannelIcon channel={msg.channel} size={11} /></div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0d1f3c" }}>{msg.from}</span>
                    <span style={{ fontSize: 10, color: "#4a6070" }}>{msg.time}</span>
                  </div>
                  <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap", alignItems: "center" }}>
                    {(() => {
                      const auto = getAutoStatus(msg.from, msg.type);
                      const displayType = auto ? auto.type : (msg.type || "ליד");
                      const displaySub = auto ? auto.subStatus : msg.subStatus;
                      const assignedUser = team.find(u => u.id === msg.assignedTo);
                      return (<>
                        <div style={{ cursor: "default" }}>
                          <TypeBadge type={displayType} />
                        </div>
                        <div style={{ cursor: "default" }}>
                          <SubBadge type={displayType} sub={displaySub} />
                        </div>
                        {assignedUser && (
                          <div style={{ display: "flex", alignItems: "center", gap: 3, background: msg.assignedTo === currentUser ? "#dbeafe" : "#f3f4f6", borderRadius: 20, padding: "1px 7px 1px 4px" }}>
                            <div style={{ width: 13, height: 13, borderRadius: "50%", background: assignedUser.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 700, color: "#fff" }}>{assignedUser.avatar}</div>
                            <span style={{ fontSize: 10, color: msg.assignedTo === currentUser ? "#1e5fa8" : "#4a6070", fontWeight: 700 }}>
                              {msg.assignedTo === currentUser ? "אליי" : assignedUser.name}
                            </span>
                          </div>
                        )}
                      </>);
                    })()}
                  </div>
                  <div style={{ fontSize: 12, color: "#4a6070", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{msg.text}</div>
                </div>
                {msg.unread > 0 && <div style={{ background: "#1e5fa8", color: "#fff", fontSize: 10, fontWeight: 700, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>{msg.unread}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Chat + Customer Panel */}
        <div style={{ flex: 1, display: mob() && !showChat ? "none" : "flex", flexDirection: "row", overflow: "hidden", gap: 0 }}>

          {/* מובייל: פאנל fullscreen */}
          {mob() && showCustomerPanel && activeMessage && (
            <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "#fff", overflowY: "auto", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0d1f3c" }}>פרטי {activeMessage.from}</div>
                <button onClick={() => setShowCustomerPanel(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#4a6070" }}>✕</button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                {/* פרטי קשר */}
                <div style={{ background: "#f8f9fb", borderRadius: 12, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#0d1f3c" }}>פרטי קשר</div>
                    {!editingContact
                      ? <button onClick={() => setEditingContact(true)} style={{ background: "none", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", color: "#1e5fa8", fontFamily: "'Heebo',sans-serif" }}>✏️ עריכה</button>
                      : <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => setEditingContact(false)} style={{ background: "#0d1f3c", border: "none", borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", color: "#fff", fontFamily: "'Heebo',sans-serif" }}>שמור</button>
                          <button onClick={() => setEditingContact(false)} style={{ background: "none", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", color: "#4a6070", fontFamily: "'Heebo',sans-serif" }}>ביטול</button>
                        </div>
                    }
                  </div>
                  {[
                    { icon: "📞", l: "טלפון", k: "phone", v: contactInfoMap[activeMessage.id]?.phone ?? "052-0000000" },
                    { icon: "✉️", l: "אימייל", k: "email", v: contactInfoMap[activeMessage.id]?.email ?? activeMessage.from.replace(" ","").toLowerCase()+"@email.co.il" },
                    { icon: "📡", l: "מקור", k: "source", v: contactInfoMap[activeMessage.id]?.source ?? activeMessage.channel, readOnly: true },
                  ].map(f => (
                    <div key={f.l} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                      <span style={{ fontSize: 16, marginTop: 2 }}>{f.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 2 }}>{f.l}</div>
                        {editingContact && !f.readOnly ? (
                          <input
                            value={contactInfoMap[activeMessage.id]?.[f.k] ?? f.v}
                            onChange={e => setContactInfoMap(prev => ({ ...prev, [activeMessage.id]: { ...prev[activeMessage.id], [f.k]: e.target.value } }))}
                            style={{ width: "100%", padding: "6px 10px", border: "1.5px solid #1e5fa8", borderRadius: 8, fontSize: 13, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", color: "#0d1f3c", boxSizing: "border-box", background: "#fff" }}
                          />
                        ) : (
                          <div style={{ fontSize: 13, fontWeight: 600, color: f.v ? "#0d1f3c" : "#9ca3af" }}>{f.v || "—"}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {/* שיוך שיחה */}
                {isMain && (
                  <div style={{ background: "#f8f9fb", borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#0d1f3c", marginBottom: 10 }}>👥 שיוך שיחה</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {team.map(u => (
                        <div key={u.id} onClick={() => assignTo(activeMessage.id, u.id)}
                          style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, cursor: "pointer", background: activeMessage.assignedTo === u.id ? "#dbeafe" : "#fff", border: `1.5px solid ${activeMessage.assignedTo === u.id ? "#bfdbfe" : "rgba(0,0,0,0.07)"}`, transition: "all 0.15s" }}>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: u.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{u.avatar}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#0d1f3c" }}>{u.name}</div>
                            <div style={{ fontSize: 11, color: "#9ca3af" }}>{u.role}</div>
                          </div>
                          {activeMessage.assignedTo === u.id && <span style={{ color: "#1e5fa8", fontSize: 16 }}>✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* מסמכים פתוחים */}
                {(() => {
                  const openDocs = payHistory.filter(p => p.client === activeMessage.from && (p.status === "פתוח" || p.status === "ממתין"));
                  if (openDocs.length === 0) return null;
                  return (
                    <div style={{ background: "#f8f9fb", borderRadius: 12, padding: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#0d1f3c", marginBottom: 10 }}>💳 מסמכים פתוחים</div>
                      {openDocs.map(doc => (
                        <div key={doc.id} onClick={() => setPayDocModal(doc)}
                          style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, background: "#fff", marginBottom: 6, cursor: "pointer", border: "1px solid rgba(0,0,0,0.06)" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#eff6ff"}
                          onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                          <span style={{ fontSize: 18 }}>{doc.type === "quote" ? "📋" : "💸"}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#0d1f3c" }}>{doc.type === "quote" ? "הצעת מחיר" : "בקשת תשלום"}</div>
                            <div style={{ fontSize: 11, color: "#9ca3af" }}>{doc.date}</div>
                          </div>
                          <div style={{ textAlign: "left" }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: "#0d1f3c" }}>₪{doc.amount.toLocaleString()}</div>
                            <div style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 10, background: doc.status === "ממתין" ? "#fffbeb" : "#eff6ff", color: doc.status === "ממתין" ? "#b89440" : "#1e5fa8" }}>{doc.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
                {/* משימות — גלובלי */}
                <div style={{ background: "#f8f9fb", borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#0d1f3c", marginBottom: 10 }}>✅ משימות</div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                    <input value={cpNewTask} onChange={e => setCpNewTask(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && cpNewTask.trim()) { setTasks(p => [...p, { id: Date.now(), title: cpNewTask, contact: activeMessage.from, priority: "בינונית", status: "פתוח", due: "ללא תאריך", fromMsg: "", channel: activeMessage.channel }]); setCpNewTask(""); }}} placeholder="משימה חדשה..." style={{ flex: 1, padding: "7px 10px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 13, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl" }} />
                    <button onClick={() => { if (!cpNewTask.trim()) return; setTasks(p => [...p, { id: Date.now(), title: cpNewTask, contact: activeMessage.from, priority: "בינונית", status: "פתוח", due: "ללא תאריך", fromMsg: "", channel: activeMessage.channel }]); setCpNewTask(""); }} style={{ background: "#0d1f3c", color: "#fff", border: "none", borderRadius: 8, padding: "7px 12px", fontSize: 16, cursor: "pointer" }}>+</button>
                  </div>
                  {tasks.filter(t => t.contact === activeMessage.from).length === 0 && <div style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", padding: "8px 0" }}>אין משימות</div>}
                  {tasks.filter(t => t.contact === activeMessage.from).map(t => (
                    <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "1px solid rgba(0,0,0,0.04)", opacity: t.status === "הושלם" ? 0.5 : 1 }}>
                      <input type="checkbox" checked={t.status === "הושלם"} onChange={() => setTasks(p => p.map(x => x.id === t.id ? { ...x, status: x.status === "הושלם" ? "פתוח" : "הושלם" } : x))} style={{ accentColor: "#0d1f3c", cursor: "pointer" }} />
                      <span style={{ flex: 1, fontSize: 13, color: "#0d1f3c", textDecoration: t.status === "הושלם" ? "line-through" : "none" }}>{t.title}</span>
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>{t.due}</span>
                      <button onClick={() => setTasks(p => p.filter(x => x.id !== t.id))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#ef4444", padding: 2 }}>🗑</button>
                    </div>
                  ))}
                </div>
                {/* הערות — per contact */}
                <div style={{ background: "#f8f9fb", borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#0d1f3c", marginBottom: 10 }}>📝 הערות</div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                    <textarea value={cpNewNote} onChange={e => setCpNewNote(e.target.value)} placeholder="הוסף הערה..." rows={2} style={{ flex: 1, padding: "7px 10px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 13, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", resize: "none" }} />
                    <button onClick={() => { if (!cpNewNote.trim()) return; setCpNotes(p => ({ ...p, [activeMessage.from]: [{ id: Date.now(), text: cpNewNote, time: "עכשיו" }, ...(p[activeMessage.from] || [])] })); setCpNewNote(""); }} style={{ background: "#0d1f3c", color: "#fff", border: "none", borderRadius: 8, padding: "7px 10px", fontSize: 12, cursor: "pointer", fontFamily: "'Heebo',sans-serif", alignSelf: "flex-end" }}>שמור</button>
                  </div>
                  {(cpNotes[activeMessage.from] || []).map(n => (
                    <div key={n.id} style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "9px 10px", marginBottom: 6 }}>
                      <div style={{ fontSize: 13, color: "#0d1f3c", lineHeight: 1.5 }}>{n.text}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                        <span style={{ fontSize: 10, color: "#9ca3af" }}>🕐 {n.time}</span>
                        <button onClick={() => setCpNotes(p => ({ ...p, [activeMessage.from]: (p[activeMessage.from]||[]).filter(x => x.id !== n.id) }))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#ef4444", padding: 0 }}>🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* פגישות — גלובלי */}
                <div style={{ background: "#f8f9fb", borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#0d1f3c", marginBottom: 10 }}>📅 פגישות</div>
                  {events.filter(e => e.contact === activeMessage.from).length === 0 && <div style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", padding: "8px 0" }}>אין פגישות</div>}
                  {events.filter(e => e.contact === activeMessage.from).map(ev => (
                    <div key={ev.id} style={{ background: "#fff", borderRadius: 8, padding: "9px 10px", marginBottom: 6, borderRight: "3px solid " + ev.color }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0d1f3c" }}>{ev.title}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>🕐 {ev.time} · ⏱ {ev.duration}</div>
                    </div>
                  ))}
                  <button onClick={() => { setShowCustomerPanel(false); openMeet(activeMessage.from); }} style={{ width: "100%", padding: "8px", background: "transparent", border: "1.5px dashed rgba(0,0,0,0.12)", borderRadius: 8, fontSize: 12, color: "#4a6070", cursor: "pointer", fontFamily: "'Heebo',sans-serif" }}>+ קבע פגישה חדשה</button>
                </div>
                {/* AI */}
                <div style={{ background: "linear-gradient(135deg,#e8f0fe,#dbeafe)", borderRadius: 12, padding: 14, border: "1px solid #bfdbfe" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#1e5fa8", marginBottom: 8 }}>⚡ המלצות AI</div>
                  {["שלח הצעת מחיר — הלקוח ביקש לפני 2 ימים", "קבע פגישת דמו השבוע"].map((s, i) => (
                    <div key={i} style={{ background: "#fff", borderRadius: 8, padding: "8px 10px", marginBottom: 6, fontSize: 12, color: "#374151", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: "#1e5fa8", fontWeight: 700 }}>→</span>{s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat column */}
          <div style={{ flex: 1, background: "#fff", borderRadius: mob() ? 0 : 16, display: "flex", flexDirection: "column", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden", minWidth: 0 }}>
          {activeMessage && (
            <>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#fff" }}>
                {/* שורה עליונה: חזרה + אווטר + שם + שיוך */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  {mob() && <button onClick={() => setShowChat(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#0d1f3c", padding: 0, flexShrink: 0 }}>←</button>}
                  <Av letter={activeMessage.avatar} color={activeMessage.color} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#0d1f3c", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeMessage.from}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
                      <ChannelIcon channel={activeMessage.channel} size={10} />
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>{activeMessage.channel}</span>
                    </div>
                  </div>
                  {/* badge שיוך */}
                  {(() => {
                    const u = team.find(u => u.id === activeMessage.assignedTo);
                    return u ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, background: isMyChat(activeMessage) ? "#dbeafe" : "#f3f4f6", borderRadius: 20, padding: "3px 10px 3px 6px", flexShrink: 0 }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", background: u.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>{u.avatar}</div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: isMyChat(activeMessage) ? "#1e5fa8" : "#4a6070" }}>{isMyChat(activeMessage) ? "אליי" : u.name}</span>
                      </div>
                    ) : null;
                  })()}
                </div>
                {/* שורה תחתונה: באדג'ים */}
                {(() => {
                  const blocked = hasOpenDocs(activeMessage.from);
                  const auto = getAutoStatus(activeMessage.from, activeMessage.type);
                  const displayType = auto ? auto.type : (activeMessage.type || "ליד");
                  const displaySub = auto ? auto.subStatus : activeMessage.subStatus;
                  const typeColor = displayType === "לקוח" ? { bg: "#0d1f3c", text: "#fff" } : { bg: "#dbeafe", text: "#1e5fa8" };
                  const subColors = {
                    "חדש": { bg: "#dcfce7", text: "#16a34a" },
                    "בטיפול": { bg: "#fef9c3", text: "#ca8a04" },
                    "נשלח הצעת מחיר": { bg: "#ffedd5", text: "#ea580c" },
                    "לקוח עתידי": { bg: "#f3e8ff", text: "#7c3aed" },
                    "לא רלוונטי": { bg: "#fee2e2", text: "#dc2626" },
                    "הזמנה פעילה": { bg: "#dbeafe", text: "#1e5fa8" },
                    "מוכן למסירה": { bg: "#dcfce7", text: "#16a34a" },
                    "ממתין לתשלום": { bg: "#fee2e2", text: "#dc2626" },
                    "סגור": { bg: "#f3f4f6", text: "#6b7280" },
                  };
                  const subC = subColors[displaySub] || { bg: "#f3f4f6", text: "#6b7280" };
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {auto && <span style={{ fontSize: 10, color: "#ea580c", fontWeight: 700 }}>⚡ אוטו</span>}
                      {/* Type badge */}
                      <div style={{ position: "relative" }}>
                        <div onClick={e => { e.stopPropagation(); if (blocked) { showBlockedToast(); return; } setOpenChatDrop(openChatDrop==="t" ? null : "t"); }}
                          style={{ display: "flex", alignItems: "center", gap: 4, background: typeColor.bg, color: typeColor.text, borderRadius: 20, padding: "4px 10px", fontSize: 12, fontWeight: 700, cursor: blocked ? "not-allowed" : "pointer", opacity: blocked ? 0.85 : 1 }}>
                          {displayType}
                          {!blocked && <span style={{ fontSize: 8 }}>▾</span>}
                          
                        </div>
                        {openChatDrop === "t" && (
                          <div style={{ position: "absolute", top: "110%", right: 0, zIndex: 100, background: "#fff", borderRadius: 10, marginTop: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", minWidth: 110, overflow: "hidden" }}>
                            {["ליד","לקוח"].map(t => (
                              <div key={t} onClick={e => { e.stopPropagation(); updateMsg(activeMessage.id, t, t==="לקוח"?"הזמנה פעילה":"חדש"); setOpenChatDrop(null); }}
                                style={{ padding: "10px 16px", fontSize: 13, cursor: "pointer", color: "#0d1f3c", fontWeight: (activeMessage.type||"ליד")===t?700:400, background: (activeMessage.type||"ליד")===t?"#f0ede8":"transparent" }}
                                onMouseEnter={e=>e.currentTarget.style.background="#f8f7f5"}
                                onMouseLeave={e=>e.currentTarget.style.background=(activeMessage.type||"ליד")===t?"#f0ede8":"transparent"}
                              >{t}</div>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* Sub badge */}
                      <div style={{ position: "relative" }}>
                        <div onClick={e => { e.stopPropagation(); if (blocked) { showBlockedToast(); return; } setOpenChatDrop(openChatDrop==="s" ? null : "s"); }}
                          style={{ display: "flex", alignItems: "center", gap: 4, background: subC.bg, color: subC.text, borderRadius: 20, padding: "4px 10px", fontSize: 12, fontWeight: 700, cursor: blocked ? "not-allowed" : "pointer", opacity: blocked ? 0.85 : 1 }}>
                          {displaySub || "חדש"}
                          {!blocked && <span style={{ fontSize: 8 }}>▾</span>}
                        </div>
                        {openChatDrop === "s" && (
                          <div style={{ position: "absolute", top: "110%", right: 0, zIndex: 100, background: "#fff", borderRadius: 10, marginTop: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", minWidth: 160, overflow: "hidden" }}>
                            {(activeMessage.type==="לקוח" ? CUSTOMER_STATUSES : LEAD_STATUSES)
                              .filter(s => !auto || (s !== "נשלח הצעת מחיר" && s !== "ממתין לתשלום"))
                              .map(s => (
                              <div key={s} onClick={e => { e.stopPropagation(); updateMsg(activeMessage.id, activeMessage.type||"ליד", s); setOpenChatDrop(null); }}
                                style={{ padding: "10px 16px", fontSize: 13, cursor: "pointer", color: "#0d1f3c", fontWeight: activeMessage.subStatus===s?700:400, background: activeMessage.subStatus===s?"#f0ede8":"transparent" }}
                                onMouseEnter={e=>e.currentTarget.style.background="#f8f7f5"}
                                onMouseLeave={e=>e.currentTarget.style.background=activeMessage.subStatus===s?"#f0ede8":"transparent"}
                              >{s}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div style={{ flex: 1, padding: "20px", overflow: "auto" }}>
                {!(chatMessages[activeMessage.id]) && (
                  <div style={{ textAlign: "center", padding: "20px", color: "#4a6070", fontSize: 13 }}>טוען הודעות...</div>
                )}
                {chatMessages[activeMessage.id] === '__syncing__' && (
                  <div style={{ textAlign: "center", padding: "20px", color: "#4a6070", fontSize: 13 }}>
                    <div style={{ width: 24, height: 24, border: "3px solid rgba(30,95,168,0.2)", borderTop: "3px solid #1e5fa8", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 8px" }} />
                    טוען היסטוריה מ-WhatsApp...
                  </div>
                )}
                {(Array.isArray(chatMessages[activeMessage.id]) ? chatMessages[activeMessage.id] : []).map((m, i) => {
                  const isMe = m.from === 'me';
                  return (
                    <div key={m.id || i} style={{ display: "flex", justifyContent: isMe ? "flex-start" : "flex-end", marginBottom: 12 }}>
                      {m.type === "contact" ? (
                        <div style={{ background: "#1e5fa8", borderRadius: "12px 12px 12px 2px", padding: "14px 16px", maxWidth: "80%", color: "#fff", minWidth: 200 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.65)", marginBottom: 6 }}>📇 פרטי קשר</div>
                          <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", marginBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: 8 }}>{m.business}</div>
                          <div style={{ fontSize: 13, color: "#fff", marginBottom: 5 }}>📞 {m.phone}</div>
                          <div style={{ fontSize: 13, color: "#fff", marginBottom: 5 }}>✉️ {m.email}</div>
                          {m.address ? <div style={{ fontSize: 13, color: "#fff" }}>📍 {m.address}</div> : null}
                        </div>
                      ) : (
                        <div
                          onContextMenu={e => { e.preventDefault(); setMsgContextMenu({ msgText: m.text, contact: activeMessage.from, channel: activeMessage.channel, x: e.clientX, y: e.clientY, fromMe: isMe }); }}
                          onTouchStart={e => { const t = setTimeout(() => setMsgContextMenu({ msgText: m.text, contact: activeMessage.from, channel: activeMessage.channel, x: 80, y: 300, fromMe: isMe }), 600); e._t = t; }}
                          onTouchEnd={e => clearTimeout(e._t)}
                          style={{
                            background: isMe ? "#1e5fa8" : "#f0ede8",
                            borderRadius: isMe ? "12px 12px 12px 2px" : "12px 12px 2px 12px",
                            padding: "10px 14px", maxWidth: "70%", fontSize: 14,
                            color: isMe ? "#fff" : "#0d1f3c", cursor: "context-menu"
                          }}>
                          {m.text}
                          {m.time && <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: isMe ? "left" : "right" }}>{m.time}</div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", gap: 8, alignItems: "flex-end" }}>
                {!isMyChat(activeMessage) && !isMain ? (
                  <div style={{ flex: 1, padding: "12px 14px", background: "#f5f0e8", borderRadius: 10, fontSize: 13, color: "#4a6070", textAlign: "center" }}>
                    🔒 שיחה זו משויכת ל-{team.find(u => u.id === activeMessage.assignedTo)?.name}. צפייה בלבד.
                  </div>
                ) : (
                  <>
                    {mob() && (
                      <button onClick={() => setShowCustomerPanel(true)} style={{ width: 40, height: 40, borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", background: "#f8f7f5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18, flexShrink: 0 }}>👤</button>
                    )}
                    <textarea placeholder="כתוב הודעה..." rows={1} value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight,120)+"px"; e.target.style.overflowY = e.target.scrollHeight>120?"auto":"hidden"; }}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); document.getElementById('send-msg-btn')?.click(); } }}
                      style={{ flex: 1, padding: "10px 14px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10, fontSize: 14, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", resize: "none", lineHeight: 1.5, overflowY: "hidden", maxHeight: 120 }} />
                    <label style={{ width: 40, height: 40, borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", background: "#f8f7f5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 20, color: "#4a6070", flexShrink: 0 }}>
                      +<input type="file" accept="image/*,video/*,*" style={{ display: "none" }} onChange={e => { const f=e.target.files[0]; if(f) alert('"'+f.name+'" נבחר'); e.target.value=""; }} />
                    </label>
                    <button id="send-msg-btn" disabled={sending || !chatInput.trim()} onClick={async () => {
                      if (!chatInput.trim() || !activeMessage) return;
                      setSending(true);
                      try {
                        await convsApi.sendMessage(activeMessage.id, { content: chatInput.trim() });
                        setChatMessages(prev => ({ ...prev, [activeMessage.id]: [...(Array.isArray(prev[activeMessage.id]) ? prev[activeMessage.id] : []), {
                          id: Date.now(), from: 'me', type: 'text', text: chatInput.trim(),
                          time: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
                        }] }));
                        setChatInput('');
                      } catch (err) { console.error('Send failed:', err); }
                      setSending(false);
                    }} style={{ background: sending ? "#4a6070" : "#1e5fa8", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: sending ? "not-allowed" : "pointer", fontFamily: "'Heebo',sans-serif", flexShrink: 0, height: 40 }}>{sending ? '...' : 'שלח'}</button>
                  </>
                )}
              </div>
            </>
          )}
          </div>{/* end chat column */}

          {/* דסקטופ: פאנל לקוח */}
          {!mob() && activeMessage && (
            <div style={{ width: panelMinimized ? 40 : 280, flexShrink: 0, background: "#f8f9fb", borderRadius: "0 16px 16px 0", borderRight: "1px solid rgba(0,0,0,0.06)", overflow: "hidden", transition: "width 0.25s ease", display: "flex", flexDirection: "column" }}>

              {/* כפתור מזעור/פתיחה */}
              {panelMinimized ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 14, gap: 8 }}>
                  <button onClick={() => setPanelMinimized(false)} style={{ width: 28, height: 28, borderRadius: "50%", background: "#0d1f3c", border: "none", cursor: "pointer", color: "#fff", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
                  <div style={{ writingMode: "vertical-rl", fontSize: 11, fontWeight: 700, color: "#4a6070", marginTop: 8, transform: "rotate(180deg)", whiteSpace: "nowrap" }}>{activeMessage.from}</div>
                </div>
              ) : (
                <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 12, padding: "14px 14px 20px" }}>
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: activeMessage.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>{activeMessage.avatar}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "#0d1f3c" }}>{activeMessage.from}</div>
                      <SubBadge type={activeMessage.type||"ליד"} sub={activeMessage.subStatus} />
                    </div>
                    <button onClick={() => setPanelMinimized(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 18, padding: 2, flexShrink: 0 }}>›</button>
                  </div>
                  {/* שיוך */}
                  {isMain && (
                    <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: "1px solid rgba(0,0,0,0.06)" }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#0d1f3c", marginBottom: 10 }}>👥 שיוך שיחה</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {team.map(u => (
                          <div key={u.id} onClick={() => assignTo(activeMessage.id, u.id)}
                            style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, cursor: "pointer", background: activeMessage.assignedTo === u.id ? "#dbeafe" : "#f8f9fb", border: activeMessage.assignedTo === u.id ? "1.5px solid #bfdbfe" : "1.5px solid transparent", transition: "all 0.15s" }}
                            onMouseEnter={e => { if (activeMessage.assignedTo !== u.id) e.currentTarget.style.background = "#f0f4ff"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = activeMessage.assignedTo === u.id ? "#dbeafe" : "#f8f9fb"; }}>
                            <div style={{ width: 24, height: 24, borderRadius: "50%", background: u.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{u.avatar}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "#0d1f3c" }}>{u.name}</div>
                              <div style={{ fontSize: 10, color: "#9ca3af" }}>{u.role}</div>
                            </div>
                            {activeMessage.assignedTo === u.id && <span style={{ color: "#1e5fa8", fontSize: 14 }}>✓</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* פרטי קשר */}
                  <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: "1px solid rgba(0,0,0,0.06)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#0d1f3c" }}>פרטי קשר</div>
                      {!editingContact
                        ? <button onClick={() => setEditingContact(true)} style={{ background: "none", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", color: "#1e5fa8", fontFamily: "'Heebo',sans-serif" }}>✏️ עריכה</button>
                        : <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => setEditingContact(false)} style={{ background: "#0d1f3c", border: "none", borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", color: "#fff", fontFamily: "'Heebo',sans-serif" }}>שמור</button>
                            <button onClick={() => setEditingContact(false)} style={{ background: "none", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", color: "#4a6070", fontFamily: "'Heebo',sans-serif" }}>ביטול</button>
                          </div>
                      }
                    </div>
                    {[
                      { icon: "📞", l: "טלפון", k: "phone", v: contactInfoMap[activeMessage.id]?.phone ?? "052-0000000" },
                      { icon: "✉️", l: "אימייל", k: "email", v: contactInfoMap[activeMessage.id]?.email ?? activeMessage.from.replace(" ","").toLowerCase()+"@email.co.il" },
                      { icon: "📡", l: "מקור", k: "source", v: contactInfoMap[activeMessage.id]?.source ?? activeMessage.channel, readOnly: true },
                    ].map(f => (
                      <div key={f.l} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                        <span style={{ fontSize: 15, marginTop: 2 }}>{f.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 2 }}>{f.l}</div>
                          {editingContact && !f.readOnly ? (
                            <input
                              value={contactInfoMap[activeMessage.id]?.[f.k] ?? f.v}
                              onChange={e => setContactInfoMap(prev => ({ ...prev, [activeMessage.id]: { ...prev[activeMessage.id], [f.k]: e.target.value } }))}
                              style={{ width: "100%", padding: "5px 8px", border: "1.5px solid #1e5fa8", borderRadius: 8, fontSize: 12, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", color: "#0d1f3c", boxSizing: "border-box", background: "#fff" }}
                            />
                          ) : (
                            <div style={{ fontSize: 12, fontWeight: 600, color: f.v ? "#0d1f3c" : "#9ca3af" }}>{f.v || "—"}</div>
                          )}
                        </div>
                      </div>
                    ))}
              </div>
              {/* מסמכים פתוחים */}
              {(() => {
                const openDocs = payHistory.filter(p => p.client === activeMessage.from && (p.status === "פתוח" || p.status === "ממתין"));
                if (openDocs.length === 0) return null;
                return (
                  <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: "1px solid rgba(0,0,0,0.06)" }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#0d1f3c", marginBottom: 8 }}>💳 מסמכים פתוחים</div>
                    {openDocs.map(doc => (
                      <div key={doc.id} onClick={() => setPayDocModal(doc)}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 8, background: "#f8f9fb", marginBottom: 5, cursor: "pointer", border: "1px solid transparent" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.borderColor = "#bfdbfe"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#f8f9fb"; e.currentTarget.style.borderColor = "transparent"; }}>
                        <span style={{ fontSize: 16 }}>{doc.type === "quote" ? "📋" : "💸"}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#0d1f3c" }}>{doc.type === "quote" ? "הצעת מחיר" : "בקשת תשלום"}</div>
                          <div style={{ fontSize: 10, color: "#9ca3af" }}>{doc.date}</div>
                        </div>
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontSize: 12, fontWeight: 800, color: "#0d1f3c" }}>₪{doc.amount.toLocaleString()}</div>
                          <div style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 8, background: doc.status === "ממתין" ? "#fffbeb" : "#eff6ff", color: doc.status === "ממתין" ? "#b89440" : "#1e5fa8" }}>{doc.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
              {/* משימות — מהסטייט הגלובלי */}
              {(() => {
                const contactName = activeMessage.from;
                const contactTasksList = tasks.filter(t => t.contact === contactName);
                return (
                  <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: "1px solid rgba(0,0,0,0.06)" }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#0d1f3c", marginBottom: 10 }}>✅ משימות</div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                      <input value={cpNewTask} onChange={e => setCpNewTask(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && cpNewTask.trim()) { setTasks(p => [...p, { id: Date.now(), title: cpNewTask, contact: contactName, priority: "בינונית", status: "פתוח", due: "ללא תאריך", fromMsg: "", channel: activeMessage.channel }]); setCpNewTask(""); }}}
                        placeholder="משימה חדשה..." style={{ flex: 1, padding: "6px 10px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 12, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl" }} />
                      <button onClick={() => { if (!cpNewTask.trim()) return; setTasks(p => [...p, { id: Date.now(), title: cpNewTask, contact: contactName, priority: "בינונית", status: "פתוח", due: "ללא תאריך", fromMsg: "", channel: activeMessage.channel }]); setCpNewTask(""); }} style={{ background: "#0d1f3c", color: "#fff", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 15, cursor: "pointer" }}>+</button>
                    </div>
                    {contactTasksList.length === 0 && <div style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", padding: "8px 0" }}>אין משימות</div>}
                    {contactTasksList.map(t => (
                      <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(0,0,0,0.04)", opacity: t.status === "הושלם" ? 0.5 : 1 }}>
                        <input type="checkbox" checked={t.status === "הושלם"} onChange={() => setTasks(p => p.map(x => x.id === t.id ? { ...x, status: x.status === "הושלם" ? "פתוח" : "הושלם" } : x))} style={{ accentColor: "#0d1f3c", cursor: "pointer" }} />
                        {cpEditTask === t.id ? (
                          <input autoFocus defaultValue={t.title} onBlur={e => { setTasks(p => p.map(x => x.id === t.id ? { ...x, title: e.target.value } : x)); setCpEditTask(null); }} onKeyDown={e => { if (e.key === "Enter") { setTasks(p => p.map(x => x.id === t.id ? { ...x, title: e.target.value } : x)); setCpEditTask(null); }}} style={{ flex: 1, padding: "3px 7px", border: "1.5px solid #1e5fa8", borderRadius: 6, fontSize: 12, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl" }} />
                        ) : (
                          <span style={{ flex: 1, fontSize: 12, color: "#0d1f3c", textDecoration: t.status === "הושלם" ? "line-through" : "none" }}>{t.title}</span>
                        )}
                        <span style={{ fontSize: 10, color: "#9ca3af" }}>{t.due}</span>
                        <button onClick={() => setCpEditTask(t.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#9ca3af", padding: 1 }}>✏️</button>
                        <button onClick={() => setTasks(p => p.filter(x => x.id !== t.id))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#ef4444", padding: 1 }}>🗑</button>
                      </div>
                    ))}
                  </div>
                );
              })()}
              {/* הערות — per contact */}
              {(() => {
                const contactName = activeMessage.from;
                const notes = cpNotes[contactName] || [];
                return (
                  <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: "1px solid rgba(0,0,0,0.06)" }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#0d1f3c", marginBottom: 10 }}>📝 הערות</div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                      <textarea value={cpNewNote} onChange={e => setCpNewNote(e.target.value)} placeholder="הוסף הערה..." rows={2} style={{ flex: 1, padding: "6px 10px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 12, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", resize: "none" }} />
                      <button onClick={() => { if (!cpNewNote.trim()) return; setCpNotes(p => ({ ...p, [contactName]: [{ id: Date.now(), text: cpNewNote, time: "עכשיו" }, ...(p[contactName] || [])] })); setCpNewNote(""); }} style={{ background: "#0d1f3c", color: "#fff", border: "none", borderRadius: 8, padding: "6px 8px", fontSize: 11, cursor: "pointer", fontFamily: "'Heebo',sans-serif", alignSelf: "flex-end" }}>שמור</button>
                    </div>
                    {notes.length === 0 && <div style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", padding: "8px 0" }}>אין הערות</div>}
                    {notes.map(n => (
                      <div key={n.id} style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "8px 10px", marginBottom: 6 }}>
                        {cpEditNote === n.id ? (
                          <textarea autoFocus defaultValue={n.text} rows={2} onBlur={e => { setCpNotes(p => ({ ...p, [contactName]: (p[contactName]||[]).map(x => x.id === n.id ? { ...x, text: e.target.value } : x) })); setCpEditNote(null); }} style={{ width: "100%", padding: "4px 7px", border: "1.5px solid #1e5fa8", borderRadius: 6, fontSize: 12, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", resize: "none", boxSizing: "border-box" }} />
                        ) : (
                          <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                            <div style={{ flex: 1 }}><div style={{ fontSize: 12, color: "#0d1f3c", lineHeight: 1.5 }}>{n.text}</div><div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3 }}>🕐 {n.time}</div></div>
                            <button onClick={() => setCpEditNote(n.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#9ca3af", padding: 1 }}>✏️</button>
                            <button onClick={() => setCpNotes(p => ({ ...p, [contactName]: (p[contactName]||[]).filter(x => x.id !== n.id) }))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#ef4444", padding: 1 }}>🗑</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
              {/* פגישות — מהסטייט הגלובלי */}
              {(() => {
                const contactName = activeMessage.from;
                const contactEvents = events.filter(e => e.contact === contactName);
                return (
                  <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: "1px solid rgba(0,0,0,0.06)" }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#0d1f3c", marginBottom: 10 }}>📅 פגישות</div>
                    {contactEvents.length === 0 && <div style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", padding: "8px 0" }}>אין פגישות</div>}
                    {contactEvents.map(ev => (
                      <div key={ev.id} style={{ background: "#f8f9fb", borderRadius: 8, padding: "8px 10px", marginBottom: 6, borderRight: "3px solid " + ev.color }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#0d1f3c" }}>{ev.title}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>🕐 {ev.time} · ⏱ {ev.duration}</div>
                      </div>
                    ))}
                    <button onClick={() => openMeet(contactName)} style={{ width: "100%", padding: "7px", background: "transparent", border: "1.5px dashed rgba(0,0,0,0.12)", borderRadius: 8, fontSize: 12, color: "#4a6070", cursor: "pointer", fontFamily: "'Heebo',sans-serif" }}>+ קבע פגישה</button>
                  </div>
                );
              })()}
              {/* AI */}
              <div style={{ background: "linear-gradient(135deg,#e8f0fe,#dbeafe)", borderRadius: 12, padding: 14, border: "1px solid #bfdbfe" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#1e5fa8", marginBottom: 8 }}>⚡ המלצות AI</div>
                {["שלח הצעת מחיר — הלקוח ביקש לפני 2 ימים", "קבע פגישת דמו השבוע"].map((s, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 8, padding: "7px 10px", marginBottom: 6, fontSize: 11, color: "#374151", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "#1e5fa8", fontWeight: 700 }}>→</span>{s}
                  </div>
                ))}
              </div>
              </div>
              )}{/* end minimized else */}
            </div>
          )}

        </div>{/* end flex row */}
      </div>
    );
  };

  // ── FUNNEL / LEADS ──
  const renderFunnel = () => {
    // messages הוא מקור האמת — לידים ולקוחות
    const allContacts = messages;
    const onlyLeads = allContacts.filter(m => m.type === "ליד");
    const onlyCustomers = allContacts.filter(m => m.type === "לקוח");
    const total = onlyLeads.length;
    const conversionRate = allContacts.length > 0 ? Math.round((onlyCustomers.length / allContacts.length) * 100) : 0;

    const statuses = [
      { label: "חדש", color: "#22c55e", bg: "#f0fdf4", icon: "🌱", desc: "ליד שנכנס לאחרונה" },
      { label: "בטיפול", color: "#1e5fa8", bg: "#eff6ff", icon: "⚡", desc: "בתהליך פולואפ" },
      { label: "נשלח הצעת מחיר", color: "#b89440", bg: "#fffbeb", icon: "📋", desc: "ממתין לתגובה" },
      { label: "לקוח עתידי", color: "#7c3aed", bg: "#faf5ff", icon: "🔮", desc: "עניין גבוה" },
    ];

    return (
      <div style={{ direction: "rtl" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#0d1f3c" }}>לידים</div>
          <div style={{ fontSize: 13, color: "#4a6070", marginTop: 2 }}>
            {total} לידים פעילים · {onlyCustomers.length} לקוחות · {conversionRate}% אחוז המרה
          </div>
        </div>

        {/* Stats cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 28 }}>
          {statuses.map(s => {
            const count = onlyLeads.filter(m => m.subStatus === s.label).length;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={s.label}
                style={{ background: s.bg, borderRadius: 16, padding: "20px 18px", border: `1.5px solid ${s.color}20`, position: "relative", overflow: "hidden", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${s.color}20`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ position: "absolute", top: 0, right: 0, left: 0, height: 3, background: s.color, borderRadius: "16px 16px 0 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 40, fontWeight: 900, color: "#0d1f3c", lineHeight: 1 }}>{count}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0d1f3c", marginTop: 6 }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{s.desc}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span style={{ fontSize: 22 }}>{s.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: s.color, background: "#fff", padding: "2px 8px", borderRadius: 10 }}>{pct}%</span>
                  </div>
                </div>
                <div style={{ marginTop: 14, height: 4, background: "rgba(0,0,0,0.08)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: s.color, borderRadius: 4, transition: "width 0.5s ease" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Lead list */}
        <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(0,0,0,0.06)", fontSize: 14, fontWeight: 800, color: "#0d1f3c" }}>
            כל הלידים
          </div>
          {onlyLeads.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>👥</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>אין לידים עדיין</div>
            </div>
          )}
          {onlyLeads.map((m, i) => {
            const s = statuses.find(x => x.label === m.subStatus) || { color: "#94a3b8", bg: "#f8fafc" };
            return (
              <div key={m.id} onClick={() => { setActiveMessage(m); setActiveTab("inbox"); }}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderBottom: i < onlyLeads.length-1 ? "1px solid rgba(0,0,0,0.04)" : "none", cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8f9fb"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{m.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0d1f3c" }}>{m.from}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.text}</div>
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af", flexShrink: 0 }}>{m.time}</div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.color}30`, whiteSpace: "nowrap" }}>{m.subStatus || "חדש"}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2,"0");
    const mm = String(now.getMonth()+1).padStart(2,"0");
    const yyyy = now.getFullYear();
    const todayStr = `${dd}/${mm}/${yyyy}`;
    const parseDate = d => { if (!d || d === "" || d === "ללא תאריך") return null; const [day,month,year] = d.split("/"); return new Date(year, month-1, day); };
    const HEB_MONTHS = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
    const HEB_DAYS_SHORT = ["א","ב","ג","ד","ה","ו","ש"];
    const HEB_DAYS = ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    const getDayStr = d => `${String(d).padStart(2,"0")}/${String(calMonth+1).padStart(2,"0")}/${calYear}`;
    const getDayEvents = d => events.filter(ev => ev.date === getDayStr(d));
    const displayEvents = events.filter(ev => ev.date === todayStr);
    const todayDate = new Date(); todayDate.setHours(0,0,0,0);
    const futureEvents = events
      .filter(ev => { const d = parseDate(ev.date); return d && d > todayDate; })
      .sort((a,b) => parseDate(a.date) - parseDate(b.date));
    const grouped = {};
    futureEvents.forEach(ev => { if (!grouped[ev.date]) grouped[ev.date]=[]; grouped[ev.date].push(ev); });
    const selectedEvents = selectedDay ? getDayEvents(selectedDay) : [];
    return (
      <div>
        {/* טאבים */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[{id:"today",label:"📅 היום"},{id:"future",label:"🗓 עתידיות"}].map(t => (
            <button key={t.id} onClick={() => setCalTab(t.id)}
              style={{ flex:1, padding:"9px", borderRadius:10, border:"none", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Heebo',sans-serif",
                background: calTab===t.id?"#0d1f3c":"#fff", color: calTab===t.id?"#fff":"#4a6070",
                boxShadow: calTab===t.id?"none":"0 1px 4px rgba(0,0,0,0.06)" }}>
              {t.label}{t.id==="future"&&futureEvents.length>0?` (${futureEvents.length})`:""}
            </button>
          ))}
        </div>
        {calTab === "future" ? (
          /* תצוגת פגישות עתידיות */
          <div>
            {futureEvents.length === 0 && (
              <div style={{ background:"#fff", borderRadius:16, padding:40, textAlign:"center", color:"#9ca3af", boxShadow:"0 1px 6px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize:32, marginBottom:8 }}>🗓</div>
                <div style={{ fontSize:14, fontWeight:700 }}>אין פגישות עתידיות</div>
                <button onClick={openMeet} style={{ marginTop:16, padding:"10px 20px", background:"#0d1f3c", color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Heebo',sans-serif" }}>+ קבע פגישה</button>
              </div>
            )}
            {Object.entries(grouped).map(([date, evs]) => {
              const d = parseDate(date); const [ddd,mmm] = date.split("/");
              const isTomorrow = (() => { const t=new Date(); t.setDate(t.getDate()+1); t.setHours(0,0,0,0); return d.getTime()===t.getTime(); })();
              return (
                <div key={date} style={{ background:"#fff", borderRadius:14, padding:16, marginBottom:10, boxShadow:"0 1px 6px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize:12, fontWeight:800, color:"#4a6070", marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ background:isTomorrow?"#0d1f3c":"#f0ede8", color:isTomorrow?"#fff":"#4a6070", padding:"2px 10px", borderRadius:20, fontSize:11 }}>
                      {isTomorrow?"מחר":`${HEB_DAYS[d.getDay()]}`}
                    </span>
                    <span>{ddd}/{mmm}/{date.split("/")[2]}</span>
                  </div>
                  {evs.map(ev => (
                    <div key={ev.id} onClick={() => setViewEvent(ev)}
                      style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 0", borderBottom:"1px solid rgba(0,0,0,0.04)", cursor:"pointer" }}
                      onMouseEnter={e=>e.currentTarget.style.background="#f8f9fb"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <div style={{ background:ev.color, color:"#fff", borderRadius:8, padding:"6px 10px", fontSize:13, fontWeight:900, flexShrink:0 }}>{ev.time}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:"#0d1f3c" }}>{ev.title}</div>
                        <div style={{ fontSize:11, color:"#9ca3af" }}>{ev.duration}{ev.contact?` · ${ev.contact}`:""}</div>
                      </div>
                      <span style={{ fontSize:11, color:"#9ca3af" }}>›</span>
                    </div>
                  ))}
                </div>
              );
            })}
            {futureEvents.length > 0 && <button onClick={openMeet} style={{ width:"100%", padding:"10px", background:"transparent", border:"2px dashed rgba(0,0,0,0.1)", borderRadius:10, fontSize:13, color:"#4a6070", cursor:"pointer", fontFamily:"'Heebo',sans-serif" }}>+ הוסף פגישה</button>}
          </div>
        ) : (
        /* תצוגת היום + לוח */
        <div style={{ display: "grid", gridTemplateColumns: mob()?"1fr":"1fr 1fr", gap: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0d1f3c", marginBottom: 14 }}>📅 הפגישות של היום</div>
            {displayEvents.length === 0 && <div style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "16px 0" }}>אין פגישות להיום</div>}
            {displayEvents.map(ev => (
              <div key={ev.id} onClick={() => setViewEvent(ev)}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid rgba(0,0,0,0.05)", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8f9fb"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ background: ev.color, color: "#fff", borderRadius: 8, padding: "8px 12px", textAlign: "center", flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 900 }}>{ev.time}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0d1f3c" }}>{ev.title}</div>
                  <div style={{ fontSize: 12, color: "#4a6070" }}>{ev.duration}{ev.contact ? ` · ${ev.contact}` : ""}</div>
                </div>
                <span style={{ fontSize: 16, color: "#9ca3af" }}>›</span>
              </div>
            ))}
            <button onClick={() => openMeet()} style={{ width: "100%", marginTop: 12, padding: "10px", background: "transparent", border: "2px dashed rgba(0,0,0,0.1)", borderRadius: 10, fontSize: 13, color: "#4a6070", cursor: "pointer", fontFamily: "'Heebo',sans-serif" }}>+ הוסף פגישה</button>
          </div>
          {/* לוח חודשי */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <button onClick={() => { if (calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1); setSelectedDay(null); }}
                style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#4a6070", padding:"0 4px" }}>›</button>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#0d1f3c" }}>{HEB_MONTHS[calMonth]} {calYear}</div>
              <button onClick={() => { if (calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1); setSelectedDay(null); }}
                style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#4a6070", padding:"0 4px" }}>‹</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:4 }}>
              {HEB_DAYS_SHORT.map(d => <div key={d} style={{ textAlign:"center", fontSize:10, fontWeight:700, color:"#9ca3af", padding:"2px 0" }}>{d}</div>)}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
              {cells.map((d, i) => {
                if (!d) return <div key={i} />;
                const dayEvents = getDayEvents(d);
                const isSelected = selectedDay === d;
                const isTodayDay = getDayStr(d) === todayStr;
                return (
                  <div key={i} onClick={() => setSelectedDay(isSelected ? null : d)}
                    style={{ textAlign:"center", padding:"4px 2px", borderRadius:8, cursor:"pointer",
                      background: isSelected?"#0d1f3c":isTodayDay?"#eff6ff":"transparent",
                      border: isTodayDay&&!isSelected?"1.5px solid #1e5fa8":"1.5px solid transparent" }}
                    onMouseEnter={e=>{if(!isSelected)e.currentTarget.style.background="#f0ede8";}}
                    onMouseLeave={e=>{if(!isSelected)e.currentTarget.style.background=isTodayDay?"#eff6ff":"transparent";}}>
                    <div style={{ fontSize:13, fontWeight:isTodayDay?800:400, color:isSelected?"#fff":isTodayDay?"#1e5fa8":"#0d1f3c" }}>{d}</div>
                    {dayEvents.length > 0 && (
                      <div style={{ display:"flex", justifyContent:"center", gap:2, marginTop:2 }}>
                        {dayEvents.slice(0,3).map((ev,j) => <div key={j} style={{ width:5, height:5, borderRadius:"50%", background:isSelected?"#fff":ev.color }} />)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {selectedDay && (
              <div style={{ marginTop:14, borderTop:"1px solid rgba(0,0,0,0.06)", paddingTop:12 }}>
                <div style={{ fontSize:12, fontWeight:800, color:"#0d1f3c", marginBottom:8 }}>
                  {selectedEvents.length > 0 ? `${selectedEvents.length} פגישות ב-${selectedDay}/${String(calMonth+1).padStart(2,"0")}` : `אין פגישות ב-${selectedDay}/${String(calMonth+1).padStart(2,"0")}`}
                </div>
                {selectedEvents.length === 0 && <button onClick={openMeet} style={{ width:"100%", padding:"8px", background:"transparent", border:"1.5px dashed rgba(0,0,0,0.1)", borderRadius:8, fontSize:12, color:"#4a6070", cursor:"pointer", fontFamily:"'Heebo',sans-serif" }}>+ הוסף פגישה</button>}
                {selectedEvents.map(ev => (
                  <div key={ev.id} onClick={() => setViewEvent(ev)}
                    style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid rgba(0,0,0,0.04)", cursor:"pointer" }}
                    onMouseEnter={e=>e.currentTarget.style.background="#f8f9fb"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <div style={{ background:ev.color, color:"#fff", borderRadius:6, padding:"4px 8px", fontSize:12, fontWeight:700, flexShrink:0 }}>{ev.time}</div>
                    <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:700, color:"#0d1f3c" }}>{ev.title}</div>{ev.contact&&<div style={{ fontSize:11, color:"#9ca3af" }}>{ev.contact}</div>}</div>
                    <span style={{ fontSize:14, color:"#9ca3af" }}>›</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )} {/* סוף else של today */}
      </div>
    );
  };

  // ── PAYMENTS ──
  const renderPayments = () => {
    const acts = [
      { id: "quote", label: "הצעת מחיר", icon: "📋", color: "#1e5fa8", desc: "שלח הצעת מחיר מקצועית" },
      { id: "request", label: "בקשת תשלום", icon: "💸", color: "#b89440", desc: "שלח תזכורת תשלום" },
    ];

    // Filter
    const filtered = payHistory.filter(p => {
      if (payStatusFilter !== "הכל" && p.status !== payStatusFilter) return false;
      if (payMonthFilter !== "הכל") {
        const [, mm, yyyy] = p.date.split("/");
        if (`${mm}/${yyyy}` !== payMonthFilter) return false;
      }
      return true;
    });

    // Available months from history
    const months = [...new Set(payHistory.map(p => {
      const [, mm, yyyy] = p.date.split("/");
      return `${mm}/${yyyy}`;
    }))].sort((a, b) => {
      const [am, ay] = a.split("/"); const [bm, by] = b.split("/");
      return (by - ay) || (bm - am);
    });

    const HEB_MONTHS = { "01":"ינואר","02":"פברואר","03":"מרץ","04":"אפריל","05":"מאי","06":"יוני","07":"יולי","08":"אוגוסט","09":"ספטמבר","10":"אוקטובר","11":"נובמבר","12":"דצמבר" };
    const monthLabel = (m) => { const [mm, yyyy] = m.split("/"); return `${HEB_MONTHS[mm]} ${yyyy}`; };

    // Summary — מותאם לסוג המסמך
    const totalPaid = filtered.filter(p => p.type === "request" && p.status === "שולם").reduce((s,p) => s+p.amount, 0);
    const totalPending = filtered.filter(p => p.type === "request" && p.status === "ממתין").reduce((s,p) => s+p.amount, 0);
    const totalOpenQuotes = filtered.filter(p => p.type === "quote" && p.status === "פתוח").length;

    const statusColor = s => s === "שולם" ? "#22c55e" : s === "סגור" ? "#64748b" : s === "פתוח" ? "#1e5fa8" : s === "ממתין" ? "#b89440" : "#c0614a";
    const statusBg = s => s === "שולם" ? "#f0fdf4" : s === "סגור" ? "#f1f5f9" : s === "פתוח" ? "#eff6ff" : s === "ממתין" ? "#fffbeb" : "#fef2f2";
    const statusOptions = (type) => type === "quote" ? ["פתוח","סגור"] : ["שולם","ממתין"];

    // Send and add to history
    return (
      <div style={{ direction: "rtl" }}>
        {/* Action buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
          {acts.map(a => (
            <div key={a.id} onClick={() => { setPayModal(a.id); setPaySent(false); setPayForm({ clientName:"", amount:"", description:"", dueDate:"" }); }}
              style={{ background: "#fff", borderRadius: 14, padding: "18px 16px", cursor: "pointer", border: `2px solid transparent`, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 12 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.transform = "none"; }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: a.color+"15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{a.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0d1f3c" }}>{a.label}</div>
                <div style={{ fontSize: 11, color: "#4a6070" }}>{a.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
          {[
            { label: "שולם", value: `₪${totalPaid.toLocaleString()}`, color: "#22c55e", bg: "#f0fdf4", icon: "✅" },
            { label: "ממתין לתשלום", value: `₪${totalPending.toLocaleString()}`, color: "#b89440", bg: "#fffbeb", icon: "⏳" },
            { label: "הצעות פתוחות", value: totalOpenQuotes, color: "#1e5fa8", bg: "#eff6ff", icon: "📋" },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: "12px 14px", border: `1.5px solid ${s.color}20` }}>
              <div style={{ fontSize: 10, color: s.color, fontWeight: 700, marginBottom: 4 }}>{s.icon} {s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#0d1f3c" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "12px 16px", marginBottom: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {/* Month filter */}
          <select value={payMonthFilter} onChange={e => setPayMonthFilter(e.target.value)}
            style={{ flex: 1, minWidth: 130, padding: "7px 10px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 12, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", background: payMonthFilter !== "הכל" ? "#0d1f3c" : "#f8f9fb", color: payMonthFilter !== "הכל" ? "#fff" : "#4a6070", cursor: "pointer", fontWeight: 700 }}>
            <option value="הכל">📅 כל התקופות</option>
            {months.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
          {/* Status filter */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {["הכל","שולם","ממתין","פתוח","סגור"].map(s => (
              <div key={s} onClick={() => setPayStatusFilter(s)}
                style={{ padding: "6px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                  background: payStatusFilter === s ? (s === "שולם" || s === "סגור" ? "#22c55e" : s === "ממתין" || s === "פתוח" ? "#b89440" : "#0d1f3c") : "#f0ede8",
                  color: payStatusFilter === s ? "#fff" : "#4a6070" }}>
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0d1f3c" }}>📄 היסטוריית מסמכים</div>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>{filtered.length} מסמכים</div>
          </div>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>אין מסמכים לתקופה זו</div>
            </div>
          )}
          {filtered.map((p, i) => (
            <div key={p.id} onClick={() => setPayDocModal(p)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: i < filtered.length-1 ? "1px solid rgba(0,0,0,0.05)" : "none", cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f8f9fb"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: p.type==="quote" ? "#1e5fa815" : "#b8944015", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                {p.type === "quote" ? "📋" : "💸"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0d1f3c" }}>{p.client}</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                  {p.type === "quote" ? "הצעת מחיר" : "בקשת תשלום"} · {p.date}
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 900, color: "#0d1f3c", flexShrink: 0 }}>₪{p.amount.toLocaleString()}</div>
              <div style={{ flexShrink: 0 }}>
                <select value={p.status}
                  onClick={e => e.stopPropagation()}
                  onChange={e => { e.stopPropagation(); setPayHistory(prev => prev.map(x => x.id === p.id ? { ...x, status: e.target.value } : x)); }}
                  style={{ padding: "4px 10px", borderRadius: 20, border: "none", fontSize: 11, fontWeight: 700, fontFamily: "'Heebo',sans-serif", cursor: "pointer", outline: "none", background: statusBg(p.status), color: statusColor(p.status) }}>
                  {statusOptions(p.type).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>

      </div>
    );
  };
  const renderAI = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "14px 20px", marginBottom: 12, display: "flex", alignItems: "center", gap: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#0d1f3c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🤖</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0d1f3c" }}>מזכירה AI</div>
          <div style={{ fontSize: 12, color: "#22c55e", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>פעילה
          </div>
        </div>
      </div>
      <div style={{ flex: 1, background: "#fff", borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
        <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
          {aiChat.map((m,i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role==="user"?"flex-end":"flex-start", marginBottom: 12 }}>
              <div style={{ background: m.role==="user"?"#1e5fa8":"#f0ede8", color: m.role==="user"?"#fff":"#0d1f3c", borderRadius: m.role==="user"?"12px 12px 2px 12px":"12px 12px 12px 2px", padding: "10px 14px", maxWidth: "75%", fontSize: 14, lineHeight: 1.5 }}>{m.text}</div>
            </div>
          ))}
          {aiLoading && <div style={{ display: "flex", gap: 6, padding: "8px 14px" }}>{[0,1,2].map(i=><div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#4a6070", opacity: 0.5, animation: "pulse 1s "+i*0.2+"s ease-in-out infinite" }}/>)}</div>}
        </div>
        <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            {["הוסף פגישה","תזכורת"].map(h=>(
              <span key={h} onClick={()=>setAiInput(h)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: "#f0ede8", cursor: "pointer", color: "#4a6070", fontWeight: 600 }}>{h}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendAI()} placeholder="כתוב פקודה..."
              style={{ flex: 1, padding: "10px 14px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10, fontSize: 14, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl" }} />
            <button onClick={sendAI} disabled={aiLoading} style={{ background: "#0d1f3c", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif" }}>שלח</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── STATS ──
  const renderStats = () => {
    const wl = [{label:"א'",value:4},{label:"ב'",value:7},{label:"ג'",value:5},{label:"ד'",value:9},{label:"ה'",value:6},{label:"ו'",value:3},{label:"ש'",value:8}];
    const mr = [{label:"ינו",value:18},{label:"פבר",value:24},{label:"מרץ",value:31},{label:"אפר",value:28},{label:"מאי",value:35},{label:"יוני",value:42}];
    const cd = [{label:"WhatsApp",value:42,color:"#25D366"},{label:"Instagram",value:28,color:"#E1306C"},{label:"Facebook",value:18,color:"#1877F2"},{label:"Email",value:12,color:"#3a8fe8"}];
    const fd = [{label:"נכנסו",value:87,color:"#1e5fa8"},{label:"בטיפול",value:54,color:"#b89440"},{label:"הצעה",value:31,color:"#f97316"},{label:"סגרו",value:23,color:"#22c55e"}];
    return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 20 }}>
          {[{l:"לידים החודש",v:"87",d:"+12%",c:"#1e5fa8",i:"👥"},{l:"אחוז סגירה",v:"26%",d:"+3%",c:"#22c55e",i:"🎯"},{l:"זמן תגובה",v:"4 דק'",d:"-1 דק'",c:"#b89440",i:"⚡"},{l:"הכנסה",v:"₪38,400",d:"+18%",c:"#c0614a",i:"💰"}].map(k=>(
            <div key={k.l} style={{ background: "#fff", borderRadius: 14, padding: "18px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderTop: "3px solid "+k.c }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{k.i}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#0d1f3c" }}>{k.v}</div>
              <div style={{ fontSize: 12, color: "#4a6070", marginTop: 4 }}>{k.l}</div>
              <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 700, marginTop: 4 }}>{k.d}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mob()?"1fr":"1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}><span style={{ fontSize: 14, fontWeight: 700, color: "#0d1f3c" }}>📈 לידים השבוע</span><span style={{ fontSize: 12, color: "#4a6070" }}>42 סה"כ</span></div>
            <BarChart data={wl} color="#1e5fa8" />
          </div>
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}><span style={{ fontSize: 14, fontWeight: 700, color: "#0d1f3c" }}>💰 הכנסות (אלפי ₪)</span><span style={{ fontSize: 12, color: "#22c55e", fontWeight: 700 }}>↑ 21%</span></div>
            <BarChart data={mr} color="#22c55e" />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mob()?"1fr":"1fr 1fr", gap: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0d1f3c", marginBottom: 16 }}>📡 מקורות לידים</div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <DonutChart segments={cd} />
              <div style={{ flex: 1 }}>
                {cd.map(c=>(
                  <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.color }} />
                    <div style={{ flex: 1, fontSize: 13, color: "#0d1f3c" }}>{c.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0d1f3c" }}>{c.value}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0d1f3c", marginBottom: 16 }}>🔽 משפך מכירות</div>
            {fd.map(f=>(
              <div key={f.label} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: "#0d1f3c", fontWeight: 600 }}>{f.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0d1f3c" }}>{f.value}</span>
                </div>
                <div style={{ height: 8, background: "#f0ede8", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 4, background: f.color, width: (f.value/fd[0].value*100)+"%" }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 12, padding: "10px 14px", background: "#f0fdf4", borderRadius: 10, fontSize: 13, color: "#22c55e", fontWeight: 700 }}>אחוז המרה: 26.4%</div>
          </div>
        </div>
      </div>
    );
  };

  // ── SETTINGS ──
  const renderSettings = () => {
    const intgs = [
      { id:"whatsapp", name:"WhatsApp Business", icon:"💬", color:"#25D366", desc:"קבל הודעות ולידים ישירות מ-WhatsApp" },
      { id:"instagram", name:"Instagram", icon:"📸", color:"#E1306C", desc:"ניהול DMs מ-Instagram" },
      { id:"facebook", name:"Facebook", icon:"👍", color:"#1877F2", desc:"ניהול הודעות מ-Facebook Page" },
      { id:"gmail", name:"Gmail", icon:"✉️", color:"#EA4335", desc:"כל המיילים ב-Inbox אחד" },
    ];
    const invIntgs = [
      { id:"icount", name:"iCount", icon:"📊", color:"#0057b8", desc:"פלטפורמת החשבוניות הפופולרית" },
      { id:"priority", name:"Priority", icon:"📋", color:"#e8542a", desc:"מערכת ERP ישראלית" },
      { id:"hashavshevet", name:"חשבשבת", icon:"📒", color:"#2d8a4e", desc:"תוכנת הנהלת חשבונות" },
    ];
    return (
      <div>
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0d1f3c", marginBottom: 16 }}>👤 פרופיל עסקי</div>
          <div style={{ display: "grid", gridTemplateColumns: mob()?"1fr":"1fr 1fr", gap: 14 }}>
            {[{l:"שם מלא",k:"name"},{l:"שם העסק",k:"business"},{l:"מייל",k:"email"},{l:"טלפון",k:"phone"}].map(f=>(
              <div key={f.k}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#4a6070", marginBottom: 6 }}>{f.l}</div>
                <input value={profile[f.k]} onChange={e => setProfile(p => ({ ...p, [f.k]: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid rgba(0,0,0,0.1)", borderRadius: 10, fontSize: 14, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", color: "#0d1f3c", boxSizing: "border-box" }} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#4a6070", marginBottom: 6 }}>📍 כתובת העסק</div>
            <input value={businessAddress} onChange={e => setBusinessAddress(e.target.value)} placeholder="רחוב הרצל 1, תל אביב"
              style={{ width: "100%", padding: "10px 14px", border: "1.5px solid rgba(0,0,0,0.1)", borderRadius: 10, fontSize: 14, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", color: "#0d1f3c", boxSizing: "border-box" }} />
            <div style={{ fontSize: 11, color: "#4a6070", marginTop: 4 }}>כתובת זו תישלח ללקוחות דרך "פעולות → שלח כתובת עסק"</div>
          </div>
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <button onClick={saveProfile} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#0d1f3c", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif" }}>שמור שינויים</button>
            {profileSaved && <span style={{ fontSize: 13, color: "#22c55e", fontWeight: 700 }}>✓ נשמר בהצלחה</span>}
            <button onClick={async () => { await logout(); router.push('/login'); }}
              style={{ padding: "10px 24px", borderRadius: 10, border: "1.5px solid #ef4444", background: "transparent", color: "#ef4444", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif", marginRight: "auto" }}>
              התנתק
            </button>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0d1f3c", marginBottom: 6 }}>🔗 חיבור ערוצים</div>
          <div style={{ fontSize: 13, color: "#4a6070", marginBottom: 16 }}>חבר ערוצים לקבלת הודעות ולידים</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {intgs.map(g=>(
              <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, border: "1.5px solid "+(connected[g.id]?g.color+"50":"rgba(0,0,0,0.08)"), background: connected[g.id]?g.color+"08":"#fff", flexWrap: "wrap" }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: g.color+"18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{g.icon}</div>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0d1f3c" }}>{g.name}</div>
                  <div style={{ fontSize: 12, color: "#4a6070" }}>{g.desc}</div>
                </div>
                {connected[g.id] ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a" }}/>מחובר</div>
                    <button onClick={async ()=>{
                      if(g.id==='whatsapp' && waModal.channelId){
                        try { await channelsApi.disconnect(waModal.channelId); } catch {}
                      }
                      setConnected(p=>({...p,[g.id]:false}));
                    }} style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid rgba(0,0,0,0.1)", background: "transparent", color: "#4a6070", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Heebo',sans-serif" }}>נתק</button>
                  </div>
                ) : (
                  <button onClick={()=>doConnect(g.id)} disabled={connecting===g.id}
                    style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: connecting===g.id?"#4a6070":g.color, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                    {connecting===g.id?<><div style={{ width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid white",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>מתחבר...</>:"חבר "+g.name}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0d1f3c", marginBottom: 6 }}>🧾 חיבור פלטפורמות חשבוניות</div>
          <div style={{ fontSize: 13, color: "#4a6070", marginBottom: 16 }}>חבר את תוכנת החשבוניות שלך</div>
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, filter: "blur(1.5px)", pointerEvents: "none" }}>
              {invIntgs.map(g=>(
                <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, border: "1.5px solid rgba(0,0,0,0.08)" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: g.color+"18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{g.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0d1f3c" }}>{g.name}</div>
                    <div style={{ fontSize: 12, color: "#4a6070" }}>{g.desc}</div>
                  </div>
                  <button style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: g.color, color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "'Heebo',sans-serif" }}>חבר</button>
                </div>
              ))}
            </div>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ background: "#4ab8f5", borderRadius: 30, padding: "12px 28px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 20px rgba(74,184,245,0.4)" }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#fff", animation: "pulse 1.5s ease-in-out infinite" }}/>
                <span style={{ fontSize: 17, fontWeight: 900, color: "#0d1f3c" }}>בקרוב</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0d1f3c", marginBottom: 14 }}>💳 החבילה שלי</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#0d1f3c", marginBottom: 4 }}>Flow Pro+</div>
              <div style={{ fontSize: 13, color: "#4a6070" }}>₪349/חודש · מתחדש ב-27.04.2026</div>
              <div style={{ fontSize: 12, color: "#22c55e", fontWeight: 700, marginTop: 4 }}>✓ ניסיון חינם – 11 ימים נותרו</div>
            </div>
            <button style={{ padding: "10px 20px", borderRadius: 10, border: "2px solid #0d1f3c", background: "transparent", color: "#0d1f3c", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif" }}>שנה חבילה</button>
          </div>
        </div>

        <div style={{ background: "#fff8f8", borderRadius: 16, padding: 20, border: "1.5px solid #fee2e2", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#c0614a", marginBottom: 8 }}>⚠️ אזור מסוכן</div>
          <div style={{ fontSize: 13, color: "#4a6070", marginBottom: 14 }}>מחיקת חשבון תסיר את כל הנתונים לצמיתות</div>
          <button style={{ padding: "9px 20px", borderRadius: 10, border: "1.5px solid #c0614a", background: "transparent", color: "#c0614a", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif" }}>מחק חשבון</button>
        </div>
      </div>
    );
  };

  // ── MEETING MODAL ──

  // ── SIDEBAR ──
  const SidebarContent = ({ mobile }) => (
    <>
      <div style={{ padding:"24px 20px 20px", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        {(mobile || !sidebarCollapsed) && (
          <div>
            <div style={{ fontSize:28, fontWeight:900, color:"#fff", letterSpacing:-1 }}>Flow</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:2 }}>ניהול עסקי חכם</div>
          </div>
        )}
        {mobile ? (
          <button onClick={()=>setSidebarOpen(false)} style={{ background:"rgba(255,255,255,0.08)", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.8)", fontSize:18 }}>✕</button>
        ) : (
          <button onClick={()=>setSidebarCollapsed(!sidebarCollapsed)} style={{ background:"rgba(255,255,255,0.08)", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.7)", fontSize:14, marginLeft:sidebarCollapsed?"auto":0, marginRight:sidebarCollapsed?"auto":0 }}>{sidebarCollapsed?"→":"←"}</button>
        )}
      </div>
      <nav style={{ padding:"16px 12px", flex:1 }}>
        {tabs.map(t=>(
          <div key={t.id} onClick={()=>{ setActiveTab(t.id); setSidebarOpen(false); }}
            style={{ display:"flex", alignItems:"center", gap:10, padding:(!mobile&&sidebarCollapsed)?"10px":"10px 12px", borderRadius:10, cursor:"pointer", marginBottom:4, background:activeTab===t.id?"rgba(255,255,255,0.1)":"transparent", color:activeTab===t.id?"#fff":"rgba(255,255,255,0.55)", fontSize:14, fontWeight:activeTab===t.id?700:400, justifyContent:(!mobile&&sidebarCollapsed)?"center":"flex-start", position:"relative" }}
            title={(!mobile&&sidebarCollapsed)?t.label:""}>
            <span style={{ fontSize:18 }}>{t.icon}</span>
            {(mobile||!sidebarCollapsed) && <span>{t.label}</span>}
            {(mobile||!sidebarCollapsed) && t.badge && <div style={{ position:"absolute", left:12, background:"#c0614a", color:"#fff", fontSize:10, fontWeight:700, width:18, height:18, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>{t.badge}</div>}
          </div>
        ))}
      </nav>
      <div style={{ padding:"16px 12px", borderTop:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", justifyContent:(!mobile&&sidebarCollapsed)?"center":"flex-start" }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:"#3a8fe8", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff", flexShrink:0 }}>נ</div>
          {(mobile||!sidebarCollapsed) && <div><div style={{ fontSize:13, fontWeight:700, color:"#fff" }}>נירו</div><div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>Pro+</div></div>}
        </div>
      </div>
    </>
  );

  // ── TASK MODAL ──
  const TaskModal = () => {
    if (!showTaskModal) return null;
    const save = () => {
      if (!taskForm.title.trim()) return;
      setTasks(prev => [...prev, { id: Date.now(), ...taskForm, status: "פתוח" }]);
      setShowTaskModal(false);
    };
    return (
      <div onClick={() => setShowTaskModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "20px 20px 16px", width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", direction: "rtl", maxHeight: "90vh", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#0d1f3c" }}>✅ צור משימה</div>
            <button onClick={() => setShowTaskModal(false)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#4a6070" }}>✕</button>
          </div>
          {taskForm.fromMsg && (
            <div style={{ background: "#f5f0e8", borderRadius: 10, padding: "10px 12px", marginBottom: 12, fontSize: 12, color: "#4a6070", borderRight: "3px solid #1e5fa8" }}>
              <div style={{ fontWeight: 700, marginBottom: 4, color: "#0d1f3c" }}>מתוך הודעה:</div>
              {taskForm.fromMsg}
            </div>
          )}
          {[{ k: "title", l: "נושא המשימה *", p: "לדוגמה: לשלוח הצעת מחיר" }, { k: "contact", l: "לקוח/ליד", p: "שם הלקוח" }].map(f => (
            <div key={f.k} style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#4a6070", marginBottom: 4, display: "block" }}>{f.l}</label>
              <input value={taskForm[f.k]} placeholder={f.p} onChange={e => setTaskForm(p => ({ ...p, [f.k]: e.target.value }))}
                style={{ width: "100%", padding: "8px 12px", border: "1.5px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 13, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", color: "#0d1f3c", boxSizing: "border-box" }} />
            </div>
          ))}
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#4a6070", marginBottom: 4, display: "block" }}>תאריך יעד</label>
            <DatePicker value={taskForm.due} onChange={v => setTaskForm(p => ({ ...p, due: v }))} placeholder="ללא תאריך" />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#4a6070", marginBottom: 4, display: "block" }}>עדיפות</label>
            <div style={{ display: "flex", gap: 6 }}>
              {TASK_PRIORITIES.map(p => (
                <div key={p} onClick={() => setTaskForm(prev => ({ ...prev, priority: p }))}
                  style={{ flex: 1, padding: "7px 4px", textAlign: "center", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700,
                    border: `2px solid ${taskForm.priority === p ? (p === "גבוהה" ? "#ef4444" : p === "בינונית" ? "#f97316" : "#4a6070") : "rgba(0,0,0,0.1)"}`,
                    background: taskForm.priority === p ? (p === "גבוהה" ? "#fee2e2" : p === "בינונית" ? "#ffedd5" : "#f3f4f6") : "transparent",
                    color: taskForm.priority === p ? (p === "גבוהה" ? "#ef4444" : p === "בינונית" ? "#f97316" : "#4a6070") : "#4a6070" }}>
                  {p === "גבוהה" ? "🔴" : p === "בינונית" ? "🟠" : "⚪"} {p}
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#4a6070", marginBottom: 4, display: "block" }}>הערות</label>
            <textarea value={taskForm.notes} onChange={e => setTaskForm(p => ({ ...p, notes: e.target.value }))} placeholder="הערות נוספות..." rows={2}
              style={{ width: "100%", padding: "8px 12px", border: "1.5px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 13, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", color: "#0d1f3c", resize: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setShowTaskModal(false)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid rgba(0,0,0,0.1)", background: "transparent", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif", color: "#4a6070" }}>ביטול</button>
            <button onClick={save} style={{ flex: 2, padding: "10px", borderRadius: 10, border: "none", background: "#0d1f3c", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif" }}>צור משימה</button>
          </div>
        </div>
      </div>
    );
  };

  // ── MSG CONTEXT MENU ──
  const MsgContextMenu = () => {
    if (!msgContextMenu) return null;
    const { x, y, msgText, contact, channel, fromMe } = msgContextMenu;
    const top = Math.min(y, window.innerHeight - 300);
    const right = window.innerWidth - Math.min(x + 200, window.innerWidth - 10);
    return (
      <div onClick={() => setMsgContextMenu(null)} style={{ position: "fixed", inset: 0, zIndex: 150 }}>
        <div onClick={e => e.stopPropagation()} style={{ position: "fixed", top, right, background: "#fff", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", padding: 6, minWidth: 200, direction: "rtl", zIndex: 151, border: "1px solid rgba(0,0,0,0.06)" }}>
          {/* פעולות */}
          <div onClick={() => { openMeet(contact); setMsgContextMenu(null); }}
            style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "#0d1f3c", cursor: "pointer", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}
            onMouseEnter={e => e.currentTarget.style.background = "#f5f0e8"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            📅 קבע פגישה
          </div>
          <div onClick={() => { setPayModal("quote"); setPaySent(false); setPayForm({ clientName: contact, amount: "", description: "", dueDate: "" }); setMsgContextMenu(null); }}
            style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "#0d1f3c", cursor: "pointer", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}
            onMouseEnter={e => e.currentTarget.style.background = "#f5f0e8"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            📋 הגשת הצעת מחיר
          </div>
          <div onClick={() => { setPayModal("request"); setPaySent(false); setPayForm({ clientName: contact, amount: "", description: "", dueDate: "" }); setMsgContextMenu(null); }}
            style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "#0d1f3c", cursor: "pointer", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}
            onMouseEnter={e => e.currentTarget.style.background = "#f5f0e8"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            💸 בקשה לתשלום
          </div>
          <div onClick={() => { setTaskSidePanel({ msgText, contact, channel }); setMsgContextMenu(null); }}
            style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "#0d1f3c", cursor: "pointer", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}
            onMouseEnter={e => e.currentTarget.style.background = "#f5f0e8"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            ✅ הפוך למשימה
          </div>
          <div onClick={() => {
            setChatMessages(prev => ({ ...prev, [activeMessage.id]: [...(prev[activeMessage.id] || []), { from: "me", type: "contact", business: profile.business, phone: profile.phone, email: profile.email, address: businessAddress }] }));
            setMsgContextMenu(null);
          }}
            style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "#0d1f3c", cursor: "pointer", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}
            onMouseEnter={e => e.currentTarget.style.background = "#f5f0e8"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            📇 שלח פרטי קשר
          </div>
          <div style={{ height: 1, background: "rgba(0,0,0,0.06)", margin: "4px 8px" }} />
          {/* AI */}
          <div onClick={async () => {
            setMsgContextMenu(null);
            setAiSuggestLoading(true);
            setAiSuggestText("");
            try {
              const res = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  model: "claude-sonnet-4-20250514", max_tokens: 200,
                  system: "אתה עוזר CRM ישראלי. כתוב תשובה קצרה ומקצועית בעברית להודעה הזו. רק את התשובה, בלי הסברים.",
                  messages: [{ role: "user", content: `הודעה: "${msgText}"\nכתוב תשובה מתאימה.` }]
                })
              });
              const data = await res.json();
              setAiSuggestText(data.content?.[0]?.text || "");
            } catch { setAiSuggestText("שגיאת חיבור."); }
            setAiSuggestLoading(false);
          }}
            style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "#1e5fa8", cursor: "pointer", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}
            onMouseEnter={e => e.currentTarget.style.background = "#f0f4ff"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            🤖 הצע תשובה מ-AI
          </div>
          <div onClick={() => { setMsgContextMenu(null); alert("תמלול קולי: בממשק האמיתי ישלח קובץ האודיו ל-Whisper API לתמלול בעברית."); }}
            style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "#b89440", cursor: "pointer", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}
            onMouseEnter={e => e.currentTarget.style.background = "#fffbeb"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            🎤 תמלל הודעה קולית
          </div>
          <div style={{ height: 1, background: "rgba(0,0,0,0.06)", margin: "4px 8px" }} />
          <div onClick={() => setMsgContextMenu(null)}
            style={{ padding: "8px 14px", fontSize: 12, color: "#9ca3af", cursor: "pointer", borderRadius: 8 }}
            onMouseEnter={e => e.currentTarget.style.background = "#f5f0e8"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            ✕ סגור
          </div>
        </div>
      </div>
    );
  };

  // ── AI SUGGEST OVERLAY ──
  const AiSuggestOverlay = () => {
    if (!aiSuggestLoading && !aiSuggestText) return null;
    const [inputRef, setInputRef] = React.useState(aiSuggestText);
    return (
      <div onClick={() => { setAiSuggestText(""); setAiSuggestLoading(false); }} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 0 80px" }}>
        <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 20, width: "min(500px,90vw)", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", direction: "rtl" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 20 }}>🤖</span>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0d1f3c" }}>תשובה מוצעת מ-AI</div>
          </div>
          {aiSuggestLoading ? (
            <div style={{ display: "flex", gap: 6, padding: "12px 0", justifyContent: "center" }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#1e5fa8", opacity: 0.5, animation: `pulse 1s ${i*0.2}s ease-in-out infinite` }} />)}
            </div>
          ) : (
            <>
              <textarea value={inputRef} onChange={e => setInputRef(e.target.value)} rows={3}
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #1e5fa8", borderRadius: 10, fontSize: 14, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", resize: "none", boxSizing: "border-box", marginBottom: 12 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setAiSuggestText(""); setAiSuggestLoading(false); }}
                  style={{ flex: 1, padding: "10px", border: "1.5px solid rgba(0,0,0,0.1)", borderRadius: 10, background: "transparent", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif", color: "#4a6070" }}>ביטול</button>
                <button onClick={() => {
                  setChatMessages(prev => ({ ...prev, [activeMessage.id]: [...(prev[activeMessage.id] || []), { from: "me", type: "text", text: inputRef }] }));
                  setAiSuggestText(""); setAiSuggestLoading(false);
                }}
                  style={{ flex: 2, padding: "10px", border: "none", borderRadius: 10, background: "#1e5fa8", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif" }}>שלח תשובה</button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // ── TASK SIDE PANEL ──
  const TaskSidePanel = () => {
    if (!taskSidePanel) return null;
    const [form, setForm] = React.useState({ title: taskSidePanel.msgText.slice(0, 60), contact: taskSidePanel.contact, priority: "בינונית", due: "", notes: taskSidePanel.msgText });
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 200 }} onClick={() => setTaskSidePanel(null)}>
        <div onClick={e => e.stopPropagation()} style={{
          position: "fixed", top: 0, left: 0, bottom: 0, width: "min(360px,90vw)",
          background: "#fff", boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
          display: "flex", flexDirection: "column", direction: "rtl", zIndex: 201,
          animation: "slideIn 0.25s ease"
        }}>
          <style>{`@keyframes slideIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}`}</style>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#0d1f3c" }}>✅ משימה חדשה</div>
            <button onClick={() => setTaskSidePanel(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#4a6070" }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            {/* מתוך הודעה */}
            <div style={{ background: "#f5f0e8", borderRadius: 10, padding: "10px 12px", borderRight: "3px solid #1e5fa8", fontSize: 12, color: "#4a6070", lineHeight: 1.5 }}>
              💬 {taskSidePanel.msgText.length > 80 ? taskSidePanel.msgText.slice(0,80)+"..." : taskSidePanel.msgText}
            </div>
            {[
              { l: "כותרת המשימה", k: "title", type: "input" },
              { l: "קשור ל", k: "contact", type: "input" },
              { l: "הערות", k: "notes", type: "textarea" },
            ].map(f => (
              <div key={f.k}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#4a6070", marginBottom: 5 }}>{f.l}</div>
                {f.type === "textarea" ? (
                  <textarea value={form[f.k]||""} onChange={e => setForm(p => ({...p,[f.k]:e.target.value}))} rows={3}
                    style={{ width: "100%", padding: "9px 12px", border: "1.5px solid rgba(0,0,0,0.1)", borderRadius: 10, fontSize: 13, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", resize: "none", boxSizing: "border-box" }} />
                ) : (
                  <input value={form[f.k]||""} onChange={e => setForm(p => ({...p,[f.k]:e.target.value}))} placeholder={f.placeholder||""}
                    style={{ width: "100%", padding: "9px 12px", border: "1.5px solid rgba(0,0,0,0.1)", borderRadius: 10, fontSize: 13, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", boxSizing: "border-box" }} />
                )}
              </div>
            ))}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#4a6070", marginBottom: 5 }}>תאריך יעד</div>
              <DatePicker value={form.due} onChange={v => setForm(p => ({...p, due: v}))} placeholder="ללא תאריך" />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#4a6070", marginBottom: 5 }}>עדיפות</div>
              <div style={{ display: "flex", gap: 6 }}>
                {["גבוהה","בינונית","נמוכה"].map(p => (
                  <div key={p} onClick={() => setForm(f => ({...f,priority:p}))}
                    style={{ flex: 1, textAlign: "center", padding: "7px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
                      background: form.priority===p ? (p==="גבוהה"?"#fef2f2":p==="בינונית"?"#fefce8":"#f0fdf4") : "#f8f9fb",
                      color: form.priority===p ? (p==="גבוהה"?"#dc2626":p==="בינונית"?"#ca8a04":"#16a34a") : "#6b7280",
                      border: `1.5px solid ${form.priority===p ? (p==="גבוהה"?"#fecaca":p==="בינונית"?"#fde68a":"#bbf7d0") : "transparent"}` }}>
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <button onClick={() => {
              if (!form.title.trim()) return;
              setTasks(prev => [...prev, { id: Date.now(), title: form.title, contact: form.contact, priority: form.priority, status: "פתוח", due: form.due || "ללא תאריך", fromMsg: taskSidePanel.msgText, channel: taskSidePanel.channel }]);
              setTaskSidePanel(null);
            }} style={{ width: "100%", padding: "12px", background: "#0d1f3c", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif" }}>
              שמור משימה ✓
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── TASKS ──
  const renderTasks = () => {
    const prioOrder = { "גבוהה": 0, "בינונית": 1, "נמוכה": 2 };
    const dueOrder = (d) => d === "היום" ? 0 : d === "מחר" ? 1 : d === "ללא תאריך" ? 99 : 2;

    const base = tasks.filter(t => {
      if (taskFilter !== "הכל" && t.status !== taskFilter) return false;
      if (taskPrioFilter !== "הכל" && t.priority !== taskPrioFilter) return false;
      if (taskTeamFilter !== "הכל" && !(t.assignedTo || []).includes(taskTeamFilter)) return false;
      if (taskSearch && !t.title?.includes(taskSearch) && !t.contact?.includes(taskSearch)) return false;
      return true;
    });

    const sorted = [...base].sort((a, b) => {
      if (taskSort === "priority") return (prioOrder[a.priority] ?? 1) - (prioOrder[b.priority] ?? 1);
      if (taskSort === "due") return dueOrder(a.due) - dueOrder(b.due);
      if (taskSort === "status") return a.status.localeCompare(b.status);
      return 0;
    });

    const open = tasks.filter(t => t.status !== "הושלם").length;
    const today = tasks.filter(t => t.due === "היום" && t.status !== "הושלם").length;

    const prioColor = p => p === "גבוהה" ? "#ef4444" : p === "בינונית" ? "#f97316" : "#4a6070";
    const prioBg = p => p === "גבוהה" ? "#fef2f2" : p === "בינונית" ? "#fff7ed" : "#f8f9fb";
    const statusColor = s => s === "הושלם" ? "#22c55e" : s === "בטיפול" ? "#1e5fa8" : "#f97316";
    const statusBg = s => s === "הושלם" ? "#dcfce7" : s === "בטיפול" ? "#dbeafe" : "#fff7ed";
    const dueColor = d => d === "היום" ? "#ef4444" : d === "אתמול" ? "#dc2626" : "#4a6070";

    const startEdit = (task) => { setEditingTask(task.id); setEditDraft({ title: task.title, contact: task.contact, due: task.due, priority: task.priority, notes: task.notes || "" }); };
    const saveEdit = (id) => { setTasks(p => p.map(t => t.id === id ? { ...t, ...editDraft } : t)); setEditingTask(null); };

    const renderTaskCard = (task) => {
      const isEditing = editingTask === task.id;
      const assignedUsers = (task.assignedTo || []).map(id => team.find(u => u.id === id)).filter(Boolean);
      return (
        <div key={task.id} onClick={() => !isEditing && setOpenTaskPanel(task.id)}
          style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", borderRight: `4px solid ${prioColor(task.priority)}`, opacity: task.status === "הושלם" ? 0.65 : 1, transition: "all 0.2s", cursor: isEditing ? "default" : "pointer" }}
          onMouseEnter={e => { if (!isEditing) e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.06)"; }}>
          {isEditing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input value={editDraft.title} onChange={e => setEditDraft(p => ({...p, title: e.target.value}))}
                style={{ padding: "8px 10px", border: "1.5px solid #1e5fa8", borderRadius: 8, fontSize: 14, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", fontWeight: 700 }} />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input value={editDraft.contact} onChange={e => setEditDraft(p => ({...p, contact: e.target.value}))} placeholder="קשור ל..."
                  style={{ flex: 1, padding: "6px 10px", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 8, fontSize: 12, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl" }} />
                <DatePicker value={editDraft.due} onChange={v => setEditDraft(p => ({...p, due: v}))} placeholder="ללא תאריך" />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["גבוהה","בינונית","נמוכה"].map(p => (
                  <div key={p} onClick={() => setEditDraft(f => ({...f, priority: p}))}
                    style={{ flex: 1, textAlign: "center", padding: "5px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer",
                      background: editDraft.priority === p ? prioBg(p) : "#f8f9fb",
                      color: editDraft.priority === p ? prioColor(p) : "#9ca3af",
                      border: `1.5px solid ${editDraft.priority === p ? prioColor(p)+"40" : "transparent"}` }}>{p}</div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                <button onClick={() => saveEdit(task.id)} style={{ flex: 2, padding: "7px", background: "#0d1f3c", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif" }}>שמור</button>
                <button onClick={() => setEditingTask(null)} style={{ flex: 1, padding: "7px", background: "#f3f4f6", color: "#6b7280", border: "none", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "'Heebo',sans-serif" }}>ביטול</button>
                <button onClick={() => { setTasks(p => p.filter(t => t.id !== task.id)); setEditingTask(null); }} style={{ flex: 1, padding: "7px", background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "'Heebo',sans-serif" }}>מחק</button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div onClick={() => setTasks(p => p.map(t => t.id === task.id ? { ...t, status: t.status === "הושלם" ? "פתוח" : "הושלם" } : t))}
                style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${task.status === "הושלם" ? "#22c55e" : "rgba(0,0,0,0.2)"}`, background: task.status === "הושלם" ? "#22c55e" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginTop: 2, transition: "all 0.15s" }}>
                {task.status === "הושלם" && <span style={{ color: "#fff", fontSize: 12, lineHeight: 1 }}>✓</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0d1f3c", marginBottom: 5, textDecoration: task.status === "הושלם" ? "line-through" : "none", lineHeight: 1.4 }}>{task.title}</div>
                {task.fromMsg && (
                  <div style={{ fontSize: 11, color: "#4a6070", background: "#f5f0e8", borderRadius: 6, padding: "3px 8px", marginBottom: 6, borderRight: "2px solid #1e5fa8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    💬 {task.fromMsg.length > 45 ? task.fromMsg.slice(0,45)+"..." : task.fromMsg}
                  </div>
                )}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  {task.contact && <span style={{ fontSize: 11, color: "#4a6070", background: "#f0f4ff", padding: "2px 8px", borderRadius: 10 }}>👤 {task.contact}</span>}
                  {task.due && <span style={{ fontSize: 11, fontWeight: 600, color: dueColor(task.due), background: task.due === "היום" ? "#fef2f2" : "#f8f9fb", padding: "2px 8px", borderRadius: 10 }}>📅 {task.due}</span>}
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: statusBg(task.status), color: statusColor(task.status) }}>{task.status}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: prioBg(task.priority), color: prioColor(task.priority) }}>{task.priority}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4, flexShrink: 0, alignItems: "center" }}>
                {assignedUsers.length > 0 && (
                  <div style={{ display: "flex", marginLeft: 4 }}>
                    {assignedUsers.map((u, i) => (
                      <div key={u.id} style={{ width: 22, height: 22, borderRadius: "50%", background: u.color, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", marginRight: i > 0 ? -6 : 0 }}>{u.avatar}</div>
                    ))}
                  </div>
                )}
                <button onClick={e => { e.stopPropagation(); startEdit(task); }} style={{ background: "#f8f9fb", border: "none", borderRadius: 8, padding: "6px 8px", fontSize: 12, cursor: "pointer", color: "#4a6070" }}>✏️</button>
                {task.status !== "הושלם" && (
                  <button onClick={e => { e.stopPropagation(); setTasks(p => p.map(t => t.id === task.id ? { ...t, status: t.status === "פתוח" ? "בטיפול" : "הושלם" } : t)); }}
                    style={{ background: "#0d1f3c", color: "#fff", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif", whiteSpace: "nowrap" }}>
                    {task.status === "פתוח" ? "▶" : "✓"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      );
    };

    const renderKanbanCol = (status, label, color, bg) => {
      const col = sorted.filter(t => t.status === status);
      return (
        <div key={status} style={{ flex: 1, minWidth: 240, background: bg, borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: "#0d1f3c" }}>{label}</span>
            <span style={{ fontSize: 11, color: "#9ca3af", marginRight: "auto" }}>{col.length}</span>
          </div>
          {col.map(task => renderTaskCard(task))}
          {col.length === 0 && <div style={{ textAlign: "center", padding: "20px 0", fontSize: 12, color: "#c4c9d4" }}>אין משימות</div>}
        </div>
      );
    };

    return (
      <div style={{ direction: "rtl" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#0d1f3c" }}>משימות</div>
            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: "#4a6070" }}>{open} פתוחות</span>
              {today > 0 && <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 700 }}>🔥 {today} להיום</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* Toggle view */}
            <div style={{ display: "flex", background: "#f0ede8", borderRadius: 10, padding: 3, gap: 2 }}>
              {[{ v: "list", icon: "☰" }, { v: "kanban", icon: "⊞" }].map(({ v, icon }) => (
                <button key={v} onClick={() => setTaskView(v)} style={{ padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "'Heebo',sans-serif", fontSize: 14, fontWeight: 700, background: taskView === v ? "#fff" : "transparent", color: taskView === v ? "#0d1f3c" : "#9ca3af", boxShadow: taskView === v ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition: "all 0.15s" }}>{icon}</button>
              ))}
            </div>
            <button onClick={() => { setTaskForm({ title: "", contact: "", priority: "בינונית", due: "", notes: "", fromMsg: "", channel: "" }); setShowTaskModal(true); }}
              style={{ background: "#0d1f3c", color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
              + משימה חדשה
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "12px 16px", marginBottom: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: 160 }}>
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#9ca3af" }}>🔍</span>
            <input value={taskSearch} onChange={e => setTaskSearch(e.target.value)} placeholder="חפש משימה..."
              style={{ width: "100%", padding: "7px 32px 7px 10px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 13, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", boxSizing: "border-box" }} />
          </div>

          {mob() ? (
            /* מובייל — dropdowns */
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", width: "100%" }}>
              {/* Status dropdown */}
              <select value={taskFilter} onChange={e => setTaskFilter(e.target.value)}
                style={{ flex: 1, padding: "7px 10px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10, fontSize: 12, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", background: taskFilter !== "הכל" ? "#0d1f3c" : "#f8f9fb", color: taskFilter !== "הכל" ? "#fff" : "#4a6070", cursor: "pointer", fontWeight: 700 }}>
                <option value="הכל">סטטוס: הכל</option>
                {["פתוח","בטיפול","הושלם"].map(s => <option key={s} value={s}>סטטוס: {s} ({tasks.filter(t=>t.status===s).length})</option>)}
              </select>
              {/* Priority dropdown */}
              <select value={taskPrioFilter} onChange={e => setTaskPrioFilter(e.target.value)}
                style={{ flex: 1, padding: "7px 10px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10, fontSize: 12, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", background: taskPrioFilter !== "הכל" ? "#0d1f3c" : "#f8f9fb", color: taskPrioFilter !== "הכל" ? "#fff" : "#4a6070", cursor: "pointer", fontWeight: 700 }}>
                <option value="הכל">עדיפות: הכל</option>
                {["גבוהה","בינונית","נמוכה"].map(p => <option key={p} value={p}>עדיפות: {p}</option>)}
              </select>
              {/* Team dropdown */}
              <select value={taskTeamFilter} onChange={e => setTaskTeamFilter(e.target.value)}
                style={{ flex: 1, padding: "7px 10px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10, fontSize: 12, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", background: taskTeamFilter !== "הכל" ? "#0d1f3c" : "#f8f9fb", color: taskTeamFilter !== "הכל" ? "#fff" : "#4a6070", cursor: "pointer", fontWeight: 700 }}>
                <option value="הכל">צוות: כולם</option>
                {team.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              {/* Sort dropdown */}
              <select value={taskSort} onChange={e => setTaskSort(e.target.value)}
                style={{ flex: 1, padding: "7px 10px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10, fontSize: 12, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", background: "#f8f9fb", color: "#4a6070", cursor: "pointer", fontWeight: 700 }}>
                <option value="due">מיין: תאריך</option>
                <option value="priority">מיין: עדיפות</option>
                <option value="status">מיין: סטטוס</option>
              </select>
            </div>
          ) : (
            /* דסקטופ — כפתורים */
            <>
              <div style={{ display: "flex", gap: 4 }}>
                {["הכל","פתוח","בטיפול","הושלם"].map(f => (
                  <div key={f} onClick={() => setTaskFilter(f)} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", background: taskFilter === f ? "#0d1f3c" : "#f0ede8", color: taskFilter === f ? "#fff" : "#4a6070", transition: "all 0.15s" }}>
                    {f}{f !== "הכל" && <span style={{ opacity: 0.6, marginRight: 3 }}>({tasks.filter(t=>t.status===f).length})</span>}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {["הכל","גבוהה","בינונית","נמוכה"].map(p => (
                  <div key={p} onClick={() => setTaskPrioFilter(p)} style={{ padding: "5px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: "pointer", background: taskPrioFilter === p ? (p === "גבוהה" ? "#ef4444" : p === "בינונית" ? "#f97316" : p === "נמוכה" ? "#4a6070" : "#0d1f3c") : "#f0ede8", color: taskPrioFilter === p ? "#fff" : "#4a6070", transition: "all 0.15s" }}>{p}</div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {["הכל", ...team.map(u => u.id)].map(id => {
                  const u = team.find(x => x.id === id);
                  return (
                    <div key={id} onClick={() => setTaskTeamFilter(id)}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.15s", background: taskTeamFilter === id ? (u ? u.color : "#0d1f3c") : "#f0ede8", color: taskTeamFilter === id ? "#fff" : "#4a6070" }}>
                      {u && <div style={{ width: 14, height: 14, borderRadius: "50%", background: taskTeamFilter === id ? "rgba(255,255,255,0.4)" : u.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 700, color: "#fff" }}>{u.avatar}</div>}
                      {id === "הכל" ? "כולם" : u?.name}
                    </div>
                  );
                })}
              </div>
              <select value={taskSort} onChange={e => setTaskSort(e.target.value)} style={{ padding: "6px 10px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 12, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", background: "#fff", cursor: "pointer" }}>
                <option value="due">מיין: תאריך</option>
                <option value="priority">מיין: עדיפות</option>
                <option value="status">מיין: סטטוס</option>
              </select>
            </>
          )}
        </div>

        {/* List view */}
        {taskView === "list" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sorted.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#4a6070" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>אין משימות כאן</div>
              </div>
            )}
            {sorted.map(task => renderTaskCard(task))}
          </div>
        )}

        {/* Kanban view */}
        {taskView === "kanban" && (
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
            {renderKanbanCol("פתוח", "פתוח", "#f97316", "#fff7ed")}
            {renderKanbanCol("בטיפול", "בטיפול", "#1e5fa8", "#eff6ff")}
            {renderKanbanCol("הושלם", "הושלם", "#22c55e", "#f0fdf4")}
          </div>
        )}
      </div>
    );
  };

  // ── TASK PANEL ──
  const TaskPanel = () => {
    const task = tasks.find(t => t.id === openTaskPanel);
    if (!task) return null;
    const [newSubtask, setNewSubtask] = React.useState("");
    const comments = taskComments[task.id] || [];
    const prioColor = p => p === "גבוהה" ? "#ef4444" : p === "בינונית" ? "#f97316" : "#4a6070";
    const statusColor = s => s === "הושלם" ? "#22c55e" : s === "בטיפול" ? "#1e5fa8" : "#f97316";

    const updateTask = (field, val) => setTasks(p => p.map(t => t.id === task.id ? { ...t, [field]: val } : t));
    const toggleAssign = (uid) => {
      const current = task.assignedTo || [];
      const next = current.includes(uid) ? current.filter(x => x !== uid) : [...current, uid];
      updateTask("assignedTo", next);
    };
    const addSubtask = () => {
      if (!newSubtask.trim()) return;
      updateTask("subtasks", [...(task.subtasks||[]), { id: Date.now(), text: newSubtask, done: false }]);
      setNewSubtask("");
    };
    const toggleSubtask = (sid) => updateTask("subtasks", (task.subtasks||[]).map(s => s.id === sid ? { ...s, done: !s.done } : s));
    const addComment = () => {
      if (!taskPanelComment.trim()) return;
      setTaskComments(p => ({ ...p, [task.id]: [...(p[task.id]||[]), { id: Date.now(), text: taskPanelComment, time: "עכשיו", author: "נירו" }] }));
      setTaskPanelComment("");
    };

    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 200 }} onClick={() => setOpenTaskPanel(null)}>
        <div onClick={e => e.stopPropagation()} style={{
          position: "fixed", top: 0, left: 0, bottom: 0, width: "min(480px,95vw)",
          background: "#fff", boxShadow: "-4px 0 32px rgba(0,0,0,0.12)",
          display: "flex", flexDirection: "column", direction: "rtl", zIndex: 201,
          animation: "slideInLeft 0.25s ease"
        }}>
          <style>{`@keyframes slideInLeft{from{transform:translateX(-100%)}to{transform:translateX(0)}}`}</style>

          {/* Header */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0,0,0,0.07)", display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div onClick={() => updateTask("status", task.status === "הושלם" ? "פתוח" : "הושלם")}
              style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${task.status === "הושלם" ? "#22c55e" : "rgba(0,0,0,0.2)"}`, background: task.status === "הושלם" ? "#22c55e" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginTop: 2 }}>
              {task.status === "הושלם" && <span style={{ color: "#fff", fontSize: 13, lineHeight: 1 }}>✓</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div contentEditable suppressContentEditableWarning
                onBlur={e => updateTask("title", e.target.textContent)}
                style={{ fontSize: 17, fontWeight: 800, color: "#0d1f3c", outline: "none", lineHeight: 1.4, textDecoration: task.status === "הושלם" ? "line-through" : "none", cursor: "text" }}>
                {task.title}
              </div>
            </div>
            <button onClick={() => setOpenTaskPanel(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9ca3af", padding: 0, flexShrink: 0 }}>✕</button>
          </div>

          {/* Meta pills */}
          <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {/* Status */}
            <select value={task.status} onChange={e => updateTask("status", e.target.value)}
              style={{ padding: "5px 10px", borderRadius: 20, border: "none", fontSize: 12, fontWeight: 700, fontFamily: "'Heebo',sans-serif", cursor: "pointer", outline: "none", background: statusColor(task.status)+"18", color: statusColor(task.status) }}>
              {["פתוח","בטיפול","הושלם"].map(s => <option key={s}>{s}</option>)}
            </select>
            {/* Priority */}
            <select value={task.priority} onChange={e => updateTask("priority", e.target.value)}
              style={{ padding: "5px 10px", borderRadius: 20, border: "none", fontSize: 12, fontWeight: 700, fontFamily: "'Heebo',sans-serif", cursor: "pointer", outline: "none", background: prioColor(task.priority)+"18", color: prioColor(task.priority) }}>
              {["גבוהה","בינונית","נמוכה"].map(p => <option key={p}>{p}</option>)}
            </select>
            {/* Due */}
            <DatePicker value={task.due} onChange={v => updateTask("due", v)} placeholder="ללא תאריך" />
            {/* Contact */}
            <input value={task.contact || ""} onChange={e => updateTask("contact", e.target.value)} placeholder="קשור ל..."
              style={{ padding: "5px 10px", borderRadius: 20, border: "1px solid rgba(0,0,0,0.1)", fontSize: 12, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", background: "#f8f9fb" }} />
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Description */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", marginBottom: 6 }}>תיאור</div>
              <textarea value={task.description || ""} onChange={e => updateTask("description", e.target.value)}
                placeholder="לחץ להוספת תיאור..."
                rows={3} style={{ width: "100%", padding: "10px 12px", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10, fontSize: 13, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", resize: "none", background: "#f8f9fb", boxSizing: "border-box", color: "#374151" }} />
            </div>

            {/* Assigned to */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", marginBottom: 8 }}>👥 משויך ל</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {team.map(u => {
                  const assigned = (task.assignedTo || []).includes(u.id);
                  return (
                    <div key={u.id} onClick={() => toggleAssign(u.id)}
                      style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 12px", borderRadius: 20, cursor: "pointer", border: `1.5px solid ${assigned ? u.color : "rgba(0,0,0,0.1)"}`, background: assigned ? u.color+"15" : "#f8f9fb", transition: "all 0.15s" }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: u.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>{u.avatar}</div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: assigned ? u.color : "#4a6070" }}>{u.name}</span>
                      {assigned && <span style={{ fontSize: 11, color: u.color }}>✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sub-tasks */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", marginBottom: 8 }}>תת-משימות</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                {(task.subtasks || []).map(s => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#f8f9fb", borderRadius: 8 }}>
                    <div onClick={() => toggleSubtask(s.id)}
                      style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${s.done ? "#22c55e" : "rgba(0,0,0,0.2)"}`, background: s.done ? "#22c55e" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                      {s.done && <span style={{ color: "#fff", fontSize: 10, lineHeight: 1 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 13, color: "#374151", textDecoration: s.done ? "line-through" : "none", flex: 1 }}>{s.text}</span>
                    <button onClick={() => updateTask("subtasks", (task.subtasks||[]).filter(x => x.id !== s.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 12, padding: 0 }}>✕</button>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <input value={newSubtask} onChange={e => setNewSubtask(e.target.value)} onKeyDown={e => e.key === "Enter" && addSubtask()} placeholder="הוסף תת-משימה..."
                  style={{ flex: 1, padding: "7px 10px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 12, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl" }} />
                <button onClick={addSubtask} style={{ background: "#0d1f3c", color: "#fff", border: "none", borderRadius: 8, padding: "7px 12px", fontSize: 14, cursor: "pointer" }}>+</button>
              </div>
            </div>

            {/* Comments */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", marginBottom: 8 }}>תגובות</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                {comments.length === 0 && <div style={{ fontSize: 12, color: "#c4c9d4", textAlign: "center", padding: "8px 0" }}>אין תגובות עדיין</div>}
                {comments.map(c => (
                  <div key={c.id} style={{ background: "#f8f9fb", borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#0d1f3c" }}>{c.author}</span>
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>{c.time}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{c.text}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <input value={taskPanelComment} onChange={e => setTaskPanelComment(e.target.value)} onKeyDown={e => e.key === "Enter" && addComment()} placeholder="כתוב תגובה..."
                  style={{ flex: 1, padding: "8px 12px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 13, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl" }} />
                <button onClick={addComment} style={{ background: "#0d1f3c", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif" }}>שלח</button>
              </div>
            </div>

            {/* Source message */}
            {task.fromMsg && (
              <div style={{ background: "#f5f0e8", borderRadius: 10, padding: "10px 12px", borderRight: "3px solid #1e5fa8" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#4a6070", marginBottom: 4 }}>💬 מקור — הודעה</div>
                <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>{task.fromMsg}</div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(0,0,0,0.07)", display: "flex", gap: 8 }}>
            <button onClick={() => { setTasks(p => p.filter(t => t.id !== task.id)); setOpenTaskPanel(null); }}
              style={{ padding: "8px 14px", background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif" }}>מחק</button>
            <button onClick={() => setOpenTaskPanel(null)}
              style={{ flex: 1, padding: "8px", background: "#0d1f3c", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif" }}>סגור</button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (activeTab==="inbox") return renderInbox();
    if (activeTab==="tasks") return renderTasks();
    if (activeTab==="funnel") return renderFunnel();
    if (activeTab==="calendar") return renderCalendar();
    if (activeTab==="payments") return renderPayments();
    if (activeTab==="ai") return renderAI();
    if (activeTab==="stats") return renderStats();
    if (activeTab==="settings") return renderSettings();
    return renderInbox();
  };

  return (<>
    <div style={{ display:"flex", height:"100vh", fontFamily:"'Heebo',sans-serif", direction:"rtl", background:"#f5f0e8", overflow:"hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;900&display=swap" rel="stylesheet" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.4)}}`}</style>

      <TaskModal />

      {/* Meeting Modal — inline */}
      {showMeeting && (
          <div onClick={()=>setShowMeeting(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div onClick={e=>e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "20px 20px 16px", width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", direction: "rtl", maxHeight: "90vh", overflowY: "auto" }}>
              {!meetSaved ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#0d1f3c" }}>📅 קבע פגישה</div>
                    <button onClick={()=>setShowMeeting(false)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#4a6070" }}>✕</button>
                  </div>
                  {[{k:"title",l:"נושא *",p:"פגישת אפיון",t:"text"}].map(f=>(
                    <div key={f.k} style={{ marginBottom: 8 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#4a6070", marginBottom: 4, display: "block" }}>{f.l}</label>
                      <input type={f.t} value={meetForm[f.k]} placeholder={f.p} onChange={e=>setMeetForm(p=>({...p,[f.k]:e.target.value}))}
                        style={{ width: "100%", padding: "8px 12px", border: "1.5px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 13, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", color: "#0d1f3c", boxSizing: "border-box", background: "#fff" }} />
                    </div>
                  ))}
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#4a6070", marginBottom: 4, display: "block" }}>תאריך</label>
                    <DatePicker value={meetForm.date} onChange={v => setMeetForm(p => ({ ...p, date: v }))} placeholder="בחר תאריך" />
                  </div>
                  {/* קשור ל */}
                  <div style={{ marginBottom: 8, position: "relative" }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#4a6070", marginBottom: 4, display: "block" }}>קשור ל</label>
                    {(() => {
                      const sel = messages.find(m => m.from === meetForm.contact);
                      if (sel) return (
                        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", border:"1.5px solid #1e5fa8", borderRadius:8, background:"#eff6ff" }}>
                          <div style={{ width:24, height:24, borderRadius:"50%", background:sel.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"#fff" }}>{sel.avatar}</div>
                          <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:700, color:"#0d1f3c" }}>{sel.from}</div><div style={{ fontSize:10, color:"#9ca3af" }}>{sel.type==="לקוח"?"לקוח":"ליד"} · {sel.channel}</div></div>
                          <button onClick={()=>setMeetForm(p=>({...p,contact:""}))} style={{ background:"none", border:"none", fontSize:16, cursor:"pointer", color:"#9ca3af", padding:0 }}>✕</button>
                        </div>
                      );
                      return (
                        <>
                          <input value={meetForm.contact||""} placeholder="חפש איש קשר או השאר ריק..." autoComplete="off"
                            onChange={e=>setMeetForm(p=>({...p,contact:e.target.value}))}
                            onBlur={()=>{ if(meetForm.contact&&!messages.some(m=>m.from===meetForm.contact)) setTimeout(()=>setMeetForm(p=>({...p,contact:""})),150); }}
                            style={{ width:"100%", padding:"8px 12px", border:"1.5px solid rgba(0,0,0,0.1)", borderRadius:8, fontSize:13, fontFamily:"'Heebo',sans-serif", outline:"none", direction:"rtl", color:"#0d1f3c", boxSizing:"border-box", background:"#fff" }} />
                          {(meetForm.contact||"").length>0 && (() => {
                            const sugg = messages.filter(m=>m.from.includes(meetForm.contact)).slice(0,5);
                            if (!sugg.length) return null;
                            return (
                              <div style={{ position:"absolute", top:"100%", right:0, left:0, zIndex:400, background:"#fff", borderRadius:10, boxShadow:"0 8px 24px rgba(0,0,0,0.12)", border:"1px solid rgba(0,0,0,0.08)", overflow:"hidden", marginTop:2 }}>
                                {sugg.map(m=>(
                                  <div key={m.id} onMouseDown={()=>setMeetForm(p=>({...p,contact:m.from}))}
                                    style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", cursor:"pointer" }}
                                    onMouseEnter={e=>e.currentTarget.style.background="#f8f9fb"}
                                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                                    <div style={{ width:26, height:26, borderRadius:"50%", background:m.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"#fff" }}>{m.avatar}</div>
                                    <div><div style={{ fontSize:12, fontWeight:700, color:"#0d1f3c" }}>{m.from}</div><div style={{ fontSize:10, color:"#9ca3af" }}>{m.type==="לקוח"?"לקוח":"ליד"} · {m.channel}</div></div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </>
                      );
                    })()}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#4a6070", marginBottom: 4, display: "block" }}>שעה *</label>
                    <TimeList selected={meetForm.time} onSelect={val => setMeetForm(p => ({ ...p, time: val }))} listRef={timeListRef} />
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#4a6070", marginBottom: 4, display: "block" }}>משך</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      {["15 דק'","30 דק'","45 דק'","שעה"].map(d=>(
                        <div key={d} onClick={()=>setMeetForm(p=>({...p,duration:d}))} style={{ flex:1, padding:"6px 2px", textAlign:"center", borderRadius:8, cursor:"pointer", border:"2px solid "+(meetForm.duration===d?"#1e5fa8":"rgba(0,0,0,0.1)"), background:meetForm.duration===d?"#edf4ff":"transparent", fontSize:11, fontWeight:700, color:meetForm.duration===d?"#1e5fa8":"#4a6070" }}>{d}</div>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#4a6070", marginBottom: 4, display: "block" }}>מיקום</label>
                    <div style={{ border: "1.5px solid rgba(0,0,0,0.1)", borderRadius: 8, overflow: "hidden" }}>
                      <div style={{ display: "flex" }}>
                        {[{ id: "phone", label: "שיחת טלפון", icon: "📞" }, { id: "video", label: "שיחת וידאו", icon: "🎥" }, { id: "physical", label: "פרונטלי", icon: "🤝" }].map((opt, idx) => (
                          <div key={opt.id} onClick={() => setMeetForm(p => ({ ...p, locationType: p.locationType === opt.id ? "" : opt.id, locationValue: "" }))}
                            style={{ flex: 1, padding: "8px 4px", textAlign: "center", cursor: "pointer", background: meetForm.locationType === opt.id ? "#edf4ff" : "#f8f7f5", borderLeft: idx > 0 ? "1px solid rgba(0,0,0,0.08)" : "none" }}>
                            <div style={{ fontSize: 16 }}>{opt.icon}</div>
                            <div style={{ fontSize: 9, fontWeight: 700, color: meetForm.locationType === opt.id ? "#1e5fa8" : "#4a6070", marginTop: 2 }}>{opt.label}</div>
                          </div>
                        ))}
                      </div>
                      {meetForm.locationType && meetForm.locationType !== "phone" && (
                        <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                          <input value={meetForm.locationValue} onChange={e => setMeetForm(p => ({ ...p, locationValue: e.target.value }))}
                            placeholder={meetForm.locationType === "video" ? "הדבק קישור וידאו..." : "הזן כתובת..."}
                            style={{ width: "100%", padding: "8px 12px", border: "none", fontSize: 13, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", color: "#0d1f3c", boxSizing: "border-box", background: "#fff" }} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#4a6070", marginBottom: 4, display: "block" }}>הערות</label>
                    <textarea value={meetForm.notes} onChange={e=>setMeetForm(p=>({...p,notes:e.target.value}))} placeholder="הערות..." rows={2}
                      style={{ width: "100%", padding: "8px 12px", border: "1.5px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 13, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", color: "#0d1f3c", resize: "none", boxSizing: "border-box" }} />
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={()=>setShowMeeting(false)} style={{ flex:1, padding:"10px", borderRadius:10, border:"1.5px solid rgba(0,0,0,0.1)", background:"transparent", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Heebo',sans-serif", color:"#4a6070" }}>ביטול</button>
                    <button onClick={saveMeet} style={{ flex:2, padding:"10px", borderRadius:10, border:"none", background:"#0d1f3c", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Heebo',sans-serif" }}>שמור פגישה</button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#0d1f3c", marginBottom: 6 }}>הפגישה נקבעה!</div>
                  <div style={{ fontSize: 14, color: "#4a6070", marginBottom: 20 }}>{meetForm.title} · {meetForm.time}</div>
                  <button onClick={()=>setShowMeeting(false)} style={{ padding:"10px 28px", borderRadius:10, border:"none", background:"#0d1f3c", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'Heebo',sans-serif" }}>סגור</button>
                </div>
              )}
            </div>
          </div>
      )}
      <MsgContextMenu />
      <AiSuggestOverlay />
      <TaskSidePanel />
      <TaskPanel />
      {blockedToast && (
        <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: "#0d1f3c", color: "#fff", padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 700, zIndex: 9999, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.3)", whiteSpace: "nowrap", direction: "rtl" }}>
          ⚠️ לא ניתן לשנות סטטוס – יש מסמכים פתוחים
        </div>
      )}

      {/* Pay Modal — גלובלי */}
      {/* Modal */}
      {payModal && (
      <div onClick={() => setPayModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: 28, width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", direction: "rtl" }}>
      {!paySent ? (
      <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <div style={{ fontSize: 18, fontWeight: 900, color: "#0d1f3c" }}>{payModal === "quote" ? "📋 הצעת מחיר" : "💸 בקשת תשלום"}</div>
      <button onClick={() => setPayModal(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#4a6070" }}>✕</button>
      </div>
      {[{k:"clientName",l:"שם הלקוח",p:"דניאל כהן"},{k:"amount",l:"סכום (₪)",p:"1,500"},{k:"description",l:"תיאור",p:"ייעוץ"}].map(f => (
      <div key={f.k} style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: "#4a6070", marginBottom: 4, display: "block" }}>{f.l}</label>
      <input value={payForm[f.k]} onChange={e=>setPayForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.p}
      style={{ width: "100%", padding: "10px 14px", border: "1.5px solid rgba(0,0,0,0.1)", borderRadius: 10, fontSize: 13, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", color: "#0d1f3c", boxSizing: "border-box" }} />
      </div>
      ))}
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
      <button onClick={() => setPayModal(null)} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid rgba(0,0,0,0.1)", background: "transparent", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif", color: "#4a6070" }}>ביטול</button>
      <button onClick={handlePaySend} style={{ flex: 2, padding: "11px", borderRadius: 10, border: "none", background: "#1e5fa8", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif" }}>
      {payModal === "quote" ? "שלח הצעת מחיר" : "שלח בקשת תשלום"}
      </button>
      </div>
      </>
      ) : (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: "#0d1f3c", marginBottom: 8 }}>נשלח בהצלחה!</div>
      <div style={{ fontSize: 14, color: "#4a6070", marginBottom: 24 }}>נשלח ל-{payForm.clientName||"הלקוח"} ונוסף להיסטוריה</div>
      <button onClick={() => setPayModal(null)} style={{ padding: "12px 32px", borderRadius: 10, border: "none", background: "#0d1f3c", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif" }}>סגור</button>
      </div>
      )}
      </div>
      </div>
      )}
      {/* Document details modal */}


      {/* Edit Event Modal */}
      {/* View Event Modal — כרטיס פרטי פגישה */}
      {viewEvent && (
        <div onClick={() => setViewEvent(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 350, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", direction: "rtl", overflow: "hidden" }}>
            {/* Header צבעוני */}
            <div style={{ background: viewEvent.color, padding: "22px 20px 18px", position: "relative" }}>
              <button onClick={() => setViewEvent(null)} style={{ position: "absolute", top: 14, left: 14, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 30, height: 30, fontSize: 16, cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.75)", marginBottom: 4, letterSpacing: 0.5 }}>פגישה</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1.3 }}>{viewEvent.title}</div>
            </div>
            {/* גוף הכרטיס */}
            <div style={{ padding: "18px 20px 20px" }}>
              {/* שורת פרטים */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
                {/* שעה + משך */}
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1, background: "#f8f9fb", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>🕐</span>
                    <div>
                      <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700 }}>שעה</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: "#0d1f3c" }}>{viewEvent.time}</div>
                    </div>
                  </div>
                  <div style={{ flex: 1, background: "#f8f9fb", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>⏱</span>
                    <div>
                      <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700 }}>משך</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: "#0d1f3c" }}>{viewEvent.duration || "—"}</div>
                    </div>
                  </div>
                </div>
                {/* תאריך */}
                {viewEvent.date && viewEvent.date !== "ללא תאריך" && (
                  <div style={{ background: "#f8f9fb", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 18 }}>📅</span>
                    <div>
                      <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700 }}>תאריך</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0d1f3c" }}>{viewEvent.date}</div>
                    </div>
                  </div>
                )}
                {/* קשור ל */}
                {viewEvent.contact && (() => {
                  const sel = messages.find(m => m.from === viewEvent.contact);
                  return (
                    <div style={{ background: "#f8f9fb", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 18 }}>👤</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700 }}>קשור ל</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0d1f3c" }}>{viewEvent.contact}</div>
                        {sel && <div style={{ fontSize: 11, color: "#9ca3af" }}>{sel.type === "לקוח" ? "לקוח" : "ליד"} · {sel.channel}</div>}
                      </div>
                      {sel && <div style={{ width: 32, height: 32, borderRadius: "50%", background: sel.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{sel.avatar}</div>}
                    </div>
                  );
                })()}
                {/* מיקום */}
                {viewEvent.locationType && (
                  <div style={{ background: "#f8f9fb", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{viewEvent.locationType === "phone" ? "📞" : viewEvent.locationType === "video" ? "🎥" : "🤝"}</span>
                    <div>
                      <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700 }}>מיקום</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0d1f3c" }}>
                        {viewEvent.locationType === "phone" ? "טלפון" : viewEvent.locationType === "video" ? "וידאו" : "פרונטלי"}
                        {viewEvent.locationValue ? ` · ${viewEvent.locationValue}` : ""}
                      </div>
                    </div>
                  </div>
                )}
                {/* הערות */}
                {viewEvent.notes && (
                  <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ fontSize: 18 }}>📝</span>
                    <div>
                      <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, marginBottom: 3 }}>הערות</div>
                      <div style={{ fontSize: 13, color: "#0d1f3c", lineHeight: 1.5 }}>{viewEvent.notes}</div>
                    </div>
                  </div>
                )}
              </div>
              {/* כפתורי פעולה */}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setEvents(p => p.filter(e => e.id !== viewEvent.id)); setViewEvent(null); }}
                  style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #fecaca", background: "#fef2f2", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif", color: "#ef4444" }}>מחק</button>
                <button onClick={() => setViewEvent(null)}
                  style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid rgba(0,0,0,0.1)", background: "transparent", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif", color: "#4a6070" }}>סגור</button>
                <button onClick={() => { setEditEvent(viewEvent); setViewEvent(null); }}
                  style={{ flex: 2, padding: "10px", borderRadius: 10, border: "none", background: "#0d1f3c", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif" }}>✏️ ערוך</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editEvent && (
        <div onClick={() => setEditEvent(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 350, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "20px 20px 16px", width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", direction: "rtl", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#0d1f3c" }}>✏️ עריכת פגישה</div>
              <button onClick={() => setEditEvent(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#4a6070" }}>✕</button>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#4a6070", marginBottom: 4, display: "block" }}>נושא *</label>
              <input value={editEvent.title} onChange={e => setEditEvent(p => ({ ...p, title: e.target.value }))}
                style={{ width: "100%", padding: "8px 12px", border: "1.5px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: 13, fontFamily: "'Heebo',sans-serif", outline: "none", direction: "rtl", color: "#0d1f3c", boxSizing: "border-box" }} />
            </div>
            {/* קשור ל */}
            <div style={{ marginBottom: 8, position: "relative" }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#4a6070", marginBottom: 4, display: "block" }}>קשור ל</label>
              {(() => {
                const sel = messages.find(m => m.from === editEvent.contact);
                if (sel) return (
                  <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", border:"1.5px solid #1e5fa8", borderRadius:8, background:"#eff6ff" }}>
                    <div style={{ width:24, height:24, borderRadius:"50%", background:sel.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"#fff" }}>{sel.avatar}</div>
                    <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:700, color:"#0d1f3c" }}>{sel.from}</div><div style={{ fontSize:10, color:"#9ca3af" }}>{sel.type==="לקוח"?"לקוח":"ליד"} · {sel.channel}</div></div>
                    <button onClick={()=>setEditEvent(p=>({...p,contact:""}))} style={{ background:"none", border:"none", fontSize:16, cursor:"pointer", color:"#9ca3af", padding:0 }}>✕</button>
                  </div>
                );
                return (
                  <>
                    <input value={editEvent.contact||""} placeholder="חפש איש קשר או השאר ריק..." autoComplete="off"
                      onChange={e=>setEditEvent(p=>({...p,contact:e.target.value}))}
                      onBlur={()=>{ if(editEvent.contact&&!messages.some(m=>m.from===editEvent.contact)) setTimeout(()=>setEditEvent(p=>({...p,contact:""})),150); }}
                      style={{ width:"100%", padding:"8px 12px", border:"1.5px solid rgba(0,0,0,0.1)", borderRadius:8, fontSize:13, fontFamily:"'Heebo',sans-serif", outline:"none", direction:"rtl", color:"#0d1f3c", boxSizing:"border-box" }} />
                    {(editEvent.contact||"").length>0 && (() => {
                      const sugg = messages.filter(m=>m.from.includes(editEvent.contact)).slice(0,5);
                      if (!sugg.length) return null;
                      return (
                        <div style={{ position:"absolute", top:"100%", right:0, left:0, zIndex:400, background:"#fff", borderRadius:10, boxShadow:"0 8px 24px rgba(0,0,0,0.12)", border:"1px solid rgba(0,0,0,0.08)", overflow:"hidden", marginTop:2 }}>
                          {sugg.map(m=>(
                            <div key={m.id} onMouseDown={()=>setEditEvent(p=>({...p,contact:m.from}))}
                              style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", cursor:"pointer" }}
                              onMouseEnter={e=>e.currentTarget.style.background="#f8f9fb"}
                              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                              <div style={{ width:26, height:26, borderRadius:"50%", background:m.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"#fff" }}>{m.avatar}</div>
                              <div><div style={{ fontSize:12, fontWeight:700, color:"#0d1f3c" }}>{m.from}</div><div style={{ fontSize:10, color:"#9ca3af" }}>{m.type==="לקוח"?"לקוח":"ליד"} · {m.channel}</div></div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </>
                );
              })()}
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#4a6070", marginBottom: 4, display: "block" }}>שעה</label>
              <TimeList selected={editEvent.time} onSelect={val => setEditEvent(p => ({ ...p, time: val }))} listRef={{ current: null }} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#4a6070", marginBottom: 4, display: "block" }}>משך</label>
              <div style={{ display: "flex", gap: 6 }}>
                {["15 דק'","30 דק'","45 דק'","שעה"].map(d => (
                  <div key={d} onClick={() => setEditEvent(p => ({ ...p, duration: d }))}
                    style={{ flex: 1, padding: "6px 2px", textAlign: "center", borderRadius: 8, cursor: "pointer", border: `2px solid ${editEvent.duration===d?"#1e5fa8":"rgba(0,0,0,0.1)"}`, background: editEvent.duration===d?"#edf4ff":"transparent", fontSize: 11, fontWeight: 700, color: editEvent.duration===d?"#1e5fa8":"#4a6070" }}>{d}</div>
                ))}
              </div>
            </div>
            {/* מיקום */}
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#4a6070", marginBottom: 4, display: "block" }}>מיקום</label>
              <div style={{ border: "1.5px solid rgba(0,0,0,0.1)", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ display: "flex" }}>
                  {[{id:"phone",label:"טלפון",icon:"📞"},{id:"video",label:"וידאו",icon:"🎥"},{id:"physical",label:"פרונטלי",icon:"🤝"}].map((opt,idx) => (
                    <div key={opt.id} onClick={() => setEditEvent(p => ({ ...p, locationType: p.locationType===opt.id?"":opt.id, locationValue:"" }))}
                      style={{ flex:1, padding:"8px 4px", textAlign:"center", cursor:"pointer", background:editEvent.locationType===opt.id?"#edf4ff":"#f8f7f5", borderLeft:idx>0?"1px solid rgba(0,0,0,0.08)":"none" }}>
                      <div style={{ fontSize:16 }}>{opt.icon}</div>
                      <div style={{ fontSize:9, fontWeight:700, color:editEvent.locationType===opt.id?"#1e5fa8":"#4a6070", marginTop:2 }}>{opt.label}</div>
                    </div>
                  ))}
                </div>
                {editEvent.locationType && editEvent.locationType !== "phone" && (
                  <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                    <input value={editEvent.locationValue||""} onChange={e=>setEditEvent(p=>({...p,locationValue:e.target.value}))}
                      placeholder={editEvent.locationType==="video"?"הדבק קישור וידאו...":"הזן כתובת..."}
                      style={{ width:"100%", padding:"8px 12px", border:"none", fontSize:13, fontFamily:"'Heebo',sans-serif", outline:"none", direction:"rtl", color:"#0d1f3c", boxSizing:"border-box", background:"#fff" }} />
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#4a6070", marginBottom: 4, display: "block" }}>הערות</label>
              <textarea value={editEvent.notes||""} onChange={e=>setEditEvent(p=>({...p,notes:e.target.value}))} placeholder="הערות..." rows={2}
                style={{ width:"100%", padding:"8px 12px", border:"1.5px solid rgba(0,0,0,0.1)", borderRadius:8, fontSize:13, fontFamily:"'Heebo',sans-serif", outline:"none", direction:"rtl", color:"#0d1f3c", resize:"none", boxSizing:"border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button onClick={() => { setEvents(p => p.filter(e => e.id !== editEvent.id)); setEditEvent(null); }}
                style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #fecaca", background: "#fef2f2", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif", color: "#ef4444" }}>מחק</button>
              <button onClick={() => setEditEvent(null)}
                style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid rgba(0,0,0,0.1)", background: "transparent", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif", color: "#4a6070" }}>ביטול</button>
              <button onClick={() => { setEvents(p => p.map(e => e.id === editEvent.id ? editEvent : e)); setEditEvent(null); }}
                style={{ flex: 2, padding: "10px", borderRadius: 10, border: "none", background: "#0d1f3c", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif" }}>שמור שינויים</button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Doc Modal — גלובלי */}
      {payDocModal && (
        <div onClick={() => setPayDocModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: 28, width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", direction: "rtl" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: payDocModal.type === "quote" ? "#1e5fa815" : "#b8944015", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                  {payDocModal.type === "quote" ? "📋" : "💸"}
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: "#0d1f3c" }}>{payDocModal.type === "quote" ? "הצעת מחיר" : "בקשת תשלום"}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>מס׳ {payDocModal.id} · {payDocModal.date}</div>
                </div>
              </div>
              <button onClick={() => setPayDocModal(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9ca3af" }}>✕</button>
            </div>
            <div style={{ background: "#f8f9fb", borderRadius: 14, padding: 18, marginBottom: 16 }}>
              {[{icon:"👤",label:"לקוח",value:payDocModal.client},{icon:"💰",label:"סכום",value:`₪${payDocModal.amount.toLocaleString()}`},{icon:"📅",label:"תאריך",value:payDocModal.date},{icon:"📄",label:"סוג",value:payDocModal.type==="quote"?"הצעת מחיר":"בקשת תשלום"}].map(f => (
                <div key={f.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: "#9ca3af" }}>{f.icon} {f.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#0d1f3c" }}>{f.value}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.07)" }}>
                <span style={{ fontSize: 13, color: "#9ca3af" }}>📌 סטטוס</span>
                <select value={payDocModal.status}
                  onChange={e => {
                    const updated = { ...payDocModal, status: e.target.value };
                    setPayHistory(prev => prev.map(x => x.id === payDocModal.id ? updated : x));
                    setPayDocModal(updated);
                  }}
                  style={{ padding: "5px 12px", borderRadius: 20, border: "none", fontSize: 12, fontWeight: 700, fontFamily: "'Heebo',sans-serif", cursor: "pointer", outline: "none",
                    background: payDocModal.status==="שולם"?"#f0fdf4":payDocModal.status==="סגור"?"#f1f5f9":payDocModal.status==="פתוח"?"#eff6ff":"#fffbeb",
                    color: payDocModal.status==="שולם"?"#22c55e":payDocModal.status==="סגור"?"#64748b":payDocModal.status==="פתוח"?"#1e5fa8":"#b89440" }}>
                  {(payDocModal.type === "quote" ? ["פתוח","סגור"] : ["שולם","ממתין"]).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setPayDocModal(null)} style={{ flex: 1, padding: "11px", borderRadius: 12, border: "1.5px solid rgba(0,0,0,0.1)", background: "transparent", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif", color: "#4a6070" }}>סגור</button>
              <button onClick={() => { setPayHistory(prev => prev.filter(x => x.id !== payDocModal.id)); setPayDocModal(null); }}
                style={{ padding: "11px 16px", borderRadius: 12, border: "1px solid #fecaca", background: "#fef2f2", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo',sans-serif", color: "#ef4444" }}>מחק</button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div style={{ width:sidebarCollapsed?64:220, background:"#0d1f3c", display:window.innerWidth<768?"none":"flex", flexDirection:"column", flexShrink:0, transition:"width 0.25s ease", overflow:"hidden" }}>
        <SidebarContent mobile={false} />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && <div onClick={()=>setSidebarOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:99 }}/>}
      <div style={{ position:"fixed", top:0, right:0, bottom:0, width:240, background:"#0d1f3c", zIndex:100, display:"flex", flexDirection:"column", transform:sidebarOpen?"translateX(0)":"translateX(100%)", transition:"transform 0.3s ease", boxShadow:"-4px 0 20px rgba(0,0,0,0.3)" }}>
        <SidebarContent mobile={true} />
      </div>

      {/* Main */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {showNotifications && <div style={{ position:"fixed", inset:0, zIndex:499 }} onClick={() => setShowNotifications(false)} />}
        <div style={{ background:"#fff", padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(0,0,0,0.06)", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {window.innerWidth<768 && <button onClick={()=>setSidebarOpen(true)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#0d1f3c" }}>☰</button>}
            <div>
              <div style={{ fontSize:18, fontWeight:900, color:"#0d1f3c" }}>{tabs.find(t=>t.id===activeTab)?.label}</div>
              <div style={{ fontSize:12, color:"#4a6070" }}>יום שישי, 27 מרץ 2026</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ position:"relative" }}>
              <div onClick={e => { e.stopPropagation(); setShowNotifications(!showNotifications); }}
                style={{ cursor:"pointer", fontSize:20, position:"relative", display:"flex", alignItems:"center", justifyContent:"center", width:36, height:36, borderRadius:"50%", background: showNotifications ? "#f0f4ff" : "transparent" }}>
                🔔
                {unreadCount > 0 && (
                  <div style={{ position:"absolute", top:-2, right:-2, minWidth:16, height:16, borderRadius:8, background:"#c0614a", color:"#fff", fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 4px" }}>{unreadCount}</div>
                )}
              </div>
              {showNotifications && (
                <div onClick={e => e.stopPropagation()} style={{ position:"fixed", top:70, left:10, right:10, zIndex:500, background:"#fff", borderRadius:16, boxShadow:"0 8px 32px rgba(0,0,0,0.2)", maxHeight:"70vh", overflowY:"auto", direction:"rtl", border:"1px solid rgba(0,0,0,0.08)" }}>
                  <div style={{ padding:"14px 16px 10px", borderBottom:"1px solid rgba(0,0,0,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ fontSize:15, fontWeight:800, color:"#0d1f3c" }}>🔔 התראות</div>
                    <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                      {computedNotifs.length > 0 && <button onClick={() => setReadNotifs(new Set(computedNotifs.map(n => n.id)))} style={{ background:"none", border:"none", fontSize:11, color:"#1e5fa8", cursor:"pointer", fontFamily:"'Heebo',sans-serif", fontWeight:700 }}>סמן הכל כנקרא</button>}
                      <button onClick={() => setShowNotifications(false)} style={{ background:"none", border:"none", fontSize:18, cursor:"pointer", color:"#4a6070", lineHeight:1 }}>✕</button>
                    </div>
                  </div>
                  {computedNotifs.length === 0 ? (
                    <div style={{ padding:"40px 16px", textAlign:"center", color:"#9ca3af", fontSize:13 }}>אין התראות חדשות 🎉</div>
                  ) : (
                    computedNotifs.map(n => (
                      <div key={n.id} onClick={() => {
                        setReadNotifs(prev => new Set([...prev, n.id]));
                        if (n.type === "meeting") setActiveTab("calendar");
                        else if (n.type === "task" || n.type === "deadline") setActiveTab("tasks");
                        else if (n.type === "doc") setActiveTab("payments");
                        else if (n.type === "assign") setActiveTab("inbox");
                        setShowNotifications(false);
                      }}
                        style={{ padding:"14px 16px", borderBottom:"1px solid rgba(0,0,0,0.05)", display:"flex", gap:12, alignItems:"flex-start", background: readNotifs.has(n.id) ? "transparent" : "#f0f7ff", cursor:"pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = readNotifs.has(n.id) ? "#f8f7f5" : "#e0effe"}
                        onMouseLeave={e => e.currentTarget.style.background = readNotifs.has(n.id) ? "transparent" : "#f0f7ff"}>
                        <span style={{ fontSize:20, flexShrink:0 }}>{n.icon}</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:"#0d1f3c", lineHeight:1.5 }}>{n.text}</div>
                          {n.time && <div style={{ fontSize:11, color:"#9ca3af", marginTop:4 }}>{n.time}</div>}
                        </div>
                        {!readNotifs.has(n.id) && <div style={{ width:8, height:8, borderRadius:"50%", background:"#1e5fa8", flexShrink:0, marginTop:6 }} />}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div style={{ width:34, height:34, borderRadius:"50%", background:"#0d1f3c", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"#fff", cursor:"pointer" }}>נ</div>
          </div>
        </div>

        {window.innerWidth < 768 && (
          <div style={{ position:"fixed", bottom:0, right:0, left:0, background:"#fff", borderTop:"1px solid rgba(0,0,0,0.08)", zIndex:50, padding:"6px 0", display:"flex" }}>
            {tabs.map(t=>(
              <div key={t.id} onClick={() => {
                setActiveTab(t.id);
                if (t.id === "inbox" && showChat) setShowChat(false);
              }} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"6px 0", cursor:"pointer", position:"relative" }}>
                <span style={{ fontSize:20 }}>{t.icon}</span>
                <span style={{ fontSize:9, color:activeTab===t.id?"#1e5fa8":"#4a6070", fontWeight:activeTab===t.id?700:400, marginTop:2 }}>{t.label}</span>
                {t.badge && <div style={{ position:"absolute", top:4, right:"calc(50% - 14px)", background:"#c0614a", color:"#fff", fontSize:9, fontWeight:700, width:14, height:14, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>{t.badge}</div>}
              </div>
            ))}
          </div>
        )}

        <div style={{ flex:1, overflow:"auto", padding:"24px", paddingBottom:window.innerWidth<768?80:24 }}>
          {renderContent()}
        </div>
      </div>
    </div>

    {/* ── WhatsApp QR Modal ── */}
    {waModal.open && (
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
        <div style={{ background:"#fff", borderRadius:20, padding:28, maxWidth:420, width:"100%", boxShadow:"0 8px 40px rgba(0,0,0,0.2)", fontFamily:"'Heebo',sans-serif", direction:"rtl" }}>

          {/* Disclaimer step */}
          {waModal.step === 'disclaimer' && (<>
            <div style={{ fontSize:18, fontWeight:800, color:"#0d1f3c", marginBottom:12 }}>💬 חיבור WhatsApp</div>
            <div style={{ fontSize:13, color:"#4a6070", lineHeight:1.7, marginBottom:20, background:"#fffbeb", border:"1.5px solid #fde68a", borderRadius:12, padding:"14px 16px" }}>
              חיבור זה מתבצע דרך WhatsApp Web ואינו חיבור רשמי של Meta. השימוש כפוף לתנאי השירות של WhatsApp. Flow אינה אחראית לכל הגבלה, חסימה, או שינוי מדיניות מצד WhatsApp. האחריות המלאה על החשבון המחובר היא של המשתמש בלבד.
            </div>
            {waModal.error && <div style={{ fontSize:13, color:"#dc2626", marginBottom:12, fontWeight:600 }}>{waModal.error}</div>}
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button onClick={closeWaModal} style={{ padding:"10px 20px", borderRadius:10, border:"1.5px solid rgba(0,0,0,0.1)", background:"transparent", color:"#4a6070", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"'Heebo',sans-serif" }}>ביטול</button>
              <button onClick={acceptWaDisclaimer} style={{ padding:"10px 24px", borderRadius:10, border:"none", background:"#25D366", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'Heebo',sans-serif" }}>מאשר — המשך</button>
            </div>
          </>)}

          {/* Loading step */}
          {waModal.step === 'loading' && (<>
            <div style={{ fontSize:18, fontWeight:800, color:"#0d1f3c", marginBottom:20 }}>💬 מאתחל חיבור...</div>
            <div style={{ display:"flex", justifyContent:"center", alignItems:"center", padding:"30px 0" }}>
              <div style={{ width:48, height:48, border:"4px solid rgba(37,211,102,0.2)", borderTop:"4px solid #25D366", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
            </div>
            <div style={{ fontSize:13, color:"#4a6070", textAlign:"center" }}>מאתחל Puppeteer — עלול לקחת 30–60 שניות</div>
          </>)}

          {/* QR step */}
          {waModal.step === 'qr' && (<>
            <div style={{ fontSize:18, fontWeight:800, color:"#0d1f3c", marginBottom:6 }}>📱 סרוק QR ב-WhatsApp</div>
            <div style={{ fontSize:13, color:"#4a6070", marginBottom:16 }}>פתח WhatsApp → הגדרות → מכשירים מקושרים → קשר מכשיר</div>
            <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:220, background:"#f8fafc", borderRadius:14, border:"1.5px solid rgba(0,0,0,0.08)", marginBottom:16 }}>
              {waModal.qr
                ? <img src={waModal.qr} alt="QR Code" style={{ width:200, height:200, imageRendering:"pixelated" }} />
                : <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
                    <div style={{ width:36, height:36, border:"3px solid rgba(37,211,102,0.2)", borderTop:"3px solid #25D366", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
                    <div style={{ fontSize:13, color:"#4a6070" }}>ממתין ל-QR...</div>
                  </div>
              }
            </div>
            <div style={{ fontSize:12, color:"#4a6070", textAlign:"center", marginBottom:16 }}>ממתין לסריקה... הדף מתעדכן אוטומטית</div>
            <div style={{ display:"flex", justifyContent:"center" }}>
              <button onClick={closeWaModal} style={{ padding:"9px 22px", borderRadius:10, border:"1.5px solid rgba(0,0,0,0.1)", background:"transparent", color:"#4a6070", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'Heebo',sans-serif" }}>ביטול</button>
            </div>
          </>)}

        </div>
      </div>
    )}
  </>);
}
