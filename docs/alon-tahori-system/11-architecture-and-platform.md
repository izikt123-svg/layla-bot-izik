# 11 — ארכיטקטורה ופלטפורמה

## Stack מומלץ

| שכבה | טכנולוגיה |
|------|-----------|
| Frontend | React / Next.js |
| Backend | Node.js / NestJS |
| Database | PostgreSQL |
| Realtime | Socket.io / Firebase |
| Storage | AWS S3 / Cloudflare R2 |
| AI | OpenAI API |
| WhatsApp | Meta Cloud API / Twilio |
| Hosting | Vercel + AWS |

## Domain Driven Design (DDD)

חלוקה לעולמות עצמאיים: לקוחות · גבייה · משימות · מסמכים · AI · עובדים · WhatsApp.

## Event System

כל פעולה במערכת מייצרת EVENT (לקוח נוצר · מסמך הועלה · משימה הושלמה · גבייה נכשלה · הודעת WhatsApp התקבלה).

מאפשר: אוטומציות · AI · דוחות · היסטוריה · אינטגרציות.

## Internal Notification Bus

מערכת פנימית להעברת הודעות בין שירותים.

## Queue Workers

משימות כבדות רצות ב-Background Workers: OCR · WhatsApp · Email · AI · PDF Generation.

## Realtime System

עדכונים LIVE בלי רענון דף: עובד סיים משימה · לקוח שלח מסמך · התקבלה הודעה · גבייה נכשלה.

## Caching Layer

Redis Cache — טעינה מהירה, פחות עומס.

## File Storage Architecture

מסמכים נשמרים ב-AWS S3 / Cloudflare R2 (לא בשרת ראשי), כולל: Versioning · Encryption · Backup · CDN.

## Multi Tenant Architecture

בעתיד — כמה משרדים על אותה מערכת. כל משרד מבודד (נתונים · עובדים · הרשאות נפרדים).

## Monitoring System

מעקב שגיאות · קריסות · זמני תגובה · שימוש עובדים · עומסים. כלים: Sentry / Datadog / Grafana.

## API Gateway

כניסה אחת לכל השירותים.

## Microservices (עתידי)

כל מודול כשירות נפרד.

## Disaster Recovery

מערכת גיבוי · שחזור מהיר · Downtime מינימלי.

## Infrastructure as Code

Terraform / Docker / Kubernetes.

## CI/CD

GitHub → Testing → Production (אוטומטי).

## Testing System

Unit Tests · Integration Tests · E2E Tests.
