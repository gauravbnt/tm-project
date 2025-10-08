import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Award, Calendar, Clock, MapPin, Tag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { meetingService } from '../services/meetingService'
import { roleService } from '../services/roleService'
import { roleAssignmentService } from '../services/roleAssignmentService'
import LoadingSpinner from '../components/common/LoadingSpinner'

const MemberRolesHistory = () => {
  const { user } = useAuth() || {}
  const memberId = user?.memberId

  const [roleAssignments, setRoleAssignments] = useState([])
  const [meetings, setMeetings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [roleAssignmentsResponse, meetingsResponse] = await Promise.allSettled([
          roleAssignmentService.getMemberPastRoles(memberId),
          meetingService.getAllMeetings()
        ]);

        // Handle role assignments with role name fetching if needed
        const roleAssignmentsData = roleAssignmentsResponse.status === 'fulfilled' ? roleAssignmentsResponse.value : [];
        
        if (roleAssignmentsData && roleAssignmentsData.length > 0) {
          // Check if role assignments already have role names
          const assignmentsWithRoleNames = await Promise.all(
            roleAssignmentsData.map(async (assignment) => {
              // If roleName is already present, use it
              if (assignment.roleName) {
                return assignment;
              }
              
              // If only roleId is present, fetch role details
              if (assignment.roleId) {
                try {
                  const roleResponse = await roleService.getRoleById(assignment.roleId);
                  return {
                    ...assignment,
                    roleName: roleResponse.roleName || roleResponse.name || 'Unknown Role'
                  };
                } catch (roleError) {
                  console.error(`Error fetching role details for roleId ${assignment.roleId}:`, roleError);
                  return {
                    ...assignment,
                    roleName: 'Unknown Role'
                  };
                }
              }
              
              return assignment;
            })
          );
          
          setRoleAssignments(assignmentsWithRoleNames);
        } else {
          setRoleAssignments(roleAssignmentsData);
        }

        const allMeetings = meetingsResponse.status === 'fulfilled' ? meetingsResponse.value : [];
        setMeetings(allMeetings);

      } catch (error) {
        console.error('Error fetching roles history data:', error);
        setError('Failed to load roles history. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (memberId) {
      fetchData();
    }
  }, [memberId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getMeetingTypeColor = (type) => {
    const colors = {
      'REGULAR': 'bg-blue-100 text-blue-800',
      'CONTEST': 'bg-purple-100 text-purple-800',
      'SPECIAL': 'bg-green-100 text-green-800',
      'WORKSHOP': 'bg-yellow-100 text-yellow-800',
      // Also handle title case for backward compatibility
      'Regular': 'bg-blue-100 text-blue-800',
      'Contest': 'bg-purple-100 text-purple-800',
      'Special': 'bg-green-100 text-green-800',
      'Workshop': 'bg-yellow-100 text-yellow-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md" role="alert">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm font-medium text-yellow-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Get meeting details for each role assignment and sort by date
  const roleHistoryWithMeetings = roleAssignments.map(assignment => {
    const meeting = meetings.find(m => m.meetingId.toString() === assignment.meetingId.toString());
    return {
      ...assignment,
      meeting: meeting || null
    };
  }).sort((a, b) => {
    // Sort by meeting date, most recent first
    if (!a.meeting?.date || !b.meeting?.date) return 0;
    return new Date(b.meeting.date) - new Date(a.meeting.date);
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Roles History</h1>
          <p className="text-gray-600 mt-1">View your complete role assignment history across all meetings.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        {roleHistoryWithMeetings.length === 0 ? (
          <div className="text-center py-12">
            <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Role History</h3>
            <p className="text-gray-500">You haven't been assigned any roles yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Role Assignments ({roleHistoryWithMeetings.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {roleHistoryWithMeetings.map((assignment, index) => (
                <motion.div
                  key={`${assignment.meetingId}-${assignment.roleId}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <Award className="h-6 w-6 text-green-500 mr-3" />
                        <h3 className="text-xl font-semibold text-gray-900">
                          {assignment.roleName || 'Unknown Role'}
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="text-sm">Meeting ID: {assignment.meetingId}</span>
                        </div>
                        
                        {assignment.meeting?.meetingType && (
                          <div className="flex items-center">
                            <Tag className="h-4 w-4 mr-2 text-gray-400" />
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getMeetingTypeColor(assignment.meeting.meetingType)}`}>
                              {assignment.meeting.meetingType}
                            </span>
                          </div>
                        )}
                        
                        {assignment.meeting?.date && (
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            <span className="text-sm">{formatDate(assignment.meeting.date)}</span>
                          </div>
                        )}
                        
                        {assignment.meeting?.location && (
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span className="text-sm">{assignment.meeting.location}</span>
                          </div>
                        )}
                      </div>
                      
                      {assignment.meeting?.meetingTheme && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">Meeting Theme:</h4>
                          <p className="text-sm text-gray-700">{assignment.meeting.meetingTheme}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                        <Award className="h-4 w-4 mr-1" />
                        Assigned
                      </span>
                      {assignment.meeting?.startTime && (
                        <span className="text-xs text-gray-500 mt-2">
                          {assignment.meeting.startTime}
                          {assignment.meeting.endTime && ` - ${assignment.meeting.endTime}`}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MemberRolesHistory;
