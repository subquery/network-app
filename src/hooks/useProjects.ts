import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { projectsApi } from '../services/agent-api';
import type { RegisterProjectRequest, UpdateProjectConfigRequest } from '../types';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useProject(cid: string) {
  return useQuery({
    queryKey: ['project', cid],
    queryFn: () => projectsApi.getConfig(cid),
    enabled: !!cid,
  });
}

export function useRegisterProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RegisterProjectRequest) => projectsApi.register(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProjectConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cid, updates }: { cid: string; updates: UpdateProjectConfigRequest }) =>
      projectsApi.updateConfig(cid, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(['project', data.cid], data);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cid: string) => projectsApi.delete(cid),
    onSuccess: (data) => {
      queryClient.removeQueries({ queryKey: ['project', data.cid] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: projectsApi.health,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}
