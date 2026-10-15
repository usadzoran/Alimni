# إعداد لوحة إدارة عَلِّمني

## 1. تطبيق مخطط قاعدة البيانات

من **Supabase → SQL Editor** شغّل الملفات بالترتيب:

1. `supabase_schema.sql`
2. `supabase_admin_portal_migration.sql`
3. `supabase_admin_portal_security_hardening.sql`
4. `supabase_admin_content_and_roles_migration.sql`

التشغيل المتكرر آمن بفضل `IF NOT EXISTS` وعمليات `DROP POLICY IF EXISTS` الموجودة في الترحيلات.

## 2. إنشاء مالك الموقع الأول

أنشئ حسابًا في **Supabase → Authentication → Users**، ثم نفّذ في SQL Editor (استبدل القيم محليًا ولا تحفظ البريد في المستودع):

```sql
INSERT INTO public.alimni_admin_allowlist (email, user_id, role, permissions, is_active)
SELECT lower('OWNER_EMAIL'), id, 'owner', '{}'::jsonb, true
FROM auth.users
WHERE email = lower('OWNER_EMAIL')
ON CONFLICT (email) DO UPDATE
SET user_id = EXCLUDED.user_id, role = 'owner', is_active = true;
```

افتح لوحة الإدارة من الرابط `/?alimni-admin=1` أو `#admin`.

## 3. إنشاء المشرفين

بعد دخول المالك، افتح **المشرفون والصلاحيات**:

- أدخل بريد المشرف وكلمة المرور الأولية.
- اختر «مشرف بصلاحيات محددة» ثم حدد الأقسام المسموحة.
- أو اختر «مدير كامل» لمنحه كل صلاحيات لوحة الإدارة.
- إذا كان تأكيد البريد مفعلًا في Supabase، يجب على المشرف تأكيد بريده قبل تسجيل الدخول.

الصلاحيات تطبق في **RLS داخل Supabase** وليس في إخفاء الأزرار فقط، لذلك لا يستطيع المشرف تجاوزها بطلبات مباشرة.

## الصلاحيات المتاحة

- إدارة الدروس
- إدارة التحديات
- إدارة الإعلانات
- إدارة الملفات التعليمية
- إدارة الاستفسارات
- عرض التلاميذ
- عرض الإحصاءات وعدد الزوار
- إدارة المشرفين والصلاحيات (للمالك/المدير الكامل)
