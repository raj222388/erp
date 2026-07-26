import { supabase } from "@/integrations/supabase/client";
import { queryOptions } from "@tanstack/react-query";

// Local types (until Supabase generated types are refreshed)
export type SiteSettings = {
  id: string;
  school_name: string;
  motto: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  office_hours: string | null;
  google_map_url: string | null;
  google_map_embed: string | null;
  principal_name: string | null;
  principal_photo_url: string | null;
  principal_message: string | null;
  director_name: string | null;
  director_photo_url: string | null;
  director_message: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  linkedin_url: string | null;
  welcome_message: string | null;
  announcement_bar: string | null;
  announcement_active: boolean;
  footer_text: string | null;
  copyright: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_image_url: string | null;
  analytics_code: string | null;
  principal_signature_url: string | null;
};

export type HeroSlide = {
  id: string; title: string | null; subtitle: string | null; image_url: string;
  cta_label: string | null; cta_href: string | null; display_order: number; is_visible: boolean;
  created_at: string; updated_at: string;
};

export type AboutSection = {
  id: string; section_key: string; title: string; body: string | null;
  image_url: string | null; icon: string | null; display_order: number; is_published: boolean;
};

export type Teacher = {
  id: string; name: string; designation: string | null; subject: string | null;
  qualification: string | null; experience: string | null; achievements: string | null;
  bio: string | null; photo_url: string | null; display_order: number;
  is_featured: boolean; is_visible: boolean;
};

export type Facility = {
  id: string; title: string; description: string | null; icon: string | null;
  category: string | null; image_url: string | null; display_order: number; is_visible: boolean;
};

export type NewsItem = {
  id: string; title: string; slug: string | null; excerpt: string | null;
  content: string | null; cover_image_url: string | null;
  is_featured: boolean; is_published: boolean;
  published_at: string | null; created_at: string; updated_at: string;
};

export type EventItem = {
  id: string; title: string; description: string | null; event_date: string | null;
  venue: string | null; poster_url: string | null; gallery: string[] | null;
  is_featured: boolean; is_archived: boolean; is_published: boolean;
};

export type Testimonial = {
  id: string; name: string; role: string | null; message: string;
  photo_url: string | null; rating: number | null; display_order: number; is_visible: boolean;
};

export type Faq = {
  id: string; question: string; answer: string; display_order: number; is_visible: boolean;
};

export type Album = {
  id: string; title: string; slug: string | null; description: string | null;
  category: string | null; cover_image_url: string | null; event_date: string | null;
  display_order: number; is_visible: boolean;
};

export type Notice = {
  id: string; title: string; content: string | null; file_url: string | null;
  image_url: string | null; priority: number; expires_at: string | null; is_published: boolean;
  created_at: string;
};

const sb = supabase as any;
const unwrap = <T,>({ data, error }: { data: T | null; error: unknown }, fallback: T | null = null): T | null => {
  if (error) {
    console.warn("Supabase query error:", error);
    return fallback;
  }
  return data ?? fallback;
};

export const settingsQuery = queryOptions({
  queryKey: ["site_settings"],
  queryFn: async () =>
    unwrap<SiteSettings | null>(await sb.from("site_settings").select("*").limit(1).maybeSingle(), null),
});

export const heroSlidesQuery = queryOptions({
  queryKey: ["hero_slides"],
  queryFn: async () =>
    unwrap<HeroSlide[]>(await sb.from("hero_slides").select("*").eq("is_visible", true).order("display_order"), []) ?? [],
});

export const aboutQuery = queryOptions({
  queryKey: ["about_sections"],
  queryFn: async () =>
    unwrap<AboutSection[]>(await sb.from("about_sections").select("*").eq("is_published", true).order("display_order"), []) ?? [],
});

export const teachersQuery = queryOptions({
  queryKey: ["teachers"],
  queryFn: async () =>
    unwrap<Teacher[]>(await sb.rpc("get_public_teachers"), []) ?? [],
});

export const facilitiesQuery = queryOptions({
  queryKey: ["facilities"],
  queryFn: async () =>
    unwrap<Facility[]>(await sb.from("facilities").select("*").eq("is_visible", true).order("display_order"), []) ?? [],
});

export const newsQuery = queryOptions({
  queryKey: ["news"],
  queryFn: async () =>
    unwrap<NewsItem[]>(await sb.from("news").select("*").eq("is_published", true).order("published_at", { ascending: false }), []) ?? [],
});

export const eventsQuery = queryOptions({
  queryKey: ["events"],
  queryFn: async () =>
    unwrap<EventItem[]>(await sb.from("events").select("*").eq("is_published", true).order("event_date", { ascending: true }), []) ?? [],
});

export const testimonialsQuery = queryOptions({
  queryKey: ["testimonials"],
  queryFn: async () =>
    unwrap<Testimonial[]>(await sb.from("testimonials").select("*").eq("is_visible", true).order("display_order"), []) ?? [],
});

export const faqsQuery = queryOptions({
  queryKey: ["faqs"],
  queryFn: async () =>
    unwrap<Faq[]>(await sb.from("faqs").select("*").eq("is_visible", true).order("display_order"), []) ?? [],
});

export const albumsQuery = queryOptions({
  queryKey: ["gallery_albums"],
  queryFn: async () =>
    unwrap<Album[]>(await sb.from("gallery_albums").select("*").eq("is_visible", true).order("display_order"), []) ?? [],
});

export const noticesQuery = queryOptions({
  queryKey: ["notices"],
  queryFn: async () =>
    unwrap<Notice[]>(await sb.from("notices").select("*").eq("is_published", true).order("priority", { ascending: false }).order("created_at", { ascending: false }), []) ?? [],
});
