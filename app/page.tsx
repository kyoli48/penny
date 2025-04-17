import Link from "next/link";

export default async function Home() {
  return (
    <>      <main className="flex-1 flex flex-col gap-6 px-4">
        <Link
          href="/protected/expenses"
          className="inline-block mt-4 px-4 py-2 rounded bg-blue-600 text-white text-center font-semibold hover:bg-blue-700 transition"
        >
          Go to Your Expenses
        </Link>
      </main>
    </>
  );
}
