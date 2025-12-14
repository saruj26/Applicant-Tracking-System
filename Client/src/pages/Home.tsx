import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Mail,
  Phone,
  Users,
  Zap,
  Shield,
  Globe,
  BarChart,
  Target,
  Award,
  Clock,
  TrendingUp,
} from "lucide-react";

const Home: React.FC = () => {
  const [showContactCard, setShowContactCard] = useState(true);
  const features = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Smart Candidate Matching",
      description:
        "AI-powered matching algorithm connects the right talent with the right opportunities.",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Fast Application Processing",
      description:
        "Process hundreds of applications in minutes with automated screening.",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure & Compliant",
      description:
        "Enterprise-grade security with GDPR and data protection compliance.",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Reach",
      description:
        "Connect with talent from around the world with multi-language support.",
    },
    {
      icon: <BarChart className="h-8 w-8" />,
      title: "Analytics Dashboard",
      description:
        "Real-time insights and analytics to optimize your hiring process.",
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Precision Screening",
      description:
        "Advanced filters and screening tools to find perfect candidates.",
    },
  ];

  const stats = [
    { label: "Active Job Postings", value: "50+" },
    { label: "Successful Placements", value: "1000+" },
    { label: "Hiring Partners", value: "200+" },
    { label: "Avg. Time to Hire", value: "15 days" },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "HR Director, TechCorp",
      content:
        "Nanthi ATS reduced our hiring time by 60%. The platform is intuitive and powerful.",
      avatar: "SJ",
    },
    {
      name: "Michael Chen",
      role: "Talent Acquisition Lead",
      content:
        "The candidate matching algorithm is incredibly accurate. We found our perfect hire in days.",
      avatar: "MC",
    },
    {
      name: "Emily Rodriguez",
      role: "Startup Founder",
      content:
        "As a small team, this platform gave us enterprise-level recruiting tools at an affordable price.",
      avatar: "ER",
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section with Background Image */}
      <div className="relative isolate overflow-hidden min-h-[700px] flex items-center bg-gradient-to-b from-blue-900 to-purple-900">
        {/* Background Image */}
        <div className="absolute inset-0 -z-10">
          <img
            src="https://craftmycv.com/blog/wp-content/uploads/2020/11/Interview-Questions-1024x576.jpg"
            alt="Career opportunities"
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 via-purple-600/35 to-transparent"></div>
        </div>

        {/* Hero Content - MODIFIED LAYOUT */}
        <div className="relative container mx-auto px-4 py-16 lg:py-24 w-full h-full">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-12 h-full">
            {/* Left Side - Text Content */}
            <div className="lg:w-1/2 text-left pt-8">
              <div className="mb-8">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
                  We Have the Ideas.
                  <br />
                  <span className="text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent">
                    We Need the Builders.
                  </span>
                </h1>
              </div>
              <p className="text-lg md:text-xl text-white/90 mb-10 max-w-xl leading-relaxed font-medium">
                The modern Applicant Tracking System that transforms how you
                find, screen, and hire top talent.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/careers"
                  className="px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all transform hover:scale-105 hover:shadow-2xl shadow-lg flex items-center justify-center group"
                >
                  Browse Open Positions
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/15 transition-all backdrop-blur-sm text-center"
                >
                  Recruiter Login
                </Link>
              </div>
            </div>

            {showContactCard && (
              <div className="hidden lg:block absolute bottom-6 right-6 lg:bottom-2 lg:right-1 w-full lg:w-2/5 max-w-md">
                <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-white/40 hover:shadow-3xl transition-all duration-300">
                  <button
                    onClick={() => setShowContactCard(false)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/70 text-gray-600 hover:bg-white hover:text-gray-900 shadow-sm"
                    aria-label="Close contact card"
                  >
                    ✕
                  </button>
                  <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                    Contact Me!
                  </h3>

                  <div className="space-y-6">
                    {/* Email */}
                    <div className="flex items-start">
                      <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white mr-4">
                        <Mail className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">
                          Email
                        </h4>
                        <a
                          href="mailto:careers@nanthi.com"
                          className="text-blue-600 hover:text-blue-800 transition-colors text-lg"
                        >
                          careers@nanthi.com
                        </a>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start">
                      <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white mr-4">
                        <Phone className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">
                          Phone
                        </h4>
                        <a
                          href="tel:+94 21 234 2345"
                          className="text-blue-600 hover:text-blue-800 transition-colors text-lg"
                        >
                          +94 21 234 2345
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-16 -mt-10 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need to Hire Better
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Streamline your hiring process with our comprehensive suite of tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700"
            >
              <div className="h-14 w-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Award className="h-16 w-16 text-white mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Hiring?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join hundreds of companies already using Nanthi ATS to build
              amazing teams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all"
              >
                Start Free Trial
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all"
              >
                Schedule a Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            See what our customers have to say
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 italic">
                "{testimonial.content}"
              </p>
              <div className="flex mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Clock className="h-12 w-12 text-blue-600 dark:text-blue-400 mr-4" />
              <TrendingUp className="h-12 w-12 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Start Hiring Smarter Today
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              No credit card required. Get started with our free plan or try
              premium features for 14 days.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Star icon component
const Star: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default Home;
