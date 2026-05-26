# PRD — Alon Tahori Accounting Control Tower

## 1) מטרת המוצר
פלטפורמת CRM/OPS למשרד רואי חשבון עם 50 משתמשים במקביל וסקייל ל-10 שנים, הכוללת שליטה תפעולית, ציות לרשויות בישראל, תקשורת משרדית, אוטומציה מקצה לקצה, ובקרת רווחיות.

## 2) יעדים עסקיים
- 95%+ עמידה ב-SLA תוך 90 יום.
- ירידה של 50% במשימות באיחור תוך 6 חודשים.
- שיפור של 30% בזמן תגובה פנימי תוך 90 יום.
- מדידת רווחיות לכל לקוח בזמן אמת.

## 3) פרסונות משתמש
- שותף/בעלים
- מנהל תפעול
- ראש צוות
- רו"ח/מנהל חשבונות/חשבות שכר
- שירות לקוחות/בק אופיס
- בקרה וגבייה

## 4) תחומי מוצר
1. Pipeline לקוחות
2. Work OS למשימות ותלויות
3. Compliance Calendar לישראל
4. Document Collection
5. תכתובת משרדית פנימית
6. Messaging ללקוחות
7. Billing & Profitability
8. AI Copilot
9. Audit + Permissions

## 5) דרישות פונקציונליות
- ניהול לקוחות, תיקים, אנשי קשר והסכמים.
- יצירת משימות אוטומטית חודשית/רבעונית/שנתית.
- SLA דינמי לפי סוג משימה וסוג לקוח.
- מנגנון הסלמות רב-שלבי.
- רשימות מסמכי חובה לפי סוג דיווח.
- תכתובת פנימית צמודת לקוח/משימה.
- שליחת מייל/SMS/וואטסאפ/מכתב לפי תזמון.
- מעקב שעות, עלויות, רווחיות, טיוטות חיוב.
- לוג ביקורת מלא לכל פעולה קריטית.

## 6) דרישות לא-פונקציונליות
- זמינות: 99.9%.
- תמיכה ב-50 משתמשים מקביליים (ו-100+ כסקייל).
- RPO עד 24 שעות, RTO עד 4 שעות.
- MFA חובה והרשאות Role-based.

## 7) KPI
- SLA Compliance
- Backlog Age
- First Response Time
- שיעור מסמכים חסרים
- רווחיות לקוח
- ימי גבייה

## 8) אינטגרציות
- אימייל (SMTP/Graph/Gmail)
- וואטסאפ עסקי (API)
- SMS ספק ישראלי
- חשבוניות/ERP
- ספק חתימה דיגיטלית

