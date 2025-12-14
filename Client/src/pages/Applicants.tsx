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
      setApplicants(response.data.results || response.data);
    } catch (err) {
      console.error("Failed to fetch applicants:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await api.get("/jobs/");
      // Handle both paginated and direct array responses
      const jobsData = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setJobs(jobsData);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    }
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

    // Show SweetAlert confirmation
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

          // Show success message
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

    // Show SweetAlert confirmation
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

          // Show success message
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Applicants
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and review all job applications
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Applicant
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search applicants..."
                />
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="mr-2 h-4 w-4" />
              Search
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Job
              </label>
              <select
                value={filters.job}
                onChange={(e) =>
                  setFilters({ ...filters, job: e.target.value })
                }
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Min Score
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.minScore}
                onChange={(e) =>
                  setFilters({ ...filters, minScore: e.target.value })
                }
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700"
                placeholder="0-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700"
              />
            </div>
          </div>
        </form>
      </div>

      {/* Bulk Actions */}
      {selectedApplicants.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {selectedApplicants.length} applicant(s) selected
              </span>
            </div>
            <div className="flex space-x-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleBulkUpdateStatus(option.value)}
                  className={`inline-flex items-center px-3 py-1.5 rounded text-xs font-medium ${option.color}`}
                >
                  Mark as {option.label}
                </button>
              ))}
              <button
                onClick={() => setSelectedApplicants([])}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Applicants Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : applicants.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No applicants found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your filters or upload new applicants.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <button
                      onClick={handleSelectAll}
                      className="focus:outline-none"
                    >
                      {selectedApplicants.length === applicants.length ? (
                        <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {applicants.map((applicant) => (
                  <tr
                    key={applicant.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleSelectApplicant(applicant.id)}
                        className="focus:outline-none"
                      >
                        {selectedApplicants.includes(applicant.id) ? (
                          <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              {applicant.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {applicant.name}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Mail className="mr-1 h-3 w-3" />
                            {applicant.email}
                          </div>
                          {applicant.phone && (
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <Phone className="mr-1 h-3 w-3" />
                              {applicant.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {applicant.job_title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <StatusBadge status={applicant.status} />
                        <div className="flex space-x-1">
                          {statusOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() =>
                                handleUpdateStatus(applicant.id, option.value)
                              }
                              className={`text-xs px-2 py-1 rounded ${option.color} opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity`}
                              title={`Mark as ${option.label}`}
                            >
                              {option.label.charAt(0)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="mr-2 h-4 w-4" />
                        {formatDate(applicant.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div
                            className="bg-green-600 h-2.5 rounded-full"
                            style={{
                              width: `${Math.min(applicant.match_score, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                          {applicant.match_score}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedApplicant(applicant);
                            setIsDetailModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <a
                          href={applicant.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Download Resume"
                        >
                          <FileText className="h-5 w-5" />
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
