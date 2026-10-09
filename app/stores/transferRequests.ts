import { defineStore } from 'pinia';
import type { Database, Tables } from '~/types/database.types';
import type { TransferRequest } from '~/types/TransferRequest';

export const useTransferRequestsStore = defineStore('transfer-requests-store', () => {
  const supabase = useSupabaseClient<Database>();
  const { getActiveSeason } = useAppSettings();
  const pendingRequests = ref<TransferRequest[]>([]);

  const fetchPendingTransferRequests = async () => {
    const activeSeason = await getActiveSeason();
    const { data: requests, error: requestsError } = await supabase
      .from('transfer_requests')
      .select('*')
      .eq('active_season', activeSeason)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (requestsError) throw new Error(requestsError.message);

    if (!requests?.length) {
      pendingRequests.value = [];
      return;
    }

    const requestIds = requests.map(request => request.transfer_request_id);
    const { data: items, error: itemsError } = await supabase
      .from('transfer_request_items')
      .select('*')
      .in('transfer_request_id', requestIds)
      .order('transfer_number', { ascending: true });

    if (itemsError) throw new Error(itemsError.message);

    const itemsByRequest = new Map<number, Tables<'transfer_request_items'>[]>();
    (items ?? []).forEach((item) => {
      const current = itemsByRequest.get(item.transfer_request_id) ?? [];
      current.push(item);
      itemsByRequest.set(item.transfer_request_id, current);
    });

    pendingRequests.value = requests.map(request => ({
      ...request,
      items: itemsByRequest.get(request.transfer_request_id) ?? [],
    }));
  };

  const reviewTransferRequest = async (
    transferRequestId: number,
    status: 'approved' | 'rejected',
  ) => {
    const { error } = status === 'approved'
      ? await supabase.rpc('approve_transfer_request', {
          p_transfer_request_id: transferRequestId,
        })
      : await supabase.rpc('reject_transfer_request', {
          p_transfer_request_id: transferRequestId,
        });

    if (error) throw new Error(error.message);

    pendingRequests.value = pendingRequests.value.filter(
      request => request.transfer_request_id !== transferRequestId,
    );
  };

  return {
    pendingRequests,
    fetchPendingTransferRequests,
    reviewTransferRequest,
  };
});
