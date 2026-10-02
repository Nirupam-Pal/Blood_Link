'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Send, Users, MapPin, Check, X, Ban, MessageSquare, RefreshCw, Clock, Search, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppShell } from '@/components/layout/app-shell';
import {
  Avatar,
  BloodBadge,
  CardGridSkeleton,
  EmptyState,
  ListSkeleton,
  Notice,
  PageHeader,
  PageLoader,
  Panel,
  Segmented,
  StatusBadge,
} from '@/components/ui/state-views';
import { useAuthStore } from '@/stores/auth.store';
import { useConnectionStore } from '@/stores/connection.store';
import { useChatStore } from '@/stores/chat.store';
import { Connection, ConnectionRequest, ConnectionRequestStatus, PublicUser } from '@/types/connection.types';
import { formatBloodGroup, formatLocation, getCurrentUserId, refId, timeAgo } from '@/lib/format';

type Tab = 'received' | 'sent' | 'connected';

const STATUS_META: Record<ConnectionRequestStatus, { label: string; tone: 'warning' | 'success' | 'brand' | 'neutral' }> = {
  PENDING: { label: 'Pending', tone: 'warning' },
  ACCEPTED: { label: 'Accepted', tone: 'success' },
  REJECTED: { label: 'Declined', tone: 'brand' },
  CANCELLED: { label: 'Cancelled', tone: 'neutral' },
};

export default function ConnectionsPage() {
  return (
    <Suspense fallback={<PageLoader label="Authenticating session" />}>
      <ConnectionsContent />
    </Suspense>
  );
}

function ConnectionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auth Store Selectors
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  // Connection Store Selectors
  const receivedRequests = useConnectionStore((state) => state.receivedRequests);
  const sentRequests = useConnectionStore((state) => state.sentRequests);
  const connections = useConnectionStore((state) => state.connections);
  const isLoading = useConnectionStore((state) => state.isLoading);
  const actingRequestId = useConnectionStore((state) => state.actingRequestId);
  const error = useConnectionStore((state) => state.error);
  const fetchAll = useConnectionStore((state) => state.fetchAll);
  const acceptRequest = useConnectionStore((state) => state.acceptRequest);
  const rejectRequest = useConnectionStore((state) => state.rejectRequest);
  const cancelRequest = useConnectionStore((state) => state.cancelRequest);
  const clearError = useConnectionStore((state) => state.clearError);

  // Chat Store (to link connections to their conversation)
  const conversations = useChatStore((state) => state.conversations);
  const fetchConversations = useChatStore((state) => state.fetchConversations);

  // The URL is the source of truth for the tab so ?tab= links (e.g. from notifications) always work
  const tabParam = searchParams.get('tab') as Tab | null;
  const activeTab: Tab = tabParam ?? (user?.donor ? 'received' : 'sent');
  const setActiveTab = (tab: Tab) => router.replace(`/connections?tab=${tab}`, { scroll: false });
  const [acceptedConversationId, setAcceptedConversationId] = useState<string | null>(null);

  // Auth Guard
  useEffect(() => {
    if (!isInitializing && status === 'unauthenticated') {
      router.push('/login');
    }
    if (!isInitializing && user?.role === 'BLOOD_BANK') {
      router.push('/dashboard/blood-bank');
    }
  }, [status, isInitializing, user, router]);

  useEffect(() => {
    if (!isInitializing && status === 'authenticated') {
      fetchAll();
      fetchConversations();
    }
  }, [status, isInitializing, fetchAll, fetchConversations]);

  const conversationByConnection = useMemo(() => {
    const map = new Map<string, string>();
    conversations.forEach((c) => map.set(String(c.connectionId), c._id));
    return map;
  }, [conversations]);

  const pendingReceivedCount = receivedRequests.filter((r) => r.status === 'PENDING').length;
  const pendingSentCount = sentRequests.filter((r) => r.status === 'PENDING').length;

  const handleAccept = async (id: string) => {
    try {
      const response = await acceptRequest(id);
      setAcceptedConversationId(response.conversationId);
      fetchConversations();
    } catch {
      // Error is surfaced through the store
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectRequest(id);
    } catch {}
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelRequest(id);
    } catch {}
  };

  const handleRefresh = () => {
    fetchAll();
    fetchConversations();
  };

  if (isInitializing || status === 'idle') {
    return <PageLoader label="Authenticating session" />;
  }

  return (
    <AppShell>
      <PageHeader
        icon={Users}
        title={<>Blood <span className="text-gradient-brand">connections</span></>}
        description="Manage requests between blood seekers and donors. Accepted requests open a private chat."
        actions={
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {/* Accept success banner */}
      <AnimatePresence>
        {acceptedConversationId && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="mb-6 overflow-hidden"
          >
            <Notice
              tone="success"
              onDismiss={() => setAcceptedConversationId(null)}
              action={
                <Button size="sm" onClick={() => router.push(`/messages?c=${acceptedConversationId}`)} className="shrink-0">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Start chatting
                </Button>
              }
            >
              Connection accepted. You can now chat with this person.
            </Notice>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <Notice tone="brand" onDismiss={clearError} className="mb-6">
          {error}
        </Notice>
      )}

      <Segmented<Tab>
        label="Connection views"
        layoutId="connections-tab"
        value={activeTab}
        onChange={setActiveTab}
        className="mb-6"
        options={[
          { id: 'received', label: 'Received', icon: Inbox, count: pendingReceivedCount, pulse: true },
          { id: 'sent', label: 'Sent', icon: Send, count: pendingSentCount },
          { id: 'connected', label: 'Connected', icon: Users, count: connections.length },
        ]}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === 'received' && (
            <RequestList
              requests={receivedRequests}
              direction="received"
              isLoading={isLoading}
              actingRequestId={actingRequestId}
              emptyIcon={Inbox}
              emptyTitle="No requests received"
              emptyText={
                user?.donor
                  ? 'When someone needs your blood group, their request will appear here.'
                  : 'Only verified donors receive connection requests.'
              }
              onAccept={handleAccept}
              onReject={handleReject}
            />
          )}

          {activeTab === 'sent' && (
            <RequestList
              requests={sentRequests}
              direction="sent"
              isLoading={isLoading}
              actingRequestId={actingRequestId}
              emptyIcon={Send}
              emptyTitle="No requests sent"
              emptyText="Find a matching donor on the dashboard and send them a connection request."
              emptyAction={
                <Button onClick={() => router.push('/dashboard/donor')}>
                  <Search className="h-4 w-4" />
                  Find donors
                </Button>
              }
              onCancel={handleCancel}
            />
          )}

          {activeTab === 'connected' && (
            <ConnectionList
              connections={connections}
              isLoading={isLoading}
              conversationByConnection={conversationByConnection}
              onOpenChat={(conversationId) => router.push(`/messages?c=${conversationId}`)}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}

function PersonMark({ person }: { person: PublicUser | null }) {
  const bg = formatBloodGroup(person?.bloodGroup);
  return bg ? <BloodBadge group={bg} /> : <Avatar name={person?.fullName} className="h-12 w-12" />;
}

interface RequestListProps {
  requests: ConnectionRequest[];
  direction: 'received' | 'sent';
  isLoading: boolean;
  actingRequestId: string | null;
  emptyIcon: typeof Inbox;
  emptyTitle: string;
  emptyText: string;
  emptyAction?: React.ReactNode;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
}

function RequestList({
  requests,
  direction,
  isLoading,
  actingRequestId,
  emptyIcon,
  emptyTitle,
  emptyText,
  emptyAction,
  onAccept,
  onReject,
  onCancel,
}: RequestListProps) {
  if (requests.length === 0) {
    if (isLoading) return <ListSkeleton rows={3} />;
    return (
      <Panel>
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyText} action={emptyAction} />
      </Panel>
    );
  }

  return (
    <ul className="space-y-3">
      <AnimatePresence initial={false}>
        {requests.map((request) => {
          const other = (direction === 'received' ? request.senderId : request.receiverId) as PublicUser | null;
          const isActing = actingRequestId === request._id;
          const isPending = request.status === 'PENDING';
          const meta = STATUS_META[request.status];

          return (
            <motion.li
              key={request._id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <Panel className={`p-5 transition-shadow hover:shadow-float ${isPending ? '' : 'opacity-80'}`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-start gap-4 min-w-0">
                    <PersonMark person={other} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold">{other?.fullName || 'Unavailable account'}</h3>
                        <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {formatLocation(other) && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {formatLocation(other)}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {direction === 'received' ? 'Received' : 'Sent'} {timeAgo(request.createdAt)}
                        </span>
                      </div>
                      {request.message && (
                        <div className="mt-3 flex gap-2 rounded-xl bg-surface px-3.5 py-2.5 text-sm text-foreground/90">
                          <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                          <p className="wrap-break-word leading-relaxed">{request.message}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {isPending && (
                    <div className="flex shrink-0 gap-2">
                      {direction === 'received' ? (
                        <>
                          <Button variant="outline" disabled={isActing} onClick={() => onReject?.(request._id)} className="flex-1 sm:flex-none">
                            <X className="h-4 w-4" />
                            Decline
                          </Button>
                          <Button variant="brand" disabled={isActing} onClick={() => onAccept?.(request._id)} className="flex-1 sm:flex-none">
                            {isActing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            Accept
                          </Button>
                        </>
                      ) : (
                        <Button variant="outline" disabled={isActing} onClick={() => onCancel?.(request._id)} className="w-full sm:w-auto">
                          {isActing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                          Cancel request
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Panel>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}

interface ConnectionListProps {
  connections: Connection[];
  isLoading: boolean;
  conversationByConnection: Map<string, string>;
  onOpenChat: (conversationId: string) => void;
}

function ConnectionList({ connections, isLoading, conversationByConnection, onOpenChat }: ConnectionListProps) {
  const currentUserId = getCurrentUserId();

  if (connections.length === 0) {
    if (isLoading) return <CardGridSkeleton count={4} className="xl:grid-cols-2" />;
    return (
      <Panel>
        <EmptyState icon={Users} title="No connections yet" description="Accepted connection requests will appear here." />
      </Panel>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {connections.map((connection, i) => {
        const iAmRequester = refId(connection.userId) === currentUserId;
        const other = iAmRequester ? connection.donorId : connection.userId;
        const conversationId = conversationByConnection.get(connection._id);

        return (
          <motion.div
            key={connection._id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.04 }}
            className="rounded-3xl bg-surface p-1.5 shadow-card transition-transform hover:-translate-y-1"
          >
            <div className="flex h-full flex-col rounded-[1.1rem] bg-background p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <PersonMark person={other} />
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{other?.fullName || 'Unavailable account'}</h3>
                    <p className="text-xs text-muted-foreground">
                      {iAmRequester ? 'Donor' : 'Blood Seeker'} · connected {timeAgo(connection.connectedAt)}
                    </p>
                  </div>
                </div>
                <StatusBadge tone="success">Connected</StatusBadge>
              </div>

              {formatLocation(other) && (
                <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {formatLocation(other)}
                </p>
              )}

              <Button disabled={!conversationId} onClick={() => conversationId && onOpenChat(conversationId)} className="mt-5 w-full">
                <MessageSquare className="h-4 w-4" />
                {conversationId ? 'Open chat' : 'Chat unavailable'}
              </Button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
