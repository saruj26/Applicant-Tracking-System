import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Briefcase,
  MapPin,
  ChevronsUpDown,
  ChevronDown,
  ChevronUp,
  DollarSign,
  ExternalLink,
  FileText,
  RefreshCw,
  Download,
} from "lucide-react";
import type { Job } from "../types";
import Swal from "sweetalert2";

const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: "date" | "applications" | "title" | "status";
    direction: "asc" | "desc";
  }>({
    key: "date",
    direction: "desc",
  });

  // New job form state
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    salary_range: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/jobs/");
      const jobsData = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setJobs(jobsData);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      Swal.fire({
        title: "Error!",
        text: "Failed to load jobs. Please try again.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (key: "date" | "applications" | "title" | "status") => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedJobs = [...jobs]
    .filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && job.is_active) ||
        (statusFilter === "inactive" && !job.is_active);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.key) {
        case "date":
          comparison =
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;
        case "applications":
          comparison = (b.application_count || 0) - (a.application_count || 0);
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "status":
          comparison = (a.is_active ? 1 : 0) - (b.is_active ? 1 : 0);
          break;
      }

      return sortConfig.direction === "asc" ? -comparison : comparison;
    });

  const handleCreateJob = async () => {
    const newErrors: Record<string, string> = {};
    if (!newJob.title.trim()) newErrors.title = "Title is required";
    if (!newJob.description.trim())
      newErrors.description = "Description is required";
    if (!newJob.location.trim()) newErrors.location = "Location is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await api.post("/jobs/", newJob);
      setJobs([response.data, ...jobs]);
      setShowCreateModal(false);
      resetNewJobForm();
      Swal.fire({
        title: "Success!",
        text: "Job created successfully.",
        icon: "success",
        confirmButtonColor: "#10b981",
        timer: 2000,
      });
    } catch (err) {
      console.error("Failed to create job:", err);
      Swal.fire({
        title: "Error!",
        text: "Failed to create job. Please try again.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleUpdateJob = async () => {
    if (!selectedJob) return;

    const newErrors: Record<string, string> = {};
    if (!newJob.title.trim()) newErrors.title = "Title is required";
    if (!newJob.description.trim())
      newErrors.description = "Description is required";
    if (!newJob.location.trim()) newErrors.location = "Location is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await api.put(`/jobs/${selectedJob.id}/`, newJob);
      setJobs(
        jobs.map((job) => (job.id === selectedJob.id ? response.data : job))
      );
      setShowEditModal(false);
      resetNewJobForm();
      Swal.fire({
        title: "Success!",
        text: "Job updated successfully.",
        icon: "success",
        confirmButtonColor: "#10b981",
        timer: 2000,
      });
    } catch (err) {
      console.error("Failed to update job:", err);
      Swal.fire({
        title: "Error!",
        text: "Failed to update job. Please try again.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleDeleteJob = async (jobToDelete: Job) => {
    Swal.fire({
      title: "Are you sure?",
      html: `<p>Delete "<strong>${
        jobToDelete.title
      }</strong>"?<br/>This action cannot be undone.${
        jobToDelete.application_count
          ? `<br/><br/>This job has ${jobToDelete.application_count} applicant(s).`
          : ""
      }</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/jobs/${jobToDelete.id}/`);
          setJobs(jobs.filter((job) => job.id !== jobToDelete.id));
          Swal.fire({
            title: "Deleted!",
            text: "Job has been deleted.",
            icon: "success",
            confirmButtonColor: "#10b981",
            timer: 2000,
          });
        } catch (err) {
          console.error("Failed to delete job:", err);
          Swal.fire({
            title: "Error!",
            text: "Failed to delete job. Please try again.",
            icon: "error",
            confirmButtonColor: "#ef4444",
          });
        }
      }
    });
  };

  const handleToggleJobStatus = async (job: Job) => {
    Swal.fire({
      title: "Change Status",
      html: `<p>${job.is_active ? "Deactivate" : "Activate"} "<strong>${
        job.title
      }</strong>"?</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: job.is_active ? "#f59e0b" : "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: job.is_active ? "Deactivate" : "Activate",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const updatedJob = { ...job, is_active: !job.is_active };
          const response = await api.put(`/jobs/${job.id}/`, updatedJob);
          setJobs(jobs.map((j) => (j.id === job.id ? response.data : j)));
          Swal.fire({
            title: "Success!",
            text: `Job ${
              job.is_active ? "deactivated" : "activated"
            } successfully.`,
            icon: "success",
            confirmButtonColor: "#10b981",
            timer: 2000,
          });
        } catch (err) {
          console.error("Failed to toggle job status:", err);
          Swal.fire({
            title: "Error!",
            text: "Failed to update job status. Please try again.",
            icon: "error",
            confirmButtonColor: "#ef4444",
          });
        }
      }
    });
  };

  const resetNewJobForm = () => {
    setNewJob({
      title: "",
      description: "",
      requirements: "",
      location: "",
      salary_range: "",
      is_active: true,
    });
    setErrors({});
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  };

  const exportJobsCSV = async () => {
    try {
      const response = await api.get("/jobs/export_csv/", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "jobs.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to export CSV:", err);
      Swal.fire({
        title: "Error!",
        text: "Failed to export jobs. Please try again.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Job Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create, manage, and track all job positions
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={exportJobsCSV}
            className="inline-flex items-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Job
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            title: "Total Jobs",
            value: jobs.length,
            icon: Briefcase,
            color: "bg-blue-500",
            textColor: "text-blue-600 dark:text-blue-400",
          },
          {
            title: "Active Jobs",
            value: jobs.filter((j) => j.is_active).length,
            icon: CheckCircle,
            color: "bg-green-500",
            textColor: "text-green-600 dark:text-green-400",
          },
          {
            title: "Total Applicants",
            value: jobs.reduce(
              (sum, job) => sum + (job.application_count || 0),
              0
            ),
            icon: Users,
            color: "bg-purple-500",
            textColor: "text-purple-600 dark:text-purple-400",
          },
          {
            title: "New This Week",
            value: jobs.reduce(
              (sum, job) => sum + (job.new_applications_count || 0),
              0
            ),
            icon: Clock,
            color: "bg-orange-500",
            textColor: "text-orange-600 dark:text-orange-400",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
              </div>
              <div
                className={`h-12 w-12 rounded-lg ${stat.color} bg-opacity-10 flex items-center justify-center`}
              >
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search jobs by title, location, or description..."
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
            <button
              onClick={fetchJobs}
              className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              title="Refresh jobs"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : sortedJobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
              <Briefcase className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No jobs found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by creating your first job posting"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-all"
              >
                <Plus className="inline mr-2 h-4 w-4" />
                Create Job
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="pl-6 pr-3 py-3">
                    <div className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                      #
                    </div>
                  </th>
                  <th className="px-3 py-3 text-left">
                    <button
                      onClick={() => handleSort("title")}
                      className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider flex items-center space-x-1 focus:outline-none"
                    >
                      <span>Job Title</span>
                      {sortConfig.key === "title" ? (
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
                  <th className="px-3 py-3 text-left">
                    <div className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                      Location
                    </div>
                  </th>
                  <th className="px-3 py-3 text-left">
                    <button
                      onClick={() => handleSort("date")}
                      className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider flex items-center space-x-1 focus:outline-none"
                    >
                      <span>Posted Date</span>
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
                  <th className="px-3 py-3 text-left">
                    <button
                      onClick={() => handleSort("applications")}
                      className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider flex items-center space-x-1 focus:outline-none"
                    >
                      <span>Applicants</span>
                      {sortConfig.key === "applications" ? (
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
                  <th className="px-3 py-3 text-left">
                    <button
                      onClick={() => handleSort("status")}
                      className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider flex items-center space-x-1 focus:outline-none"
                    >
                      <span>Status</span>
                      {sortConfig.key === "status" ? (
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
                  <th className="px-3 py-3 text-left">
                    <div className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                      Actions
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sortedJobs.map((job, index) => (
                  <React.Fragment key={job.id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="pl-6 pr-3 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {job.title}
                          </div>
                          {job.salary_range && (
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <span className="mr-1">LKR</span>
                              {job.salary_range}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          {job.location || "Remote"}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {formatDate(job.created_at)}
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center">
                          <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {job.application_count || 0}
                            </div>
                            {job.new_applications_count ? (
                              <div className="text-xs text-blue-600 dark:text-blue-400">
                                +{job.new_applications_count} new
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center">
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              job.is_active
                            )}`}
                          >
                            {job.is_active ? (
                              <>
                                <CheckCircle className="mr-1.5 h-3 w-3" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="mr-1.5 h-3 w-3" />
                                Inactive
                              </>
                            )}
                          </div>
                          <button
                            onClick={() => handleToggleJobStatus(job)}
                            className="ml-2 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            title={job.is_active ? "Deactivate" : "Activate"}
                          >
                            {job.is_active ? (
                              <XCircle className="h-4 w-4" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              navigate(`/applicants?job=${job.id}`)
                            }
                            className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                            title="View Applicants"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedJob(job);
                              setNewJob({
                                title: job.title,
                                description: job.description,
                                requirements: job.requirements,
                                location: job.location,
                                salary_range: job.salary_range,
                                is_active: job.is_active,
                              });
                              setErrors({});
                              setShowEditModal(true);
                            }}
                            className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            title="Edit Job"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job)}
                            className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                            title="Delete Job"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              setExpandedJobId(
                                expandedJobId === job.id ? null : job.id
                              )
                            }
                            className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            title="View Details"
                          >
                            {expandedJobId === job.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedJobId === job.id && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-4 bg-gray-50 dark:bg-gray-900"
                        >
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                  Job Description
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                  {job.description}
                                </p>
                              </div>
                              {job.requirements && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                    Requirements
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                    {job.requirements}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                              <button
                                onClick={() => {
                                  const url = `/careers/${job.id}`;
                                  window.open(url, "_blank");
                                }}
                                className="inline-flex items-center px-4 py-2 border border-blue-300 dark:border-blue-700 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Public Page
                              </button>
                              <button
                                onClick={() => {
                                  // Copy job URL to clipboard
                                  const url = `${window.location.origin}/careers/${job.id}`;
                                  navigator.clipboard.writeText(url);
                                  Swal.fire({
                                    title: "Copied!",
                                    text: "Job URL copied to clipboard.",
                                    icon: "success",
                                    confirmButtonColor: "#10b981",
                                    timer: 1500,
                                  });
                                }}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Copy Job Link
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowCreateModal(false)}
            />

            <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Create New Job
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Fill in the details to create a new job posting
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={newJob.title}
                    onChange={(e) => {
                      setNewJob({ ...newJob, title: e.target.value });
                      if (errors.title) setErrors({ ...errors, title: "" });
                    }}
                    className={`w-full px-3 py-2.5 border ${
                      errors.title
                        ? "border-red-300 dark:border-red-700"
                        : "border-gray-300 dark:border-gray-600"
                    } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="e.g., Senior Software Engineer"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.title}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={newJob.location}
                      onChange={(e) => {
                        setNewJob({ ...newJob, location: e.target.value });
                        if (errors.location)
                          setErrors({ ...errors, location: "" });
                      }}
                      className={`w-full px-3 py-2.5 border ${
                        errors.location
                          ? "border-red-300 dark:border-red-700"
                          : "border-gray-300 dark:border-gray-600"
                      } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="e.g., Remote, Colombo, etc."
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.location}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Salary Range
                    </label>
                    <input
                      type="text"
                      value={newJob.salary_range}
                      onChange={(e) =>
                        setNewJob({ ...newJob, salary_range: e.target.value })
                      }
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Rs100,000 - Rs150,000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    value={newJob.description}
                    onChange={(e) => {
                      setNewJob({ ...newJob, description: e.target.value });
                      if (errors.description)
                        setErrors({ ...errors, description: "" });
                    }}
                    rows={4}
                    className={`w-full px-3 py-2.5 border ${
                      errors.description
                        ? "border-red-300 dark:border-red-700"
                        : "border-gray-300 dark:border-gray-600"
                    } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Describe the role, responsibilities, and expectations..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Requirements
                  </label>
                  <textarea
                    value={newJob.requirements}
                    onChange={(e) =>
                      setNewJob({ ...newJob, requirements: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="List required skills, experience, and qualifications..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={newJob.is_active}
                    onChange={(e) =>
                      setNewJob({ ...newJob, is_active: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="is_active"
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    Activate this job posting immediately
                  </label>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateJob}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all"
                >
                  Create Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {showEditModal && selectedJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowEditModal(false)}
            />

            <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Edit Job
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Update job details
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={newJob.title}
                    onChange={(e) => {
                      setNewJob({ ...newJob, title: e.target.value });
                      if (errors.title) setErrors({ ...errors, title: "" });
                    }}
                    className={`w-full px-3 py-2.5 border ${
                      errors.title
                        ? "border-red-300 dark:border-red-700"
                        : "border-gray-300 dark:border-gray-600"
                    } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.title}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={newJob.location}
                      onChange={(e) => {
                        setNewJob({ ...newJob, location: e.target.value });
                        if (errors.location)
                          setErrors({ ...errors, location: "" });
                      }}
                      className={`w-full px-3 py-2.5 border ${
                        errors.location
                          ? "border-red-300 dark:border-red-700"
                          : "border-gray-300 dark:border-gray-600"
                      } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.location}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Salary Range
                    </label>
                    <input
                      type="text"
                      value={newJob.salary_range}
                      onChange={(e) =>
                        setNewJob({ ...newJob, salary_range: e.target.value })
                      }
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    value={newJob.description}
                    onChange={(e) => {
                      setNewJob({ ...newJob, description: e.target.value });
                      if (errors.description)
                        setErrors({ ...errors, description: "" });
                    }}
                    rows={4}
                    className={`w-full px-3 py-2.5 border ${
                      errors.description
                        ? "border-red-300 dark:border-red-700"
                        : "border-gray-300 dark:border-gray-600"
                    } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Requirements
                  </label>
                  <textarea
                    value={newJob.requirements}
                    onChange={(e) =>
                      setNewJob({ ...newJob, requirements: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit_is_active"
                    checked={newJob.is_active}
                    onChange={(e) =>
                      setNewJob({ ...newJob, is_active: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="edit_is_active"
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    Job is active
                  </label>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateJob}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all"
                >
                  Update Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
