'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplet,
  Inbox,
  Send,
  Users,
  MapPin,
  Check,
  X,
  Ban,
  MessageSquare,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/navbar';
import { AmbientOrbs } from '@/components/ui/ambient-orbs';
import { useAuthStore } from '@/stores/auth.store';
import { useConnectionStore } from '@/stores/connection.store';
import { useChatStore } from '@/stores/chat.store';
import { Connection, ConnectionRequest, ConnectionRequestStatus, PublicUser } from '@/types/connection.types';
import { formatBloodGroup, formatLocation, getCurrentUserId, getInitials, refId, timeAgo } from '@/lib/format';

type Tab = 'received' | 'sent' | 'connected';

const STATUS_STYLES: Record<ConnectionRequestStatus, string> = {
  PENDING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  ACCEPTED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  REJECTED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  CANCELLED: 'bg-muted text-muted-foreground border-border',
};

export default function ConnectionsPage() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <ConnectionsContent />
    </Suspense>
  );
}

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-cosmic flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Droplet className="h-10 w-10 text-crimson-600 animate-bounce" />
        <p className="text-sm text-muted-foreground">Authenticating session...</p>
      </div>
    </div>
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
    return <FullScreenLoader />;
  }

  const tabs: { id: Tab; label: string; icon: typeof Inbox; count: number }[] = [
    { id: 'received', label: 'Received', icon: Inbox, count: pendingReceivedCount },
    { id: 'sent', label: 'Sent', icon: Send, count: pendingSentCount },
    { id: 'connected', label: 'Connected', icon: Users, count: connections.length },
  ];

  return (
    <div className="relative min-h-screen bg-cosmic text-foreground flex flex-col overflow-hidden">
      <AmbientOrbs />
      <Navbar />

      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto mt-18 px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              Blood <span className="text-red-600">Connections</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage requests between blood seekers and donors. Accepted requests open a private chat.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="gap-2 text-xs text-muted-foreground cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Accept success banner */}
        <AnimatePresence>
          {acceptedConversationId && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, height: 0, marginBottom: 0 }}
              className="mb-6 overflow-hidden"
            >
              <Card className="relative p-4 pr-12 bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="button"
                  aria-label="Dismiss"
                  onClick={() => setAcceptedConversationId(null)}
                  className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 transition hover:bg-emerald-500/20 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <p className="text-sm font-medium">Connection accepted. You can now chat with this person.</p>
                </div>
                <Button
                  onClick={() => router.push(`/messages?c=${acceptedConversationId}`)}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs shrink-0 gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Start Chatting
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <Card className="mb-6 p-4 rounded-2xl border-rose-500/20 bg-rose-500/5 flex flex-row items-center justify-between gap-3">
            <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </p>
            <button onClick={clearError} className="text-muted-foreground hover:text-foreground cursor-pointer" aria-label="Dismiss error">
              <X className="h-4 w-4" />
            </button>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-2 p-1 mb-6 rounded-2xl bg-card border border-border w-full sm:w-fit overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`min-w-5 h-5 px-1.5 rounded-full text-[10px] flex items-center justify-center ${
                      isActive ? 'bg-white/20 text-white' : 'bg-red-600/10 text-red-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === 'received' && (
          <RequestList
            requests={receivedRequests}
            direction="received"
            isLoading={isLoading}
            actingRequestId={actingRequestId}
            emptyTitle="No Requests Received"
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
            emptyTitle="No Requests Sent"
            emptyText="Find a matching donor on the dashboard and send them a connection request."
            emptyAction={
              <Button
                onClick={() => router.push('/dashboard/donor')}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white text-xs cursor-pointer"
              >
                Find Donors
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
      </main>
    </div>
  );
}

function PersonAvatar({ person }: { person: PublicUser | null }) {
  const bg = formatBloodGroup(person?.bloodGroup);
  return (
    <div className="h-12 w-12 rounded-2xl bg-red-600/10 text-red-600 font-extrabold flex items-center justify-center text-sm border border-red-600/20 shrink-0">
      {bg || getInitials(person?.fullName)}
    </div>
  );
}

function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <Card className="p-12 text-center bg-card border-border rounded-2xl">
      <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{text}</p>
      {action}
    </Card>
  );
}

interface RequestListProps {
  requests: ConnectionRequest[];
  direction: 'received' | 'sent';
  isLoading: boolean;
  actingRequestId: string | null;
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
  emptyTitle,
  emptyText,
  emptyAction,
  onAccept,
  onReject,
  onCancel,
}: RequestListProps) {
  if (requests.length === 0) {
    return (
      <EmptyState
        title={isLoading ? 'Loading...' : emptyTitle}
        text={isLoading ? 'Fetching your connection requests...' : emptyText}
        action={isLoading ? undefined : emptyAction}
      />
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const other = (direction === 'received' ? request.senderId : request.receiverId) as PublicUser | null;
        const isActing = actingRequestId === request._id;
        const isPending = request.status === 'PENDING';

        return (
          <motion.div key={request._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="p-5 bg-card border-border hover:border-red-600/40 hover:shadow-lg transition-all rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <PersonAvatar person={other} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-base text-foreground leading-tight truncate">
                        {other?.fullName || 'Unavailable account'}
                      </h3>
                      <Badge className={`text-[10px] ${STATUS_STYLES[request.status]}`}>{request.status.toLowerCase()}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                      {formatLocation(other) && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-red-600 shrink-0" />
                          {formatLocation(other)}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        {direction === 'received' ? 'Received' : 'Sent'} {timeAgo(request.createdAt)}
                      </span>
                    </div>
                    {request.message && (
                      <p className="mt-3 text-sm text-foreground/90 bg-muted/60 rounded-xl px-3.5 py-2.5 break-words">
                        &ldquo;{request.message}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {isPending && (
                  <div className="flex gap-2 shrink-0 sm:self-center">
                    {direction === 'received' ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isActing}
                          onClick={() => onReject?.(request._id)}
                          className="h-9 gap-1.5 text-xs cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          disabled={isActing}
                          onClick={() => onAccept?.(request._id)}
                          className="h-9 bg-red-600 hover:bg-red-700 text-white text-xs gap-1.5 cursor-pointer"
                        >
                          {isActing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                          Accept
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isActing}
                        onClick={() => onCancel?.(request._id)}
                        className="h-9 gap-1.5 text-xs cursor-pointer"
                      >
                        {isActing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
                        Cancel Request
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
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
    return (
      <EmptyState
        title={isLoading ? 'Loading...' : 'No Connections Yet'}
        text={isLoading ? 'Fetching your connections...' : 'Accepted connection requests will appear here.'}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {connections.map((connection) => {
        const iAmRequester = refId(connection.userId) === currentUserId;
        const other = iAmRequester ? connection.donorId : connection.userId;
        const conversationId = conversationByConnection.get(connection._id);

        return (
          <motion.div key={connection._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="p-6 bg-card border-border hover:border-red-600/40 hover:shadow-lg transition-all rounded-2xl flex flex-col justify-between h-full">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <PersonAvatar person={other} />
                    <div className="min-w-0">
                      <h3 className="font-bold text-base text-foreground leading-tight truncate">
                        {other?.fullName || 'Unavailable account'}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {iAmRequester ? 'Donor' : 'Blood Seeker'} · connected {timeAgo(connection.connectedAt)}
                      </span>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Connected
                  </Badge>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground mb-6">
                  {formatLocation(other) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-red-600 shrink-0" />
                      <span>{formatLocation(other)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button
                  disabled={!conversationId}
                  onClick={() => conversationId && onOpenChat(conversationId)}
                  className="w-full h-9 bg-linear-to-r from-red-700 to-red-950 hover:from-red-800 hover:to-rose-700 text-white text-xs font-semibold gap-1.5 cursor-pointer border-none"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  {conversationId ? 'Open Chat' : 'Chat unavailable'}
                </Button>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
