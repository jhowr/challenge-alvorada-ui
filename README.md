# Reservas sem conflito — painel

Painel opcional para a API do [Caso 02 da Alvorada](https://github.com/Alvorada-Dev/desafios-tecnicos/blob/main/casos/02-reservas-de-recursos.md). A API, que é a entrega do desafio, fica num repositório separado (`alvorada`). Este painel é um complemento para ver a regra funcionando.

Ele tem duas telas:
- **Agenda por hora.** Arraste um período na grade e a API responde na hora se está livre ou com quais reservas conflita. Dali dá para reservar e cancelar.
- **Reservas.** A lista completa, com busca, filtros por status e recurso (enviados à API), ordenação e cancelamento.

Feito com Next.js 16 e shadcn/ui (Base UI).

## Como rodar

Pré-requisitos: **Node 22+**, **pnpm 10+** e a API rodando em `http://localhost:3000`. No repositório da API, rode `pnpm install && pnpm dev`.

```bash
pnpm install
pnpm dev           # http://localhost:3001
pnpm test          # convenção de horas, grade, sessão e mensagens de erro
```

Entre com `avaliador` / `alvorada` e clique em **Carregar cenário** para criar um dia de exemplo.

| Variável | Padrão |
|---|---|
| `API_URL` | `http://localhost:3000` |
| `PANEL_USER` / `PANEL_PASSWORD` | `avaliador` / `alvorada` |
| `SESSION_SECRET` | um segredo de desenvolvimento; obrigatório em produção |

Ver [.env.example](.env.example).

## Decisões

- **O login existe só no Next**, como um JWT num cookie httpOnly. A API continua sem autenticação, como pede o enunciado. Assim a API não precisou mudar.
- **Cada inteiro de `start`/`end` é uma hora** desde 1970-01-01 00:00 UTC, então um número carrega dia e hora. A tela mostra a hora no fuso do navegador, sempre com o inteiro cru ao lado. A conversão fica toda em [lib/hours.ts](lib/hours.ts).
- **O navegador nunca fala com a API.** Server actions do Next fazem as chamadas, e por isso a `API_URL` não aparece no cliente.

## Estrutura

```
app/            rotas: login, (panel)/ agenda e reservas
features/
  agenda/       grade por hora, seleção por arraste, verificação ao vivo
  bookings/     cliente da API (server-only), server actions, tabela, erros em pt-BR
  auth/         sessão JWT em cookie httpOnly, credenciais de demo
  shell/        sidebar e peças de layout
lib/hours.ts    a convenção de horas
proxy.ts        redireciona para /login sem sessão (as páginas checam de novo)
```

## Limites

- O painel supõe que o servidor Next e o navegador estão no mesmo fuso, o caso da demo local. O servidor recorta o dia pelo fuso dele, e o navegador formata pelo seu.
