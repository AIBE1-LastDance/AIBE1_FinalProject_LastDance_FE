import { useState, useEffect } from 'react';
import { groupsAPI } from '../api/groups';
import { GroupResponse } from '../types';

export const useGroups = () => {
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const myGroups = await groupsAPI.getMyGroups();
      setGroups(myGroups);
    } catch (err) {
      console.error('그룹 목록 조회 실패:', err);
      setError('그룹 목록을 불러오는데 실패했습니다.');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return {
    groups,
    loading,
    error,
    refetch: fetchGroups,
    // 첫 번째 그룹을 기본 그룹으로 사용 (나중에 사용자가 선택할 수 있도록 개선 가능)
    currentGroup: groups.length > 0 ? groups[0] : null,
  };
};
