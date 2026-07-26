import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Phone, MapPin, Shield, User, BookOpen, CheckCircle2 } from "lucide-react";
import type { SiteSettings } from "@/lib/queries";

export type Student = {
  id: string;
  qr_token: string;
  admission_no: string | null;
  roll_no: string | null;
  first_name: string;
  last_name: string | null;
  gender: string | null;
  date_of_birth: string | null;
  blood_group: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  photo_url: string | null;
  classroom_id: string | null;
  grade: string | null;
  section: string | null;
  admission_date: string | null;
  father_name: string | null;
  father_phone: string | null;
  mother_name: string | null;
  mother_phone: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  is_active: boolean;
};

export type ThemeColor = "navy" | "emerald" | "crimson" | "midnight" | "royal" | "gold";
export type BgStyle = "gradient" | "mesh" | "watermark" | "minimal";

export type CardCustomization = {
  schoolName: string;
  motto: string;
  session: string;
  principalName: string;
  themeColor: ThemeColor;
  bgStyle?: BgStyle;
  logoUrl?: string;
  phone?: string;
  address?: string;
  website?: string;
  showBackSide?: boolean;
};

export type ThemeConfig = {
  primaryStart: string;
  primaryEnd: string;
  accent: string;
  accentText: string;
  bgGradient: string;
  badgeBg: string;
  badgeText: string;
  cardBorder: string;
};

export const themeMap: Record<ThemeColor, ThemeConfig> = {
  navy: {
    primaryStart: "#0f2b5c",
    primaryEnd: "#1e40af",
    accent: "#f59e0b",
    accentText: "#fef08a",
    bgGradient: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 50%, #e2e8f0 100%)",
    badgeBg: "#dbeafe",
    badgeText: "#1e40af",
    cardBorder: "#3b82f6",
  },
  emerald: {
    primaryStart: "#064e3b",
    primaryEnd: "#047857",
    accent: "#fbbf24",
    accentText: "#fde047",
    bgGradient: "linear-gradient(135deg, #f0fdf4 0%, #e6f4ea 50%, #dcfce7 100%)",
    badgeBg: "#dcfce7",
    badgeText: "#065f46",
    cardBorder: "#10b981",
  },
  crimson: {
    primaryStart: "#881337",
    primaryEnd: "#be123c",
    accent: "#fde047",
    accentText: "#fef08a",
    bgGradient: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fecdd3 100%)",
    badgeBg: "#ffe4e6",
    badgeText: "#9f1239",
    cardBorder: "#f43f5e",
  },
  midnight: {
    primaryStart: "#0f172a",
    primaryEnd: "#1e293b",
    accent: "#38bdf8",
    accentText: "#7dd3fc",
    bgGradient: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
    badgeBg: "#e0f2fe",
    badgeText: "#0369a1",
    cardBorder: "#0284c7",
  },
  royal: {
    primaryStart: "#581c87",
    primaryEnd: "#7e22ce",
    accent: "#facc15",
    accentText: "#fde047",
    bgGradient: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)",
    badgeBg: "#f3e8ff",
    badgeText: "#6b21a8",
    cardBorder: "#a855f7",
  },
  gold: {
    primaryStart: "#78350f",
    primaryEnd: "#b45309",
    accent: "#fef08a",
    accentText: "#fef9c3",
    bgGradient: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)",
    badgeBg: "#fef3c7",
    badgeText: "#92400e",
    cardBorder: "#f59e0b",
  },
};

export type ClassroomLite = {
  id: string;
  name: string;
  grade: string | null;
  section: string | null;
};