## 9) אוטומציות (100)
| # | Trigger | Action |
|---|---|---|
| 1 | ליד חדש | פתיחת משימת פולואפ + SLA 24h |
| 2 | ליד ללא מענה 24h | תזכורת לנציג |
| 3 | ליד ללא מענה 72h | הסלמה לראש צוות |
| 4 | הצעה נשלחה | פתיחת משימת בדיקת סטטוס T+3 |
| 5 | הצעה לא נפתחה 48h | שליחה חוזרת עם כותרת חלופית |
| 6 | הצעה אושרה | פתיחת Onboarding |
| 7 | חתימה התקבלה | יצירת לקוח פעיל |
| 8 | לקוח חדש | יצירת Checklist מסמכי חובה |
| 9 | חסר מסמך חובה | מייל/וואטסאפ תזכורת #1 |
| 10 | אין תגובה 48h | תזכורת #2 |
| 11 | אין תגובה 5 ימים | הודעת הסלמה ללקוח |
| 12 | אין תגובה 7 ימים | יצירת משימת שיחה לבעל תיק |
| 13 | תחילת חודש | יצירת משימות מע"מ חודשיות |
| 14 | תחילת רבעון | יצירת משימות דוחות רבעון |
| 15 | תחילת שנה | יצירת משימות דוחות שנתיים |
| 16 | משימה נוצרה | שיוך אוטומטי לפי עומס |
| 17 | עומס עובד >90% | חלוקה מחדש למשימות לא קריטיות |
| 18 | עובד בחופשה | העברת משימות פתוחות לגיבוי |
| 19 | SLA T-24h | התראה למבצע |
| 20 | SLA T-12h | התראה למבצע + ראש צוות |
| 21 | SLA עבר ב-2h | הסלמה רמה 1 |
| 22 | SLA עבר ב-24h | הסלמה רמה 2 למנהל תפעול |
| 23 | SLA עבר ב-48h | הוספה ללוח חריגים הנהלה |
| 24 | משימה נחסמה | בקשת Unblock אוטומטית |
| 25 | חסימה >24h | הסלמה לבעל חסימה |
| 26 | משימה קריטית הושלמה | סגירת משימות תלויות |
| 27 | יעד נופל על שבת/חג | דחייה אוטומטית ליום עסקים |
| 28 | יעד בעוד 10 ימים | בקשת מסמכים מקדימה |
| 29 | יעד בעוד 3 ימים וחסר מסמך | הסלמה לראש צוות |
| 30 | דיווח הוגש | סגירת משימות הכנה |
| 31 | דיווח נכשל | פתיחת Incident + RCA |
| 32 | 3 איחורים ברבעון ללקוח | סימון High Risk |
| 33 | לקוח High Risk | פגישת סטטוס חובה |
| 34 | משימה הועברה בין עובדים | הודעה לצוות |
| 35 | אזכור @ קריטי | פוש מיידי |
| 36 | הודעה פנימית קריטית ללא תגובה 2h | פינג חוזר |
| 37 | ללא תגובה 4h | הסלמה למנהל |
| 38 | מייל ללקוח Bounce | משימת תיקון פרטי קשר |
| 39 | וואטסאפ נכשל | fallback ל-SMS |
| 40 | SMS נכשל | fallback לשיחה |
| 41 | שיחה נקבעה | תזכורת T-24 ו-T-1 |
| 42 | פגישה לא התקיימה | תיאום מחדש אוטומטי |
| 43 | סוף יום עבודה | תזכורת מילוי שעות |
| 44 | שעות חסרות יומיים | התראה לראש צוות |
| 45 | ניצול תקציב 80% | התראת רווחיות |
| 46 | ניצול תקציב 100% | נעילת עבודה לא חיונית |
| 47 | אישור חריגה ניתן | פתיחת בלוק שעות נוסף |
| 48 | סוף חודש | יצירת טיוטת חשבונית |
| 49 | טיוטה מעל סף | בקשת אישור שותף |
| 50 | חשבונית נשלחה | פתיחת מעקב גבייה |
| 51 | ללא תשלום 14 יום | תזכורת גבייה #1 |
| 52 | ללא תשלום 30 יום | תזכורת גבייה #2 |
| 53 | ללא תשלום 45 יום | הסלמה לגבייה משפטית פנימית |
| 54 | לקוח משלם באיחור סדרתי | עדכון Credit Risk |
| 55 | מסמך הועלה | בדיקת שלמות אוטומטית |
| 56 | מסמך לא קריא | בקשה להעלאה מחדש |
| 57 | מסמך חסר חתימה | שליחת בקשת חתימה דיגיטלית |
| 58 | חתימה הושלמה | מעבר לשלב הבא בתהליך |
| 59 | פתיחת תיק שכר | יצירת משימות תלושי שכר |
| 60 | עובד חדש אצל לקוח | יצירת checklist קליטה |
| 61 | סיום עובד אצל לקוח | יצירת checklist סיום העסקה |
| 62 | שינוי סטטוס לקוח ל"לא פעיל" | עצירת משימות עתידיות |
| 63 | חידוש חוזה מתקרב 30 יום | יצירת משימת חידוש |
| 64 | חידוש לא נסגר 7 ימים לפני | הסלמה לבעל תיק |
| 65 | לקוח ביטל שירות | תהליך Offboarding |
| 66 | Offboarding הושלם | ארכוב גישה ומסמכים |
| 67 | פתיחת שנה חדשה | reset יעדי KPI |
| 68 | KPI שבועי יורד | דוח חריגה למנהל |
| 69 | KPI מחלקה מתחת לסף | תוכנית שיפור אוטומטית |
| 70 | backlog > סף | הקפצת כוח אדם זמני |
| 71 | משימה ללא בעלים | שיוך אוטומטי לפי Queue |
| 72 | לקוח VIP | תעדוף גבוה כברירת מחדל |
| 73 | לקוח בסיכון נטישה | יצירת שיחת שימור |
| 74 | תלונה נפתחה | SLA שירות 4h |
| 75 | תלונה לא טופלה 8h | הסלמה למנהל שירות |
| 76 | תלונה נסגרה | שליחת סקר שביעות רצון |
| 77 | ציון סקר נמוך | פתיחת משימת תיקון |
| 78 | ציון סקר גבוה | בקשת המלצה/Referral |
| 79 | מסמך רגולטורי חדש | עדכון checklist רלוונטי |
| 80 | שינוי חקיקה מוזן | עדכון חוקי deadline |
| 81 | גרסת תבנית מכתב עודכנה | החלפה אוטומטית במשלוחים עתידיים |
| 82 | שליחה המונית מתוזמנת | בדיקת כפילויות נמענים |
| 83 | נמצא נמען כפול | איחוד רשומות |
| 84 | פתיחת לקוח חדש מסוג סטודנט | playbook סטודנטים |
| 85 | לקוח חברה בע"מ | playbook חברה |
| 86 | לקוח עצמאי | playbook עצמאי |
| 87 | דוח סיכון שבועי | שליחה להנהלה ב-08:00 |
| 88 | חריגה קריטית חדשה | SMS למנהל תפעול |
| 89 | 5 חריגות קריטיות ביום | התראת owner |
| 90 | זמינות מערכת ירדה | פתיחת incident תשתיתי |
| 91 | גיבוי יומי נכשל | התראה ל-IT + ניסיון חוזר |
| 92 | שחזור בדיקה רבעוני נכשל | פתיחת משימת DR דחופה |
| 93 | כניסה חריגה למשתמש | MFA challenge + התראה |
| 94 | 5 ניסיונות התחברות כושלים | נעילת משתמש זמנית |
| 95 | שינוי הרשאות רגיש | Audit alert לשותף |
| 96 | מחיקת רשומה קריטית | soft-delete + אישור כפול |
| 97 | בקשת ייצוא נתונים | אישור מנהל אבטחה |
| 98 | AI מזהה סיכון איחור 30 יום | יצירת תוכנית מניעה |
| 99 | AI מזהה עומס קיצון | הצעת re-balance אוטומטית |
| 100 | סיכום שבועי | דוח הנהלה אוטומטי |

