import React, { useState } from 'react';
import axios from 'axios';
import { X, Mail, Phone, Calendar, FileText, Briefcase, Award, Download, Edit } from 'lucide-react';
import type { Applicant } from '../types';
import StatusBadge from './StatusBadge';

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
  const [notes, setNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen || !applicant) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusUpdate = async (status: string) => {
    try {
      setIsUpdating(true);
      await axios.post(`/api/applicants/${applicant.id}/update_status/`, { 
        status,
        notes: notes || applicant.notes 
      });
      onStatusUpdate();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setIsUpdating(true);
      await axios.patch(`/api/applicants/${applicant.id}/`, { notes });
      setIsEditingNotes(false);
      onStatusUpdate();
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusOptions = [
    { value: 'new', label: 'New', color: 'bg-blue-500 hover:bg-blue-600' },
    { value: 'reviewed', label: 'Reviewed', color: 'bg-purple-500 hover:bg-purple-600' },
    { value: 'shortlisted', label: 'Shortlisted', color: 'bg-green-500 hover:bg-green-600' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-500 hover:bg-red-600' },
    { value: 'hired', label: 'Hired', color: 'bg-emerald-500 hover:bg-emerald-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {applicant.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Application for {applicant.job_title}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column - Applicant Info */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Contact Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-700 dark:text-gray-300">{applicant.email}</span>
                    </div>
                    {applicant.phone && (
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-700 dark:text-gray-300">{applicant.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Applied on {formatDate(applicant.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-700 dark:text-gray-300">Match Score: {applicant.match_score}%</span>
                    </div>
                    {applicant.keywords && (
                      <div className="flex items-start">
                        <Award className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <span className="text-gray-700 dark:text-gray-300">Keywords: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {applicant.keywords.split(',').map((keyword, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              >
                                {keyword.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Cover Letter
                  </h4>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {applicant.cover_letter || 'No cover letter provided.'}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Notes</h4>
                    <button
                      onClick={() => setIsEditingNotes(!isEditingNotes)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                  </div>
                  {isEditingNotes ? (
                    <div>
                      <textarea
                        value={notes || applicant.notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700"
                        placeholder="Add notes about this applicant..."
                      />
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          onClick={() => setIsEditingNotes(false)}
                          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveNotes}
                          disabled={isUpdating}
                          className="px-3 py-1.5 border border-transparent rounded text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {isUpdating ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {applicant.notes || 'No notes added.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column - Actions */}
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Current Status
                  </h4>
                  <div className="flex items-center justify-between mb-6">
                    <StatusBadge status={applicant.status} />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Updated {formatDate(applicant.updated_at)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Update Status
                    </h5>
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleStatusUpdate(option.value)}
                        disabled={isUpdating || applicant.status === option.value}
                        className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium text-white ${option.color} disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {applicant.status === option.value ? '✓ ' : ''}
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Resume
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                            {applicant.resume_filename}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Resume file
                          </p>
                        </div>
                      </div>
                      <a
                        href={applicant.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Download Resume"
                      >
                        <Download className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetailModal;