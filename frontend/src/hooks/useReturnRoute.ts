import { useMutation } from '@tanstack/react-query';
import { postReturnRoute } from '../api/navigation';
import type { ReturnRouteRequest, ReturnRouteResponse } from '../types/navigation';

export function useReturnRoute() {
	return useMutation<ReturnRouteResponse, Error, ReturnRouteRequest>({
		mutationFn: postReturnRoute,
	});
}
