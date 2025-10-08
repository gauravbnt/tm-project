import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Star, Award, BarChart3, User, UserCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { meetingService } from '../services/meetingService'
import { roleService } from '../services/roleService'
import { memberRoleAssignService } from '../services/memberRoleAssignService'
import { roleAssignmentService } from '../services/roleAssignmentService'
import memberAvailabilityService from '../services/memberAvailabilityService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { showWarning, showSuccess, showError } from '../utils/alerts';

const MemberDashboard = () => {
  const { user } = useAuth() || {}
  const navigate = useNavigate()
  const memberId = user?.memberId

  const [meetings, setMeetings] = useState([])
  const [myAvailability, setMyAvailability] = useState({})
  const [upcomingRoles, setUpcomingRoles] = useState([])
  const [roleAssignments, setRoleAssignments] = useState([])
  const [rolePreferences, setRolePreferences] = useState({})
  const [roles, setRoles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savingFor, setSavingFor] = useState(null)

  const STATUS_OPTIONS = [
    { value: 'AVAILABLE', label: 'Available', icon: CheckCircle, color: 'green' },
    { value: 'UNAVAILABLE', label: 'Unavailable', icon: XCircle, color: 'red' },
    { value: 'MAYBE', label: 'Maybe', icon: AlertCircle, color: 'yellow' }
  ]

  const statusClasses = {
    green: 'bg-green-100 text-green-800 border-green-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [meetingsResponse, availabilityResponse, upcomingRolesResponse, roleAssignmentsResponse, rolesResponse] = 
          await Promise.allSettled([
            meetingService.getAllMeetings(),
            memberAvailabilityService.getMemberAvailability(memberId),
            memberRoleAssignService.getAssignmentsByMember(memberId),
            roleAssignmentService.getMemberPastRoles(memberId),
            roleService.getAllRoles()
          ]);

        const allMeetings = meetingsResponse.status === 'fulfilled' ? meetingsResponse.value : [];
        setMeetings(allMeetings);
        
        // Handle availability data - it might be an array or object
        const availabilityData = availabilityResponse.status === 'fulfilled' ? availabilityResponse.value.data || availabilityResponse.value : [];
        console.log('Raw availability data:', availabilityData);
        const availabilityMap = {};
        if (Array.isArray(availabilityData)) {
          availabilityData.forEach(item => {
            if (item.meetingId) {
              availabilityMap[item.meetingId] = item;
            }
          });
        }
        console.log('Availability map:', availabilityMap);
        setMyAvailability(availabilityMap);
        
        setUpcomingRoles(upcomingRolesResponse.status === 'fulfilled' ? upcomingRolesResponse.value.data || upcomingRolesResponse.value : []);
        
        // Fetch role preferences for each meeting where member has availability
        if (availabilityMap && Object.keys(availabilityMap).length > 0) {
          const preferencesMap = {};
          for (const meetingId of Object.keys(availabilityMap)) {
            try {
              const preferences = await memberAvailabilityService.getRolePreferences(memberId, meetingId);
              if (preferences && preferences.length > 0) {
                preferencesMap[meetingId] = preferences;
              }
            } catch (prefError) {
              console.log(`No preferences found for meeting ${meetingId}`);
            }
          }
          console.log('Role preferences map:', preferencesMap);
          setRolePreferences(preferencesMap);
        }
        
        // Handle role assignments with role name fetching if needed
        const roleAssignmentsData = roleAssignmentsResponse.status === 'fulfilled' ? roleAssignmentsResponse.value : [];
        console.log('Raw role assignments data:', roleAssignmentsData);
        
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
          
          console.log('Assignments with role names:', assignmentsWithRoleNames);
          setRoleAssignments(assignmentsWithRoleNames);
        } else {
          setRoleAssignments(roleAssignmentsData);
        }
        
        setRoles(rolesResponse.status === 'fulfilled' ? rolesResponse.value : []);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load some dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (memberId) {
      fetchData();
    }
  }, [memberId]);

  const handleAvailabilityChange = async (meetingId, status) => {
    // Example of using showWarning
    const confirm = await showWarning(
      'Update Availability',
      `Are you sure you want to set your availability to ${status}?`,
      `Yes, set to ${status}`
    );
    
    if (!confirm.isConfirmed) {
      return; // User cancelled the action
    }
    if (!memberId) {
      console.error('No memberId available');
      showError('You must be logged in to update availability');
      return;
    }
    
    setSavingFor(meetingId);
    try {
      const payload = {
        memberId: parseInt(memberId, 10),
        meetingId: parseInt(meetingId, 10),
        avaStatus: status.toUpperCase()
      };
      
      console.log('Sending availability update with payload:', JSON.stringify(payload, null, 2));
      console.log('API Endpoint:', 'http://localhost:8080/availabilities/add');
      
      const response = await memberAvailabilityService.createAvailability(payload);
      
      console.log('Availability update successful. Response:', response);
      setMyAvailability(prev => ({ ...prev, [meetingId]: status }));
      await showSuccess('Success', `Your availability has been set to ${status}`);
    } catch (error) {
      console.error('Error updating availability:', {
        message: error.message,
        response: error.response?.data,
        status: error.status,
        data: error.data,
        details: error.details,
        fullError: error
      });
      
      // Format a more detailed error message
      let errorMessage = 'Failed to update availability';
      
      if (error.response?.data) {
        // Handle validation errors from the server
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.details) {
        // Handle client-side validation errors
        errorMessage = `Validation error: ${JSON.stringify(error.details)}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('Error details:', errorMessage);
      showError('Error', errorMessage);
    } finally {
      setSavingFor(null);
    }
  }

  // Helper function to get upcoming meetings count (same logic as MemberMeetings)
  const getUpcomingMeetingsCount = () => {
    if (!meetings || meetings.length === 0) return 0;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    today.setHours(0, 0, 0, 0);
    
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      meetingDate.setHours(0, 0, 0, 0);
      
      // Check if meeting is today and not started yet
      const isToday = meetingDate.getTime() === today.getTime();
      if (isToday) {
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const startTime = meeting.startTime ? 
          parseInt(meeting.startTime.split(':')[0]) * 60 + parseInt(meeting.startTime.split(':')[1]) : 0;
        return currentTime < startTime; // Today but not started yet
      }
      
      // Future meetings
      return meetingDate.getTime() > today.getTime();
    }).length;
  };

  // Helper function to get assigned roles for a meeting
  const getAssignedRolesForMeeting = (meetingId) => {
    console.log('Getting roles for meeting:', meetingId);
    console.log('Available role assignments:', roleAssignments);
    const roles = roleAssignments.filter(assignment => 
      assignment.meetingId.toString() === meetingId.toString()
    );
    console.log('Filtered roles for meeting', meetingId, ':', roles);
    return roles;
  };

  // Helper function to get upcoming role assignments count
  const getUpcomingRolesCount = () => {
    if (!roleAssignments || roleAssignments.length === 0 || !meetings || meetings.length === 0) return 0;
    
    const upcomingMeetings = getUpcomingMeetings();
    const upcomingMeetingIds = upcomingMeetings.map(meeting => meeting.meetingId.toString());
    
    return roleAssignments.filter(assignment => 
      upcomingMeetingIds.includes(assignment.meetingId.toString())
    ).length;
  };

  // Helper function to get upcoming meetings only
  const getUpcomingMeetings = () => {
    if (!meetings || meetings.length === 0) return [];
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    today.setHours(0, 0, 0, 0);
    
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      meetingDate.setHours(0, 0, 0, 0);
      
      // Check if meeting is today and not started yet
      const isToday = meetingDate.getTime() === today.getTime();
      if (isToday) {
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const startTime = meeting.startTime ? 
          parseInt(meeting.startTime.split(':')[0]) * 60 + parseInt(meeting.startTime.split(':')[1]) : 0;
        return currentTime < startTime; // Today but not started yet
      }
      
      // Future meetings
      return meetingDate.getTime() > today.getTime();
    }).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date ascending
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Member Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome{user?.name ? `, ${user.name}` : ''}! Manage your availability and role preferences.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200"
          onClick={() => navigate('/member-meetings')}
        >
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{getUpcomingMeetingsCount()}</p>
              <p className="text-sm text-gray-600">Upcoming Meetings</p>
            </div>
          </div>
        </div>
        
        <div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-green-300 transition-all duration-200"
          onClick={() => navigate('/member-assigned-roles')}
        >
          <div className="flex items-center">
            <Award className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{roleAssignments?.length || 0}</p>
              <p className="text-sm text-gray-600">Role Assignments</p>
            </div>
          </div>
        </div>
        
        <div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-orange-300 transition-all duration-200"
          onClick={() => navigate('/member-meetings')}
        >
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{getUpcomingRolesCount()}</p>
              <p className="text-sm text-gray-600">Upcoming Roles</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <User className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {roleAssignments ? new Set(roleAssignments.map(r => r.roleName)).size : 0}
              </p>
              <p className="text-sm text-gray-600">Different Roles</p>
            </div>
          </div>
        </div>
      </div>


      {/* Upcoming Meetings Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Meetings</h2>
          
          {(() => {
            const upcomingMeetings = getUpcomingMeetings();
            return upcomingMeetings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Meetings</h3>
                <p className="text-gray-500">There are no upcoming meetings scheduled at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => {
                if (!meeting || !meeting.meetingId) return null;
                
                const currentAvailability = myAvailability[meeting.meetingId];
                console.log(`Meeting ${meeting.meetingId} availability:`, currentAvailability);
                
                // Get role preferences from rolePreferences state or availability object
                const currentRolePreferences = rolePreferences[meeting.meetingId] || currentAvailability?.rolePreferences || [];
                console.log(`Meeting ${meeting.meetingId} role preferences:`, currentRolePreferences);
                
                const assignedRoles = getAssignedRolesForMeeting(meeting.meetingId);
                
                return (
                  <div key={meeting.meetingId} className="border border-gray-200 rounded-lg p-6 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{meeting.title || meeting.meetingTheme}</h3>
                        <p className="text-gray-600 mt-1">{formatDate(meeting.date)}</p>
                        {meeting.description && (
                          <p className="text-sm text-gray-500 mt-2">{meeting.description}</p>
                        )}
                        
                        {/* Display Assigned Roles */}
                        {assignedRoles && assignedRoles.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-gray-600 mb-2">Your Assigned Roles:</h4>
                            <div className="flex flex-wrap gap-2">
                              {assignedRoles.map((role, index) => {
                                console.log('Displaying role:', role);
                                return (
                                  <span 
                                    key={`${role.roleId}-${index}`}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200"
                                  >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    {role.roleName || 'Unknown Role'}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        {/* Smart Action Button */}
                        {assignedRoles && assignedRoles.length > 0 ? (
                          <div className="text-center">
                            <span className="inline-flex items-center px-4 py-2 text-sm font-medium bg-green-50 text-green-700 border border-green-200 rounded-lg">
                              <UserCheck className="w-4 h-4 mr-2" />
                              {assignedRoles.length === 1 ? 'Role Assigned' : `${assignedRoles.length} Roles Assigned`}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => navigate(`/meetings/${meeting.meetingId}/mark-availability`)}
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            {currentAvailability ? 'Update Availability' : 'Mark Availability'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Status and Role Preferences Display */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">
                        Your Status:{" "}
                        <span
                          className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            currentAvailability
                              ? (currentAvailability.avaStatus || currentAvailability.status) === "AVAILABLE"
                                ? "bg-green-100 text-green-800"
                                : (currentAvailability.avaStatus || currentAvailability.status) === "MAYBE"
                                ? "bg-yellow-100 text-yellow-800"
                                : (currentAvailability.avaStatus || currentAvailability.status) === "UNAVAILABLE"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {currentAvailability && (currentAvailability.avaStatus || currentAvailability.status)
                            ? (currentAvailability.avaStatus || currentAvailability.status).charAt(0) +
                              (currentAvailability.avaStatus || currentAvailability.status).slice(1).toLowerCase()
                            : "Not Responded"}
                        </span>
                      </h4>
                      
                      {/* Show role preferences when member has preferences and no assigned roles */}
                      {(!assignedRoles || assignedRoles.length === 0) && (
                        <>
                          {currentRolePreferences.length > 0 && (
                            <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                              <div className="flex items-center mb-2">
                                <Star className="w-4 h-4 text-indigo-600 mr-2" />
                                <h4 className="text-sm font-medium text-indigo-900">
                                  Your Preferred Roles:
                                </h4>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {currentRolePreferences.map((pref, index) => {
                                  // Support both formats: number roleId OR object { roleId, roleName }
                                  const roleId = typeof pref === 'number' ? pref : pref?.roleId;
                                  const resolvedRoleName = typeof pref === 'object' && pref?.roleName
                                    ? pref.roleName
                                    : roles?.find((r) => r.roleId === roleId)?.roleName;
                                  return (
                                    <div
                                      key={`${roleId || 'unknown'}-${index}`}
                                      className="flex items-center bg-white border border-indigo-300 rounded-md px-3 py-2 shadow-sm"
                                    >
                                      <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-2">
                                        {index + 1}
                                      </span>
                                      <span className="text-sm text-indigo-900 font-medium">
                                        {resolvedRoleName || "Loading..."}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
                })}
              </div>
            );
          })()}
        </div>
      </motion.div>


    </div>
  );
};

export default MemberDashboard;
