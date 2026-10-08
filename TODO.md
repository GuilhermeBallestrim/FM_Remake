# TODO.md — Dívidas técnicas conhecidas

> Regra do projeto: **nada é prometido sem estar aqui**. Quando algo não couber na fase,
> entra neste arquivo. Quando for implementado, o item sai daqui e vai para o README.

Formato: `- [ ] FASE-xx — descrição curta (motivo: ...)`

---

## Fora do escopo da v1 (decidido, não é dívida)

- Subidas e descensos entre as 3 ligas
- Modo multiplayer ou caretaker de outro clube
- Editor de elenco com validação de regras (só importação/exportação CSV na v1)
- Treinamento em 3D com animation de jogador
- Áudio e commentary com voz (só texto na v1)

---

## Dívidas abertas

- [ ] FASE-00 — Definir stack final entre React+Vite, Svelte e Godot 4 (bloqueia tudo)
- [ ] FASE-00 — Diagrama de dependências no README
- [ ] FASE-01 — Ajustar constantes do motor até a distribuição de gols ficar entre 1,8 e 3,2 por jogo
- [ ] FASE-03 — Virtualização da grade de elenco (necessário acima de 100 linhas)
- [ ] FASE-04 — Migração de save entre versões (`MIGRATION.md`)
- [ ] FASE-05 — Arrastar-e-soltar com suporte a teclado e toque (acessibilidade)
- [ ] FASE-06 — Sistema de scouting manual em paralelo à IA automática
- [ ] FASE-07 — Notificações de proposta fora da janela de transferências
- [ ] FASE-08 — Fechamento de caixa no meio da temporada (não só em 30 de junho)
- [ ] FASE-09 — Filtro rápido precisa lidar com fila de ações pendentes
- [ ] FASE-10 — Sorteio da Copa Continental com critério determinístico verificável
- [ ] FASE-11 — Narração por template precisa de mais de 3 exemplos por evento
- [ ] FASE-12 — Otimizar serialização do save (JSON grande fica lento após 5 temporadas)