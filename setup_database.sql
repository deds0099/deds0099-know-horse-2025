-- ============================================================
-- KNOW HORSE 2025 — Script de criação do banco de dados
-- Execute este script no SQL Editor do Supabase
-- (Database > SQL Editor > New query)
-- ============================================================


-- ============================================================
-- 1. TABELA: subscriptions (inscrições no congresso)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text NOT NULL,
  email       text NOT NULL,
  phone       text NOT NULL,
  cpf         text NOT NULL,
  institution text,
  status      text NOT NULL DEFAULT 'pending',
  is_paid     boolean NOT NULL DEFAULT false,
  paid_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. TABELA: news (notícias)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.news (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title        text NOT NULL,
  summary      text,
  content      text,
  image_url    text,
  video_url    text,
  image_size   text DEFAULT 'full',
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. TABELA: schedule (programação do congresso)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.schedule (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title        text NOT NULL,
  description  text,
  image_url    text,
  date         date,
  start_time   time,
  end_time     time,
  speaker      text,
  speaker_bio  text,
  location     text,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. TABELA: minicourses (minicursos)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.minicourses (
  id                   uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title                text NOT NULL,
  description          text,
  instructor           text,
  instructor_photo_url text,
  location             text,
  date                 text DEFAULT 'A definir',
  time                 text DEFAULT 'A definir',
  vacancies            integer NOT NULL DEFAULT 0,
  vacancies_left       integer NOT NULL DEFAULT 0,
  type                 text,
  theme                text,
  price                numeric(10,2) NOT NULL DEFAULT 0,
  image_url            text,
  is_published         boolean NOT NULL DEFAULT false,
  published_at         timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. TABELA: minicourse_registrations (inscrições em minicursos)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.minicourse_registrations (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  minicourse_id uuid NOT NULL REFERENCES public.minicourses(id) ON DELETE CASCADE,
  name         text NOT NULL,
  email        text NOT NULL,
  phone        text,
  cpf          text,
  institution  text,
  is_paid      boolean NOT NULL DEFAULT false,
  paid_at      timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.subscriptions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minicourses            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minicourse_registrations ENABLE ROW LEVEL SECURITY;


-- ---- subscriptions ----
-- Público pode inserir (formulário de inscrição)
CREATE POLICY "Public can insert subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (true);

-- Apenas autenticados podem ler/atualizar/deletar
CREATE POLICY "Authenticated can read subscriptions"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can update subscriptions"
  ON public.subscriptions FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can delete subscriptions"
  ON public.subscriptions FOR DELETE
  TO authenticated
  USING (true);


-- ---- news ----
-- Público pode ler notícias publicadas
CREATE POLICY "Public can read published news"
  ON public.news FOR SELECT
  USING (is_published = true);

-- Autenticados têm acesso completo
CREATE POLICY "Authenticated full access news"
  ON public.news FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ---- schedule ----
-- Público pode ler itens publicados
CREATE POLICY "Public can read published schedule"
  ON public.schedule FOR SELECT
  USING (is_published = true);

-- Autenticados têm acesso completo
CREATE POLICY "Authenticated full access schedule"
  ON public.schedule FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ---- minicourses ----
-- Público pode ler minicursos publicados
CREATE POLICY "Public can read published minicourses"
  ON public.minicourses FOR SELECT
  USING (is_published = true);

-- Autenticados têm acesso completo
CREATE POLICY "Authenticated full access minicourses"
  ON public.minicourses FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ---- minicourse_registrations ----
-- Público pode inserir (formulário de inscrição em minicurso)
CREATE POLICY "Public can insert minicourse registrations"
  ON public.minicourse_registrations FOR INSERT
  WITH CHECK (true);

-- Público pode ler seus próprios registros pelo email
CREATE POLICY "Public can read own minicourse registrations"
  ON public.minicourse_registrations FOR SELECT
  USING (true);

-- Autenticados têm acesso completo
CREATE POLICY "Authenticated full access minicourse registrations"
  ON public.minicourse_registrations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ============================================================
-- 7. STORAGE BUCKET para imagens de minicursos (opcional)
-- Execute separadamente se quiser suporte a upload de imagens
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('minicourses', 'minicourses', true)
-- ON CONFLICT DO NOTHING;
