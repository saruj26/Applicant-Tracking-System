import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  Upload,
  Mail,
  FileText,
  AlertCircle,
  CheckCircle2,
  User,
  Phone,
  HelpCircle,
  Sparkles,
  Shield,
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

  // Professional application form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cover_letter: "",
    resume: null as File | null,
  });
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const [resumeTipsVisible, setResumeTipsVisible] = useState(false);

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

    // Validate file type for ATS compatibility
    const allowedExtensions = [".pdf", ".doc", ".docx", ".txt", ".rtf"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    
    if (!fileExtension || !allowedExtensions.includes(`.${fileExtension}`)) {
      setError("Please upload PDF, DOC, DOCX, TXT, or RTF files only. These formats are ATS-friendly.");
      return;
    }

    setFormData((prev) => ({ ...prev, resume: file }));
    setFileName(file.name);
    setError("");
    
    // Show ATS tips when a file is uploaded
    if (!resumeTipsVisible) {
      setResumeTipsVisible(true);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) newErrors.push("Full name is required");
    if (!formData.email.trim()) newErrors.push("Email address is required");
    if (!formData.resume) newErrors.push("Resume is required");

    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.push("Please enter a valid email address");
    }

    if (formData.phone.trim() && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) {
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

    if (!validateForm() || !job) {
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("name", formData.name.trim());
      data.append("email", formData.email.trim());
      data.append("job", job.id.toString());
      data.append("job_title", job.title);
      
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
      setResumeTipsVisible(false);

      // Auto-redirect after 5 seconds
      setTimeout(() => {
        navigate("/careers");
      }, 5000);
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(err.response.data.error || "Failed to submit application. Please check your information and try again.");
      } else if (err.response?.status === 409) {
        setError("You've already applied for this position. We'll review your existing application.");
      } else {
        setError("Failed to submit application. Please try again or contact support if the issue persists.");
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

  // Extract keywords from job description for ATS optimization tips
  const extractKeywords = () => {
    if (!job) return [];
    const text = `${job.title} ${job.description} ${job.requirements || ''}`.toLowerCase();
    const words = text.match(/\b[a-z]{4,}\b/g) || [];
    const frequency: Record<string, number> = {};
    
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
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

  const keywords = extractKeywords();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Success Modal */}
      {submitSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 shadow-2xl animate-fade-in">
            <div className="text-center">
              <div className="h-16 w-16 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Application Submitted Successfully!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Thank you for applying for the <span className="font-semibold text-blue-600 dark:text-blue-400">{job.title}</span> position. 
                Your application has been received and is being reviewed by our team.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <Clock className="inline h-4 w-4 mr-1 mb-0.5" />
                Redirecting to careers page in 5 seconds...
              </div>
              <button
                onClick={() => navigate("/careers")}
                className="mt-6 px-6 py-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Return to Careers Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="container mx-auto px-4 py-6">
        <Link
          to="/careers"
          className="inline-flex items-center group text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Careers
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Job Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                    {job.title}
                  </h1>
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    Accepting Applications
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400 mb-7">
                  {job.location && (
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2.5 text-gray-400" />
                      <span className="font-medium">{job.location}</span>
                    </div>
                  )}
                  {job.salary_range && (
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-900 dark:text-white">LKR {job.salary_range}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2.5 text-gray-400" />
                    <span>Posted {formatDate(job.created_at)}</span>
                  </div>
                </div>

                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {job.description}
                  </p>
                </div>
              </div>

              <div className="lg:w-96">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
                    Application Process
                  </h3>
                  <ul className="space-y-4 mb-7">
                    <li className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">1</span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">Fill out the application form</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">2</span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">Upload your ATS-optimized resume</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">3</span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">Add a tailored cover letter</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">4</span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">Submit & receive confirmation</span>
                    </li>
                  </ul>
                  <div className="text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Average response time: <strong>3-5 business days</strong></span>
                    </div>
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
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-7 pb-4 border-b border-gray-200 dark:border-gray-700">
                    Requirements & Qualifications
                  </h2>
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {job.requirements}
                    </div>
                  </div>
                </div>
              )}

              {/* Benefits */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-7 pb-4 border-b border-gray-200 dark:border-gray-700">
                  Why Join Our Team?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mb-4">
                      <span className="text-white font-bold">$</span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                      Competitive Compensation
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      Attractive salary packages, performance bonuses, and comprehensive benefits.
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-100 dark:border-green-800/30 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                      <span className="text-white font-bold">🏠</span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                      Flexible Work Options
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      Remote, hybrid, or in-office - choose what works best for your lifestyle.
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 border border-purple-100 dark:border-purple-800/30 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                      <span className="text-white font-bold">📚</span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                      Growth & Development
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      Continuous learning opportunities, mentorship programs, and clear career paths.
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center mb-4">
                      <span className="text-white font-bold">❤️</span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                      Health & Wellness
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      Comprehensive health insurance, mental health support, and wellness programs.
                    </p>
                  </div>
                </div>
              </div>

              {/* ATS Optimization Tips - Visible when resume is uploaded */}
              {resumeTipsVisible && keywords.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800/30 rounded-2xl p-7">
                  <div className="flex items-center mb-5">
                    <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      ATS Optimization Tips
                    </h3>
                    <button
                      onClick={() => setResumeTipsVisible(false)}
                      className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-5 leading-relaxed">
                    <strong>Did you know?</strong> Over 98% of large companies use Applicant Tracking Systems (ATS) to screen resumes[citation:1]. 
                    To increase your chances, consider including these keywords from the job description in your resume:
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-white/80 dark:bg-gray-800/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Use standard fonts (Arial, Calibri, Times New Roman) for better parsing[citation:6]</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Save as PDF or Word document for optimal ATS compatibility[citation:1]</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Spell out acronyms to capture both keyword variations[citation:6]</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Application Form */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 sticky top-6">
                <div className="flex items-center mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Apply Now
                  </h2>
                  <div className="ml-auto flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Shield className="h-4 w-4 mr-1" />
                    Secure Form
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-7 pb-6 border-b border-gray-200 dark:border-gray-700">
                  Complete this form to submit your application for the <span className="font-semibold">{job.title}</span> position.
                </p>

                {error && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-red-700 dark:text-red-400">Please check the following:</span>
                        <p className="text-red-600 dark:text-red-300 mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-7">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="pl-11 w-full px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700/50 disabled:opacity-50 transition-all"
                        placeholder="John Smith"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="pl-11 w-full px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700/50 disabled:opacity-50 transition-all"
                        placeholder="john.smith@email.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="pl-11 w-full px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700/50 disabled:opacity-50 transition-all"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  {/* Resume Upload */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Resume / CV <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setResumeTipsVisible(!resumeTipsVisible)}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <HelpCircle className="h-4 w-4 mr-1" />
                        ATS Tips
                      </button>
                    </div>
                    {!fileName ? (
                      <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                          dragActive
                            ? "border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
                            : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:shadow-sm"
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                          <Upload className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Drag & drop or{" "}
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">browse files</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Supports PDF, DOC, DOCX, TXT, RTF • Max 10MB
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
                          className="inline-block mt-5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:opacity-90 cursor-pointer disabled:opacity-50 transition-all"
                        >
                          Select File
                        </label>
                      </div>
                    ) : (
                      <div className="border border-gray-300 dark:border-gray-600 rounded-xl p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/30 dark:to-gray-800/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-4">
                              <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {fileName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formData.resume?.size
                                  ? `${(
                                      formData.resume.size /
                                      1024 /
                                      1024
                                    ).toFixed(1)} MB • Ready to upload`
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
                              setResumeTipsVisible(false);
                            }}
                            disabled={isSubmitting}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cover Letter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2.5">
                      Cover Letter (Optional)
                    </label>
                    <textarea
                      name="cover_letter"
                      value={formData.cover_letter}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      rows={5}
                      className="w-full px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700/50 disabled:opacity-50 transition-all resize-none"
                      placeholder={`Tell us why you're a great fit for the ${job.title} position. You can mention relevant experience, skills, or what excites you about this opportunity...`}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Pro tip: Tailoring your cover letter to this specific role can significantly increase your chances[citation:1].
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.resume}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        Submitting Application...
                      </span>
                    ) : (
                      "Submit Application"
                    )}
                  </button>

                  {/* Privacy Note */}
                  <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      <Shield className="inline h-3 w-3 mr-1 mb-0.5" />
                      Your information is secure. By applying, you agree to our{" "}
                      <a href="/privacy" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                        Privacy Policy
                      </a>
                      .
                    </p>
                  </div>
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