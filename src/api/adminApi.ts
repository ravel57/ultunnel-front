import axios from "axios";

interface ApiAttempt {
	method: "delete" | "post" | "put" | "patch";
	url: string;
	data?: unknown;
}

async function requestFirstSupported(attempts: ApiAttempt[]): Promise<void> {
	let lastError: unknown = null;

	for (const attempt of attempts) {
		try {
			await axios.request({
				method: attempt.method,
				url: attempt.url,
				data: attempt.data,
			});
			return;
		} catch (error: any) {
			lastError = error;
			const status = error?.response?.status;

			// Different deployed backend revisions used slightly different CRUD routes.
			// Only fall through when the route/method itself is unavailable.
			if (status !== 404 && status !== 405) {
				throw error;
			}
		}
	}

	throw lastError ?? new Error("API route is not available");
}

export async function setUserEnabled(userId: number, isEnabled: boolean): Promise<void> {
	const data = {userId, isEnabled};

	await requestFirstSupported([
		{method: "post", url: "/api/v1/set-user-enabled", data},
		{method: "post", url: `/api/v1/set-user-enabled/${userId}`, data: {isEnabled}},
		{method: "post", url: `/api/v1/set-user-enabled/${userId}/${isEnabled}`},
		{method: "patch", url: `/api/v1/users/${userId}`, data: {isEnabled}},
		{method: "put", url: `/api/v1/update-user/${userId}`, data: {isEnabled}},
		{method: "post", url: "/api/v1/change-user-status", data},
	]);
}

export async function deleteServer(serverId: number): Promise<void> {
	await requestFirstSupported([
		{method: "delete", url: `/api/v1/delete-server/${serverId}`},
		{method: "post", url: `/api/v1/delete-server/${serverId}`},
		{method: "delete", url: `/api/v1/server/${serverId}`},
		{method: "delete", url: `/api/v1/servers/${serverId}`},
	]);
}

export async function deleteProtocol(serverId: number, proxyId: number): Promise<void> {
	await requestFirstSupported([
		{method: "delete", url: `/api/v1/delete-proxy/${proxyId}`},
		{method: "post", url: `/api/v1/delete-proxy/${proxyId}`},
		{method: "delete", url: `/api/v1/delete-proxy-from/${serverId}/${proxyId}`},
		{method: "delete", url: `/api/v1/servers/${serverId}/proxies/${proxyId}`},
	]);
}

export async function deleteProtocolFromUser(
	userId: number,
	proxyServerId: number,
	type: string,
	userProxyId?: number,
): Promise<void> {
	const data = {
		userId,
		proxyServerId,
		type,
		...(userProxyId != null ? {userProxyId} : {}),
	};

	const attempts: ApiAttempt[] = [];

	if (userProxyId != null) {
		attempts.push(
			{method: "delete", url: `/api/v1/delete-user-proxy/${userProxyId}`},
			{method: "delete", url: `/api/v1/user-proxies/${userProxyId}`},
		);
	}

	attempts.push(
		{method: "delete", url: "/api/v1/delete-proxy-from-user", data},
		{method: "post", url: "/api/v1/delete-proxy-from-user", data},
		{method: "delete", url: `/api/v1/delete-proxy-from-user/${userId}/${proxyServerId}/${encodeURIComponent(type)}`},
		{method: "post", url: "/api/v1/remove-proxy-from-user", data},
		{method: "delete", url: "/api/v1/remove-proxy-from-user", data},
	);

	await requestFirstSupported(attempts);
}
