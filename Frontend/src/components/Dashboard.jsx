import { useState, useEffect } from "react"
import toast from "react-hot-toast"

function Dashboard({ onEdit }) {
    const [jobs, setJobs] = useState([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState("All")

    useEffect(() => {
        fetchJobs()
    }, [])

    const fetchJobs = async () => {
        try {
            setLoading(true)
            const response = await fetch("http://localhost:8000/jobs")
            const data = await response.json()
            setJobs(data)
        } catch (error) {
            console.error("Error fetching jobs:", error)
            toast.error("Failed to load jobs. Is backend running?")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this job?")
        if (!confirmed) return
        try {
            await fetch(`http://localhost:8000/jobs/${id}`, {
                method: "DELETE"
            })
            toast.success("Job deleted successfully")
            fetchJobs()
        } catch (error) {
            toast.error("Failed to delete job")
        }
    }

    const needsFollowUp = (dateStr, status) => {
        if (status !== "Applied") return false
        const appliedDate = new Date(dateStr + "T00:00:00")
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const diffTime = today - appliedDate
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        return diffDays >= 15
    }

    const statusColor = (status) => {
        const colors = {
            "Applied": "bg-blue-100 text-blue-700",
            "Interview": "bg-yellow-100 text-yellow-700",
            "Offered": "bg-green-100 text-green-700",
            "Rejected": "bg-red-100 text-red-700",
        }
        return colors[status] || "bg-gray-100 text-gray-700"
    }

    const filteredJobs = jobs
        .filter((job) => activeFilter === "All" ? true : job.status === activeFilter)
        .filter((job) =>
            job.company.toLowerCase().includes(search.toLowerCase()) ||
            job.role.toLowerCase().includes(search.toLowerCase())
        )

    const exportToCSV = () => {
        if (jobs.length === 0) {
            toast.error("No jobs to export")
            return
        }
        const headers = ["Company", "Role", "Status", "Date Applied"]
        const rows = jobs.map(job => [job.company, job.role, job.status, job.date])
        const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n")
        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = "my-job-applications.csv"
        link.click()
        toast.success("Exported successfully!")
    }

    // ── ANIMATION 3: Loading Spinner ──
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-gray-400 text-sm">Loading your applications...</p>
            </div>
        )
    }

    return (
        <div>

            {/* ── ROW 1: Stats Cards with hover animation ── */}
            <div className="grid grid-cols-4 gap-4 mb-6">

                <div className="bg-white rounded-xl border border-gray-200 p-4 transition-transform hover:scale-105 cursor-default">
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Total Applied</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{jobs.length}</p>
                    <p className="text-xs text-gray-400 mt-1">all time</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 transition-transform hover:scale-105 cursor-default">
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Interviews</p>
                    <p className="text-3xl font-bold text-yellow-500 mt-1">
                        {jobs.filter(j => j.status === "Interview").length}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">in progress</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 transition-transform hover:scale-105 cursor-default">
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Offers</p>
                    <p className="text-3xl font-bold text-green-500 mt-1">
                        {jobs.filter(j => j.status === "Offered").length}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">received</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 transition-transform hover:scale-105 cursor-default">
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Success Rate</p>
                    <p className="text-3xl font-bold text-blue-500 mt-1">
                        {jobs.length === 0 ? "0" : Math.round(
                            (jobs.filter(j => j.status === "Offered").length / jobs.length) * 100
                        )}%
                    </p>
                    <p className="text-xs text-gray-400 mt-1">offer rate</p>
                </div>

            </div>

            {/* ── ROW 2: Title + Export + Search ── */}
            <div className="flex items-center justify-between mb-4">

                <div>
                    <h2 className="text-2xl font-bold text-gray-800">My Applications</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {jobs.length} total · {jobs.filter(j => j.status === "Applied").length} applied · {jobs.filter(j => j.status === "Interview").length} interviews
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={exportToCSV}
                        className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                    >
                        Export CSV
                    </button>
                    <input
                        type="text"
                        placeholder="Search company or role..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border border-gray-200 rounded-lg px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

            </div>

            {/* ── ROW 3: Filter Tabs ── */}
            <div className="flex gap-2 mb-6">
                {["All", "Applied", "Interview", "Offered", "Rejected"].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                            ${activeFilter === filter
                                ? "bg-blue-600 text-white"
                                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        {filter}
                        <span className="ml-1.5 text-xs opacity-70">
                            {filter === "All"
                                ? jobs.length
                                : jobs.filter(j => j.status === filter).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* ── ROW 4: Empty State ── */}
            {filteredJobs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                    <p className="text-4xl">📭</p>
                    <p className="text-sm font-medium">
                        {search
                            ? "No jobs match your search."
                            : activeFilter !== "All"
                                ? `No jobs with status "${activeFilter}"`
                                : "No jobs added yet. Click Add Job to start."
                        }
                    </p>
                </div>
            )}

            {/* ── ROW 5: Jobs Table ── */}
            {filteredJobs.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                {["Company", "Role", "Status", "Date Applied", "Actions"].map(h => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredJobs.map((job) => (
                                <tr
                                    key={job.id}
                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-4 py-3">
                                        <span className="font-medium text-gray-800">{job.company}</span>
                                        {needsFollowUp(job.date, job.status) && (
                                            <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium animate-pulse">
                                                ⏰ Follow up now!
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-4 py-3 text-gray-600">{job.role}</td>

                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(job.status)}`}>
                                            {job.status}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3 text-gray-500 text-sm">{job.date}</td>

                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onEdit(job)}
                                                className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(job.id)}
                                                className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    )
}

export default Dashboard