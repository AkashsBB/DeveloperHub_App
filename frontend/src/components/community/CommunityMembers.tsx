import { useState, useEffect } from 'react';
import { X, Loader2, User, Shield, Crown, MoreVertical, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { CommunityMember } from '../../store/useCommunityStore';

interface CommunityMembersProps {
  isOpen: boolean;
  onClose: () => void;

  members: CommunityMember[];
  currentUserId: string;
  onRoleUpdate: (userId: string, newRole: 'VIEWER' | 'ADMIN' | 'OWNER') => Promise<boolean>;
  loading: boolean;
}

export function CommunityMembers({
  isOpen,
  onClose,

  members,
  currentUserId,
  onRoleUpdate,
  loading,
}: CommunityMembersProps) {
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'VIEWER' | 'ADMIN' | 'OWNER'>('VIEWER');
  const [filteredMembers, setFilteredMembers] = useState<CommunityMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (members) {
      const filtered = members.filter(member => 
        member.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMembers(filtered);
    }
  }, [members, searchQuery]);

  const handleRoleUpdate = async (userId: string) => {
    if (!selectedRole) return;
    
    const success = await onRoleUpdate(userId, selectedRole);
    if (success) {
      setEditingMember(null);
      toast.success('Member role updated successfully');
    }
  };

  const getRoleBadge = (role: string) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (role) {
      case 'OWNER':
        return (
          <span className={`${baseClasses} bg-purple-100 text-purple-800`}>
            <Crown className="mr-1 h-3 w-3" /> Owner
          </span>
        );
      case 'ADMIN':
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            <Shield className="mr-1 h-3 w-3" /> Admin
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            <User className="mr-1 h-3 w-3" /> Member
          </span>
        );
    }
  };

  const canEditRole = (member: CommunityMember) => {
    const currentUser = members.find(m => m.userId === currentUserId);
    if (!currentUser) return false;
    
    // Only owners can edit roles
    if (currentUser.role !== 'OWNER') return false;
    
    // Can't edit your own role if you're the only owner
    if (member.userId === currentUserId) {
      const ownerCount = members.filter(m => m.role === 'OWNER').length;
      return ownerCount > 1;
    }
    
    return true;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Community Members
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="mt-4">
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <input
                      type="text"
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                      placeholder="Search members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="mt-4 flow-root">
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                      </div>
                    ) : filteredMembers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No members found
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {filteredMembers.map((member) => (
                          <li key={member.userId} className="py-4 flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                  {member.user.name}
                                  {member.userId === currentUserId && (
                                    <span className="ml-2 text-xs text-indigo-600">(You)</span>
                                  )}
                                </p>
                                <p className="text-sm text-gray-500">{member.user.email}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center">
                              {editingMember === member.userId ? (
                                <div className="flex items-center space-x-2">
                                  <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value as 'VIEWER' | 'ADMIN' | 'OWNER')}
                                    className="block w-full pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                  >
                                    <option value="VIEWER">Member</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="OWNER">Owner</option>
                                  </select>
                                  <button
                                    onClick={() => handleRoleUpdate(member.userId)}
                                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                  >
                                    <Check className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => setEditingMember(null)}
                                    className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  {getRoleBadge(member.role)}
                                  {canEditRole(member) && (
                                    <button
                                      onClick={() => {
                                        setEditingMember(member.userId);
                                        setSelectedRole(member.role);
                                      }}
                                      className="ml-2 text-gray-400 hover:text-gray-600"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
