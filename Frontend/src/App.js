import { useState } from "react"
import Navbar from "./components/Navbar"
import Dashboard from "./components/Dashboard"
import JobForm from "./components/JobForm"
import AIAnalyzer from "./components/AIAnalyzer"
import { Toaster } from "react-hot-toast"

function App() {
    const [currentPage, setCurrentPage] = useState("dashboard")
    const [jobToEdit, setJobToEdit] = useState(null)

    const handleEdit = (job) => {
        setJobToEdit(job)
        setCurrentPage("edit")
    }

    const handleFormSuccess = () => {
        setJobToEdit(null)
        setCurrentPage("dashboard")
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />
            <Navbar
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
            />
            <main className="max-w-5xl mx-auto px-4 py-8">
                <div key={currentPage} className="animate-fadeIn">
                    {currentPage === "dashboard" && <Dashboard onEdit={handleEdit} />}
                    {currentPage === "add" && (
                        <JobForm
                            onSuccess={handleFormSuccess}
                            onCancel={() => setCurrentPage("dashboard")}
                        />
                    )}
                    {currentPage === "edit" && (
                        <JobForm
                            job={jobToEdit}
                            onSuccess={handleFormSuccess}
                            onCancel={() => setCurrentPage("dashboard")}
                        />
                    )}
                    {currentPage === "analyzer" && <AIAnalyzer />}
                </div>
            </main>
        </div>
    )
}

export default App