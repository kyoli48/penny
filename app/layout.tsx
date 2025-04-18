import { type Metadata } from 'next'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Clerk Next.js Quickstart',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
          <header className="flex justify-between items-center p-4 gap-4 h-16">
            <nav className="flex items-center gap-4">
              <Link 
                href="/" 
                className="px-4 py-2 rounded bg-background text-foreground font-semibold hover:bg-muted transition"
              >
                Home
              </Link>
              <Link
                href="/protected/expenses"
                className="px-4 py-2 rounded bg-green-600 text-background font-semibold hover:bg-green-700 transition"
              >
                Go to Your Expenses
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton />
                <SignUpButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <footer className="text-center py-4 text-sm text-gray-600">
            <p>
              © 2025 Alphonsus Koong. All rights reserved. |{" "}
              <a 
                href="https://github.com/kyoli48/penny" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View on GitHub
              </a>
            </p>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  )
}