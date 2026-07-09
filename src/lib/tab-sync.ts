// ─── Multi-tab sync via BroadcastChannel ─────────────────────

export type SyncMessage =
  | { type: 'block_update'; payload: { pageId: string; blockId: string } }
  | { type: 'block_delete'; payload: { pageId: string; blockId: string } }
  | { type: 'page_update'; payload: { pageId: string } }
  | { type: 'page_create'; payload: { pageId: string } }
  | { type: 'page_delete'; payload: { pageId: string } }
  | { type: 'synced_block_update'; payload: { syncId: string } };

let channel: BroadcastChannel | null = null;

export function getChannel(): BroadcastChannel {
  if (!channel) {
    channel = new BroadcastChannel('notion-clone-sync');
  }
  return channel;
}

export function broadcastChange(message: SyncMessage): void {
  try {
    getChannel().postMessage(message);
  } catch {
    // BroadcastChannel not supported or closed
  }
}

export function onSyncMessage(handler: (message: SyncMessage) => void): () => void {
  const ch = getChannel();
  const listener = (event: MessageEvent<SyncMessage>) => {
    handler(event.data);
  };
  ch.addEventListener('message', listener);
  return () => ch.removeEventListener('message', listener);
}
