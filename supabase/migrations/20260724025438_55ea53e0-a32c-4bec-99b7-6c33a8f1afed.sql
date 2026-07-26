
-- =========================================
-- ROLES & HELPER
-- =========================================
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users can read their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Reusable updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Generic admin-write, public-read policy helper via inline policies below.

-- =========================================
-- SITE SETTINGS (singleton row)
-- =========================================
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name TEXT NOT NULL DEFAULT 'Greenfield Academy',
  motto TEXT DEFAULT 'Learn. Lead. Inspire.',
  logo_url TEXT,
  favicon_url TEXT,
  address TEXT DEFAULT '123 Learning Lane, Springfield',
  phone TEXT DEFAULT '+1 (555) 123-4567',
  email TEXT DEFAULT 'info@greenfield.edu',
  office_hours TEXT DEFAULT 'Mon–Fri, 8:00 AM – 4:00 PM',
  google_map_url TEXT,
  google_map_embed TEXT,
  principal_name TEXT DEFAULT 'Dr. Sarah Mitchell',
  principal_photo_url TEXT,
  principal_message TEXT,
  director_name TEXT DEFAULT 'Mr. James Whitmore',
  director_photo_url TEXT,
  director_message TEXT,
  primary_color TEXT DEFAULT '#0f2a4a',
  secondary_color TEXT DEFAULT '#c9a24b',
  facebook_url TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  youtube_url TEXT,
  linkedin_url TEXT,
  welcome_message TEXT,
  announcement_bar TEXT,
  announcement_active BOOLEAN NOT NULL DEFAULT FALSE,
  footer_text TEXT,
  copyright TEXT,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  og_image_url TEXT,
  analytics_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
GRANT UPDATE, INSERT ON public.site_settings TO authenticated;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read site settings" ON public.site_settings FOR SELECT USING (TRUE);
CREATE POLICY "Admins can update site settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert site settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_site_settings_updated BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the singleton row
INSERT INTO public.site_settings (welcome_message, principal_message, director_message, footer_text, copyright, meta_title, meta_description)
VALUES (
  'Welcome to Greenfield Academy — a modern school where curiosity, character, and community come together.',
  'At Greenfield we believe every child deserves an education that nurtures the mind and the heart. Our teachers are mentors, our classrooms are studios of thought, and our campus is a home for discovery.',
  'For more than three decades our school has stood for academic rigor and human values. We are proud to prepare students who are as capable as they are compassionate.',
  'Nurturing curious minds since 1992.',
  '© ' || EXTRACT(YEAR FROM now())::text || ' Greenfield Academy. All rights reserved.',
  'Greenfield Academy — A Modern School for Curious Minds',
  'Greenfield Academy is a modern K–12 school focused on academic excellence, character, and community.'
);

-- =========================================
-- Reusable macro-style: publish/visibility columns everywhere
-- =========================================

-- HERO SLIDER
CREATE TABLE public.hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  cta_label TEXT,
  cta_href TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hero_slides TO anon, authenticated;
GRANT ALL ON public.hero_slides TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.hero_slides TO authenticated;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read visible slides" ON public.hero_slides FOR SELECT USING (is_visible = TRUE OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage slides" ON public.hero_slides FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_hero_slides_updated BEFORE UPDATE ON public.hero_slides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ABOUT SECTIONS (history, mission, vision, why-us, etc.)
CREATE TABLE public.about_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL, -- 'history' | 'mission' | 'vision' | 'why_us' | ...
  title TEXT NOT NULL,
  body TEXT,
  image_url TEXT,
  icon TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.about_sections TO anon, authenticated;
GRANT ALL ON public.about_sections TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.about_sections TO authenticated;
ALTER TABLE public.about_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published about" ON public.about_sections FOR SELECT USING (is_published = TRUE OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage about" ON public.about_sections FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_about_updated BEFORE UPDATE ON public.about_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TEACHERS
CREATE TABLE public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  designation TEXT,
  subject TEXT,
  qualification TEXT,
  experience TEXT,
  achievements TEXT,
  bio TEXT,
  photo_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.teachers TO anon, authenticated;
