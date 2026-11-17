/**
 * Project data hooks. Every mutation invalidates the project lists *and* the
 * customer cache, because the customers tab shows active-job counts.
 */
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { repo, RepositoryError, type NewProject, type Project, type ProjectFilter, type ProjectStatus } from '@/data';
import { customerKeys, projectKeys } from '@/data/queryKeys';

function invalidateProjects(client: QueryClient, customerId?: string) {
  void client.invalidateQueries({ queryKey: projectKeys.all });
  if (customerId) void client.invalidateQueries({ queryKey: projectKeys.byCustomer(customerId) });
  void client.invalidateQueries({ queryKey: customerKeys.all });
}

export function useProjects(filter: ProjectFilter = 'all') {
  return useQuery({
    queryKey: projectKeys.list(filter),
    queryFn: () => repo.projects.list(filter),
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(id ?? ''),
    enabled: Boolean(id),
    queryFn: () => {
      if (!id) throw new RepositoryError('not_found');
      return repo.projects.get(id);
    },
  });
}

export function useCreateProject() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: NewProject) => repo.projects.create(input),
    onSuccess: (project) => invalidateProjects(client, project.customerId),
  });
}

export function useUpdateProject(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Project>) => repo.projects.update(id, patch),
    onSuccess: (project) => {
      client.setQueryData(projectKeys.detail(id), project);
      invalidateProjects(client, project.customerId);
    },
  });
}

/** Status moves go through the machine in `features/projects/status.ts`. */
export function useSetProjectStatus() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProjectStatus }) => repo.projects.setStatus(id, status),
    onSuccess: (project) => {
      client.setQueryData(projectKeys.detail(project.id), project);
      invalidateProjects(client, project.customerId);
    },
  });
}

