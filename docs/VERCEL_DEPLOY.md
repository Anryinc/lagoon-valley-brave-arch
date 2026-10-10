# Vercel: почему прод «старый» и как перепривязать

Репозиторий: https://github.com/Anryinc/story-constructor  
Ветка: `main` (в ней уже хаб `/` и `/studio`).

## Частая причина

**Redeploy** пересобирает **тот же старый deployment/commit**, а Production Alias
остаётся на последнем *успешном* билде. Если новые коммиты **падают на build**,
сайт навсегда показывает старый UI.

## Чеклист

1. **Settings → Git**
   - Connected repo: `Anryinc/story-constructor`
   - Production Branch: `main`
   - Не должен указывать на fork/old name без sync

2. **Deployments**
   - Открой последний deployment
   - Source commit message должен быть про studio/hub (не древний «Export from Grok»)
   - Status = **Ready** (не Error / Canceled)
   - Если Error → **Build Logs** (часто TypeScript / missing module)

3. **Promote**
   - На *успешном* свежем deployment: `…` → **Promote to Production**

4. **Domains**
   - Settings → Domains: production domain должен указывать на текущий Production
   - Старый `*.vercel.app` от lagoon-valley может жить отдельно

5. **Deployment Protection**
   - Если URL просит Login Vercel — это не «старый билд», а SSO-защита
   - Vercel Authentication → отключить для Production или добавить bypass

6. **Новый deploy с main**
   - Deployments → **Create Deployment** → Branch `main` → Deploy
   - Дождаться Ready → открыть **Visit** именно у этого deployment

## Проверка, что код в git верный

```bash
curl -sL https://raw.githubusercontent.com/Anryinc/story-constructor/main/src/routes/index.tsx | head -5
# должно быть: listProjects / HubPage / «Активные сценарии»
```