## 10) מטריצת הרשאות (RBAC)
| יכולת | Owner | Ops Manager | Team Lead | Accountant | Payroll | Client Success | Billing | Auditor |
|---|---|---|---|---|---|---|---|---|
| צפייה בכל הלקוחות | Full | Full | Team | Assigned | Assigned | Assigned | Financial scope | Read-only scope |
| עריכת פרטי לקוח | Full | Full | Team | Assigned | Assigned | Limited | No | No |
| יצירת/עדכון משימות | Full | Full | Full Team | Assigned | Assigned | Assigned | Limited | No |
| שינוי SLA Policy | Full | Full | No | No | No | No | No | No |
| אישור חריגת SLA | Full | Full | Limited | No | No | No | No | No |
| העלאה/ניהול מסמכים | Full | Full | Team | Assigned | Assigned | Assigned | Limited | Read-only |
| שליחת הודעות ללקוחות | Full | Full | Team | Limited | Limited | Full | Billing only | No |
| גישה לתכתובת פנימית | Full | Full | Team | Assigned | Assigned | Assigned | Limited | Read-only scope |
| צפייה בדוחות רווחיות | Full | Full | Team-level | No | No | No | Full | Read-only |
| יצירת טיוטת חשבונית | Full | Limited | No | No | No | No | Full | No |
| אישור חשבונית | Full | Limited | No | No | No | No | Full | No |
| ניהול משתמשים והרשאות | Full | Limited | No | No | No | No | No | No |
| צפייה ב-Audit Log | Full | Full | Team scope | No | No | No | Limited | Full |
| ייצוא נתונים | Full | Approval needed | No | No | No | No | Limited | No |

## 11) Roadmap
- **60 יום (MVP):** CRM בסיסי, משימות, SLA, מסמכים חסרים, תכתובת, דשבורד הנהלה.
- **90 יום:** ציות מתקדם, חיוב/רווחיות, אוטומציות 1–70.
- **6–9 חודשים:** AI מתקדם, אופטימיזציית עומסים, אוטומציות 100/100, BI מתקדם.

## 12) קריטריוני קבלה
- לפחות 90 מתוך 100 אוטומציות פעילות בסביבת Production.
- 95% מהמשימות הקריטיות עם SLA פעיל ומנוטר.
- כל פעולה קריטית נרשמת ב-Audit Log.
- דשבורד הנהלה מתעדכן כל 5 דקות לכל היותר.


## 13) ארכיטקטורת מידע (Data Contracts) — V1
### 13.1 ישויות חובה
- `clients(client_id, legal_name, tax_id, entity_type, status, owner_user_id, risk_level, created_at)`
- `engagements(engagement_id, client_id, service_type, billing_model, monthly_budget_hours, active_from, active_to)`
- `tasks(task_id, client_id, engagement_id, task_type, priority, status, assignee_id, due_at, sla_due_at, escalation_level)`
- `documents(document_id, client_id, doc_type, period_key, required, received_at, validation_status)`
- `compliance_events(event_id, client_id, authority, report_type, deadline_at, filed_at, filing_status)`
- `time_entries(entry_id, user_id, client_id, task_id, minutes, billable, entered_at)`
- `invoice_drafts(draft_id, client_id, period_key, amount, margin_pct, approval_status)`

### 13.2 סטטוסים אחידים למשימות
`new -> in_progress -> blocked -> pending_review -> done -> archived`

### 13.3 עדיפויות
`low | medium | high | critical`

## 14) מפרט מסכים (UI Spec) — מוכן לפיתוח
### 14.1 Executive Dashboard
- KPI Cards: SLA שבועי, חריגות פתוחות, גבייה פתוחה, רווחיות חודשית.
- Widget “דחוף היום”: top 20 משימות קריטיות לפי SLA.
- Widget “לקוחות בסיכון”: לקוחות עם `risk_level=high` או 2+ איחורים בשבוע.