GRANT ALL ON public.teachers TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.teachers TO authenticated;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read visible teachers" ON public.teachers FOR SELECT USING (is_visible = TRUE OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage teachers" ON public.teachers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_teachers_updated BEFORE UPDATE ON public.teachers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- FACILITIES / INFRASTRUCTURE (icon-driven cards)
CREATE TABLE public.facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- lucide icon name
  category TEXT, -- 'facility' | 'infrastructure'
  image_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.facilities TO anon, authenticated;
GRANT ALL ON public.facilities TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.facilities TO authenticated;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read visible facilities" ON public.facilities FOR SELECT USING (is_visible = TRUE OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage facilities" ON public.facilities FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_facilities_updated BEFORE UPDATE ON public.facilities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CLASSROOMS
CREATE TABLE public.classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  capacity INT,
  description TEXT,
  facilities TEXT,
  images TEXT[] DEFAULT '{}',
  display_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.classrooms TO anon, authenticated;
GRANT ALL ON public.classrooms TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.classrooms TO authenticated;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read visible classrooms" ON public.classrooms FOR SELECT USING (is_visible = TRUE OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage classrooms" ON public.classrooms FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_classrooms_updated BEFORE UPDATE ON public.classrooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- NEWS
CREATE TABLE public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  excerpt TEXT,
  content TEXT,
  cover_image_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.news TO anon, authenticated;
GRANT ALL ON public.news TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.news TO authenticated;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published news" ON public.news FOR SELECT USING (is_published = TRUE OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage news" ON public.news FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_news_updated BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- EVENTS
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ,
  venue TEXT,
  poster_url TEXT,
  gallery TEXT[] DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon, authenticated;
GRANT ALL ON public.events TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.events TO authenticated;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published events" ON public.events FOR SELECT USING (is_published = TRUE OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage events" ON public.events FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_events_updated BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- NOTICES
CREATE TABLE public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  image_url TEXT,
  priority INT NOT NULL DEFAULT 0, -- higher = more urgent
  expires_at TIMESTAMPTZ,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.notices TO anon, authenticated;
GRANT ALL ON public.notices TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.notices TO authenticated;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active notices" ON public.notices FOR SELECT USING ((is_published = TRUE AND (expires_at IS NULL OR expires_at > now())) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage notices" ON public.notices FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_notices_updated BEFORE UPDATE ON public.notices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- GALLERY ALBUMS
CREATE TABLE public.gallery_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  category TEXT, -- 'festival' | 'sports' | 'annual' | etc.
  cover_image_url TEXT,
  event_date DATE,
  display_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_albums TO anon, authenticated;
