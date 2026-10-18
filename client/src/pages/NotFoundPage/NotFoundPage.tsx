export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-slate-900">
      <div className="space-y-6 text-center">
        {/* Hình ảnh/Icon con bò biết bay - bạn có thể thay bằng component Icon đã tạo ở trên */}
        <div className="animate-bounce text-8xl">🐄🚀</div>

        <h1 className="text-6xl font-extrabold tracking-tight">404</h1>

        <p className="mx-auto max-w-md text-xl text-slate-600">
          Rất tiếc, trang bạn đang tìm kiếm đã bay đi mất cùng với "con bò biết
          bay" rồi!
        </p>
        <a
          href="/"
          className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-indigo-700"
        >
          Quay về trang chủ
        </a>
      </div>
    </div>
  );
}