### 14.2 Client 360
- Header: פרטי לקוח + סטטוס + איש קשר ראשי.
- Tabs: Tasks, Documents, Compliance, Messages, Billing, Timeline.
- Panel צד: “Next Best Action” מה-AI.

### 14.3 Automation Studio
- Rule Builder: תנאים (IF), פעולות (THEN), הסלמות (ELSE/ESCALATE).
- סימולציה לפני הפעלה: test run על נתוני 30 הימים האחרונים.
- גרסאות חוקים + rollback בלחיצה.

## 15) מטריצת תורים (Queue Design) ל-50 עובדים
- Queue-HNH: הנה"ח שוטף
- Queue-SALARY: שכר
- Queue-TAX: מסים והצהרות
- Queue-YEARLY: דוחות שנתיים
- Queue-CS: שירות לקוחות ואיסוף מסמכים
- Queue-BILLING: חיוב וגבייה

כל תור כולל:
- SLA ברירת מחדל
- Role בעלי הרשאה
- חוקי ניתוב עומס
- עומס מקסימלי לעובד

## 16) תרחישי קצה (Failure/Edge Cases)
1. ספק וואטסאפ מושבת -> fallback אוטומטי למייל ואז SMS.
2. משתמש מפתח משימה בטעות פעמיים -> זיהוי כפילות + מיזוג.
3. שינוי דדליין רגולטורי בדקה ה-90 -> עדכון חוק גלובלי ו-recalculate לכל המשימות הפתוחות.
4. עובד חולה ביום הגשה -> reassign חירום לפי Skill Matrix.
5. לקוח VIP שלא שלח מסמכים -> מסלול הסלמה אישי לשותף.

## 17) תוכנית הטמעה רבעונית (Q1–Q4)
### Q1
- Core CRM + Task Engine + SLA + Document Collection.
### Q2
- Compliance IL מלא + Messaging Center + Automation 1-70.
### Q3
- Billing & Profitability + AI Copilot + Automation 71-100.
### Q4
- Optimization, predictive analytics, playbooks מתקדמים.

## 18) DoD — Definition of Done לכל מודול
- דרישות מאושרות ע"י מנהל מוצר + מנהל תפעול.
- בדיקות פונקציונליות עברו (happy + edge cases).
- Audit Log קיים לכל פעולה רגישה.
- Dashboard KPI מתעדכן בזמן תקין.
- הדרכת משתמשים בוצעה + מדריך תפעולי זמין.

## 19) בקשות פתוחות להחלטת הנהלה
1. אילו רשויות/סוגי דיווח נכנסים ל-MVP בדיוק?
2. האם Billing יתממשק ל-ERP קיים או ינוהל פנימית בשלב ראשון?
3. מה SLA רשמי ללקוחות VIP לעומת לקוחות רגילים?
4. האם יש צורך בפורטל לקוח self-service בגרסת MVP?

## 20) ERD טבלאי (גרסת יישום ראשונית)
### 20.1 users
- `user_id` (PK)
- `full_name`
- `email` (unique)
- `phone`
- `role_id` (FK -> roles.role_id)
- `team_id` (FK -> teams.team_id)
- `is_active`
- `created_at`, `updated_at`

### 20.2 roles
- `role_id` (PK)
- `role_code` (OWNER/OPS/LEAD/ACCOUNTANT/PAYROLL/CS/BILLING/AUDITOR)
- `role_name_he`

### 20.3 teams
- `team_id` (PK)
- `team_code` (HNH/SALARY/TAX/YEARLY/CS/BILLING)
- `team_name_he`
- `lead_user_id` (FK -> users.user_id)

### 20.4 clients
- `client_id` (PK)
- `legal_name`
- `tax_id` (unique)
- `entity_type` (company/individual/nonprofit/student)
- `status` (lead/active/inactive/churned)
- `service_tier` (standard/vip)
- `owner_user_id` (FK -> users.user_id)
- `risk_level` (low/medium/high)
- `health_score` (0-100)
- `created_at`, `updated_at`

### 20.5 engagements
- `engagement_id` (PK)
- `client_id` (FK -> clients.client_id)
- `service_type` (bookkeeping/payroll/tax/annual/mixed)
- `billing_model` (fixed/hourly/hybrid)
- `monthly_budget_hours`
- `active_from`, `active_to`

### 20.6 tasks
- `task_id` (PK)
- `client_id` (FK)
- `engagement_id` (FK)
- `task_type`
- `priority` (low/medium/high/critical)
- `status` (new/in_progress/blocked/pending_review/done/archived)
- `assignee_id` (FK -> users.user_id)
- `team_id` (FK -> teams.team_id)
- `due_at`, `sla_due_at`
- `escalation_level` (0/1/2/3)
- `blocked_by_task_id` (nullable FK -> tasks.task_id)
- `created_at`, `updated_at`, `completed_at`