GRANT ALL ON public.gallery_albums TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.gallery_albums TO authenticated;
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read visible albums" ON public.gallery_albums FOR SELECT USING (is_visible = TRUE OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage albums" ON public.gallery_albums FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_albums_updated BEFORE UPDATE ON public.gallery_albums FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- GALLERY IMAGES
CREATE TABLE public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID REFERENCES public.gallery_albums(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_images TO anon, authenticated;
GRANT ALL ON public.gallery_images TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.gallery_images TO authenticated;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read visible images" ON public.gallery_images FOR SELECT USING (is_visible = TRUE OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage images" ON public.gallery_images FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- VIDEOS
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT,
  thumbnail_url TEXT,
  category TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.videos TO anon, authenticated;
GRANT ALL ON public.videos TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.videos TO authenticated;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read visible videos" ON public.videos FOR SELECT USING (is_visible = TRUE OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage videos" ON public.videos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_videos_updated BEFORE UPDATE ON public.videos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TESTIMONIALS
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT, -- 'Student' | 'Parent' | 'Teacher'
  message TEXT NOT NULL,
  photo_url TEXT,
  rating INT DEFAULT 5,
  display_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT ALL ON public.testimonials TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read visible testimonials" ON public.testimonials FOR SELECT USING (is_visible = TRUE OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_testimonials_updated BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- FAQS
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon, authenticated;
GRANT ALL ON public.faqs TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read visible faqs" ON public.faqs FOR SELECT USING (is_visible = TRUE OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage faqs" ON public.faqs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_faqs_updated BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- DOWNLOADS
CREATE TABLE public.downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  category TEXT, -- 'admission' | 'prospectus' | 'holiday' | 'circular' | 'other'
  display_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.downloads TO anon, authenticated;
GRANT ALL ON public.downloads TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.downloads TO authenticated;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read visible downloads" ON public.downloads FOR SELECT USING (is_visible = TRUE OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage downloads" ON public.downloads FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_downloads_updated BEFORE UPDATE ON public.downloads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CONTACT MESSAGES (from public form)
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a message" ON public.contact_messages FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins can read messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update messages" ON public.contact_messages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete messages" ON public.contact_messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- SEED: About sections
-- =========================================
INSERT INTO public.about_sections (section_key, title, body, icon, display_order) VALUES
  ('history', 'Our History', 'Founded in 1992, Greenfield Academy began as a single-classroom school with fifteen students and a bold idea: education should feel alive. Three decades later, we serve over 1,400 students from kindergarten through grade 12 on a 20-acre campus.', 'BookOpen', 1),
  ('mission', 'Our Mission', 'To cultivate confident, curious, and compassionate young people who love to learn and are prepared to lead in a changing world.', 'Target', 2),
  ('vision', 'Our Vision', 'To be a school where every student discovers their voice, their strengths, and their sense of purpose.', 'Eye', 3),
  ('why_us', 'Small classes, big ideas', 'A 1:14 teacher-to-student ratio means every child is seen, heard, and challenged.', 'Users', 4),
  ('why_us', 'Learning by doing', 'Project-based courses, science labs, art studios, and a maker space bring ideas to life.', 'Lightbulb', 5),
  ('why_us', 'A caring community', 'Advisors know every student by name and support them as whole people, not just learners.', 'Heart', 6);

-- Facilities seed
INSERT INTO public.facilities (title, description, icon, category, display_order) VALUES
  ('Modern Classrooms', 'Bright, tech-equipped classrooms designed for collaboration.', 'Presentation', 'facility', 1),
  ('Science Labs', 'Fully equipped physics, chemistry and biology laboratories.', 'FlaskConical', 'facility', 2),
  ('Computer Lab', 'Fast machines, coding curriculum, and robotics club.', 'Cpu', 'facility', 3),
  ('Library', 'Over 20,000 titles and quiet reading zones.', 'Library', 'facility', 4),
  ('Sports Complex', 'Football, basketball, and athletics on a full-size ground.', 'Trophy', 'facility', 5),
  ('Transport', 'GPS-tracked buses covering the whole city.', 'Bus', 'facility', 6),
  ('Hostel', 'Safe, comfortable residential facilities for outstation students.', 'Home', 'facility', 7),
  ('Smart Classes', 'Interactive digital boards in every classroom.', 'Monitor', 'facility', 8);

-- Teachers seed (photo placeholders)
INSERT INTO public.teachers (name, designation, subject, qualification, experience, bio, is_featured, display_order) VALUES
  ('Anita Rao', 'Head of Sciences', 'Physics', 'M.Sc, B.Ed', '14 years', 'Passionate about hands-on physics and building intuition through experimentation.', TRUE, 1),
  ('Ben Carter', 'Senior Teacher', 'Mathematics', 'M.A. Mathematics', '11 years', 'Believes math is a language everyone can learn to speak fluently.', TRUE, 2),
  ('Priya Menon', 'Coordinator, Primary', 'General', 'B.Ed, M.A. English', '9 years', 'Loves reading aloud and building a love of stories in young learners.', TRUE, 3),
  ('Daniel Kim', 'Music Director', 'Music', 'B.Mus, M.Mus', '7 years', 'Choir, orchestra, and everything in between.', FALSE, 4),
  ('Sara Odhiambo', 'Sports Coach', 'Physical Education', 'B.P.Ed', '10 years', 'Coaches football, athletics, and a mean game of chess.', FALSE, 5),
  ('Rahul Verma', 'Teacher', 'History & Civics', 'M.A. History', '6 years', 'Turns dusty dates into vivid stories.', FALSE, 6);

-- News seed
INSERT INTO public.news (title, slug, excerpt, content, is_featured, is_published) VALUES
  ('Greenfield students sweep regional science fair', 'science-fair-2026',
   'Nine of our students placed in the top ten at this year''s regional science fair.',
   'Our junior scientists returned home with medals, ribbons, and a lot of ideas for next year. Congratulations to the whole science team!',
   TRUE, TRUE),
  ('New maker space opens on North Campus', 'maker-space-opens',
   'A 2,000 sq. ft. maker space is now open to all middle and high school students.',
   'The new maker space includes 3D printers, laser cutters, electronics benches, and a dedicated robotics area.',
   TRUE, TRUE),
  ('Admissions open for 2026–27', 'admissions-2026-27',
   'Applications for the next academic year are now open for grades KG through 11.',
   'Visit the admissions page for details on the process, timelines, and open house dates.',
   FALSE, TRUE);

-- Events seed
INSERT INTO public.events (title, description, event_date, venue, is_featured, is_published) VALUES
  ('Annual Sports Day', 'A full day of track, field, and team events for every age group.', now() + INTERVAL '30 days', 'North Ground', TRUE, TRUE),
  ('Founders'' Day Concert', 'Music, dance, and drama by students from every grade.', now() + INTERVAL '45 days', 'Main Auditorium', TRUE, TRUE),
  ('Parent–Teacher Meeting', 'Termly review of student progress. All parents welcome.', now() + INTERVAL '15 days', 'Respective Classrooms', FALSE, TRUE);

-- Testimonials seed
INSERT INTO public.testimonials (name, role, message, rating, display_order) VALUES
  ('Meera Iyer', 'Parent', 'My daughter has genuinely started to love school. The teachers here truly see her.', 5, 1),
  ('Arjun Patel', 'Student, Grade 11', 'The maker space and the science labs are the best part of my week.', 5, 2),
  ('Ms. Renu Das', 'Teacher', 'It''s rare to work in a school that cares this much about both students and staff.', 5, 3);

-- FAQs seed
INSERT INTO public.faqs (question, answer, display_order) VALUES
  ('What is the age requirement for KG admission?', 'Children turning 4 years old by 30 June of the admission year are eligible for KG.', 1),
  ('Do you provide transport?', 'Yes, we operate a GPS-tracked bus service covering most parts of the city.', 2),
  ('What curriculum do you follow?', 'We follow the CBSE curriculum with additional enrichment in arts, sports, and technology.', 3),
  ('Is there a hostel facility?', 'Yes, we have separate residential facilities for boys and girls from grade 6 upwards.', 4);

-- Gallery album seed
INSERT INTO public.gallery_albums (title, slug, description, category, display_order) VALUES
  ('Annual Function 2025', 'annual-function-2025', 'Highlights from our annual function.', 'annual', 1),
  ('Independence Day', 'independence-day-2025', 'Flag hoisting, parade and cultural performances.', 'festival', 2),
  ('Sports Week', 'sports-week-2025', 'A week of games, cheers and medals.', 'sports', 3);

-- Hero slides seed (using picsum placeholders; admin replaces later)
INSERT INTO public.hero_slides (title, subtitle, image_url, cta_label, cta_href, display_order) VALUES
  ('Where curious minds come alive', 'Kindergarten through Grade 12', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1920&q=80', 'Apply now', '/contact', 1),
  ('Small classes. Big ideas.', 'Discover the Greenfield difference', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80', 'Explore programs', '/about', 2),
  ('A campus built for discovery', 'Labs, studios, sports, and more', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&q=80', 'See our campus', '/gallery', 3);
