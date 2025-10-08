import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { meetingService } from '../../services/meetingService';
import { memberService } from '../../services/memberService';
import { rolePreferenceService } from '../../services/rolePreferenceService';
import { memberRoleAssignService } from '../../services/memberRoleAssignService';
import { roleService } from '../../services/roleService';
import memberAvailabilityService from '../../services/memberAvailabilityService';
import { assignRolesHelperService } from '../../services/assignRolesHelperService';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Users, 
  User, 
  Star,
  ArrowLeft,
  Save,
  Loader2
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';

const AdminRoleAssignmentPage = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [meetingRoles, setMeetingRoles] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberPreferences, setMemberPreferences] = useState([]);
  const [memberPastRoles, setMemberPastRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [memberAssignments, setMemberAssignments] = useState([]); // Current role assignments for the meeting
  const [meetingPreferences, setMeetingPreferences] = useState([]); // All members' preferences for this meeting
  const [availableRolesForMeeting, setAvailableRolesForMeeting] = useState([]); // Available roles for this meeting
  const [memberAvailability, setMemberAvailability] = useState({}); // Real availability data for members
  const [availabilityStatuses, setAvailabilityStatuses] = useState({}); // Grouped availability by status
  const [roleFilter, setRoleFilter] = useState('all'); // Filter members by preferred role
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemberForModal, setSelectedMemberForModal] = useState(null);
  const [selectedRolesForAssignment, setSelectedRolesForAssignment] = useState([]);
  const [assignRolesData, setAssignRolesData] = useState([]); // Consolidated data from assign roles helper

  useEffect(() => {
    fetchMeetingData();
  }, [meetingId]);

  const fetchMeetingData = async () => {
    try {
      setLoading(true);
      
      // Validate meetingId parameter
      if (!meetingId || meetingId === 'undefined' || meetingId === 'null') {
        console.error('Invalid meetingId parameter:', meetingId);
        toast.error('Invalid meeting ID. Please select a valid meeting.');
        navigate('/role-assignment');
        return;
      }
      
      console.log('Attempting to fetch meeting with ID:', meetingId, 'Type:', typeof meetingId);
      
      // Fetch meeting details
      const meetingData = await meetingService.getMeetingById(meetingId);
      setMeeting(meetingData);

      // Fetch available members for this meeting
      const membersData = await memberService.getActiveMembers();
      setAvailableMembers(membersData);

      // Fetch available roles for this meeting
      const rolesData = await roleService.getAllRoles();
      setMeetingRoles(rolesData);

      // Fetch all members' role preferences for this meeting
      const preferencesData = await rolePreferenceService.getMeetingRolePreferences(meetingId);
      setMeetingPreferences(preferencesData);
      console.log('Meeting preferences:', preferencesData);

      // Fetch available roles for this meeting
      const availableRolesData = await rolePreferenceService.getAvailableRolesForMeeting(meetingId);
      setAvailableRolesForMeeting(availableRolesData);
      console.log('Available roles for meeting:', availableRolesData);

      // Fetch member assignments for this meeting
      const assignmentsData = await memberRoleAssignService.getAssignmentsByMeeting(meetingId);
      setMemberAssignments(assignmentsData);
      console.log('Member assignments data:', assignmentsData);

      // Fetch consolidated role assignment data
      const assignRolesHelperData = await assignRolesHelperService.getAssignRolesData(meetingId);
      setAssignRolesData(assignRolesHelperData);
      console.log('Assign roles helper data:', assignRolesHelperData);

      // Fetch member availability data for this meeting
      const availabilityData = await memberAvailabilityService.getMemberStatuses(meetingId);
      setAvailabilityStatuses(availabilityData);
      console.log('Member availability data:', availabilityData);

      // Create member availability lookup object
      const availabilityLookup = {};
      Object.keys(availabilityData).forEach(status => {
        availabilityData[status].forEach(member => {
          availabilityLookup[member.memberId] = {
            status: status,
            name: member.name,
            email: member.email
          };
        });
      });
      setMemberAvailability(availabilityLookup);
      console.log('Member availability lookup:', availabilityLookup);

    } catch (error) {
      console.error('Error fetching meeting data:', error);
      toast.error('Failed to load meeting data');
      navigate('/role-assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSelect = async (member) => {
    try {
      setSelectedMember(member);
      
      // Fetch member's role preferences for this meeting
      const preferences = await rolePreferenceService.getRolePreferences(member.memberId, meetingId);
      setMemberPreferences(preferences);

      // Fetch member's past role assignments
      const pastAssignments = await memberRoleAssignService.getAssignmentsByMember(member.memberId);
      setMemberPastRoles(pastAssignments);

      // Reset selected roles
      setSelectedRoles([]);

    } catch (error) {
      console.error('Error fetching member data:', error);
      toast.error('Failed to load member data');
    }
  };

  const handleRoleToggle = (roleId) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        // Limit to 2 roles maximum
        if (prev.length >= 2) {
          toast.error('Maximum 2 roles can be assigned to a member');
          return prev;
        }
        return [...prev, roleId];
      }
    });
  };

  const handleAssignRoles = async () => {
    if (!selectedMember || selectedRoles.length === 0) {
      toast.error('Please select a member and at least one role');
      return;
    }

    try {
      setAssigning(true);

      // Create assignments for each selected role using correct format
      const assignments = selectedRoles.map(roleId => ({
        meetingId: parseInt(meetingId),
        memberId: selectedMember.memberId,
        roleId: roleId
      }));

      await memberRoleAssignService.assignRoles(assignments);

      toast.success('Roles assigned successfully!');
      
      // Reset selection
      setSelectedMember(null);
      setSelectedRoles([]);
      
      // Refresh data
      await fetchMeetingData();
    } catch (error) {
      console.error('Error assigning roles:', error);
      toast.error('Failed to assign roles');
    } finally {
      setAssigning(false);
    }
  };

  const handleRoleAssignment = async () => {
    if (!selectedMember || selectedRoles.length === 0) {
      toast.error('Please select a member and at least one role');
      return;
    }

    try {
      setAssigning(true);

      // Create assignments for each selected role using correct format
      const assignments = selectedRoles.map(roleId => ({
        meetingId: parseInt(meetingId),
        memberId: selectedMember.memberId,
        roleId: roleId
      }));

      await memberRoleAssignService.assignRoles(assignments);

      toast.success('Roles assigned successfully!');
      
      // Reset selection
      setSelectedMember(null);
      setSelectedRoles([]);
      
      // Refresh data
      await fetchMeetingData();
    } catch (error) {
      console.error('Error assigning roles:', error);
      toast.error('Failed to assign roles');
    } finally {
      setAssigning(false);
    }
  };

  const handleAssignRoleClick = (member) => {
    setSelectedMemberForModal(member);
    
    // Pre-select roles that are currently assigned to this member
    const currentlyAssignedRoles = memberAssignments
      .filter(assignment => assignment.memberId === member.memberId)
      .map(assignment => assignment.roleId);
    
    setSelectedRolesForAssignment(currentlyAssignedRoles);
    setIsModalOpen(true);
  };

  const handleModalRoleAssignment = async () => {
    if (!selectedMemberForModal || selectedRolesForAssignment.length === 0) {
      toast.error('Please select at least one role');
      return;
    }

    try {
      setAssigning(true);

      // Get currently assigned roles for this member
      const currentlyAssignedRoles = memberAssignments
        .filter(assignment => assignment.memberId === selectedMemberForModal.memberId)
        .map(assignment => assignment.roleId);

      // Check if there are any changes
      const hasChanges = 
        currentlyAssignedRoles.length !== selectedRolesForAssignment.length ||
        !currentlyAssignedRoles.every(roleId => selectedRolesForAssignment.includes(roleId));

      if (!hasChanges) {
        toast.info('No changes made to role assignments');
        setIsModalOpen(false);
        setSelectedMemberForModal(null);
        setSelectedRolesForAssignment([]);
        return;
      }

      // Create assignments for the selected roles (this will replace existing assignments)
      const assignments = selectedRolesForAssignment.map(roleId => ({
        meetingId: parseInt(meetingId),
        memberId: selectedMemberForModal.memberId,
        roleId: parseInt(roleId)
      }));

      await memberRoleAssignService.assignRoles(assignments);

      const roleCount = selectedRolesForAssignment.length;
      toast.success(`${roleCount} role${roleCount > 1 ? 's' : ''} updated successfully!`);
      setIsModalOpen(false);
      setSelectedMemberForModal(null);
      setSelectedRolesForAssignment([]);
      
      // Refresh data
      await fetchMeetingData();
    } catch (error) {
      console.error('Error updating roles:', error);
      toast.error('Failed to update roles');
    } finally {
      setAssigning(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMemberForModal(null);
    setSelectedRolesForAssignment([]);
  };

  const handleRoleSelectionToggle = (roleId) => {
    setSelectedRolesForAssignment(prev => {
      if (prev.includes(roleId)) {
        // Remove role if already selected
        return prev.filter(id => id !== roleId);
      } else {
        // Check if role is still available before adding
        const availableRoles = getAvailableRolesWithCounts(selectedMemberForModal?.memberId);
        const roleInfo = availableRoles.find(r => r.roleId === roleId);
        
        if (roleInfo && roleInfo.availableCount > 0) {
          // Add role if available
          return [...prev, roleId];
        } else {
          // Show error if role is not available
          toast.error(`${getRoleName(roleId)} is no longer available for assignment`);
          return prev;
        }
      }
    });
  };

  const handleQuickAssignPreferences = () => {
    if (!selectedMemberForModal) return;
    
    const memberPreferences = getMemberPreferences(selectedMemberForModal.memberId);
    const availableRoles = getAvailableRolesWithCounts(selectedMemberForModal.memberId);
    
    // Only select roles that are still available
    const preferredRoleIds = memberPreferences
      .map(pref => pref.roleId)
      .filter(roleId => {
        const roleInfo = availableRoles.find(r => r.roleId === roleId);
        return roleInfo && roleInfo.availableCount > 0;
      });
    
    setSelectedRolesForAssignment(preferredRoleIds);
  };

  // Get roles with their counts and availability (for updating member roles)
  const getAvailableRolesWithCounts = (memberId = null) => {
    const meetingRoles = getMeetingAvailableRoles();
    
    return meetingRoles.map(role => {
      // Count how many times this role is already assigned to OTHER members
      const assignedToOthers = memberAssignments.filter(assignment => 
        assignment.roleId === role.roleId && assignment.memberId !== memberId
      ).length;
      
      // Count how many times this role is assigned to the current member
      const assignedToCurrentMember = memberId ? 
        memberAssignments.filter(assignment => 
          assignment.roleId === role.roleId && assignment.memberId === memberId
        ).length : 0;
      
      // Calculate available count
      // When updating, we treat current member's assignments as available slots
      const totalCount = role.maxAssignments || role.count || 1; // Default to 1 if not specified
      const availableCount = Math.max(0, totalCount - assignedToOthers);
      
      return {
        ...role,
        assignedCount: assignedToOthers + assignedToCurrentMember,
        assignedToCurrentMember,
        totalCount,
        availableCount,
        isAvailable: availableCount > 0
      };
    }).filter(role => role.isAvailable); // Only show roles that have available slots
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleName = (roleId) => {
    const role = meetingRoles.find(r => r.roleId === roleId);
    return role ? role.roleName : 'Unknown Role';
  };

  // Get member's preferences for this meeting from assign roles data
  const getMemberPreferences = (memberId) => {
    // First try to get from assignRolesData (new endpoint)
    const memberData = assignRolesData.find(data => data.id === memberId);
    if (memberData && memberData.pref_roles) {
      // Sort by prefOrder to maintain preference priority
      return memberData.pref_roles.sort((a, b) => a.prefOrder - b.prefOrder);
    }
    // Fallback to old meetingPreferences data
    return meetingPreferences.filter(pref => pref.memberId === memberId);
  };

  // Check if a member is available for this meeting
  const isMemberAvailable = (memberId) => {
    const availability = memberAvailability[memberId];
    if (!availability) {
      // If no availability data, assume they are not available
      return false;
    }
    // Only AVAILABLE status members can be assigned roles
    return availability.status === 'AVAILABLE';
  };

  // Get member's availability status
  const getMemberAvailabilityStatus = (memberId) => {
    const availability = memberAvailability[memberId];
    return availability ? availability.status : 'UNKNOWN';
  };

  // Get availability status color and icon
  const getAvailabilityStatusInfo = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return { color: 'green', icon: CheckCircle, text: 'Available' };
      case 'UNAVAILABLE':
        return { color: 'red', icon: XCircle, text: 'Unavailable' };
      case 'MAYBE':
        return { color: 'yellow', icon: AlertCircle, text: 'Maybe' };
      case 'PENDING':
        return { color: 'gray', icon: Clock, text: 'Pending' };
      default:
        return { color: 'gray', icon: AlertCircle, text: 'Unknown' };
    }
  };

  // Get available roles for this meeting (filtered from all roles)
  const getMeetingAvailableRoles = () => {
    if (availableRolesForMeeting.length > 0) {
      return availableRolesForMeeting;
    }
    // Fallback to all roles if meeting-specific roles not available
    return meetingRoles;
  };

  // Get member's preferred role names
  const getMemberPreferredRoleNames = (memberId) => {
    const preferences = getMemberPreferences(memberId);
    return preferences.map(pref => {
      // New format uses pref.roleId directly
      return getRoleName(pref.roleId);
    }).filter(name => name && name !== 'Unknown Role');
  };

  // Filter members based on selected role preference
  const getFilteredMembers = () => {
    if (roleFilter === 'all') {
      return availableMembers;
    }
    
    if (roleFilter === 'no-preference') {
      return availableMembers.filter(member => {
        const preferences = getMemberPreferences(member.memberId);
        return preferences.length === 0;
      });
    }
    
    return availableMembers.filter(member => {
      const preferences = getMemberPreferences(member.memberId);
      return preferences.some(pref => pref.roleId === parseInt(roleFilter));
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/role-assignment')}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Role Assignment
          </button>
          
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Role Assignment</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Assign roles to members for this meeting
                </p>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-semibold text-gray-900">{meeting.title}</h2>
                <p className="text-sm text-gray-500">{formatDate(meeting.date)}</p>
                {meeting.location && (
                  <p className="text-sm text-gray-500">{meeting.location}</p>
                )}
              </div>
            </div>
          </div>
        </div>



        <div className="grid grid-cols-1 gap-6">
          {/* All Members with Preferred Roles */}
          <div className="col-span-1">
            {/* Available Members Table */}
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  <Users className="h-5 w-5 inline mr-2" />
                  Available Members & Role Assignment
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Member Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pref 1
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pref 2
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pref 3
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assign Role
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {assignRolesData
                        .filter(memberData => isMemberAvailable(memberData.id))
                        .map((memberData) => {
                          const preferredRoleNames = getMemberPreferredRoleNames(memberData.id);
                          const assignedRoles = memberAssignments
                            .filter(assignment => assignment.memberId === memberData.id)
                            .map(assignment => getRoleName(assignment.roleId));
                          
                          return (
                            <tr key={memberData.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {memberData.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {memberData.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {/* Email not provided in new API, get from availableMembers */}
                                  {availableMembers.find(m => m.memberId === memberData.id)?.email || ''}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {preferredRoleNames[0] || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {preferredRoleNames[1] || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {preferredRoleNames[2] || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {assignedRoles.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {assignedRoles.map((roleName, index) => (
                                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {roleName}
                                      </span>
                                    ))}
                                    <button
                                      onClick={() => {
                                        const memberObj = availableMembers.find(m => m.memberId === memberData.id) || { memberId: memberData.id, firstName: memberData.name.split(' ')[0], lastName: memberData.name.split(' ').slice(1).join(' ') };
                                        handleAssignRoleClick(memberObj);
                                      }}
                                      className="ml-2 text-indigo-600 hover:text-indigo-900 text-xs"
                                    >
                                      Change
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      const memberObj = availableMembers.find(m => m.memberId === memberData.id) || { memberId: memberData.id, firstName: memberData.name.split(' ')[0], lastName: memberData.name.split(' ').slice(1).join(' ') };
                                      handleAssignRoleClick(memberObj);
                                    }}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                  >
                                    Assign Role
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Role Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {memberAssignments.some(assignment => assignment.memberId === selectedMemberForModal?.memberId) 
                    ? `Update Roles for ${selectedMemberForModal?.firstName} ${selectedMemberForModal?.lastName}`
                    : `Assign Roles to ${selectedMemberForModal?.firstName} ${selectedMemberForModal?.lastName}`
                  }
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Roles (multiple selection allowed):
                  </label>
                  <span className="text-xs text-gray-500">
                    {getAvailableRolesWithCounts(selectedMemberForModal?.memberId).length} roles available
                  </span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                  {getAvailableRolesWithCounts(selectedMemberForModal?.memberId).map(role => (
                    <label key={role.roleId} className={`flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded ${
                      role.assignedToCurrentMember > 0 ? 'bg-blue-50 border border-blue-200' : ''
                    }`}>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedRolesForAssignment.includes(role.roleId)}
                          onChange={() => handleRoleSelectionToggle(role.roleId)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900">{role.roleName}</span>
                          {role.assignedToCurrentMember > 0 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Currently Assigned
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {role.availableCount} of {role.totalCount} available
                        </span>
                        {role.availableCount <= 2 && role.availableCount > 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Limited
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                  {getAvailableRolesWithCounts(selectedMemberForModal?.memberId).length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No roles available for assignment
                    </div>
                  )}
                </div>
                {selectedRolesForAssignment.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    Selected: {selectedRolesForAssignment.length} role{selectedRolesForAssignment.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
              
              {selectedMemberForModal && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">Member Preferences:</h4>
                    {getMemberPreferredRoleNames(selectedMemberForModal.memberId).length > 0 && (
                      <button
                        onClick={handleQuickAssignPreferences}
                        className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        Quick Assign All Preferences
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {getMemberPreferredRoleNames(selectedMemberForModal.memberId).length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {getMemberPreferredRoleNames(selectedMemberForModal.memberId).map((roleName, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            {roleName}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">No preferences set</span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleModalRoleAssignment}
                  disabled={assigning || selectedRolesForAssignment.length === 0}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assigning ? (
                    <div className="flex items-center">
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Assigning...
                    </div>
                  ) : (
                    `Assign ${selectedRolesForAssignment.length > 0 ? selectedRolesForAssignment.length : ''} Role${selectedRolesForAssignment.length !== 1 ? 's' : ''}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoleAssignmentPage;
