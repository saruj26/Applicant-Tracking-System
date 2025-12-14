import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import Swal from "sweetalert2";
import {
  Search,
  Filter,
  Download,
  Eye,
  Mail,
  Phone,
  Calendar,
  FileText,
  CheckSquare,
  Square,
  Users,
  Upload,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import type { Applicant, Job } from "../types";
import StatusBadge from "../components/StatusBadge";
import ApplicantDetailModal from "../components/ApplicantDetailModal";
import UploadApplicantModal from "../components/UploadApplicantModal";

const Applicants: React.FC = () => {
  const [searchParams] = useSearchParams();
  const jobIdFromUrl = searchParams.get("job");

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedApplicants, setSelectedApplicants] = useState<number[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null
  );
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    job: jobIdFromUrl || "",
    status: "",
    dateFrom: "",
    dateTo: "",
    minScore: "",
  });
  const [sortConfig, setSortConfig] = useState<{
    key: "date" | "score" | "name";
    direction: "asc" | "desc";
  }>({
    key: "date",
    direction: "desc",
  });

  useEffect(() => {
    fetchApplicants();
    fetchJobs();
  }, [filters]);

  const fetchApplicants = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.job) params.append("job", filters.job);
      if (filters.status) params.append("status", filters.status);
      if (filters.dateFrom) params.append("date_from", filters.dateFrom);
      if (filters.dateTo) params.append("date_to", filters.dateTo);
      if (filters.minScore) params.append("min_score", filters.minScore);
      if (search) params.append("search", search);

      const response = await api.get(`/applicants/?${params}`);
      const data = response.data.results || response.data;
      
      // Sort the data
      const sortedData = [...data].sort((a, b) => {
        if (sortConfig.key === "date") {
          return sortConfig.direction === "asc"
            ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else if (sortConfig.key === "score") {
          return sortConfig.direction === "asc"
            ? a.match_score - b.match_score
            : b.match_score - a.match_score;
        } else if (sortConfig.key === "name") {
          return sortConfig.direction === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        }
        return 0;
      });
      
      setApplicants(sortedData);
    } catch (err) {
      console.error("Failed to fetch applicants:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await api.get("/jobs/");
      const jobsData = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setJobs(jobsData);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    }
  };

  const handleSort = (key: "date" | "score" | "name") => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplicants();
  };

  const handleSelectAll = () => {
    if (selectedApplicants.length === applicants.length) {
      setSelectedApplicants([]);
    } else {
      setSelectedApplicants(applicants.map((app) => app.id));
    }
  };

  const handleSelectApplicant = (id: number) => {
    if (selectedApplicants.includes(id)) {
      setSelectedApplicants(selectedApplicants.filter((appId) => appId !== id));
    } else {
      setSelectedApplicants([...selectedApplicants, id]);
    }
  };

  const handleUpdateStatus = async (applicantId: number, status: string) => {
    const applicant = applicants.find((app) => app.id === applicantId);
    if (!applicant) return;

    Swal.fire({
      title: "Update Status",
      html: `<p>Change status for <strong>${
        applicant.name
      }</strong> to <strong>${status.toUpperCase()}</strong>?</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "Cancel",
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.post(`/applicants/${applicantId}/update_status/`, {
            status,
          });

          Swal.fire({
            title: "Success!",
            text: `Status updated to ${status} and email notification sent to applicant.`,
            icon: "success",
            confirmButtonColor: "#3b82f6",
            timer: 3000,
            timerProgressBar: true,
          });

          fetchApplicants();
        } catch (err) {
          console.error("Failed to update status:", err);
          Swal.fire({
            title: "Error!",
            text: "Failed to update status. Please try again.",
            icon: "error",
            confirmButtonColor: "#ef4444",
          });
        }
      }
    });
  };

  const handleBulkUpdateStatus = async (status: string) => {
    if (selectedApplicants.length === 0) return;

    Swal.fire({
      title: "Bulk Update Status",
      html: `<p>Update status for <strong>${
        selectedApplicants.length
      }</strong> applicant(s) to <strong>${status.toUpperCase()}</strong>?</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, update all!",
      cancelButtonText: "Cancel",
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.post("/applicants/bulk_update_status/", {
            applicant_ids: selectedApplicants,
            status,
          });

          Swal.fire({
            title: "Success!",
            text: `${selectedApplicants.length} applicant(s) updated to ${status} and notifications sent.`,
            icon: "success",
            confirmButtonColor: "#3b82f6",
            timer: 3000,
            timerProgressBar: true,
          });

          setSelectedApplicants([]);
          fetchApplicants();
        } catch (err) {
          console.error("Failed to bulk update status:", err);
          Swal.fire({
            title: "Error!",
            text: "Failed to update status. Please try again.",
            icon: "error",
            confirmButtonColor: "#ef4444",
          });
        }
      }
    });
  };

  const exportCSV = async () => {
    try {
      const response = await api.get("/applicants/export_csv/", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "applicants.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to export CSV:", err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const statusOptions = [
    { value: "new", label: "New", color: "bg-blue-100 text-blue-800" },
    {
      value: "reviewed",
      label: "Reviewed",
      color: "bg-purple-100 text-purple-800",
    },
    {
      value: "shortlisted",
      label: "Shortlisted",
      color: "bg-green-100 text-green-800",
    },
    { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" },
    {
      value: "hired",
      label: "Hired",
      color: "bg-emerald-100 text-emerald-800",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Applicants
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and review all job applications
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportCSV}
            className="inline-flex items-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Applicant
          </button>
        </div>
      </div>

      {/* Compact Professional Filters */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Filter Applicants
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Refine your search criteria
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFilters({
                job: jobIdFromUrl || "",
                status: "",
                dateFrom: "",
                dateTo: "",
                minScore: "",
              });
              setSearch("");
            }}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium mt-2 md:mt-0"
          >
            Clear filters
          </button>
        </div>

        <form onSubmit={handleSearch} className="space-y-3">
          {/* Search Row */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search by name, email, or skills..."
            />
          </div>

          {/* Compact Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <select
                value={filters.job}
                onChange={(e) => setFilters({ ...filters, job: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Jobs</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.minScore}
                onChange={(e) =>
                  setFilters({ ...filters, minScore: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Min Score"
              />
            </div>

            <div>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {applicants.length} applicants
            </span>
            <button
              type="submit"
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center"
            >
              <Filter className="mr-2 h-4 w-4" />
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      {/* Bulk Actions */}
      {selectedApplicants.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center mb-3 sm:mb-0">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {selectedApplicants.length} applicant(s) selected
                </span>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  Choose action for all selected
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleBulkUpdateStatus(option.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${option.color} hover:opacity-90 transition-opacity`}
                >
                  Mark as {option.label}
                </button>
              ))}
              <button
                onClick={() => setSelectedApplicants([])}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Professional Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : applicants.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No applicants found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Try adjusting your search filters or upload new applicants.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="pl-6 pr-3 py-3">
                    <button
                      onClick={handleSelectAll}
                      className="focus:outline-none"
                    >
                      {selectedApplicants.length === applicants.length ? (
                        <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <button
                      onClick={() => handleSort("date")}
                      className="flex items-center space-x-1 focus:outline-none"
                    >
                      <span>Applied Date</span>
                      {sortConfig.key === "date" ? (
                        sortConfig.direction === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    <button
                      onClick={() => handleSort("score")}
                      className="flex items-center space-x-1 focus:outline-none"
                    >
                      <span>Match Score</span>
                      {sortConfig.key === "score" ? (
                        sortConfig.direction === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {applicants.map((applicant) => (
                  <tr
                    key={applicant.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="pl-6 pr-3 py-4">
                      <button
                        onClick={() => handleSelectApplicant(applicant.id)}
                        className="focus:outline-none"
                      >
                        {selectedApplicants.includes(applicant.id) ? (
                          <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                          {applicant.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {applicant.name}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <Mail className="mr-1 h-3 w-3" />
                            {applicant.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="text-sm text-gray-900 dark:text-white font-medium">
                        {applicant.job_title}
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center space-x-2">
                        <StatusBadge status={applicant.status} />
                        <div className="flex">
                          {statusOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() =>
                                handleUpdateStatus(applicant.id, option.value)
                              }
                              className={`ml-1 text-xs px-2 py-1 rounded-full ${option.color} opacity-70 hover:opacity-100 transition-opacity`}
                              title={`Mark as ${option.label}`}
                            >
                              {option.label.charAt(0)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(applicant.created_at)}
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-24">
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                applicant.match_score >= 80
                                  ? "bg-green-500"
                                  : applicant.match_score >= 60
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${applicant.match_score}%` }}
                            />
                          </div>
                        </div>
                        <span
                          className={`text-sm font-semibold ${
                            applicant.match_score >= 80
                              ? "text-green-600 dark:text-green-400"
                              : applicant.match_score >= 60
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {applicant.match_score}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedApplicant(applicant);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <a
                          href={applicant.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          title="Download Resume"
                        >
                          <FileText className="h-4 w-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <UploadApplicantModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={fetchApplicants}
        jobs={jobs}
      />

      <ApplicantDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedApplicant(null);
        }}
        applicant={selectedApplicant}
        onStatusUpdate={fetchApplicants}
      />
    </div>
  );
};

export default Applicants;