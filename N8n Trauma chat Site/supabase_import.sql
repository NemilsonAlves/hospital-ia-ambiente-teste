BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.sector (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  workflow_id TEXT,
  vector_namespace TEXT DEFAULT 'default',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.sector IS 'Catálogo de setores disponíveis para atendimento';
COMMENT ON COLUMN public.sector.id IS 'Identificador único do setor';
COMMENT ON COLUMN public.sector.name IS 'Nome do setor (ex.: Trauma, Pediatria)';
COMMENT ON COLUMN public.sector.description IS 'Descrição do setor';
COMMENT ON COLUMN public.sector.workflow_id IS 'ID do workflow n8n vinculado ao subagente do setor';
COMMENT ON COLUMN public.sector.vector_namespace IS 'Namespace para embeddings do setor no Supabase Vector Store';
COMMENT ON COLUMN public.sector.active IS 'Indica se o setor está disponível para seleção';
COMMENT ON COLUMN public.sector.created_at IS 'Data/hora de criação do registro';

CREATE TABLE public.functions_catalog (
  code TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.functions_catalog IS 'Catálogo de funções disponíveis para agentes';
COMMENT ON COLUMN public.functions_catalog.code IS 'Código da função (ex.: ARQ_QA, VOZ, DADOS)';
COMMENT ON COLUMN public.functions_catalog.title IS 'Título amigável da função';
COMMENT ON COLUMN public.functions_catalog.description IS 'Descrição detalhada da função';
COMMENT ON COLUMN public.functions_catalog.created_at IS 'Data/hora de criação';

INSERT INTO public.functions_catalog (code, title, description) VALUES
  ('ARQ_QA', 'Arquivos/QA', 'Ingestão, indexação e perguntas sobre documentos armazenados; usa Supabase Storage e Vector Store para responder com contexto'),
  ('VOZ', 'Voz', 'Recepção de áudio, transcrição com modelo Whisper/OpenAI, roteamento de resposta pelo supervisor'),
  ('DADOS', 'Dados', 'Operações de CRUD e consultas específicas via node Supabase conforme regras do setor');

CREATE TABLE public.sector_functions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id UUID NOT NULL REFERENCES public.sector(id) ON DELETE CASCADE,
  function_code TEXT NOT NULL REFERENCES public.functions_catalog(code) ON DELETE RESTRICT,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (sector_id, function_code)
);
COMMENT ON TABLE public.sector_functions IS 'Associação de funções do catálogo aos setores';
COMMENT ON COLUMN public.sector_functions.sector_id IS 'Setor ao qual a função está vinculada';
COMMENT ON COLUMN public.sector_functions.function_code IS 'Código da função vinculada ao setor';
COMMENT ON COLUMN public.sector_functions.enabled IS 'Se a função está habilitada para o setor';
COMMENT ON COLUMN public.sector_functions.created_at IS 'Data/hora de criação';

CREATE TABLE IF NOT EXISTS public.tickets (
  ticket TEXT NOT NULL,
  sector_id UUID NOT NULL REFERENCES public.sector(id) ON DELETE RESTRICT,
  sector_name TEXT NOT NULL,
  user_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_ticket UNIQUE (ticket)
);
COMMENT ON TABLE public.tickets IS 'Registro de protocolos únicos por atendimento';
COMMENT ON COLUMN public.tickets.ticket IS 'Protocolo AAA######### (3 letras do setor + 9 dígitos yyMMddHH + dígito aleatório), único';
COMMENT ON COLUMN public.tickets.sector_id IS 'Setor escolhido no atendimento';
COMMENT ON COLUMN public.tickets.sector_name IS 'Nome do setor no momento do atendimento';
COMMENT ON COLUMN public.tickets.user_id IS 'Identificador do lead/usuário';
COMMENT ON COLUMN public.tickets.created_at IS 'Data/hora de geração do protocolo';

CREATE INDEX IF NOT EXISTS idx_tickets_sector_id ON public.tickets(sector_id);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_sector_active ON public.sector(active);

ALTER TABLE public.sector ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.functions_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sector_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_active_sectors
  ON public.sector
  FOR SELECT
  TO anon, authenticated
  USING (active = TRUE);

CREATE POLICY manage_sectors_service
  ON public.sector
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY select_functions_catalog_all
  ON public.functions_catalog
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

CREATE POLICY manage_functions_catalog_service
  ON public.functions_catalog
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY select_sector_functions_active
  ON public.sector_functions
  FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.sector s
    WHERE s.id = sector_id AND s.active = TRUE
  ));

CREATE POLICY manage_sector_functions_service
  ON public.sector_functions
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tickets' AND polname = 'manage_tickets_service'
  ) THEN
    CREATE POLICY manage_tickets_service
      ON public.tickets
      FOR ALL
      TO service_role
      USING (TRUE)
      WITH CHECK (TRUE);
  END IF;
END $$;

-- Ajustes necessários na tabela Leads
-- Campos para integração com chat, setor e protocolo/ticket atual
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS sector_id UUID;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS sector_name TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS current_ticket TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- FK para setor e ticket (se existir)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='sector'
  ) THEN
    ALTER TABLE public.leads
      ADD CONSTRAINT IF NOT EXISTS leads_sector_fk
      FOREIGN KEY (sector_id) REFERENCES public.sector(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='tickets'
  ) THEN
    -- criar FK para current_ticket se não existir
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'leads_current_ticket_fk'
    ) THEN
      ALTER TABLE public.leads
        ADD CONSTRAINT leads_current_ticket_fk FOREIGN KEY (current_ticket)
        REFERENCES public.tickets(ticket) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_current_ticket ON public.leads(current_ticket);
CREATE INDEX IF NOT EXISTS idx_leads_sector_id ON public.leads(sector_id);

-- garantir unicidade de user_id para FK
CREATE UNIQUE INDEX IF NOT EXISTS uq_leads_user_id ON public.leads(user_id);

-- relação 1:N: tickets.user_id -> leads.user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tickets_user_id_fk'
  ) THEN
    ALTER TABLE public.tickets
      ADD CONSTRAINT tickets_user_id_fk FOREIGN KEY (user_id)
      REFERENCES public.leads(user_id) ON DELETE SET NULL NOT VALID;
  END IF;
END $$;

-- Função/trigger para updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_leads_updated_at'
  ) THEN
    CREATE TRIGGER trg_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- RLS e políticas para Leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='leads' AND polname='manage_leads_service'
  ) THEN
    CREATE POLICY manage_leads_service
      ON public.leads
      FOR ALL
      TO service_role
      USING (TRUE)
      WITH CHECK (TRUE);
  END IF;
END $$;

-- Comentários descritivos
COMMENT ON TABLE public.leads IS 'Leads do chat; armazena usuário, setor e protocolo atual';
COMMENT ON COLUMN public.leads.user_id IS 'Identificador do usuário/lead (gerado no site)';
COMMENT ON COLUMN public.leads.sector_id IS 'Setor selecionado para atendimento';
COMMENT ON COLUMN public.leads.sector_name IS 'Nome do setor selecionado';
COMMENT ON COLUMN public.leads.current_ticket IS 'Protocolo AAA######### atual do atendimento';
COMMENT ON COLUMN public.leads.status IS 'Status do lead (ex.: novo, em_atendimento, concluido)';
COMMENT ON COLUMN public.leads.metadata IS 'Dados adicionais do site/app (JSON)';
COMMENT ON COLUMN public.leads.created_at IS 'Criação do lead';
COMMENT ON COLUMN public.leads.updated_at IS 'Última atualização do lead';

COMMIT;
