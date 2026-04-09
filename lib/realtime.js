import { createClient } from '@supabase/supabase-js';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://flow-production-76f0.up.railway.app';

let client = null;
let activeChannel = null;

/**
 * Fetch realtime config from backend and create a Supabase client.
 */
async function getClient() {
  if (client) return client;

  const token = typeof window !== 'undefined' ? localStorage.getItem('flow_token') : null;
  if (!token) return null;

  const res = await fetch(`${BASE_URL}/api/realtime/config`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const config = await res.json();

  client = createClient(config.supabase_url, config.supabase_anon_key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  client._channelName = config.channel;
  return client;
}

/**
 * Subscribe to all org events. Returns an unsubscribe function.
 *
 * Handlers: { onNewMessage, onConversationAssigned, ... }
 */
export async function subscribeToOrgEvents(handlers = {}) {
  const c = await getClient();
  if (!c) return () => {};

  // Clean up any previous subscription
  if (activeChannel) {
    try { c.removeChannel(activeChannel); } catch {}
    activeChannel = null;
  }

  const channel = c.channel(c._channelName, { config: { broadcast: { self: false } } });

  if (handlers.onNewMessage) {
    channel.on('broadcast', { event: 'new_message' }, ({ payload }) => {
      try { handlers.onNewMessage(payload); } catch (e) { console.error('onNewMessage handler error:', e); }
    });
  }
  if (handlers.onConversationAssigned) {
    channel.on('broadcast', { event: 'conversation_assigned' }, ({ payload }) => {
      try { handlers.onConversationAssigned(payload); } catch (e) { console.error('handler error:', e); }
    });
  }

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('[Realtime] Subscribed to', c._channelName);
    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      console.warn('[Realtime] Channel status:', status);
    }
  });

  activeChannel = channel;

  return () => {
    try { c.removeChannel(channel); } catch {}
    if (activeChannel === channel) activeChannel = null;
  };
}
