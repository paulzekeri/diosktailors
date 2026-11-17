/**
 * Template hooks. `useTemplates` lives here now (it was in measurements) because
 * the editor and the entry form must read the same cache entry.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { repo, type Template } from '@/data';
import { templateKeys } from '@/data/queryKeys';

export function useTemplates() {
  return useQuery({ queryKey: templateKeys.list(), queryFn: () => repo.templates.list() });
}

export function useTemplate(id: string | undefined) {
  const templates = useTemplates();
  return {
    ...templates,
    data: templates.data?.find((template) => template.id === id),
  };
}

export function useSaveTemplate() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (template: Template) => repo.templates.save(template),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: templateKeys.all });
    },
  });
}
