import React, { useState, useEffect } from 'react'
import { assignRolesHelperService } from '../../services/assignRolesHelperService'
import { meetingService } from '../../services/meetingService'
import { roleAssignmentService } from '../../services/roleAssignmentService'
import api from '../../services/api'
import { toast } from 'react-hot-toast'
import { Users, UserCheck, Clock, Award, ChevronDown, ChevronUp, Calendar } from 'lucide-react'

const RoleAssignment = () => {
  const [meetings, setMeetings] = useState([])
  const [selectedMeeting, setSelectedMeeting] = useState('')
  const [membersWithPreferences, setMembersWithPreferences] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedMembers, setExpandedMembers] = useState(new Set())

  useEffect(() => {
    fetchMeetings()
  }, [])

  const fetchMeetings = async () => {
    setLoading(true)
    try {
      const meetingsData = await meetingService.getAllMeetings()
      setMeetings(meetingsData)

      // Auto-select the first meeting if available
      if (meetingsData.length > 0) {
        setSelectedMeeting(meetingsData[0].meetingId)
      }
    } catch (error) {
      toast.error('Failed to load meetings')
      console.error('Error fetching meetings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedMeeting) {
      fetchMeetingData()
    }
  }, [selectedMeeting])

  const fetchMeetingData = async () => {
    setLoading(true)
    try {
      // Fetch members with their preferred roles using the new endpoint
      const membersData = await assignRolesHelperService.getAssignRolesData(selectedMeeting)
      setMembersWithPreferences(membersData)
      
      // Initialize assignments as empty - will be populated as admin assigns roles
      setAssignments([])
      
    } catch (error) {
      console.error('Error fetching meeting data:', error)
      setMembersWithPreferences([])
      setAssignments([])
    } finally {
      setLoading(false)
    }
  }

  const handleRoleAssignment = (memberId, roleId) => {
    setAssignments(prev => {
      // Check if this member already has a role assigned
      const existingAssignment = prev.find(a => a.memberId === memberId)
      
      if (existingAssignment) {
        // Update existing assignment
        return prev.map(a => 
          a.memberId === memberId 
            ? { ...a, roleId }
            : a
        )
      } else {
        // Add new assignment
        return [...prev, {
          memberId,
          roleId,
          meetingId: selectedMeeting
        }]
      }
    })
  }

  const removeRoleAssignment = (memberId) => {
    setAssignments(prev => prev.filter(a => a.memberId !== memberId))
  }

  const getAssignedRole = (memberId) => {
    return assignments.find(a => a.memberId === memberId)
  }

  const toggleMemberExpansion = (memberId) => {
    setExpandedMembers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(memberId)) {
        newSet.delete(memberId)
      } else {
        newSet.add(memberId)
      }
      return newSet
    })
  }

  const saveAssignments = async () => {
    if (assignments.length === 0) {
      toast.error('No role assignments to save')
      return
    }

    setSaving(true)
    try {
      // Format assignments according to the backend API expectation
      // Based on the memory, backend expects array of objects with individual roleId
      const formattedAssignments = assignments.map(assignment => ({
        meetingId: parseInt(selectedMeeting),
        memberId: assignment.memberId,
        roleId: assignment.roleId
      }))

      // Send directly to the API endpoint
      const response = await api.post('/role-assign/assign', formattedAssignments)
      toast.success('Role assignments saved successfully!')
      
      // Optionally refresh the data
      await fetchMeetingData()
    } catch (error) {
      toast.error('Failed to save role assignments')
      console.error('Error saving assignments:', error)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No Date'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getMeetingTitle = (meetingId) => {
    const meeting = meetings.find(m => m.meetingId === meetingId)
    return meeting ? meeting.meetingTheme || 'Meeting' : 'Unknown Meeting'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role Assignment</h1>
          <p className="mt-1 text-sm text-gray-600">
            Assign roles to members based on their preferences and availability
          </p>
        </div>
        <button
          onClick={saveAssignments}
          disabled={saving}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
            saving 
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
              : assignments.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          <Award size={20} />
          <span>
            {saving ? 'Saving...' : assignments.length === 0 ? 'No Assignments to Save' : 'Save Assignments'}
          </span>
        </button>
      </div>

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Info:</h3>
          <div className="text-xs text-yellow-700 space-y-1">
            <div>Selected Meeting: {selectedMeeting || 'None'}</div>
            <div>Members with Preferences: {membersWithPreferences.length}</div>
            <div>Current Assignments: {assignments.length}</div>
            <div>Loading: {loading.toString()}</div>
            <div>Saving: {saving.toString()}</div>
          </div>
        </div>
      )}

      {/* Meeting Selection */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar size={20} className="text-blue-600" />
          <h2 className="text-lg font-medium text-gray-800">Select Meeting</h2>
        </div>
        <select
          value={selectedMeeting}
          onChange={(e) => setSelectedMeeting(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Choose a meeting...</option>
          {meetings.map(meeting => (
            <option key={meeting.meetingId} value={meeting.meetingId}>
              {formatDate(meeting.date)} - {meeting.meetingTheme || 'No Theme'}
            </option>
          ))}
        </select>
      </div>

      {/* Members with Preferences */}
      {selectedMeeting && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Users size={20} className="text-blue-600" />
              <h2 className="text-lg font-medium text-gray-800">
                Members & Role Preferences
              </h2>
            </div>
            <div className="text-sm text-gray-600">
              {membersWithPreferences.length} member(s) available
            </div>
          </div>

          {membersWithPreferences.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No members available</h3>
              <p className="mt-1 text-sm text-gray-500">
                No members have marked availability or set preferences for this meeting.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {membersWithPreferences.map(memberData => {
                const assignedRole = getAssignedRole(memberData.memberId)
                const isExpanded = expandedMembers.has(memberData.memberId)
                
                return (
                  <div key={memberData.memberId} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Member Header */}
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {memberData.memberName?.charAt(0)?.toUpperCase() || 'M'}
                              </span>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {memberData.memberName || 'Unknown Member'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Member ID: {memberData.memberId}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {assignedRole && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <UserCheck size={12} className="mr-1" />
                              Assigned: {assignedRole.roleName || 'Role'}
                            </span>
                          )}
                          
                          <button
                            onClick={() => toggleMemberExpansion(memberData.memberId)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="p-4 space-y-4">
                        {/* Role Preferences */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Role Preferences</h4>
                          {memberData.rolePreferences && memberData.rolePreferences.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {memberData.rolePreferences.map((pref, index) => (
                                <span 
                                  key={pref.roleId} 
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    index === 0 ? 'bg-green-100 text-green-800' : 
                                    index === 1 ? 'bg-blue-100 text-blue-800' : 
                                    'bg-purple-100 text-purple-800'
                                  }`}
                                >
                                  {index + 1}. {pref.roleName}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No role preferences set</p>
                          )}
                        </div>

                        {/* Role Assignment */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Assign Role</h4>
                          <div className="flex items-center space-x-3">
                            <select
                              value={assignedRole?.roleId || ''}
                              onChange={(e) => {
                                if (e.target.value) {
                                  const selectedRole = memberData.rolePreferences?.find(r => r.roleId === parseInt(e.target.value))
                                  handleRoleAssignment(memberData.memberId, parseInt(e.target.value))
                                } else {
                                  removeRoleAssignment(memberData.memberId)
                                }
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select a role...</option>
                              {memberData.rolePreferences?.map(role => (
                                <option key={role.roleId} value={role.roleId}>
                                  {role.roleName}
                                </option>
                              ))}
                            </select>
                            
                            {assignedRole && (
                              <button
                                onClick={() => removeRoleAssignment(memberData.memberId)}
                                className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-700 transition-colors"
                              >
                                Remove
                              </button>
                            )}
                            
                            {!assignedRole && (
                              <button
                                onClick={() => {
                                  if (memberData.rolePreferences?.length > 0) {
                                    const firstPreference = memberData.rolePreferences[0]
                                    handleRoleAssignment(memberData.memberId, firstPreference.roleId)
                                  }
                                }}
                                disabled={!memberData.rolePreferences || memberData.rolePreferences.length === 0}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                  memberData.rolePreferences?.length > 0
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                }`}
                              >
                                {memberData.rolePreferences?.length > 0 ? 'Auto-assign' : 'No Preferences'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Assignment Summary */}
      {assignments.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Award size={20} className="text-blue-600" />
            <h2 className="text-lg font-medium text-gray-800">Assignment Summary</h2>
            <span className="text-sm text-gray-600">({assignments.length} assignment(s))</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map(assignment => {
              const memberData = membersWithPreferences.find(m => m.memberId === assignment.memberId)
              const roleData = memberData?.rolePreferences?.find(r => r.roleId === assignment.roleId)
              
              return (
                <div key={`${assignment.memberId}-${assignment.roleId}`} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-medium">
                        {memberData?.memberName?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {memberData?.memberName || 'Unknown Member'}
                    </p>
                    <p className="text-sm text-blue-600 truncate">
                      {roleData?.roleName || 'Unknown Role'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default RoleAssignment
