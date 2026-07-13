# 寶亮匹克球預開班

Next.js 15 App Router + TypeScript + Tailwind CSS + Supabase 的匹克球預開班登記系統。前台只顯示公開場次、開班進度與遮蔽姓名，完整個資只允許管理員在登入後台查看。

## 功能

- 前台開放登記場次、班級詳情、四人成班進度
- 學員登記現有班級，填寫姓名、手機、年齡、性別、人數
- 學員提出新時段，需管理員確認後才公開
- 手機號碼查詢與取消自己的登記
- 管理員 Supabase Auth 登入
- 後台總覽、提案核准/合併/拒絕、班級管理、學員管理、課程類型管理
- CSV 匯出，含 UTF-8 BOM
- Supabase schema、RLS、公開摘要 view、狀態更新 RPC、seed

## 本機啟動

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local` 需填入：

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`SUPABASE_SERVICE_ROLE_KEY` 只用於 Server Route / Server Component，不能放到瀏覽器端。

## Supabase 設定

1. 建立 Supabase project。
2. 到 SQL Editor 執行 `supabase/schema.sql`。
3. 再執行 `supabase/seed.sql` 建立測試資料。
4. `seed.sql` 只建立課程與班級範例，不建立假學員名單。

## 建立第一位管理員

1. 到 Supabase Dashboard -> Authentication -> Users。
2. 新增 Email/Password 使用者。
3. `schema.sql` 已建立 `on_auth_user_created` trigger，會自動在 `profiles` 建立 role = `admin` 的 profile。
4. 若是既有使用者，手動執行：

```sql
insert into public.profiles (id, display_name, role)
values ('AUTH_USER_ID', '管理員', 'admin')
on conflict (id) do update set role = 'admin';
```

## Vercel 部署

1. 將專案推到 GitHub。
2. 在 Vercel 匯入專案。
3. 設定 Environment Variables：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
4. Build command 使用 `npm run build`。
5. Deploy 後到 `/admin/login` 使用 Supabase Auth 管理員帳密登入。

## 隱私與 RLS

- 前台班級資料讀取 `public_class_summaries`，只回傳公開班級欄位與登記總人數。
- `registrations` 與 `class_proposals` 不提供匿名 select policy，因此匿名使用者無法查詢完整個資。
- 建立登記與提案由 API route 執行。
- 學員查詢/取消使用手機號碼。
- 後台頁面和管理 API 都會驗證 `profiles.role = admin`。

## 驗收

```bash
npm run build
```

完成後請手動檢查：

- 首頁看不到任何學員完整姓名、電話、Email、備註。
- 登記班級後只增加人數，名單只顯示遮蔽姓名。
- 新提案不會公開在首頁。
- 管理員核准提案後會建立公開班級，提案人自動成為第一位登記者。
- 達最低人數只變成已達標，不會自動正式開班。
- 管理員可匯出 CSV。

## Rate limiting

專案已將所有寫入集中在 API route，適合在 Vercel Edge Config、Upstash Redis 或 Supabase `audit_logs` 加上 IP/phone-based rate limiting。正式上線建議對 `/api/classes/register`、`/api/proposals`、`/api/my-registration` 加每 IP/手機號碼每小時上限。
