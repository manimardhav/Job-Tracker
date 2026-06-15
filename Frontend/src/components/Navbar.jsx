// Navbar.jsx
// This is the top navigation bar
// It shows on every screen
// Clicking a nav item changes the currentPage in App.js

function Navbar({ currentPage, setCurrentPage }) {

    // navLinks defines all navigation items
    const navLinks = [
        { label: "Dashboard", page: "dashboard" },
        { label: "Add Job", page: "add" },
        { label: "AI Analyzer", page: "analyzer" },
    ]

    return (
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="max-w-5xl mx-auto flex items-center justify-between">

                {/* App name on the left */}
                <div>
                    <h1 className="text-xl font-bold text-gray-800">
                        JobTracker AI
                    </h1>
                    <p className="text-xs text-gray-400">
                        Your smart application manager
                    </p>
                </div>

                {/* Navigation links on the right */}
                <div className="flex gap-2">
                    {navLinks.map((link) => (
                        <button
                            key={link.page}
                            onClick={() => setCurrentPage(link.page)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${currentPage === link.page
                                    ? "bg-blue-600 text-white"      // Active page — blue
                                    : "text-gray-600 hover:bg-gray-100"  // Inactive — gray
                                }`}
                        >
                            {link.label}
                        </button>
                    ))}
                </div>

            </div>
        </nav>
    )
}

export default Navbar