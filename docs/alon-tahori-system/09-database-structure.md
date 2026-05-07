# 09 — מבנה Database

## CLIENTS

- `client_id`
- `full_name`
- `phone`
- `email`
- `id_number`
- `business_name`
- `business_type`
- `city`
- `address`
- `assigned_to`
- `status`
- `vip`
- `created_at`

## TASKS

- `task_id`
- `client_id`
- `title`
- `priority`
- `assigned_to`
- `status`
- `due_date`
- `notes`

## DOCUMENTS

- `document_id`
- `client_id`
- `document_type`
- `status`
- `file_url`
- `uploaded_at`

## PAYMENTS

- `payment_id`
- `client_id`
- `amount`
- `status`
- `payment_method`
- `due_date`
- `paid_at`

## EMPLOYEES

- `employee_id`
- `full_name`
- `department`
- `role`
- `permissions`
- `status`

## WHATSAPP

- `message_id`
- `client_id`
- `direction`
- `message`
- `sent_at`
- `status`

## אבטחת נתונים

- הרשאות
- Audit Logs
- 2FA
- גיבויים
- חסימת IP
- הצפנת מידע

## Soft Delete

לא מוחקים באמת — הכל עובר ל-Recycle Bin.

## Immutable Logs

לוגים שלא ניתן לערוך (קריטי משפטית).

## Legal Hold

נעילה משפטית של לקוח — שום דבר לא נמחק.

## Data Retention

קביעת זמן שמירה לפי רגולציה: מסמכים · שיחות · הקלטות · הודעות.

## Data Warehouse

הפרדה בין Operational DB ל-Analytics DB — כדי שדוחות לא יאטו את המערכת.