export function StudentIdCard({
  student,
  settings,
  customization,
  classrooms = [],
  className = "",
  scale = 1,
}: {
  student: Student;
  settings?: SiteSettings | null;
  customization: CardCustomization;
  classrooms?: ClassroomLite[];
  className?: string;
  scale?: number;
}) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const profileUrl = `${origin}/p/student/${student.qr_token || student.id}`;

  useEffect(() => {
    QRCode.toDataURL(profileUrl, {
      width: 220,
      margin: 1,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then(setQrCodeDataUrl)
      .catch((err) => console.error("QR Code generation error:", err));
  }, [profileUrl]);

  const schoolName = customization.schoolName || settings?.school_name || "MAA SARSWATI VIDYA MANDIR J.H. SCHOOL";
  const motto = customization.motto || settings?.motto || "॥ विद्या ददाति विनयम् ॥";
  const logoUrl = customization.logoUrl || settings?.logo_url;
  const address = customization.address || settings?.address || "Near Patar Kalan Chauraha, Dubar Market, Lalganj Mirzapur";
  const phone = customization.phone || settings?.phone || "8887845857, 9415620250";
  const session = customization.session || "2026-27";

  const themeKey = customization.themeColor || "navy";
  const theme = themeMap[themeKey] || themeMap.navy;
  const bgStyle = customization.bgStyle || "gradient";

  const firstName = (student.first_name || "").trim();
  const lastName = (student.last_name || "").trim();
  const studentDisplayName = firstName ? (lastName ? `${firstName} ${lastName}` : firstName) : "—";

  const studentRegCode = student.admission_no || (student.id ? `MSGM${student.id.slice(0, 6).toUpperCase()}` : "—");

  // Determine Class and Section
  const clsObj = classrooms.find((c) => c.id === student.classroom_id);
  let studentClassSection = "—";
  if (student.grade) {
    const secVal = student.section ? ` / ${student.section}` : "";
    studentClassSection = `${student.grade}${secVal}`;
  } else if (clsObj) {
    const gradeVal = clsObj.grade || clsObj.name;
    const secVal = clsObj.section ? ` / ${clsObj.section}` : "";
    studentClassSection = `${gradeVal}${secVal}`;
  } else if (student.section) {
    studentClassSection = student.section;
  }

  const mobileNo = student.phone || student.father_phone || student.guardian_phone || "—";
  const studentAddress = student.address || "—";
  const fatherNameDisplay = student.father_name || "—";

  return (
    <div
      className={`print-card-wrapper inline-block text-slate-900 select-none ${className}`}
      style={{
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: "top left",
      }}
    >
      {/* Universal Aadhaar Card / CR80 standard dimensions: 85.6mm x 53.98mm with outer cut outline */}
      <div
        className="id-card-container relative overflow-hidden rounded-2xl border-2 border-dashed p-[1.5mm] shadow-xl flex flex-col justify-between transition-all"
        style={{
          width: "85.6mm",
          height: "53.98mm",
          borderColor: theme.cardBorder,
          backgroundColor: "#ffffff",
          boxSizing: "border-box",
        }}
      >
        {/* Inner Card Content */}
        <div 
          className="w-full h-full flex flex-col justify-between rounded-xl overflow-hidden relative border border-slate-200/80 shadow-xs"
          style={{ background: bgStyle !== "minimal" ? theme.bgGradient : "#ffffff" }}
        >
          {!customization.showBackSide ? (
            /* FRONT SIDE OF ID CARD */
            <div className="h-full w-full flex flex-col justify-between relative overflow-hidden">
              
              {/* Optional Background Watermark / Pattern Layer */}
              {bgStyle === "watermark" && logoUrl && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 opacity-[0.08]">
                  <img src={logoUrl} alt="Watermark" className="w-28 h-28 object-contain filter grayscale" />
                </div>
              )}

              {bgStyle === "mesh" && (
                <div 
                  className="absolute inset-0 pointer-events-none z-0 opacity-20"
                  style={{
                    backgroundImage: `radial-gradient(${theme.primaryEnd} 0.5px, transparent 0.5px)`,
                    backgroundSize: "6px 6px",
                  }}
                />
              )}

              {/* 1. TOP CURVED HEADER BANNER */}
              <div className="relative w-full text-white shrink-0 z-20">
                <div 
                  className="px-2 pt-1 pb-2 flex items-center justify-between relative shadow-sm overflow-hidden"
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.primaryStart} 0%, ${theme.primaryEnd} 100%)`
                  }}
                >
                  {/* Glass Reflection Highlight line */}
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-white/30" />

                  {/* School Logo */}
                  <div className="shrink-0 mr-1.5 z-10">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="h-7.5 w-7.5 object-contain bg-white rounded-full p-0.5 border-2 border-amber-400 shadow-sm" />
                    ) : (
                      <div className="h-7.5 w-7.5 rounded-full bg-white text-blue-900 grid place-items-center font-bold text-[9px] border-2 border-amber-400 shadow-sm">
                        <Shield size={16} className="fill-amber-400 text-blue-900" />
                      </div>
                    )}
                  </div>

                  {/* School Name & Motto */}
                  <div className="flex-1 min-w-0 text-center z-10 px-0.5">
                    <h1 
                      className="font-black tracking-tight text-[8.8px] leading-none uppercase drop-shadow-xs font-sans truncate"
                      style={{ color: theme.accentText }}
                    >
                      {schoolName}
                    </h1>
                    <p className="text-[6.5px] text-amber-100 font-semibold tracking-wide leading-tight truncate mt-0.5">
                      {motto}
                    </p>
                  </div>

                  {/* Values Badge */}
                  <div className="shrink-0 z-10 flex items-center gap-1 pl-1 border-l border-white/20">
                    <BookOpen size={11} className="text-white shrink-0" />
                    <div className="text-[4.8px] font-black leading-[1.05] uppercase tracking-tighter text-left" style={{ color: theme.accentText }}>
                      <div>KNOWLEDGE</div>
                      <div>DISCIPLINE</div>
                      <div>VALUES</div>
                    </div>
                  </div>

                  {/* Soft Background glow bubble */}
                  <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full blur-xs pointer-events-none" />
                </div>

                {/* Smooth Multi-Layered Curve Arc at Bottom of Header */}
                <div className="w-full overflow-hidden leading-none -mt-[0.2px] pointer-events-none">
                  <svg className="w-full h-[3.4mm] block" viewBox="0 0 500 40" preserveAspectRatio="none">
                    <path d="M0,0 Q250,38 500,0 L500,0 L0,0 Z" fill={theme.primaryEnd} />
                    <path d="M0,0 Q250,38 500,0" fill="none" stroke={theme.accent} strokeWidth="5" />
                  </svg>
                </div>
              </div>

              {/* 2. MIDDLE CONTENT AREA (Photo & Student Details) */}
              <div className="flex-1 px-1.5 py-0.5 flex gap-1.5 items-start overflow-hidden z-10 -mt-1">
                
                {/* Student Photo Section */}
                <div className="flex flex-col items-center shrink-0 pt-0.5">
                  <div className="w-[18mm] h-[22.5mm] rounded-md overflow-hidden border-2 border-amber-400 bg-white shadow-sm relative flex items-center justify-center">
                    {student.photo_url ? (
                      <img src={student.photo_url} alt={studentDisplayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-amber-50 text-amber-700">
                        <User size={26} />
                      </div>
                    )}
                  </div>
                  {/* Verified Tag */}
                  <div className="mt-0.5 px-1 py-[0.5px] rounded bg-slate-900 text-white text-[4.5px] font-bold tracking-wider uppercase flex items-center gap-0.5 shadow-2xs">
                    <CheckCircle2 size={5} className="text-emerald-400" />
                    <span>VERIFIED</span>
                  </div>
                </div>

                {/* Student Details Fields */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="space-y-[1.2px] text-[7.2px] text-slate-900 leading-tight">
                    
                    {/* STUDENT NAME (BOLD VIVID RED) */}
                    <div className="flex items-baseline">
                      <span className="w-[20mm] font-bold text-slate-800 shrink-0">STUDENT NAME</span>
                      <span className="font-extrabold text-red-600 uppercase truncate text-[8px] pl-0.5 tracking-tight">
                        : {studentDisplayName}
                      </span>
                    </div>

                    {/* FATHER'S NAME */}
                    <div className="flex items-baseline">
                      <span className="w-[20mm] font-bold text-slate-800 shrink-0">FATHER'S NAME</span>
                      <span className="font-bold text-slate-900 uppercase truncate pl-0.5">
                        : {fatherNameDisplay}
                      </span>
                    </div>

                    {/* CLASS / SECTION */}
                    <div className="flex items-baseline">
                      <span className="w-[20mm] font-bold text-slate-800 shrink-0">CLASS / SECTION</span>
                      <span className="font-bold text-slate-900 uppercase truncate pl-0.5">
                        : {studentClassSection}
                      </span>
                    </div>

                    {/* SESSION */}
                    <div className="flex items-baseline">
                      <span className="w-[20mm] font-bold text-slate-800 shrink-0">SESSION</span>
                      <span className="font-bold text-slate-900 truncate pl-0.5">
                        : {session}
                      </span>
                    </div>

                    {/* MOBILE NO */}
                    <div className="flex items-baseline">
                      <span className="w-[20mm] font-bold text-slate-800 shrink-0">MOBILE NO</span>
                      <span className="font-bold text-slate-900 truncate pl-0.5">
                        : {mobileNo}
                      </span>
                    </div>

                    {/* ADDRESS */}
                    <div className="flex items-baseline">
                      <span className="w-[20mm] font-bold text-slate-800 shrink-0">ADDRESS</span>
                      <span className="font-bold text-slate-900 truncate pl-0.5 max-w-[32mm]">
                        : {studentAddress}
                      </span>
                    </div>

                  </div>
                </div>

                {/* RIGHT COLUMN: QR Code, Reg No, Principal Signature */}
                <div className="w-[16mm] shrink-0 flex flex-col items-center justify-between h-full pt-0.5 pr-0.5">
                  {/* Reg / Student Code */}
                  <div className="text-[5.5px] font-black text-slate-900 tracking-tighter uppercase text-center truncate w-full bg-slate-100/90 py-[0.5px] rounded border border-slate-300">
                    {studentRegCode}
                  </div>

                  {/* Dynamic QR Code */}
                  <div className="p-[0.5px] bg-white border border-slate-300 rounded-md shadow-2xs my-0.5">
                    {qrCodeDataUrl ? (
                      <img src={qrCodeDataUrl} alt="QR Code" className="w-[10.5mm] h-[10.5mm]" />
                    ) : (
                      <div className="w-[10.5mm] h-[10.5mm] bg-slate-200 animate-pulse rounded" />
                    )}
                  </div>

                  {/* Principal Signature & Title */}
                  <div className="text-center w-full mt-auto flex flex-col items-center">
                    {/* Red Handwritten Signature Graphic */}
                    <svg className="w-10 h-3 text-red-600" viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 22 C 20 5, 30 25, 45 12 C 55 2, 60 28, 75 10 C 85 5, 90 20, 95 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                      <path d="M15 18 L 85 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    
                    <div className="w-full border-t border-slate-400 text-[5px] uppercase font-black text-slate-800 tracking-wider pt-0.5">
                      PRINCIPAL
                    </div>
                  </div>

                </div>

              </div>

              {/* 3. SCHOOL ADDRESS AT BOTTOM OF THE CARD */}
              <div 
                className="w-full text-white py-[1.2mm] px-2 flex items-center justify-between border-t-2 border-amber-400 shrink-0 z-20 text-[5.8px] leading-none shadow-xs"
                style={{ background: `linear-gradient(135deg, ${theme.primaryStart} 0%, ${theme.primaryEnd} 100%)` }}
              >
                <div className="flex items-center gap-1 truncate max-w-[70%]">
                  <MapPin size={8} className="text-amber-300 shrink-0" />
                  <span className="font-semibold truncate text-slate-100 uppercase tracking-tight">{address}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Phone size={8} className="text-amber-300 shrink-0" />
                  <span className="font-extrabold text-amber-300 tracking-tighter">{phone}</span>
                </div>
              </div>

            </div>
          ) : (
            /* BACK SIDE OF ID CARD */
            <div 
              className="h-full w-full flex flex-col justify-between p-2 relative"
              style={{ background: bgStyle !== "minimal" ? theme.bgGradient : "#ffffff" }}
            >
              <div className="text-center pb-1 border-b border-slate-300">
                <h3 className="font-black text-[8.5px] uppercase text-slate-900 tracking-wider">
                  STUDENT RECORD & EMERGENCY DETAILS
                </h3>
              </div>

              <div className="space-y-1 my-auto text-[7px] text-slate-700">
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 bg-white/90 p-1.5 rounded-lg border border-slate-200 shadow-2xs">
                  <div>
                    <span className="font-semibold text-slate-500 block">Father's Name:</span>
                    <span className="font-bold text-slate-900">{fatherNameDisplay}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">Mobile No:</span>
                    <span className="font-bold text-slate-900">{mobileNo}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">Mother's Name:</span>
                    <span className="font-bold text-slate-900">{student.mother_name || "—"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">Blood Group:</span>
                    <span className="font-bold text-red-600">{student.blood_group || "—"}</span>
                  </div>
                </div>

                <div className="bg-white/90 p-1 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="font-semibold text-slate-500 block">Residential Address:</span>
                  <span className="font-bold text-slate-900 block truncate">{studentAddress}</span>
                </div>

                <div className="text-[6px] text-slate-500 leading-tight italic">
                  * This ID card is non-transferable and must be presented on demand. If found, please return to school administration.
                </div>
              </div>

              {/* Back Footer */}
              <div 
                className="pt-1 border-t border-amber-400 flex justify-between items-center text-[6.5px] text-white font-bold p-1.5 rounded-b-lg shadow-xs"
                style={{ background: `linear-gradient(135deg, ${theme.primaryStart} 0%, ${theme.primaryEnd} 100%)` }}
              >
                <span className="truncate max-w-[50%]">{schoolName}</span>
                <span>Helpline: {phone}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



