import api from './api'

export const roleAssignmentService = {
  // Assign roles to a member for a specific meeting
  assignRoles: async (meetingId, memberId, roleIds) => {
    const assignments = roleIds.map(roleId => ({
      meetingId,
      memberId,
      roleId
    }))
    const response = await api.post(`/role-assign/assign`, assignments)
    return response.data
  },

  // Get all role assignments for a meeting
  getMeetingRoleAssignments: async (meetingId) => {
    const response = await api.get(`/role-assign/meeting/${meetingId}`)
    return response.data
  },

  // Remove a role assignment - TODO: Backend endpoint not implemented yet
  // removeRoleAssignment: async (assignmentId) => {
  //   const response = await api.delete(`/role-assign/assignment/${assignmentId}`)
  //   return response.data
  // },

  // Get available roles for a meeting (with remaining counts)
  getAvailableRolesWithCounts: async (meetingId) => {
    const response = await api.get(`/role-preferences/meeting/${meetingId}/available-roles`)
    return response.data
  },

  // Get member's role preferences for a meeting
  getMemberRolePreferences: async (memberId, meetingId) => {
    const response = await api.get(`/role-preferences/member/${memberId}/meeting/${meetingId}`)
    return response.data
  },

  // Get member's past role assignments
  getMemberPastRoles: async (memberId) => {
    const response = await api.get(`/role-assign/member/${memberId}`)
    return response.data
  },

  // Get meeting roles configuration
  getMeetingRoles: async (meetingId) => {
    const response = await api.get(`/meeting-roles/meeting/${meetingId}`)
    return response.data
  },

  // Get members with their preferred roles for role assignment
  getMembersWithPreferences: async (meetingId) => {
    const response = await api.get(`/assign-helper/get/${meetingId}`)
    return response.data
  }
}

export default roleAssignmentService
