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
/** Card layout/design variant */
export type CardDesign = "classic" | "diamond" | "vintage" | "corporate";

export type CardCustomization = {
  schoolName: string;
  motto: string;
  session: string;
  principalName: string;
  themeColor: ThemeColor;
  bgStyle?: BgStyle;
  cardDesign?: CardDesign;
  logoUrl?: string;
  phone?: string;
  address?: string;
  website?: string;
  showBackSide?: boolean;
  /** URL of the uploaded principal signature image */
  principalSignatureUrl?: string;
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

/** Small helper that renders a principal signature — either an uploaded image or the SVG fallback */
function PrincipalSignature({
  signatureUrl,
  accentColor,
}: {
  signatureUrl?: string;
  accentColor?: string;
}) {
  if (signatureUrl) {
    return (
      <img
        src={signatureUrl}
        alt="Principal Signature"
        className="w-10 h-3 object-contain"
        style={{ filter: "brightness(0) saturate(100%) invert(0)" }}
      />
    );
  }
  return (
    <svg
      className="w-10 h-3 text-red-600"
      viewBox="0 0 100 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 22 C 20 5, 30 25, 45 12 C 55 2, 60 28, 75 10 C 85 5, 90 20, 95 15"
        stroke={accentColor || "currentColor"}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M15 18 L 85 24"
        stroke={accentColor || "currentColor"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
  // Signature: from customization prop OR from site settings DB column
  const signatureUrl = customization.principalSignatureUrl || (settings as any)?.principal_signature_url || undefined;

  const themeKey = customization.themeColor || "navy";
  const theme = themeMap[themeKey] || themeMap.navy;
  const bgStyle = customization.bgStyle || "gradient";
  const cardDesign = customization.cardDesign || "classic";

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

  // ---------------------------------------------------------------------------
  // BACK SIDE — shared across all designs
  // ---------------------------------------------------------------------------
  const backSide = (
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
            <span className="font-bold text-slate-900 break-words leading-tight">{fatherNameDisplay}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-500 block">Mobile No:</span>
            <span className="font-bold text-slate-900 break-words">{mobileNo}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-500 block">Mother's Name:</span>
            <span className="font-bold text-slate-900 break-words leading-tight">{student.mother_name || "—"}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-500 block">Blood Group:</span>
            <span className="font-bold text-red-600">{student.blood_group || "—"}</span>
          </div>
        </div>

        <div className="bg-white/90 p-1 rounded-lg border border-slate-200 shadow-2xs">
          <span className="font-semibold text-slate-500 block">Residential Address:</span>
          <span className="font-bold text-slate-900 block break-words leading-tight">{studentAddress}</span>
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
        <span className="break-words max-w-[50%] leading-tight">{schoolName}</span>
        <span>Helpline: {phone}</span>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // CLASSIC DESIGN (original — preserved exactly)
  // ---------------------------------------------------------------------------
  const classicFront = (
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

          {/* School Name & Motto — wraps on overflow */}
          <div className="flex-1 min-w-0 text-center z-10 px-0.5">
            <h1
              className="font-black tracking-tight text-[8.8px] leading-tight uppercase drop-shadow-xs font-sans break-words"
              style={{ color: theme.accentText }}
            >
              {schoolName}
            </h1>
            <p className="text-[6.5px] text-amber-100 font-semibold tracking-wide leading-tight break-words mt-0.5">
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

            {/* STUDENT NAME */}
            <div className="flex items-start">
              <span className="w-[20mm] font-bold text-slate-800 shrink-0">STUDENT NAME</span>
              <span className="font-extrabold text-red-600 uppercase break-words text-[8px] pl-0.5 tracking-tight leading-tight flex-1 min-w-0">
                : {studentDisplayName}
              </span>
            </div>

            {/* FATHER'S NAME */}
            <div className="flex items-start">
              <span className="w-[20mm] font-bold text-slate-800 shrink-0">FATHER'S NAME</span>
              <span className="font-bold text-slate-900 uppercase break-words pl-0.5 leading-tight flex-1 min-w-0">
                : {fatherNameDisplay}
              </span>
            </div>

            {/* CLASS / SECTION */}
            <div className="flex items-start">
              <span className="w-[20mm] font-bold text-slate-800 shrink-0">CLASS / SECTION</span>
              <span className="font-bold text-slate-900 uppercase break-words pl-0.5 leading-tight flex-1 min-w-0">
                : {studentClassSection}
              </span>
            </div>

            {/* SESSION */}
            <div className="flex items-start">
              <span className="w-[20mm] font-bold text-slate-800 shrink-0">SESSION</span>
              <span className="font-bold text-slate-900 break-words pl-0.5 leading-tight flex-1 min-w-0">
                : {session}
              </span>
            </div>

            {/* MOBILE NO */}
            <div className="flex items-start">
              <span className="w-[20mm] font-bold text-slate-800 shrink-0">MOBILE NO</span>
              <span className="font-bold text-slate-900 break-words pl-0.5 leading-tight flex-1 min-w-0">
                : {mobileNo}
              </span>
            </div>

            {/* ADDRESS */}
            <div className="flex items-start">
              <span className="w-[20mm] font-bold text-slate-800 shrink-0">ADDRESS</span>
              <span className="font-bold text-slate-900 break-words pl-0.5 leading-tight flex-1 min-w-0">
                : {studentAddress}
              </span>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: QR Code, Reg No, Principal Signature */}
        <div className="w-[16mm] shrink-0 flex flex-col items-center justify-between h-full pt-0.5 pr-0.5">
          {/* Reg / Student Code */}
          <div className="text-[5.5px] font-black text-slate-900 tracking-tighter uppercase text-center break-all w-full bg-slate-100/90 py-[0.5px] rounded border border-slate-300">
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
            <PrincipalSignature signatureUrl={signatureUrl} accentColor={theme.accent} />
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
        <div className="flex items-center gap-1 overflow-hidden flex-1 mr-1">
          <MapPin size={8} className="text-amber-300 shrink-0" />
          <span className="font-semibold break-words text-slate-100 uppercase tracking-tight leading-tight line-clamp-2">{address}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Phone size={8} className="text-amber-300 shrink-0" />
          <span className="font-extrabold text-amber-300 tracking-tighter">{phone}</span>
        </div>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // DIAMOND DESIGN — split diagonal, bold left stripe with name overlay
  // ---------------------------------------------------------------------------
  const diamondFront = (
    <div className="h-full w-full flex flex-col relative overflow-hidden">
      {/* Diagonal split background */}
      <div
        className="absolute inset-0 z-0"
        style={{ background: bgStyle !== "minimal" ? theme.bgGradient : "#ffffff" }}
      />
      <div
        className="absolute top-0 left-0 w-[45%] h-full z-0"
        style={{
          background: `linear-gradient(160deg, ${theme.primaryStart} 0%, ${theme.primaryEnd} 100%)`,
          clipPath: "polygon(0 0, 100% 0, 80% 100%, 0 100%)",
        }}
      />

      {/* Logo top-left */}
      <div className="absolute top-[2mm] left-[2mm] z-20">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="h-6 w-6 object-contain bg-white rounded-full p-0.5 border-2 shadow-sm" style={{ borderColor: theme.accent }} />
        ) : (
          <div className="h-6 w-6 rounded-full bg-white grid place-items-center border-2 shadow-sm" style={{ borderColor: theme.accent }}>
            <Shield size={12} style={{ color: theme.primaryEnd }} />
          </div>
        )}
      </div>

      {/* Student Photo — overlapping the diagonal */}
      <div className="absolute top-[8mm] left-[2.5mm] z-20">
        <div className="w-[17mm] h-[20mm] rounded-md overflow-hidden border-2 bg-white shadow-md" style={{ borderColor: theme.accent }}>
          {student.photo_url ? (
            <img src={student.photo_url} alt={studentDisplayName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: theme.bgGradient }}>
              <User size={24} style={{ color: theme.primaryEnd }} />
            </div>
          )}
        </div>
        {/* Blood group badge */}
        {student.blood_group && (
          <div
            className="mt-0.5 text-center text-[5px] font-black text-white px-1 py-[1px] rounded leading-none"
            style={{ background: "#dc2626" }}
          >
            {student.blood_group}
          </div>
        )}
      </div>

      {/* School name & motto — top right */}
      <div className="absolute top-[2mm] right-[1.5mm] z-20 max-w-[52%] text-right">
        <div className="font-black text-[7.5px] leading-tight uppercase break-words" style={{ color: theme.primaryEnd }}>
          {schoolName}
        </div>
        <div className="text-[5.5px] font-semibold mt-0.5 break-words leading-tight" style={{ color: theme.primaryStart, opacity: 0.8 }}>
          {motto}
        </div>
      </div>

      {/* Student details — right panel */}
      <div className="absolute top-[16mm] right-[1.5mm] z-20 max-w-[52%] space-y-[1.5px] text-[6.5px]">
        <div>
          <div className="text-[5px] uppercase font-bold tracking-widest" style={{ color: theme.primaryEnd, opacity: 0.7 }}>Student Name</div>
          <div className="font-extrabold text-red-600 uppercase break-words leading-tight">{studentDisplayName}</div>
        </div>
        <div>
          <div className="text-[5px] uppercase font-bold tracking-widest" style={{ color: theme.primaryEnd, opacity: 0.7 }}>Father's Name</div>
          <div className="font-bold text-slate-800 uppercase break-words leading-tight">{fatherNameDisplay}</div>
        </div>
        <div>
          <div className="text-[5px] uppercase font-bold tracking-widest" style={{ color: theme.primaryEnd, opacity: 0.7 }}>Class / Session</div>
          <div className="font-bold text-slate-800 break-words leading-tight">{studentClassSection} · {session}</div>
        </div>
        <div>
          <div className="text-[5px] uppercase font-bold tracking-widest" style={{ color: theme.primaryEnd, opacity: 0.7 }}>Mobile</div>
          <div className="font-bold text-slate-800 break-words leading-tight">{mobileNo}</div>
        </div>
        <div>
          <div className="text-[5px] uppercase font-bold tracking-widest" style={{ color: theme.primaryEnd, opacity: 0.7 }}>Address</div>
          <div className="font-bold text-slate-800 break-words leading-tight">{studentAddress}</div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 px-2 py-[1.5mm] flex items-center justify-between text-[5.5px] text-white"
        style={{ background: `linear-gradient(90deg, ${theme.primaryStart} 0%, ${theme.primaryEnd} 100%)` }}
      >
        <div className="flex items-center gap-1 overflow-hidden flex-1 mr-1">
          <MapPin size={7} className="shrink-0 opacity-80" />
          <span className="break-words leading-tight line-clamp-2 opacity-90">{address}</span>
        </div>
        {/* QR + signature stacked */}
        <div className="shrink-0 flex flex-col items-center gap-[1px]">
          {qrCodeDataUrl && <img src={qrCodeDataUrl} alt="QR" className="w-[7mm] h-[7mm] bg-white rounded-sm p-[0.5px]" />}
          <PrincipalSignature signatureUrl={signatureUrl} accentColor="#fff" />
          <span className="text-[4px] uppercase font-bold tracking-widest opacity-80">PRINCIPAL</span>
        </div>
      </div>

      {/* Reg code - diagonal left strip bottom */}
      <div
        className="absolute bottom-[7.5mm] left-[0.5mm] z-20 text-white text-[4.5px] font-black tracking-tighter uppercase px-1 py-[1px] rounded-r"
        style={{ background: "rgba(0,0,0,0.35)" }}
      >
        {studentRegCode}
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // VINTAGE DESIGN — warm parchment look with ornamental borders
  // ---------------------------------------------------------------------------
  const vintageFront = (
    <div
      className="h-full w-full flex flex-col relative overflow-hidden"
      style={{ background: bgStyle !== "minimal" ? "#fef9f0" : "#ffffff" }}
    >
      {/* Outer ornamental border */}
      <div
        className="absolute inset-[1mm] z-0 rounded-lg border-2 pointer-events-none"
        style={{ borderColor: theme.accent, opacity: 0.6 }}
      />
      <div
        className="absolute inset-[2.2mm] z-0 rounded-md border pointer-events-none"
        style={{ borderColor: theme.primaryEnd, opacity: 0.3 }}
      />

      {/* Header band */}
      <div
        className="relative z-10 px-2 pt-[1.5mm] pb-[1mm] flex items-center justify-center gap-1.5"
        style={{ background: `linear-gradient(90deg, ${theme.primaryStart}, ${theme.primaryEnd})` }}
      >
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="h-6 w-6 object-contain bg-white rounded-full p-[1px] border" style={{ borderColor: theme.accent }} />
        ) : (
          <div className="h-5.5 w-5.5 rounded-full bg-white grid place-items-center border" style={{ borderColor: theme.accent }}>
            <Shield size={10} style={{ color: theme.primaryEnd }} />
          </div>
        )}
        <div className="text-center">
          <div className="font-black text-[7.8px] leading-tight uppercase break-words" style={{ color: theme.accentText }}>{schoolName}</div>
          <div className="text-[5.5px] font-semibold break-words leading-tight" style={{ color: "#fde68a" }}>{motto}</div>
        </div>
      </div>

      {/* Middle: photo + details */}
      <div className="flex-1 z-10 flex gap-1.5 px-[2.5mm] pt-[1.5mm] pb-[1mm] overflow-hidden">
        {/* Photo */}
        <div className="shrink-0">
          <div className="w-[16mm] h-[20mm] overflow-hidden rounded-sm border-2 shadow-sm bg-white" style={{ borderColor: theme.primaryEnd }}>
            {student.photo_url ? (
              <img src={student.photo_url} alt={studentDisplayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-amber-50">
                <User size={22} style={{ color: theme.primaryEnd }} />
              </div>
            )}
          </div>
          {/* QR below photo */}
          <div className="mt-0.5 bg-white p-[1px] border rounded-xs" style={{ borderColor: "#d1d5db" }}>
            {qrCodeDataUrl
              ? <img src={qrCodeDataUrl} alt="QR" className="w-[9mm] h-[9mm]" />
              : <div className="w-[9mm] h-[9mm] bg-slate-100 animate-pulse rounded" />}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 space-y-[1.5px] text-[6.5px]">
          <InfoRow label="Name" value={studentDisplayName} bold red />
          <InfoRow label="Father" value={fatherNameDisplay} />
          <InfoRow label="Class" value={`${studentClassSection} | ${session}`} />
          <InfoRow label="Adm. No" value={studentRegCode} />
          <InfoRow label="Mobile" value={mobileNo} />
          <InfoRow label="Address" value={studentAddress} />
          {student.blood_group && <InfoRow label="Blood" value={student.blood_group} red />}
        </div>
      </div>

      {/* Footer */}
      <div
        className="relative z-10 px-2 py-[1mm] flex items-center justify-between text-[5.2px]"
        style={{ background: `linear-gradient(90deg, ${theme.primaryStart}, ${theme.primaryEnd})` }}
      >
        <div className="flex items-center gap-1 overflow-hidden flex-1 mr-1">
          <MapPin size={7} className="text-amber-300 shrink-0" />
          <span className="text-white break-words leading-tight line-clamp-2 opacity-90">{address}</span>
        </div>
        <div className="shrink-0 flex flex-col items-center ml-2">
          <PrincipalSignature signatureUrl={signatureUrl} accentColor="#fef9c3" />
          <div className="text-[4px] text-amber-200 uppercase font-bold tracking-wider mt-[0.5px]">PRINCIPAL</div>
        </div>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // CORPORATE DESIGN — clean modern two-tone horizontal split
  // ---------------------------------------------------------------------------
  const corporateFront = (
    <div className="h-full w-full flex flex-col relative overflow-hidden">
      {/* Top half — solid primary */}
      <div
        className="w-full relative z-10 flex-[0_0_43%]"
        style={{ background: `linear-gradient(135deg, ${theme.primaryStart} 0%, ${theme.primaryEnd} 100%)` }}
      >
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, ${theme.accent} 0.8px, transparent 0.8px)`,
            backgroundSize: "4.5px 4.5px",
          }}
        />

        {/* Logo + school name horizontal */}
        <div className="relative z-10 flex items-center gap-1.5 px-2 pt-[1.5mm] pb-[1mm]">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-7 w-7 object-contain bg-white rounded-full p-0.5 border-2 shadow" style={{ borderColor: theme.accent }} />
          ) : (
            <div className="h-7 w-7 rounded-full bg-white grid place-items-center border-2 shadow" style={{ borderColor: theme.accent }}>
              <Shield size={14} style={{ color: theme.primaryEnd }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-black text-[8px] leading-tight uppercase break-words" style={{ color: theme.accentText }}>{schoolName}</div>
            <div className="text-[5.5px] font-medium break-words leading-tight opacity-80" style={{ color: theme.accentText }}>{motto}</div>
          </div>
          {/* Reg code badge */}
          <div
            className="shrink-0 text-[4.5px] font-black tracking-tight uppercase px-1 py-[1px] rounded text-white border border-white/30"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            {studentRegCode}
          </div>
        </div>

        {/* Student photo floats over the middle split */}
        <div className="absolute bottom-[-9mm] left-[2mm] z-30">
          <div className="w-[16mm] h-[18mm] rounded-md overflow-hidden border-[2.5px] shadow-lg bg-white" style={{ borderColor: theme.accent }}>
            {student.photo_url ? (
              <img src={student.photo_url} alt={studentDisplayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-100">
                <User size={22} style={{ color: theme.primaryEnd }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom half — light bg with student info */}
      <div
        className="w-full relative z-10 flex-1 flex flex-col overflow-hidden pl-[20mm] pr-[1.5mm] pt-[1.5mm] pb-[1mm]"
        style={{ background: bgStyle !== "minimal" ? theme.bgGradient : "#ffffff" }}
      >
        <div className="space-y-[1px] text-[6.3px]">
          <div className="font-extrabold text-red-600 uppercase break-words leading-tight text-[7.5px]">{studentDisplayName}</div>
          <InfoRow label="Father" value={fatherNameDisplay} compact />
          <InfoRow label="Class" value={`${studentClassSection} · ${session}`} compact />
          <InfoRow label="Mobile" value={mobileNo} compact />
          <InfoRow label="Address" value={studentAddress} compact />
        </div>

        {/* Bottom actions row: QR + signature */}
        <div className="mt-auto flex items-end justify-between">
          {qrCodeDataUrl && (
            <div className="bg-white border rounded p-[0.5px]" style={{ borderColor: "#e2e8f0" }}>
              <img src={qrCodeDataUrl} alt="QR" className="w-[8mm] h-[8mm]" />
            </div>
          )}
          <div className="flex flex-col items-center ml-auto">
            <PrincipalSignature signatureUrl={signatureUrl} accentColor={theme.primaryEnd} />
            <div className="border-t text-[4.5px] uppercase font-black tracking-widest pt-[0.5px]" style={{ borderColor: theme.primaryEnd, color: theme.primaryEnd }}>
              PRINCIPAL
            </div>
          </div>
        </div>
      </div>

      {/* Bottom footer strip */}
      <div
        className="w-full relative z-10 px-2 py-[1mm] flex items-center gap-1 text-[5px] text-white"
        style={{ background: theme.primaryStart }}
      >
        <Phone size={7} className="shrink-0 opacity-70" />
        <span className="font-bold opacity-90 mr-2">{phone}</span>
        <MapPin size={7} className="shrink-0 opacity-70" />
        <span className="opacity-80 break-words flex-1 line-clamp-1">{address}</span>
      </div>
    </div>
  );

  // Pick which front to render
  const renderFront = () => {
    if (cardDesign === "diamond") return diamondFront;
    if (cardDesign === "vintage") return vintageFront;
    if (cardDesign === "corporate") return corporateFront;
    return classicFront; // default: "classic"
  };

  return (
    <div
      className={`print-card-wrapper inline-block text-slate-900 select-none ${className}`}
      style={{
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: "top left",
      }}
    >
      {/* Universal Aadhaar Card / CR80 standard dimensions: 85.6mm x 53.98mm */}
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
          {!customization.showBackSide ? renderFront() : backSide}
        </div>
      </div>
    </div>
  );
}
<<<<<<< HEAD

// ---------------------------------------------------------------------------
// Small helper — used in non-classic designs
// ---------------------------------------------------------------------------
function InfoRow({
  label,
  value,
  bold,
  red,
  compact,
}: {
  label: string;
  value: string;
  bold?: boolean;
  red?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`flex items-start gap-0.5 ${compact ? "text-[6px]" : "text-[6.5px]"}`}>
      <span className="shrink-0 font-bold text-slate-500 min-w-[11mm]">{label}:</span>
      <span
        className={`break-words leading-tight flex-1 min-w-0 ${bold ? "font-extrabold" : "font-semibold"} ${red ? "text-red-600" : "text-slate-800"}`}
      >
        {value}
      </span>
    </div>
  );
}
=======
>>>>>>> 2fbbcd1132f9a20156870281b3a9b00c785c4682
