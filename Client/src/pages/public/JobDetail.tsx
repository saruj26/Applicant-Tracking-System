import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  Upload,
  Mail,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import type { Job } from "../../types";

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState("");

  // Application form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cover_letter: "",
    resume: null as File | null,
  });
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/public/jobs/${id}/`);
      setJob(response.data);
    } catch (err) {
      console.error("Failed to fetch job:", err);
      navigate("/careers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
    ];

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const allowedExtensions = [".pdf", ".doc", ".docx", ".txt", ".rtf"];

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(`.${fileExtension}`)
    ) {
      setError("Please upload PDF, DOC, DOCX, TXT, or RTF files only");
      return;
    }

    setFormData((prev) => ({ ...prev, resume: file }));
    setFileName(file.name);
    setError("");
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) newErrors.push("Name is required");
    if (!formData.email.trim()) newErrors.push("Email is required");
    if (!formData.resume) newErrors.push("Resume is required");

    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.push("Please enter a valid email address");
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

    if (!validateForm() || !job) {
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("name", formData.name.trim());
      data.append("email", formData.email.trim());
      data.append("job", job.id.toString());
      if (formData.phone.trim()) data.append("phone", formData.phone.trim());
      if (formData.cover_letter.trim())
        data.append("cover_letter", formData.cover_letter.trim());
      if (formData.resume) data.append("resume", formData.resume);

      await api.post("/public/applications/", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSubmitSuccess(true);

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        cover_letter: "",
        resume: null,
      });
      setFileName("");

      // Auto-redirect after 5 seconds
      setTimeout(() => {
        navigate("/careers");
      }, 5000);
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(err.response.data.error || "Failed to submit application");
      } else {
        setError("Failed to submit application. Please try again.");
      }
      console.error("Application error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Success Modal */}
      {submitSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="h-16 w-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Application Submitted!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Thank you for applying for the {job.title} position. We'll
                review your application and contact you if there's a match.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Redirecting to careers page in 5 seconds...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="container mx-auto px-4 py-6">
        <Link
          to="/careers"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Careers
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Job Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {job.title}
                  </h1>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Accepting Applications
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 mb-6">
                  {job.location && (
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      {job.location}
                    </div>
                  )}
                  {job.salary_range && (
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2" />
                      {job.salary_range}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Posted {formatDate(job.created_at)}
                  </div>
                </div>

                <p className="text-lg text-gray-700 dark:text-gray-300">
                  {job.description}
                </p>
              </div>

              <div className="md:w-96">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Ready to Apply?
                  </h3>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Fill out the application form</span>
                    </li>
                    <li className="flex items-center text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Upload your resume</span>
                    </li>
                    <li className="flex items-center text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Add optional cover letter</span>
                    </li>
                    <li className="flex items-center text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Submit & wait for response</span>
                    </li>
                  </ul>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Average response time: 3-5 business days
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Job Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Requirements */}
              {job.requirements && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Requirements
                  </h2>
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {job.requirements}
                    </div>
                  </div>
                </div>
              )}

              {/* Benefits */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Why Join Nanthi Ventures?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Competitive Compensation
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      We offer competitive salaries, bonuses, and equity
                      packages.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Remote Flexibility
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Work from anywhere with our fully remote or hybrid
                      options.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Learning & Growth
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Continuous learning opportunities and career advancement.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Health & Wellness
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Comprehensive health insurance and wellness programs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Application Form */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 sticky top-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Apply for This Position
                </h2>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                      <span className="text-red-700 dark:text-red-400">
                        {error}
                      </span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 disabled:opacity-50"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 disabled:opacity-50"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 disabled:opacity-50"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  {/* Resume Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Resume / CV *
                    </label>
                    {!fileName ? (
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                          dragActive
                            ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Drag & drop or{" "}
                          <span className="text-blue-600 dark:text-blue-400">
                            browse
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PDF, DOC, DOCX, TXT, RTF (Max 10MB)
                        </p>
                        <input
                          type="file"
                          id="resume"
                          onChange={handleFileChange}
                          disabled={isSubmitting}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt,.rtf"
                        />
                        <label
                          htmlFor="resume"
                          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50"
                        >
                          Select File
                        </label>
                      </div>
                    ) : (
                      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {fileName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formData.resume?.size
                                  ? `${(
                                      formData.resume.size /
                                      1024 /
                                      1024
                                    ).toFixed(2)} MB`
                                  : ""}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                resume: null,
                              }));
                              setFileName("");
                            }}
                            disabled={isSubmitting}
                            className="text-red-600 hover:text-red-800 dark:text-red-400"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cover Letter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cover Letter (Optional)
                    </label>
                    <textarea
                      name="cover_letter"
                      value={formData.cover_letter}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 disabled:opacity-50"
                      placeholder="Tell us why you're interested in this position..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </button>

                  {/* Privacy Note */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    By applying, you agree to our Privacy Policy. We'll only use
                    your information for recruitment purposes.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