### 20.7 documents
- `document_id` (PK)
- `client_id` (FK)
- `task_id` (nullable FK)
- `doc_type`
- `period_key` (YYYY-MM)
- `required` (bool)
- `validation_status` (pending/valid/invalid/missing_signature)
- `storage_url`
- `uploaded_by` (FK -> users.user_id)
- `uploaded_at`

### 20.8 compliance_events
- `event_id` (PK)
- `client_id` (FK)
- `authority` (vat/itax/btl/other)
- `report_type`
- `period_key`
- `deadline_at`
- `filed_at`
- `filing_status` (pending/submitted/failed/late)
- `failure_reason`

### 20.9 messages
- `message_id` (PK)
- `client_id` (nullable FK)
- `task_id` (nullable FK)
- `channel` (internal/email/whatsapp/sms/letter)
- `direction` (outbound/inbound/internal)
- `template_code` (nullable)
- `content_ref`
- `sent_by` (FK -> users.user_id)
- `sent_at`
- `delivery_status`

### 20.10 time_entries
- `entry_id` (PK)
- `user_id` (FK)
- `client_id` (FK)
- `task_id` (FK)
- `minutes`
- `billable` (bool)
- `entered_at`

### 20.11 invoice_drafts
- `draft_id` (PK)
- `client_id` (FK)
- `period_key`
- `amount`
- `cost_amount`
- `margin_pct`
- `approval_status` (draft/pending/approved/rejected)
- `approved_by` (nullable FK -> users.user_id)

### 20.12 audit_logs
- `audit_id` (PK)
- `actor_user_id` (FK)
- `entity_name`
- `entity_id`
- `action` (create/update/delete/approve/export)
- `before_json`
- `after_json`
- `created_at`

## 21) API Contracts (Skeleton)
### 21.1 לקוחות
- `POST /api/v1/clients` — יצירת לקוח.
- `GET /api/v1/clients/{clientId}` — שליפת Client 360.
- `PATCH /api/v1/clients/{clientId}` — עדכון לקוח.

### 21.2 משימות
- `POST /api/v1/tasks` — יצירת משימה (ידנית/אוטומציה).
- `GET /api/v1/tasks?status=&team=&sla=` — חיפוש משימות.
- `PATCH /api/v1/tasks/{taskId}` — עדכון סטטוס/שיוך/עדיפות.
- `POST /api/v1/tasks/{taskId}/escalate` — הסלמה ידנית.

### 21.3 מסמכים
- `POST /api/v1/documents/upload-url` — קבלת כתובת העלאה.
- `POST /api/v1/documents` — רישום מסמך לאחר העלאה.
- `GET /api/v1/clients/{clientId}/documents/missing` — חסרים.

### 21.4 ציות ודיווחים
- `GET /api/v1/compliance/events?period=&authority=` — לוח ציות.
- `POST /api/v1/compliance/events/{eventId}/submit` — סימון הגשה.
- `POST /api/v1/compliance/recalculate-deadlines` — חישוב מועדים מחדש.

### 21.5 הודעות
- `POST /api/v1/messages/send` — שליחת הודעה ללקוח.
- `POST /api/v1/messages/bulk/schedule` — קמפיין מתוזמן.
- `POST /api/v1/webhooks/channels/{provider}` — קליטת סטטוס מסירה.

### 21.6 חיוב ורווחיות
- `POST /api/v1/time-entries` — דיווח זמן.
- `GET /api/v1/billing/invoice-drafts?period=` — טיוטות חיוב.
- `POST /api/v1/billing/invoice-drafts/{draftId}/approve` — אישור.

### 21.7 ניהול הרשאות
- `GET /api/v1/roles`
- `GET /api/v1/permissions/matrix`
- `PATCH /api/v1/users/{userId}/role`

### 21.8 Audit
- `GET /api/v1/audit-logs?entity=&actor=&from=&to=`

## 22) תוכנית ספרינטים (6 ספרינטים ראשונים)
### Sprint 1 (שבוע 1-2)
- הקמת schema בסיסי: users/roles/teams/clients/tasks.
- Login + MFA + RBAC בסיסי.
- Client List + Task List ראשוניים.

### Sprint 2 (שבוע 3-4)
- Client 360 מלא (Tasks/Documents/Messages tabs).
- מנוע SLA בסיסי + התראות T-24/T-12.
- Queue allocation לפי עומס.

### Sprint 3 (שבוע 5-6)
- Document collection + missing reminders #1/#2/#3.
- Messaging connectors (email + whatsapp + SMS abstraction).
- Audit logging לכל create/update.

### Sprint 4 (שבוע 7-8)
- Compliance calendar + compliance_events.
- Deadline recalculation לפי חגים/שבת.
- Escalation rules 1–30.

