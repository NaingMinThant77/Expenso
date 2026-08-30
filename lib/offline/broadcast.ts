const CHANNEL_NAME = "expenso-offline";

type BroadcastMessage = { type: "changed" };

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) return null;
  return new BroadcastChannel(CHANNEL_NAME);
}

export function emitChanged() {
  const channel = getChannel();
  if (!channel) return;
  channel.postMessage({ type: "changed" } satisfies BroadcastMessage);
  channel.close();
}

export function subscribeToChanges(onChanged: () => void): () => void {
  const channel = getChannel();
  if (!channel) return () => {};

  function handleMessage(event: MessageEvent<BroadcastMessage>) {
    if (event.data?.type === "changed") onChanged();
  }

  channel.addEventListener("message", handleMessage);
  return () => {
    channel.removeEventListener("message", handleMessage);
    channel.close();
  };
}
