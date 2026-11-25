-- Execute no SQL Editor do Supabase antes de testar o novo histórico.
-- Mantém as colunas antigas e acrescenta os dois campos do resultado final.
alter table public.historico_partidas
  add column if not exists vencedor text,
  add column if not exists pontuacao integer;

-- Opcional: garante que o placar salvo não aceite valores negativos.
alter table public.historico_partidas
  add constraint historico_partidas_pontuacao_nao_negativa
  check (pontuacao is null or pontuacao >= 0);
