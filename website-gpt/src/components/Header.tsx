import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 py-4 shadow-md">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary hover:text-primary-hover transition-colors">
          Website GPT
        </Link>
        <nav className="hidden md:flex space-x-6">
          <Link href="/" className="text-gray-900 font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/about" className="text-gray-900 font-medium hover:text-primary transition-colors">
            About
          </Link>
        </nav>
        <div className="md:hidden">
          {/* Mobile menu button - can be expanded in the future */}
          <button className="text-gray-900 hover:text-primary focus:outline-none">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
} 