import React, { useState } from "react";
import axios from "axios";
import {
  X,
  Upload,
  FileText,
  User,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Link as LinkIcon,
} from "lucide-react";
import type { Job } from "../types";

interface UploadApplicantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: () => void;
  jobs: Job[];
}

interface ApplicantFormData {
  name: string;
  email: string;
  phone: string;
  job: string;
  cover_letter: string;
  resume: File | null;
}

const UploadApplicantModal: React.FC<UploadApplicantModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  jobs,
}) => {
  const [formData, setFormData] = useState<ApplicantFormData>({
    name: "",
    email: "",
    phone: "",
    job: "",
    cover_letter: "",
    resume: null,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [parseResume, setParseResume] = useState(true);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const processFile = (file: File | undefined) => {
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "text/rtf",
      "application/rtf",
      "image/jpeg",
      "image/png",
    ];

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
      ".txt",
      ".rtf",
      ".jpg",
      ".jpeg",
      ".png",
    ];

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(`.${fileExtension}`)
    ) {
      setError(
        "Please upload PDF, DOC, DOCX, TXT, RTF, JPG, or PNG files only"
      );
      return;
    }

    setFormData((prev) => ({ ...prev, resume: file }));
    setFileName(file.name);
    setError("");

    // Auto-fill name from filename if empty
    if (!formData.name.trim()) {
      const nameFromFile = file.name
        .replace(/\.[^/.]+$/, "") // Remove extension
        .replace(/[_-]/g, " ") // Replace underscores and hyphens with spaces
        .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space between camelCase
        .replace(/\d+/g, "") // Remove numbers
        .trim();

      if (nameFromFile.length > 2) {
        setFormData((prev) => ({ ...prev, name: nameFromFile }));
      }
    }
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, resume: null }));
    setFileName("");
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) newErrors.push("Name is required");
    if (!formData.email.trim()) newErrors.push("Email is required");
    if (!formData.job.trim()) newErrors.push("Job selection is required");
    if (!formData.resume) newErrors.push("Resume file is required");

    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.push("Please enter a valid email address");
    }

    if (
      formData.phone.trim() &&
      !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ""))
    ) {
      newErrors.push("Please enter a valid phone number");
    }

    if (newErrors.length > 0) {
      setError(newErrors.join(". "));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    let progressInterval: ReturnType<typeof setInterval> | undefined;

    try {
      const data = new FormData();
      data.append("name", formData.name.trim());
      data.append("email", formData.email.trim());
      if (formData.phone.trim()) data.append("phone", formData.phone.trim());
      data.append("job", formData.job);
      if (formData.cover_letter.trim())
        data.append("cover_letter", formData.cover_letter.trim());
      if (formData.resume) data.append("resume", formData.resume);
      data.append("parse_resume", parseResume.toString());

      // Simulate upload progress
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            if (progressInterval !== undefined) clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      await axios.post("/api/applicants/", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          }
        },
      });

      if (progressInterval !== undefined) clearInterval(progressInterval);
      setUploadProgress(100);

      setSuccess(true);
      setTimeout(() => {
        onUpload();
        resetForm();
        onClose();
      }, 2000);
    } catch (err: any) {
      if (progressInterval !== undefined) clearInterval(progressInterval);
      setUploadProgress(0);

      if (err.response?.status === 400) {
        const errorData = err.response.data;
        if (typeof errorData === "object") {
          const errorMessages = Object.values(errorData).flat().join(". ");
          setError(errorMessages);
        } else {
          setError(
            errorData?.detail ||
              "Failed to upload applicant. Please check your data."
          );
        }
      } else if (err.response?.status === 413) {
        setError("File too large. Maximum size is 10MB.");
      } else {
        setError("Failed to upload applicant. Please try again.");
      }
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      job: "",
      cover_letter: "",
      resume: null,
    });
    setFileName("");
    setError("");
    setSuccess(false);
    setUploadProgress(0);
    setShowAdvanced(false);
    setParseResume(true);
  };

  const handleClose = () => {
    if (!isUploading) {
      resetForm();
      onClose();
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />;
      case "doc":
      case "docx":
        return <FileText className="h-8 w-8 text-blue-500" />;
      case "jpg":
      case "jpeg":
      case "png":
        return <FileText className="h-8 w-8 text-green-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  const getFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  if (!isOpen) return null;

  const activeJobs = jobs.filter((job) => job.is_active);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity"
          aria-hidden="true"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal */}
        <div
          className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Add New Applicant
                </h3>
              </div>
              <button
                onClick={handleClose}
                disabled={isUploading}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 disabled:opacity-50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Upload a resume to add a new applicant to the system. All fields
              marked with * are required.
            </p>
          </div>

          {/* Success State */}
          {success ? (
            <div className="px-6 py-12">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Applicant Added Successfully!
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  The applicant has been added to the system and is now visible
                  in the applicants list.
                </p>
                <div className="animate-pulse">
                  <div className="h-2 bg-green-200 dark:bg-green-800 rounded-full w-3/4 mx-auto"></div>
                  <div className="h-2 bg-green-200 dark:bg-green-800 rounded-full w-1/2 mx-auto mt-2"></div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Error Message */}
                {error && (
                  <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4 border border-red-200 dark:border-red-800">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-500 flex-shrink-0" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                          {error}
                        </h3>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Uploading...
                      </span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {uploadProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                    <User className="h-5 w-5 mr-2 text-gray-500" />
                    Personal Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={isUploading}
                          className="pl-10 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={isUploading}
                          className="pl-10 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={isUploading}
                          className="pl-10 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    {/* Job */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Job Applied For *
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <select
                          name="job"
                          value={formData.job}
                          onChange={handleInputChange}
                          disabled={isUploading || activeJobs.length === 0}
                          className="pl-10 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          required
                        >
                          <option value="">Select a job</option>
                          {activeJobs.length === 0 ? (
                            <option value="" disabled>
                              No active jobs available
                            </option>
                          ) : (
                            activeJobs.map((job) => (
                              <option key={job.id} value={job.id}>
                                {job.title}{" "}
                                {job.location ? `(${job.location})` : ""}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                      {activeJobs.length === 0 && (
                        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="inline h-3 w-3 mr-1" />
                          No active jobs. Create a job first or activate an
                          existing one.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Resume Upload */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-gray-500" />
                    Resume Upload *
                  </h4>

                  {!fileName ? (
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive
                          ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <div className="flex flex-col items-center">
                        <Upload className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            Click to upload
                          </span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PDF, DOC, DOCX, TXT, RTF, JPG, or PNG (Max 10MB)
                        </p>
                        <input
                          type="file"
                          id="resume-upload"
                          onChange={handleFileChange}
                          disabled={isUploading}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt,.rtf,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/rtf,application/rtf,image/jpeg,image/png"
                        />
                        <label
                          htmlFor="resume-upload"
                          className={`mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer ${
                            isUploading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          Browse Files
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(fileName)}
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                              {fileName}
                            </p>
                            {formData.resume && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {getFileSize(formData.resume.size)}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          disabled={isUploading}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Advanced Options */}
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <LinkIcon
                      className={`h-4 w-4 mr-2 transition-transform ${
                        showAdvanced ? "rotate-90" : ""
                      }`}
                    />
                    {showAdvanced ? "Hide" : "Show"} Advanced Options
                  </button>

                  {showAdvanced && (
                    <div className="space-y-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      {/* Parse Resume Option */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="parse_resume"
                          checked={parseResume}
                          onChange={(e) => setParseResume(e.target.checked)}
                          disabled={isUploading}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="parse_resume"
                          className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                        >
                          Extract keywords and score from resume (recommended)
                        </label>
                      </div>

                      {/* Cover Letter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Cover Letter
                        </label>
                        <textarea
                          name="cover_letter"
                          value={formData.cover_letter}
                          onChange={handleInputChange}
                          disabled={isUploading}
                          rows={4}
                          className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="Optional: Paste or type the applicant's cover letter..."
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Cover letter helps in better matching and scoring
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tips */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        Tips for best results:
                      </h4>
                      <ul className="mt-1 text-xs text-blue-700 dark:text-blue-400 space-y-1">
                        <li>• Ensure the resume file is clear and readable</li>
                        <li>• Use PDF format for best compatibility</li>
                        <li>
                          • Complete all required fields for accurate matching
                        </li>
                        <li>
                          • Cover letter helps in better applicant scoring
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {fileName ? (
                      <span className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        {fileName}
                      </span>
                    ) : (
                      "No file selected"
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isUploading}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading || activeJobs.length === 0}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Add Applicant
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadApplicantModal;
