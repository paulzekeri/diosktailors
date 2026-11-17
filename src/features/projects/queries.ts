/**
 * Project data hooks. Phase 5 builds the full project screens on top of these;
 * the customers list only needs the counts.
 */
import { useQuery } from '@tanstack/react-query';

import { repo, type ProjectFilter } from '@/data';
import { projectKeys } from '@/data/queryKeys';

export function useProjects(filter: ProjectFilter = 'all') {
  return useQuery({
    queryKey: projectKeys.list(filter),
    queryFn: () => repo.projects.list(filter),
  });
}
