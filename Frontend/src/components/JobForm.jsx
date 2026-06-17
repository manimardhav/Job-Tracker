import { useState } from "react"
import toast from "react-hot-toast"
import API_URL from "../config"

function JobForm({ job, onSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        company: job?.company || "",
        role: job?.role || "",
        status: job?.status || "Applied",
        date: job?.date || "",
    })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const isEditMode = !!job

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            const url = isEditMode
                ? `${API_URL}/jobs/${job.id}`
                : `${API_URL}/jobs`
            const method = isEditMode ? "PATCH" : "POST"
            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            const data = await response.json()
            if (!response.ok) {
                setError(data.detail || "Something went wrong")
                toast.error(data.detail || "Something went wrong")
                return
            }

            toast.success(isEditMode ? "Job updated!" : "Job added successfully!")
            onSuccess()
        } catch (err) {
            setError("Cannot connect to server. Is backend running?")
            toast.error("Cannot connect to server. Is backend running?")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {isEditMode ? "Edit Job" : "Add New Job"}
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                        <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="e.g. Google"
                            required
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Role</label>
                        <input
                            type="text"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            placeholder="e.g. Software Engineer"
                            required
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option>Applied</option>
                            <option>Interview</option>
                            <option>Offered</option>
                            <option>Rejected</option>
                        </select>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Applied</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Saving..." : isEditMode ? "Update Job" : "Add Job"}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default JobForm