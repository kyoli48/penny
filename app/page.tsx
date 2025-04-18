// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-[70vh] gap-8 px-4">
      <h1 className="text-4xl font-bold text-green-700">Penny</h1>
      <p className="text-lg text-gray-700 max-w-xl text-center">
        Effortlessly track shared expenses, split bills, and manage group spending with friends or roommates.
      </p>
      <Link
        href="/expenses"
        className="px-8 py-4 rounded-lg bg-green-600 text-white text-xl font-semibold shadow-lg hover:bg-green-700 transition"
      >
        Get Started
      </Link>
      <div className="mt-8 text-gray-500 text-sm">
        Built with Next.js, Clerk, and Prisma.
      </div>
    </main>
  );
}