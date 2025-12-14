import React, { useState, useEffect } from "react";
import api from "../api/axios";
import Swal from "sweetalert2";
import {
  X,
  Mail,
  Phone,
  Calendar,
  FileText,
  Briefcase,
  Award,
  Download,
  Edit,
  User,
  MapPin,
  Star,
  Copy,
  CheckCircle,
  Clock,
  MessageSquare,
  ChevronRight,
  Tag,
  Eye,
  Send,
  ExternalLink,
  DollarSign,
  Users,
  Link,
} from "lucide-react";
import type { Applicant } from "../types";
import StatusBadge from "./StatusBadge";

interface ApplicantDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: Applicant | null;
  onStatusUpdate: () => void;
}

const ApplicantDetailModal: React.FC<ApplicantDetailModalProps> = ({
  isOpen,
  onClose,
  applicant,
  onStatusUpdate,
}) => {
  const [notes, setNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (applicant?.notes) {
      setNotes(applicant.notes);
    }
  }, [applicant]);

  if (!isOpen || !applicant) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    }
  };

  const handleStatusUpdate = async (status: string) => {
    const statusLabels: Record<string, string> = {
      new: "New",
      reviewed: "Reviewed",
      shortlisted: "Shortlisted",
      rejected: "Rejected",
      hired: "Hired",
    };

    const result = await Swal.fire({
      title: "Update Status?",
      html: `
        <div class="text-center">
          <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p class="font-semibold text-gray-900">${applicant.name}</p>
          <p class="text-sm text-gray-600 mt-1">to <span class="font-semibold text-blue-600">${statusLabels[status]}</span></p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Update",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "rounded-xl",
      },
    });

    if (!result.isConfirmed) return;

    try {
      setIsUpdating(true);
      await api.post(`/applicants/${applicant.id}/update_status/`, {
        status,
        notes: notes || applicant.notes,
      });

      await Swal.fire({
        title: "Updated!",
        icon: "success",
        confirmButtonColor: "#10b981",
        timer: 1500,
        customClass: {
          popup: "rounded-xl",
        },
      });

      onStatusUpdate();
    } catch (err) {
      console.error("Failed to update status:", err);
      Swal.fire({
        title: "Error",
        text: "Failed to update status",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setIsUpdating(true);
      await api.patch(`/applicants/${applicant.id}/`, { notes });
      setIsEditingNotes(false);
      onStatusUpdate();
      Swal.fire({
        title: "Saved!",
        icon: "success",
        confirmButtonColor: "#10b981",
        timer: 1500,
      });
    } catch (err) {
      console.error("Failed to save notes:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(applicant.email);
    Swal.fire({
      title: "Copied!",
      icon: "success",
      confirmButtonColor: "#10b981",
      timer: 1000,
    });
  };

  // Selected styles split to avoid text overrides and support dark mode
  const statusOptions = [
    {
      value: "new",
      label: "New",
      selectedBg: "bg-blue-600 dark:bg-blue-600",
      selectedText: "text-white",
    },
    {
      value: "reviewed",
      label: "Reviewed",
      selectedBg: "bg-purple-600 dark:bg-purple-600",
      selectedText: "text-white",
    },
    {
      value: "shortlisted",
      label: "Shortlisted",
      selectedBg: "bg-green-600 dark:bg-green-600",
      selectedText: "text-white",
    },
    {
      value: "rejected",
      label: "Rejected",
      selectedBg: "bg-red-600 dark:bg-red-600",
      selectedText: "text-white",
    },
    {
      value: "hired",
      label: "Hired",
      selectedBg: "bg-emerald-600 dark:bg-emerald-600",
      selectedText: "text-white",
    },
  ];

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getMatchScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/30";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-red-100 dark:bg-red-900/30";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-4 flex items-center justify-center">
        <div className="relative w-full max-w-6xl h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                  {applicant.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {applicant.name}
                  </h2>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {applicant.job_title}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Applied {formatDate(applicant.created_at)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Main Content - No Scroll Container */}
          <div className="flex-1 overflow-hidden p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 h-full gap-6">
              {/* Left Column - Basic Info & Contact */}
              <div className="space-y-6 h-full">
                {/* Score Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-xl p-4 border border-blue-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Match Score
                    </h3>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-bold ${getMatchScoreBg(
                        applicant.match_score
                      )} ${getMatchScoreColor(applicant.match_score)}`}
                    >
                      {applicant.match_score}%
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                      style={{ width: `${applicant.match_score}%` }}
                    />
                  </div>
                </div>

                {/* Contact Card */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 h-[calc(50%-1.5rem)]">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <User className="h-4 w-4 mr-2 text-blue-500" />
                    Contact
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm">{applicant.email}</span>
                      </div>
                      <button
                        onClick={handleCopyEmail}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <Copy className="h-3 w-3 text-gray-500" />
                      </button>
                    </div>
                    {applicant.phone && (
                      <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">{applicant.phone}</span>
                        </div>
                        <a
                          href={`tel:${applicant.phone}`}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <Send className="h-3 w-3 text-gray-500" />
                        </a>
                      </div>
                    )}
                    <div className="flex items-center p-2">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Applied {formatDate(applicant.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Keywords Card */}
                {applicant.keywords && (
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 h-[calc(35%-1.5rem)]">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-purple-500" />
                      Skills & Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2 overflow-y-auto max-h-32">
                      {applicant.keywords
                        .split(",")
                        .slice(0, 8)
                        .map((keyword, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800"
                          >
                            {keyword.trim()}
                            {index === 0 && (
                              <Star className="h-2.5 w-2.5 ml-1 text-yellow-500" />
                            )}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Middle Column - Resume & Cover Letter */}
              <div className="space-y-6 h-full">
                 {/* Resume Card */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 h-[calc(50%-1.5rem)] flex flex-col">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-blue-500" />
                    Resume
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 h-[calc(100%-1.5rem)] flex flex-col">
                    <div className="flex items-center mb-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {applicant.resume_filename || "resume.pdf"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PDF Document
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-auto">
                      <a
                        href={applicant.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg text-center transition-colors"
                      >
                        <Eye className="inline h-3 w-3 mr-1" />
                        View
                      </a>
                      <a
                        href={applicant.resume_url}
                        download
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-center transition-colors"
                      >
                        <Download className="inline h-3 w-3 mr-1" />
                        Download
                      </a>
                    </div>
                  </div>
                </div>

                {/* Cover Letter Card */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 h-[calc(50%-1.5rem)] flex flex-col">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-green-500" />
                    Cover Letter
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 h-full overflow-y-auto">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {applicant.cover_letter
                        ? applicant.cover_letter.length > 200
                          ? applicant.cover_letter.substring(0, 200) + "..."
                          : applicant.cover_letter
                        : "No cover letter provided."}
                    </p>
                  </div>
                </div>

                
              </div>

              {/* Right Column - Status & Actions */}
              <div className="space-y-6 h-full">
                {/* Status Card */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 h-[calc(60%-1.5rem)] flex flex-col">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Application Status
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <StatusBadge status={applicant.status} />
                      <span className="text-xs text-gray-500">
                        Updated {formatDate(applicant.updated_at)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Quick Status Update:
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {statusOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleStatusUpdate(option.value)}
                            disabled={
                              isUpdating || applicant.status === option.value
                            }
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              applicant.status === option.value
                                ? `${option.selectedBg} ${option.selectedText}`
                                : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            <span>{option.label}</span>
                            {applicant.status === option.value ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Notes Card */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 h-[calc(40%-1.5rem)] flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
                      Internal Notes
                    </h3>
                    {!isEditingNotes && (
                      <button
                        onClick={() => setIsEditingNotes(true)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  {isEditingNotes ? (
                    <div className="space-y-2">
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Add private notes..."
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setIsEditingNotes(false);
                            setNotes(applicant.notes || "");
                          }}
                          className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveNotes}
                          disabled={isUpdating}
                          className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isUpdating ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 h-full overflow-y-auto">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {notes ||
                          applicant.notes ||
                          "Click edit to add notes..."}
                      </p>
                    </div>
                  )}
                </div>              
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              ID: {applicant.id} • Applied: {formatDate(applicant.created_at)}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  window.open(`mailto:${applicant.email}`, "_blank")
                }
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Mail className="inline h-4 w-4 mr-2" />
                Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetailModal;