### Sprint 5 (שבוע 9-10)
- Time entries + invoice drafts + margin indicators.
- דשבורד הנהלה (5 ווידג'טים מרכזיים).
- RBAC הרחבה (field-level לנתונים פיננסיים).

### Sprint 6 (שבוע 11-12)
- AI summary ללקוח + risk radar ראשוני.
- Automation Studio MVP (rule create/test/activate).
- Hardening: monitoring, backups, DR drill.



## 23) מודול שעון נוכחות (כניסה/יציאה)
### 23.1 מטרת המודול
ניהול שעון נוכחות מלא לעובדי המשרד עם רישום כניסה/יציאה, הפסקות, חריגות, ואינטגרציה ישירה לרווחיות, עומסים ותכנון משימות.

### 23.2 יכולות חובה
- Clock-in / Clock-out ידני מהווב + מובייל.
- זיהוי כפילות/טעויות (כניסה ללא יציאה, יציאה ללא כניסה).
- בקשות תיקון נוכחות באישור ראש צוות.
- חישוב שעות רגילות/נוספות/חריגות.
- קישור שעות נוכחות ל-time_entries לצורך חיוב ורווחיות.
- דוח יומי/שבועי/חודשי לעובד, ראש צוות והנהלה.

### 23.3 אוטומציות נוכחות (101–120)
| # | Trigger | Action |
|---|---|---|
| 101 | עובד לא ביצע כניסה עד 09:30 | התראת נוכחות לעובד + ראש צוות |
| 102 | כניסה בוצעה | פתיחת חלון עבודה יומי |
| 103 | יציאה לא בוצעה עד 20:00 | תזכורת יציאה אוטומטית |
| 104 | כניסה ללא יציאה יום קודם | יצירת בקשת תיקון נוכחות |
| 105 | 3 איחורי כניסה בשבוע | התראת דפוס חריגה לראש צוות |
| 106 | שעות עבודה < תקן יומי | סימון חוסר שעות בדוח עובד |
| 107 | שעות עבודה > 10 שעות | סימון שעות נוספות + אישור מנהל |
| 108 | היעדרות לא מדווחת | פתיחת משימת בירור ל-HR/מנהל |
| 109 | אישור תיקון נוכחות | עדכון timesheet רטרואקטיבי |
| 110 | דחיית תיקון נוכחות | התראה לעובד עם סיבת דחייה |
| 111 | סוף יום | סגירת נוכחות יומית וחישוב סטטוס |
| 112 | סוף שבוע | דוח חריגות שבועי להנהלה |
| 113 | עובד בחופשה מאושרת | השתקת התראות כניסה/יציאה |
| 114 | עובד במילואים/מחלה | שיוך סטטוס היעדרות תקני |
| 115 | פער בין נוכחות ל-time_entries > 20% | התראת איכות דיווח |
| 116 | עובד ללא פעילות 4 שעות באמצע יום | פינג סטטוס דיסקרטי |
| 117 | עומס צוות גבוה + נוכחות חסרה | המלצת איזון עומסים אוטומטית |
| 118 | סוף חודש | דוח נוכחות חתום למנהל |
| 119 | עובד עם חריגות חוזרות 2 חודשים | פגישת משוב אוטומטית |
| 120 | שכר נסגר | נעילת עריכות נוכחות לתקופה |

## 24) רשימת עובדים אמיתית (Master Data Seed v1)
> מקור: נתוני הנהלה שנמסרו על-ידי הלקוח בתאריך 25 במאי 2026.

| שלוחה | שם | מייל | נייד משרד | נייח ישיר | תפקיד |
|---|---|---|---|---|---|
| 212 | סיגלית שוב | company@alontax.com | 053-4711292 | 074-7281226 | הנה"ח חל"ד |
| 213 | אלון טהורי | alon@alontax.com | 050-6926029 |  | מנהל |
| 214 | תמר שימונוב | TOP@alontax.com | 053-5466170 | 074-7281224 | מיסים + פטורים |
| 215 | מיטל בן טובים | heshbon@alontax.com | 054-5282080 |  | מיסים |
| 216 | אליס טורקיה | WIN@alontax.com | 053-9232508 | 074-7281227 | סמנכ"לית + מנהלת מיסים |
| 217 | רעות דבי | MAS@alontax.com | 053-9232485 |  | מיסים |
| 219 | שרון בן תורה | law@alontax.com | 052-3991064 |  | סמנכ"ל |
| 231 | נתנאל ישראלי | Wow@alontax.com | 058-4221889 |  | הנה"ח תומך |
| 221 | איציק טהורי | yes@alontax.com | 058-5543602 |  | הנהלה |
| 222 | מורן ישר | joy@alontax.com | 058-6659967 |  | הנה"ח תומך |
| 223 | אולגה מורדכייב | baam@alontax.com | 053-3046913 |  | הנה"ח + מנהלת חברות |
| 226 | מוריה מימון | BIZ@alontax.com |  |  | דוחות |
| 229 | הילה מויאל | ltd@alontax.com | 053-5466150 | 074-7281225 | הנה"ח |
| 233 | מורל מלכאן | YYY@alontax.com | 053-9453966 |  | גביה |
| 225 | הלן כהן | tov@alontax.com | 052-6158255 | 074-7281221 | שכר + הנה"ח |
| 227 | זהבית ישראל | ESH@alontax.com | 053-9453981 | 074-7281223 | הנה"ח |
| 220 | שושנה רוזנשטיין | TIL@alontax.com |  |  | מיסים מתלמדת |

## 25) מיפוי עובדים לתפקידי מערכת (RBAC Assignment v1)
- Owner/Manager: אלון טהורי.
- Ops/Leadership: אליס טורקיה, שרון בן תורה, איציק טהורי.
- Tax Team: תמר שימונוב, מיטל בן טובים, רעות דבי, שושנה רוזנשטיין.
- Bookkeeping Team: סיגלית שוב, נתנאל ישראלי, מורן ישר, אולגה מורדכייב, הילה מויאל, זהבית ישראל, הלן כהן.
- Payroll: הלן כהן.
- Billing/Collections: מורל מלכאן.
- Reports/Yearly: מוריה מימון.

## 26) קליטת עובדים למערכת (Onboarding Checklist)
1. פתיחת משתמש + שיוך role + שיוך team.
2. הגדרת שלוחה, נייד, קו ישיר, אימייל ארגוני.
3. הפעלת MFA ואימות מכשיר.
4. הגדרת יעד שעות יומי/שבועי במודול נוכחות.
5. שיוך ל-Queue תפעולי ראשי + משני.
6. הפעלת התראות SLA ונוכחות מותאמות תפקיד.


## 27) כרטסת לקוחות + כרטסת עובדים (Ledger Cards)
כן. המערכת כוללת כרטסת לקוחות וכרטסת עובדים מלאה להנהלת חשבונות.

### 27.1 כרטסת לקוח (Client Ledger Card) — כל הפרמטרים
#### פרטי זהות
- מזהה לקוח פנימי
- שם משפטי מלא
- שם מסחרי
- מספר עוסק/ח"פ
- סוג ישות (עוסק מורשה/פטור/חברה/עמותה)
- סטטוס לקוח (פעיל/לא פעיל/מוקפא)
- רמת שירות (Standard/VIP)

#### פרטי קשר
- איש קשר ראשי + תפקיד
- טלפון נייד
- טלפון נייח
- אימייל ראשי
- אימייל חשבוניות
- כתובת מלאה (עיר/רחוב/מיקוד)

#### פרטי הנה"ח ומיסוי
- סוג דיווח מע"מ (חודשי/דו-חודשי)
- תיק ניכויים (כן/לא + מספר)
- תיק מס הכנסה (כן/לא + מספר)
- סיווג ענפי
- שנת פתיחת תיק
- סטטוס מקדמות
- סטטוס הצהרת הון

#### פרטי הסכם ושכר טרחה
- מודל חיוב (גלובלי/שעתי/היברידי)
- שכר טרחה חודשי
- תעריף שעה
- תקציב שעות חודשי
- תנאי תשלום (שוטף/שוטף+30 וכו')
- אמצעי תשלום מועדף
- תאריך חידוש הסכם

#### כרטסת כספית
- יתרת פתיחה
- חוב פתוח
- חיובים חודשיים
- זיכויים
- קבלות שהתקבלו
- יתרה נוכחית
- גיל חוב (0-30/31-60/61-90/90+)
- מסגרת אשראי מאושרת

#### תפעול ושירות
- מנהל תיק
- צוות אחראי
- SLA פעיל
- ציון בריאות לקוח
- רמת סיכון
- משימות פתוחות
- משימות באיחור
- מסמכים חסרים

#### ציות ודיווחים
- מועדי דיווח קרובים
- סטטוס הגשה אחרונה לכל רשות
- כשלי הגשה אחרונים
- התראות רגולטוריות פעילות

#### תיעוד ובקרה
- Audit Trail לכרטסת
- הערות הנהלה
- קבצים מצורפים
- היסטוריית תקשורת

### 27.2 כרטסת עובד (Employee Ledger Card) — כל הפרמטרים
#### פרטי זהות
- מזהה עובד
- שם מלא
- מספר שלוחה
- תפקיד
- מחלקה/צוות
- מנהל ישיר
- סטטוס העסקה (פעיל/חל"ד/חופשה/סיום)

#### פרטי קשר
- אימייל ארגוני
- נייד
- נייח ישיר
- משתמש מערכת

#### הרשאות וגישה
- Role RBAC
- הרשאות חריגות
- תאריך שינוי הרשאה אחרון
- MFA (פעיל/לא פעיל)
- מכשירים מורשים

#### נוכחות ושעות
- יעד שעות יומי
- יעד שעות שבועי
- כניסה אחרונה
- יציאה אחרונה
- סך שעות חודש נוכחי
- שעות נוספות
- איחורים
- חוסרי דיווח

#### ביצוע תפעולי
- עומס משימות נוכחי
- % עמידה ב-SLA אישי
- מספר משימות פתוחות
- מספר משימות באיחור
- זמן תגובה ממוצע פנימי
- ציון איכות ביצוע

#### הנה"ח וחיוב
- שעות בילאבל
- שעות לא בילאבל
- מימוש תקציב שעות
- תרומה לרווחיות צוותית

#### למידה ומשמעת
- הערות מנהל
- פעולות מתקנות פתוחות
- הדרכות חובה (הושלמו/חסרות)

#### בקרה
- Audit Trail לשינויים בפרופיל
- היסטוריית שינויים בתפקיד/צוות

### 27.3 API לכרטסות
- `GET /api/v1/ledgers/clients/{clientId}` — כרטסת לקוח מלאה.
- `GET /api/v1/ledgers/employees/{userId}` — כרטסת עובד מלאה.
- `GET /api/v1/ledgers/clients/{clientId}/balance` — מצב יתרות וגיל חוב.
- `GET /api/v1/ledgers/employees/{userId}/attendance` — סיכום נוכחות ושעות.
- `POST /api/v1/ledgers/clients/{clientId}/notes` — הוספת הערת הנהלה.

### 27.4 מסכי UI לכרטסות
- מסך "כרטסת לקוח" עם טאבים: זהות, כספים, ציות, משימות, מסמכים, תקשורת, Audit.
- מסך "כרטסת עובד" עם טאבים: זהות, הרשאות, נוכחות, ביצועים, חיוב, Audit.
- פעולות מהירות: יצירת משימה, שליחת הודעה, פתיחת גבייה, שינוי מנהל תיק.



## 28) פעולה מיידית מכרטיס לקוח לרשות (One-Click Authority Send)
כן — נדרש ויוגדר כחובה במערכת:

### 28.1 יכולת עסקית
מכל כרטסת לקוח תהיה לעובדת/מנהל תיק יכולת לבצע:
1. בחירת רשות (מע"מ / מס הכנסה / ביטוח לאומי / רשות אחרת)
2. בחירת סוג פנייה/דיווח מתוך תבנית
3. יצירה אוטומטית של מכתב עם נתוני לקוח ממוזגים
4. פתיחת קישור רשמי לרשות או שליחה דרך אינטגרציה
5. תיעוד מלא ב-Audit + היסטוריית תקשורת

### 28.2 כפתורי פעולה בכרטסת לקוח
- `שלח לרשות` (Primary CTA)
- `הפק מכתב אוטומטי`
- `פתח קישור רשות רשמי`
- `צרף מסמכים נדרשים`
- `תעד סטטוס הגשה`

### 28.3 Flow ביצוע (SOP)
- Step 1: לחיצה על "שלח לרשות" בכרטסת לקוח.
- Step 2: המערכת מציגה רק תבניות רלוונטיות לפי סוג לקוח/דיווח.
- Step 3: שדות חובה מתמלאים אוטומטית (`client_name`, `tax_id`, `period`, `representative_name`).
- Step 4: העובדת מאשרת/עורכת ניסוח, מצרפת מסמכים ולוחצת שליחה.
- Step 5: נפתח קישור רשמי מתאים או מתבצעת שליחה אוטומטית (אם קיימת אינטגרציה).
- Step 6: סטטוס מתעדכן (`draft -> sent -> acknowledged -> closed`).

### 28.4 הרשאות
- Accountant / Tax / Payroll: שליחה רק ללקוחות משויכים.
- Team Lead: שליחה + אישור חריגים.
- Owner/Ops: שליחה מלאה + override.
- Auditor: צפייה בלבד.

### 28.5 אוטומציות חדשות (121–130)
| # | Trigger | Action |
|---|---|---|
| 121 | לחיצה על "שלח לרשות" | פתיחת Wizard שליחה עם זיהוי רשות אוטומטי |
| 122 | בחירת רשות + סוג דיווח | טעינת תבנית רלוונטית אוטומטית |
| 123 | חסר שדה חובה במכתב | חסימת שליחה + הדגשת שדות חסרים |
| 124 | חסר מסמך נדרש | חסימת שליחה + בקשת השלמה מיידית |
| 125 | נשלח מכתב לרשות | יצירת Audit + משימת מעקב תגובה |
| 126 | אין תגובה מהרשות 5 ימי עסקים | תזכורת Follow-up אוטומטית |
| 127 | תגובת רשות התקבלה | עדכון סטטוס + תיוק מסמך נכנס |
| 128 | שליחה נכשלה | Retry אוטומטי + התראת צוות |
| 129 | שליחה חריגה (VIP/קנס גבוה) | הסלמה לאישור Team Lead |
| 130 | סגירת פנייה | עדכון ציון ציות לקוח + סיכום בתיק |
