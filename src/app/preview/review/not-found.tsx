import Link from "next/link";

export default function ReviewNotFound() {
  return (
    <main className="foundation-page">
      <h1>Sample unavailable · المثال غير متاح</h1>
      <p>
        This route is outside the fixed simulation. No protected resource was
        opened.
      </p>
      <p lang="ar" dir="rtl">
        المسار خارج المحاكاة الثابتة. لم يتم فتح مورد محمي.
      </p>
      <Link href="/preview/review">
        Return to synthetic review · العودة للمراجعة التجريبية
      </Link>
    </main>
  );
}
