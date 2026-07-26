import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminHeader, useCollection } from "@/components/admin/crud";
import { settingsQuery } from "@/lib/queries";
import { StudentIdCard, type Student, type CardCustomization, type CardDesign } from "@/components/admin/StudentIdCard";
import { supabase } from "@/integrations/supabase/client";
import {
  Printer,
  Search,
  Filter,
  CheckSquare,
  Square,
  Eye,
  X,
  CreditCard,
  FileText,
  School,
  Sparkles,
  Download,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/id-cards")({
  component: AdminIdCards,
});

const sb = supabase as any;

// Helper to chunk array into pages of given size
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export function AdminIdCards() {
  const { data: students = [], isLoading: isLoadingStudents } = useCollection<Student>("students", "created_at", false);
  const { data: settings } = useQuery(settingsQuery);

  const { data: classrooms = [] } = useQuery<{ id: string; name: string; grade: string | null; section: string | null }[]>({
    queryKey: ["admin", "classrooms-lite"],
    queryFn: async () => {
      const { data, error } = await sb.from("classrooms").select("id, name, grade, section").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState<string>("all");
  const [selectedStudents, setSelectedStudents] = useState<Record<string, boolean>>({});
  const [previewStudent, setPreviewStudent] = useState<Student | null>(null);
  const [groupByClass, setGroupByClass] = useState<boolean>(true);

  // Customization controls
  const [customization, setCustomization] = useState<CardCustomization>({
    schoolName: settings?.school_name || "MAA SARSWATI VIDYA MANDIR J.H. SCHOOL",
    motto: settings?.motto || "॥ विद्या ददाति विनयम् ॥",
    session: "2026-27",
    principalName: settings?.principal_name || "Principal",
    themeColor: "navy",
    bgStyle: "gradient",
    cardDesign: "classic",
    phone: settings?.phone || "8887845857, 9415620250",
    address: settings?.address || "Near Patar Kalan Chauraha, Dubar Market, Lalganj Mirzapur",
    website: "www.maasarswatividyamandir.in",
    showBackSide: false,
    principalSignatureUrl: (settings as any)?.principal_signature_url || undefined,
  });

  const [activeTab, setActiveTab] = useState<"front" | "back">("front");

  // Keep customization updated when settings load
  useMemo(() => {
    if (settings) {
      setCustomization((prev) => ({
        ...prev,
        schoolName: settings.school_name || prev.schoolName,
        motto: settings.motto || prev.motto,
        principalName: settings.principal_name || prev.principalName,
        phone: settings.phone || prev.phone,
        address: settings.address || prev.address,
        principalSignatureUrl: (settings as any).principal_signature_url || prev.principalSignatureUrl,
      }));
    }
  }, [settings]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        `${s.first_name} ${s.last_name || ""}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.admission_no && s.admission_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.roll_no && s.roll_no.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesClass = selectedClassroom === "all" || s.classroom_id === selectedClassroom;

      return matchesSearch && matchesClass;
    });
  }, [students, searchTerm, selectedClassroom]);

  // Count per classroom for quick pills
  const classroomCounts = useMemo(() => {
    const counts: Record<string, number> = { all: students.length };
    students.forEach((s) => {
      if (s.classroom_id) {
        counts[s.classroom_id] = (counts[s.classroom_id] || 0) + 1;
      }
    });
    return counts;
  }, [students]);

  // Selection handlers
  const toggleSelectAll = () => {
    const allSelected = filteredStudents.length > 0 && filteredStudents.every((s) => selectedStudents[s.id]);
    const updated: Record<string, boolean> = { ...selectedStudents };

    filteredStudents.forEach((s) => {
      updated[s.id] = !allSelected;
    });

    setSelectedStudents(updated);
  };

  const toggleSelectStudent = (id: string) => {
    setSelectedStudents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectedCount = useMemo(() => {
    return filteredStudents.filter((s) => selectedStudents[s.id]).length;
  }, [filteredStudents, selectedStudents]);

  // Determine students to print
  const studentsToPrint = useMemo(() => {
    const selectedList = filteredStudents.filter((s) => selectedStudents[s.id]);
    return selectedList.length > 0 ? selectedList : filteredStudents;
  }, [filteredStudents, selectedStudents]);

  // Group and chunk students into A4 pages (10 cards per A4 sheet: 2 cols x 5 rows)
  const printPages = useMemo(() => {
    const list = studentsToPrint;
    if (list.length === 0) return [];

    if (groupByClass && selectedClassroom === "all") {
      // Group students class-wise
      const groups: Record<string, { className: string; students: Student[] }> = {};
      
      list.forEach((student) => {
        const classId = student.classroom_id || "unassigned";
        const clsObj = classrooms.find((c) => c.id === student.classroom_id);
        const className = clsObj
          ? `${clsObj.name} ${clsObj.grade ? `(${clsObj.grade}${clsObj.section ? "-" + clsObj.section : ""})` : ""}`
          : [student.grade, student.section].filter(Boolean).join("-") || "General Class";

        if (!groups[classId]) {
          groups[classId] = { className, students: [] };
        }
        groups[classId].students.push(student);
      });

      // Chunk each class into pages of 10 cards max
      const pages: { className: string; students: Student[]; pageNum: number; totalPagesInClass: number }[] = [];
      
      Object.values(groups).forEach((g) => {
        const chunks = chunkArray(g.students, 10);
        chunks.forEach((chunk, pageIdx) => {
          pages.push({
            className: g.className,
            students: chunk,
            pageNum: pageIdx + 1,
            totalPagesInClass: chunks.length,
          });
        });
      });

      return pages;
    } else {
      // Single class or continuous batch mode: chunk into pages of 10 cards
      const chunks = chunkArray(list, 10);
      const clsObj = classrooms.find((c) => c.id === selectedClassroom);
      const className = clsObj
        ? `${clsObj.name} ${clsObj.grade ? `(${clsObj.grade}${clsObj.section ? "-" + clsObj.section : ""})` : ""}`
        : "Class Batch";

      return chunks.map((chunk, pageIdx) => ({
        className,
        students: chunk,
        pageNum: pageIdx + 1,
        totalPagesInClass: chunks.length,
      }));
    }
  }, [studentsToPrint, groupByClass, selectedClassroom, classrooms]);

  const handlePrint = () => {
    if (studentsToPrint.length === 0) {
      toast.error("No students selected for printing.");
      return;
    }
    toast.success(`Preparing ${studentsToPrint.length} ID Card(s) across ${printPages.length} A4 page(s)...`);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Hide all controls and screen UI when printing */}
      <div className="print:hidden space-y-6">
        <AdminHeader
          title="Student ID Cards"
          subtitle="Generate, customize, and batch-print universal Aadhaar / CR80 size student ID cards (10 ID Cards per A4 sheet)."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={handlePrint} className="btn-primary flex items-center gap-2 shadow-md">
                <Printer size={18} /> Print / Export PDF ({studentsToPrint.length} Cards)
              </button>
            </div>
          }
        />

        {/* Quick Batch Summary Banner */}
        <div className="card-soft p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary text-primary-foreground shadow-sm">
              <FileText size={22} />
            </div>
            <div>
              <div className="font-display font-semibold text-sm text-foreground flex items-center gap-2">
                A4 PDF Layout Ready: <span className="text-primary font-bold">{printPages.length} Page(s)</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  10 Cards / A4 Sheet
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Exact Universal CR80 size (85.6mm × 54mm) • No size compromise • Class-wise batching supported
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer bg-background/80 px-3 py-1.5 rounded-lg border border-border">
              <input
                type="checkbox"
                checked={groupByClass}
                onChange={(e) => setGroupByClass(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4"
              />
              <span>Separate Class Pages when printing</span>
            </label>

            <button
              onClick={handlePrint}
              className="btn-gold text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm"
            >
              <Printer size={15} /> Print Batch PDF
            </button>
          </div>
        </div>

        {/* Customization & Settings Panel */}
        <div className="card-soft p-5 bg-gradient-to-br from-background to-muted/30 border border-border">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <CreditCard size={18} />
              </div>
              <div>
                <h2 className="font-display font-semibold text-base">Card Template & Styling Options</h2>
                <p className="text-xs text-muted-foreground">Standard Universal Aadhaar Card / CR80 Format (85.6 mm × 54.0 mm)</p>
              </div>
            </div>

            {/* Side Toggle */}
            <div className="flex rounded-lg bg-muted p-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("front");
                  setCustomization((prev) => ({ ...prev, showBackSide: false }));
                }}
                className={`px-3 py-1 rounded-md font-medium transition ${activeTab === "front" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"}`}
              >
                Front Side
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("back");
                  setCustomization((prev) => ({ ...prev, showBackSide: true }));
                }}
                className={`px-3 py-1 rounded-md font-medium transition ${activeTab === "back" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"}`}
              >
                Back Side
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
            {/* Color Theme Selector */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Theme Color</label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: "navy", name: "Classic Navy", color: "#0f2b5c" },
                  { id: "emerald", name: "Emerald", color: "#064e3b" },
                  { id: "crimson", name: "Crimson", color: "#881337" },
                  { id: "midnight", name: "Midnight", color: "#0f172a" },
                  { id: "royal", name: "Royal Purple", color: "#581c87" },
                  { id: "gold", name: "Luxury Gold", color: "#b45309" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    title={t.name}
                    onClick={() => setCustomization((prev) => ({ ...prev, themeColor: t.id as any }))}
                    className={`h-6.5 w-6.5 rounded-full border-2 transition grid place-items-center ${
                      customization.themeColor === t.id ? "border-amber-400 scale-110 shadow-md ring-2 ring-amber-400/40" : "border-transparent opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: t.color }}
                  />
                ))}
              </div>
            </div>

            {/* Background Style Selector */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Background Style</label>
              <select
                value={customization.bgStyle || "gradient"}
                onChange={(e) => setCustomization((prev) => ({ ...prev, bgStyle: e.target.value as any }))}
                className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium"
              >
                <option value="gradient">🎨 Soft Gradient Tint</option>
                <option value="mesh">✨ Modern Mesh Pattern</option>
                <option value="watermark">🛡️ Logo Watermark</option>
                <option value="minimal">⚪ Minimal Clean White</option>
              </select>
            </div>

            {/* School Name */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">School Name</label>
              <input
                type="text"
                value={customization.schoolName}
                onChange={(e) => setCustomization((prev) => ({ ...prev, schoolName: e.target.value }))}
                className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs"
                placeholder="School Name"
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Motto / Subtitle</label>
              <input
                type="text"
                value={customization.motto}
                onChange={(e) => setCustomization((prev) => ({ ...prev, motto: e.target.value }))}
                className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs"
                placeholder="Knowledge | Excellence"
              />
            </div>

            {/* Academic Session */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Academic Session</label>
              <input
                type="text"
                value={customization.session}
                onChange={(e) => setCustomization((prev) => ({ ...prev, session: e.target.value }))}
                className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs"
                placeholder="2026-27"
              />
            </div>
          </div>

          {/* Card Design Selector */}
          <div className="mt-4 pt-4 border-t border-border">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Card Design Layout</label>
            <div className="flex flex-wrap gap-2">
              {([
                { id: "classic", label: "🎓 Classic", desc: "Original header + photo" },
                { id: "diamond", label: "💎 Diamond", desc: "Diagonal split accent" },
                { id: "vintage", label: "📜 Vintage", desc: "Ornamental parchment" },
                { id: "corporate", label: "🏢 Corporate", desc: "Two-tone modern split" },
              ] as { id: CardDesign; label: string; desc: string }[]).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setCustomization((prev) => ({ ...prev, cardDesign: d.id }))}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium transition flex flex-col items-start gap-0.5 ${
                    customization.cardDesign === d.id
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background text-foreground border-border hover:border-primary/50"
                  }`}
                >
                  <span className="font-bold">{d.label}</span>
                  <span className={`text-[10px] ${customization.cardDesign === d.id ? "opacity-80" : "text-muted-foreground"}`}>{d.desc}</span>
                </button>
              ))}
            </div>
            {/* Principal Signature URL override */}
            <div className="mt-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Principal Signature Image URL</label>
              <input
                type="text"
                value={customization.principalSignatureUrl || ""}
                onChange={(e) => setCustomization((prev) => ({ ...prev, principalSignatureUrl: e.target.value || undefined }))}
                className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs"
                placeholder="Auto-loaded from Site Settings › Principal › Signature"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Upload the signature in <strong>Site Settings › Principal</strong>, then it auto-populates here. Or paste a direct image URL above.</p>
            </div>
          </div>
        </div>

        {/* Quick Classroom Pills Filter */}
        {classrooms.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-muted-foreground font-semibold text-[11px] uppercase tracking-wider shrink-0 flex items-center gap-1">
              <School size={14} /> Class Filter:
            </span>
            <button
              type="button"
              onClick={() => setSelectedClassroom("all")}
              className={`px-3 py-1.5 rounded-full font-medium shrink-0 transition ${
                selectedClassroom === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All Classes ({classroomCounts.all || 0})
            </button>
            {classrooms.map((c) => {
              const count = classroomCounts[c.id] || 0;
              const isSelected = selectedClassroom === c.id;
              const label = `${c.name}${c.grade ? ` (${c.grade}${c.section ? "-" + c.section : ""})` : ""}`;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedClassroom(c.id)}
                  className={`px-3 py-1.5 rounded-full font-medium shrink-0 transition flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <span>{label}</span>
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-background text-foreground"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Filters and Batch Actions Bar */}
        <div className="card-soft p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            {/* Search Box */}
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student by name, roll no, admission no..."
                className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-input bg-background"
              />
            </div>

            {/* Classroom Select Dropdown */}
            <select
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              className="py-1.5 px-3 text-sm rounded-lg border border-input bg-background font-medium"
            >
              <option value="all">All Classes ({students.length})</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.grade ? `(${c.grade}${c.section ? "-" + c.section : ""})` : ""} ({classroomCounts[c.id] || 0} students)
                </option>
              ))}
            </select>
          </div>

          {/* Select All & Status */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="btn-outline text-xs flex items-center gap-1.5 py-1.5 px-3"
            >
              {filteredStudents.length > 0 && filteredStudents.every((s) => selectedStudents[s.id]) ? (
                <>
                  <CheckSquare size={14} className="text-primary" /> Deselect All
                </>
              ) : (
                <>
                  <Square size={14} /> Select All in Class ({filteredStudents.length})
                </>
              )}
            </button>

            <div className="text-xs text-muted-foreground font-medium">
              Selected: <span className="font-bold text-foreground">{selectedCount}</span> of {filteredStudents.length}
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoadingStudents ? (
          <div className="card-soft p-12 text-center text-muted-foreground">Loading student records...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="card-soft p-12 text-center text-muted-foreground">No students found matching your search or class criteria.</div>
        ) : (
          /* Students ID Cards Grid View for Web Screen */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {filteredStudents.map((student) => {
              const isSelected = !!selectedStudents[student.id];

              return (
                <div
                  key={student.id}
                  className={`card-soft p-4 flex flex-col items-center relative transition-all duration-200 ${
                    isSelected ? "ring-2 ring-primary border-primary bg-primary/5" : "hover:border-primary/50"
                  }`}
                >
                  {/* Select Checkbox Top Left */}
                  <div className="absolute top-3 left-3 z-20">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectStudent(student.id);
                      }}
                      className="p-1 rounded bg-background/80 hover:bg-background border border-border shadow-xs"
                    >
                      {isSelected ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} className="text-muted-foreground" />}
                    </button>
                  </div>

                  {/* Actions Top Right */}
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewStudent(student)}
                      title="Preview Card"
                      className="p-1.5 rounded-md bg-background/80 hover:bg-background border border-border text-muted-foreground hover:text-foreground shadow-xs"
                    >
                      <Eye size={15} />
                    </button>
                  </div>

                  {/* ID Card Display */}
                  <div className="mt-6 mb-2 cursor-pointer" onClick={() => toggleSelectStudent(student.id)}>
                    <StudentIdCard student={student} classrooms={classrooms} settings={settings} customization={customization} />
                  </div>

                  {/* Student Quick Meta */}
                  <div className="w-full text-center mt-2 pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground truncate max-w-[150px]">
                      {student.first_name} {student.last_name || ""}
                    </span>
                    <span>Roll {student.roll_no || "—"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Fullscreen Card Preview Modal */}
        {previewStudent && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="card-soft p-6 max-w-lg w-full bg-background rounded-2xl shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <h3 className="font-display font-semibold text-lg">Student ID Card Preview</h3>
                <button type="button" onClick={() => setPreviewStudent(null)} className="p-1.5 rounded-lg hover:bg-muted">
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col items-center justify-center p-6 bg-muted/40 rounded-xl border border-border my-2">
                <StudentIdCard student={previewStudent} classrooms={classrooms} settings={settings} customization={customization} scale={1.25} />
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <div>
                  Token: <code className="bg-muted px-1.5 py-0.5 rounded">{previewStudent.qr_token || previewStudent.id}</code>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewStudent(null);
                      setSelectedStudents({ [previewStudent.id]: true });
                      setTimeout(window.print, 200);
                    }}
                    className="btn-primary text-xs flex items-center gap-1"
                  >
                    <Printer size={14} /> Print Single
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PRINT-ONLY CONTAINER (Hidden on Screen, ONLY rendered on window.print()) */}
      <div id="id-cards-print-area" className="hidden print:block font-sans">
        <style dangerouslySetInnerHTML={{ __html: printStyles }} />
        {printPages.map((page, pageIndex) => (
          <div key={pageIndex} className="a4-print-page">
            {page.students.map((student) => (
              <div key={student.id} className="print-card-box">
                <StudentIdCard student={student} classrooms={classrooms} settings={settings} customization={customization} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Print CSS styles strictly optimized for 10 ID Cards per A4 Sheet (2 Columns x 5 Rows)
// Standard CR80 / Universal Aadhaar Card size: 85.6mm width × 53.98mm height
const printStyles = `
@media print {
  /* HIDE ALL WEBSITE UI AND SIDEBAR */
  html, body {
    background: #ffffff !important;
    color: #000000 !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    height: 100% !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  aside, header, nav, footer, .print\\:hidden, [data-sonner-toaster] {
    display: none !important;
  }

  #id-cards-print-area {
    display: block !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
  }

  @page {
    size: A4 portrait;
    margin: 5mm 6mm 5mm 6mm;
  }

  .a4-print-page {
    width: 198mm !important;
    height: 286mm !important;
    padding: 1mm !important;
    margin: 0 auto !important;
    box-sizing: border-box !important;
    display: grid !important;
    grid-template-columns: repeat(2, 85.6mm) !important;
    grid-template-rows: repeat(5, 53.98mm) !important;
    gap: 3.5mm 6.5mm !important;
    justify-content: center !important;
    align-content: start !important;
    page-break-after: always !important;
    break-after: page !important;
    overflow: hidden !important;
  }

  .a4-print-page:last-child {
    page-break-after: auto !important;
    break-after: auto !important;
  }

  .print-card-box {
    width: 85.6mm !important;
    height: 53.98mm !important;
    box-sizing: border-box !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .print-card-box * {
    box-shadow: none !important;
  }
}
`;
