(() => {
    'use strict';

    const apiBase = String(window.HORYOMARU_API_BASE || '').replace(/\/$/, '');

    async function request(path, options = {}) {
        if (!apiBase) return null;
        const response = await fetch(`${apiBase}${path}`, {
            headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
            ...options
        });
        if (!response.ok) throw new Error(`API request failed: ${response.status}`);
        return response.json();
    }

    /**
     * 月単位取得用インターフェース。
     * MOCKではHTML内データを利用。本番では HORYOMARU_API_BASE を設定すると
     * GET /trips?month=YYYY-MM を Fetch で非同期取得する。
     */
    async function loadMonth(monthKey) {
        const data = await request(`/trips?month=${encodeURIComponent(monthKey)}`);
        return data || { month: monthKey, trips: null, source: 'mock-dom' };
    }

    /**
     * 予約直前の残席再確認。本番ではサーバーの最新残席を返す。
     * 最終確保は必ずサーバー側トランザクション/行ロック等で排他制御すること。
     */
    async function checkAvailability(trip, requestedGuests = 0) {
        const query = new URLSearchParams({
            date: trip.date || '',
            name: trip.name || '',
            time: trip.time || '',
            guests: String(requestedGuests || 0)
        });
        const data = await request(`/availability?${query.toString()}`);
        if (data) return data;
        const sharedTrip = trip.tripId
            ? window.HoryomaruAppData?.getTrips().find((item) => item.id === trip.tripId)
            : window.HoryomaruAppData?.getTrip(trip.dateKey || '', trip.name || '');
        const remainingSeats = Number(sharedTrip?.remaining ?? trip.remainingSeats ?? 0);
        return {
            available: remainingSeats >= Number(requestedGuests || 0),
            remainingSeats,
            source: 'mock-shared-data'
        };
    }

    window.HoryomaruScheduleApi = { loadMonth, checkAvailability };
})();
