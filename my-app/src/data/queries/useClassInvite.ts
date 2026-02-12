import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { classInviteService } from '../../services/classInviteService';
import { CreateInviteRequest } from '../../types/class';

export const useClassInvite = () => {
  const queryClient = useQueryClient();

  /**
   * 초대 생성 훅
   */
  const createInviteMutation = useMutation({
    mutationFn: (request: CreateInviteRequest) => classInviteService.createInvite(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classInvites'] });
    }
  });

  /**
   * 토큰으로 초대 조회 훅
   */
  const useInviteByToken = (token: string) => {
    return useQuery({
      queryKey: ['classInvite', token],
      queryFn: () => classInviteService.getInviteByToken(token),
      enabled: !!token,
    });
  };

  /**
   * 초대 수락 훅
   */
  const acceptInviteMutation = useMutation({
    mutationFn: ({ token, userId }: { token: string; userId: string }) => 
      classInviteService.acceptInvite(token, userId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['classParticipants', variables.token] });
    }
  });

  return {
    createInvite: createInviteMutation.mutateAsync,
    isCreating: createInviteMutation.isPending,
    useInviteByToken,
    acceptInvite: acceptInviteMutation.mutateAsync,
    isAccepting: acceptInviteMutation.isPending,
  };
};
