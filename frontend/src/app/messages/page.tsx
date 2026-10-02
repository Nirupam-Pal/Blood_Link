'use client';

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, ArrowLeft, Lock, MessageSquare, MessagesSquare, RefreshCw, Search, Send, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppShell } from '@/components/layout/app-shell';
import { Avatar, BloodBadge, EmptyState, Notice, PageLoader, Skeleton, StatusBadge } from '@/components/ui/state-views';
import { useAuthStore } from '@/stores/auth.store';
import { useChatStore } from '@/stores/chat.store';
import { ChatMessage, Conversation } from '@/types/chat.types';
import { PublicUser } from '@/types/connection.types';
import { formatBloodGroup, formatLocation, formatTime, getCurrentUserId, timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';

const MAX_MESSAGE_LENGTH = 2000;
// Consecutive messages from one sender within this window are visually grouped.
const GROUP_WINDOW_MS = 5 * 60 * 1000;

export default function MessagesPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <MessagesContent />
    </Suspense>
  );
}

function getOtherParticipant(conversation: Conversation, currentUserId: string | null): PublicUser | null {
  return conversation.participantIds.find((p) => p && p._id !== currentUserId) ?? null;
}

function dayLabel(date?: string): string {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfToday - startOfDay) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...(d.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}),
  });
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedConversationId = searchParams.get('c');

  // Auth Store Selectors
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  // Chat Store Selectors
  const conversations = useChatStore((state) => state.conversations);
  const messages = useChatStore((state) => state.messages);
  const hasMore = useChatStore((state) => state.hasMore);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const isConnected = useChatStore((state) => state.isConnected);
  const isLoadingConversations = useChatStore((state) => state.isLoadingConversations);
  const isLoadingMessages = useChatStore((state) => state.isLoadingMessages);
  const isSending = useChatStore((state) => state.isSending);
  const error = useChatStore((state) => state.error);
  const connect = useChatStore((state) => state.connect);
  const fetchConversations = useChatStore((state) => state.fetchConversations);
  const setActiveConversation = useChatStore((state) => state.setActiveConversation);
  const fetchMessages = useChatStore((state) => state.fetchMessages);
  const loadOlderMessages = useChatStore((state) => state.loadOlderMessages);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const clearError = useChatStore((state) => state.clearError);

  const [draft, setDraft] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNearBottom, setIsNearBottom] = useState(true);
  // Derived from the access token once the session is authenticated
  const currentUserId = useMemo(() => (status === 'authenticated' ? getCurrentUserId() : null), [status]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const followedConversationRef = useRef<string | null>(null);

  // Auth Guard
  useEffect(() => {
    if (!isInitializing && status === 'unauthenticated') {
      router.push('/login');
    }
    if (!isInitializing && user?.role === 'BLOOD_BANK') {
      router.push('/dashboard/blood-bank');
    }
  }, [status, isInitializing, user, router]);

  // Connect socket + load conversations
  useEffect(() => {
    if (!isInitializing && status === 'authenticated') {
      connect();
      fetchConversations();
    }
  }, [status, isInitializing, connect, fetchConversations]);

  // Select the conversation from the URL (?c=...) once conversations are loaded
  useEffect(() => {
    if (requestedConversationId && conversations.some((c) => c._id === requestedConversationId)) {
      setActiveConversation(requestedConversationId);
    }
  }, [requestedConversationId, conversations, setActiveConversation]);

  // Load messages whenever the active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    }
  }, [activeConversationId, fetchMessages]);

  const activeMessages = useMemo(
    () => (activeConversationId ? messages[activeConversationId] || [] : []),
    [activeConversationId, messages]
  );

  const lastMessage = activeMessages[activeMessages.length - 1];

  // Jump to the newest message instantly when a conversation opens
  // (the resulting scroll event resets isNearBottom).
  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [activeConversationId]);

  // Follow new messages smoothly — but only when the newest message changes
  // (so loading older history doesn't yank the view) and only if the reader is
  // already near the bottom or sent it themselves.
  useEffect(() => {
    if (!lastMessage) return;
    // First batch for a freshly opened conversation: always land on the newest message
    if (followedConversationRef.current !== activeConversationId) {
      followedConversationRef.current = activeConversationId;
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
      return;
    }
    const isMine = String(lastMessage.senderId) === currentUserId;
    if (isNearBottom || isMine) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage?._id]);

  // Auto-grow the composer up to its max height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 144)}px`;
  }, [draft]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setIsNearBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 120);
  };

  const activeConversation = conversations.find((c) => c._id === activeConversationId) || null;
  const activePartner = activeConversation ? getOtherParticipant(activeConversation, currentUserId) : null;

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase().trim();
    return conversations.filter((c) => {
      const other = getOtherParticipant(c, currentUserId);
      return (other?.fullName || '').toLowerCase().includes(query);
    });
  }, [conversations, searchQuery, currentUserId]);

  // Annotate each message with day separators and grouping hints
  const renderedMessages = useMemo(() => {
    return activeMessages.map((message, i) => {
      const prev: ChatMessage | undefined = activeMessages[i - 1];
      const next: ChatMessage | undefined = activeMessages[i + 1];
      const label = dayLabel(message.createdAt);
      const showDay = !prev || dayLabel(prev.createdAt) !== label;
      const sameAsPrev =
        !!prev &&
        !showDay &&
        String(prev.senderId) === String(message.senderId) &&
        new Date(message.createdAt).getTime() - new Date(prev.createdAt).getTime() < GROUP_WINDOW_MS;
      const sameAsNext =
        !!next &&
        dayLabel(next.createdAt) === label &&
        String(next.senderId) === String(message.senderId) &&
        new Date(next.createdAt).getTime() - new Date(message.createdAt).getTime() < GROUP_WINDOW_MS;
      return { message, showDay, label, sameAsPrev, sameAsNext };
    });
  }, [activeMessages]);

  const openConversation = (id: string | null) => {
    setActiveConversation(id);
    router.replace(id ? `/messages?c=${id}` : '/messages', { scroll: false });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || !activeConversationId || isSending) return;
    try {
      await sendMessage(activeConversationId, content);
      setDraft('');
    } catch {
      // Error is surfaced through the store; keep the draft so it can be retried.
    }
  };

  if (isInitializing || status === 'idle') {
    return <PageLoader label="Authenticating session" />;
  }

  const showConversationSkeleton = isLoadingConversations && conversations.length === 0;
  const showMessageSkeleton = isLoadingMessages && activeMessages.length === 0;
  const remaining = MAX_MESSAGE_LENGTH - draft.length;
  const partnerGroup = formatBloodGroup(activePartner?.bloodGroup);

  return (
    <AppShell bleed>
      <div className="flex h-full">
        {/* ───────────── Conversations ───────────── */}
        <aside
          className={cn(
            'w-full lg:w-80 xl:w-88 lg:shrink-0 flex-col border-r border-border',
            activeConversationId ? 'hidden lg:flex' : 'flex'
          )}
          aria-label="Conversations"
        >
          <div className="px-4 pt-6 pb-4">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-xl font-bold tracking-tight">Messages</h1>
              <StatusBadge tone={isConnected ? 'success' : 'warning'} live>
                {isConnected ? 'Live' : 'Connecting…'}
              </StatusBadge>
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search conversations"
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-3">
            {showConversationSkeleton ? (
              <div role="status" aria-label="Loading conversations" className="space-y-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-3">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-2/5" />
                      <Skeleton className="h-2.5 w-4/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              searchQuery.trim() ? (
                <EmptyState icon={Search} title="No matches" description={`No conversations match “${searchQuery.trim()}”.`} />
              ) : (
                <EmptyState
                  icon={MessagesSquare}
                  title="No conversations yet"
                  description="Chats open once a connection request is accepted."
                  action={
                    <Button variant="outline" size="sm" onClick={() => router.push('/connections')}>
                      <Users className="h-3.5 w-3.5" />
                      View connections
                    </Button>
                  }
                />
              )
            ) : (
              <ul className="space-y-0.5">
                {filteredConversations.map((conversation) => {
                  const other = getOtherParticipant(conversation, currentUserId);
                  const last = conversation.lastMessageId;
                  const isActive = conversation._id === activeConversationId;
                  const isMine = last && String(last.senderId) === currentUserId;
                  const bloodGroup = formatBloodGroup(other?.bloodGroup);

                  return (
                    <motion.li key={conversation._id} layout transition={{ duration: 0.25 }}>
                      <button
                        onClick={() => openConversation(conversation._id)}
                        aria-current={isActive ? 'true' : undefined}
                        className={cn(
                          'relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30',
                          isActive ? 'text-foreground' : 'hover:bg-surface'
                        )}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="active-conversation"
                            className="absolute inset-0 rounded-xl bg-surface shadow-card"
                            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                          />
                        )}
                        <div className="relative">
                          <Avatar name={other?.fullName} />
                          {bloodGroup && (
                            <span className="absolute -bottom-1 -right-1 rounded-md bg-linear-to-br from-red-600 to-red-800 px-1 text-[9px] font-bold leading-4 text-white ring-2 ring-background">
                              {bloodGroup}
                            </span>
                          )}
                        </div>
                        <div className="relative min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-sm font-semibold">{other?.fullName || 'Unavailable account'}</span>
                            <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                              {timeAgo(last?.createdAt || conversation.lastMessageAt)}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
                            {last ? `${isMine ? 'You: ' : ''}${last.content}` : 'Say hello 👋'}
                          </p>
                        </div>
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* ───────────── Chat pane ───────────── */}
        <section
          className={cn('relative flex-1 flex-col min-w-0', activeConversationId ? 'flex' : 'hidden lg:flex')}
          aria-label="Conversation"
        >
          {!activeConversation ? (
            <div className="relative flex flex-1 items-center justify-center">
              <div className="pointer-events-none absolute inset-0 bg-dots mask-radial opacity-70" />
              <EmptyState
                icon={MessageSquare}
                title="Select a conversation"
                description="Choose a connection from the list to start chatting."
                action={
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    Messages are private to you and your connection
                  </span>
                }
                className="relative"
              />
            </div>
          ) : (
            <>
              {/* Chat header */}
              <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-4 sm:px-6">
                <button
                  onClick={() => openConversation(null)}
                  className="lg:hidden -ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                {partnerGroup ? <BloodBadge group={partnerGroup} size="sm" /> : <Avatar name={activePartner?.fullName} />}
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-semibold">{activePartner?.fullName || 'Unavailable account'}</h2>
                  <p className="truncate text-xs text-muted-foreground">
                    {[formatLocation(activePartner), activePartner?.email].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  Private
                </span>
              </header>

              {error && (
                <Notice tone="brand" onDismiss={clearError} className="mx-4 mt-3">
                  {error}
                </Notice>
              )}

              {/* Messages */}
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto scrollbar-thin bg-surface/60 px-4 py-6 sm:px-8"
                aria-live="polite"
                aria-relevant="additions"
              >
                {hasMore[activeConversation._id] && (
                  <div className="flex justify-center pb-4">
                    <Button
                      variant="outline"
                      size="xs"
                      disabled={isLoadingMessages}
                      onClick={() => loadOlderMessages(activeConversation._id)}
                      className="rounded-full"
                    >
                      <RefreshCw className={`h-3 w-3 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                      Load older messages
                    </Button>
                  </div>
                )}

                {showMessageSkeleton && (
                  <div className="space-y-3" role="status" aria-label="Loading messages">
                    {[46, 62, 34, 54, 40].map((w, i) => (
                      <div key={i} className={`flex ${i % 2 ? 'justify-end' : 'justify-start'}`}>
                        <Skeleton className="h-10 rounded-2xl" style={{ width: `${w}%` }} />
                      </div>
                    ))}
                  </div>
                )}

                {activeMessages.length === 0 && !isLoadingMessages && (
                  <EmptyState
                    icon={Send}
                    title="No messages yet"
                    description={`Say hello to ${activePartner?.fullName?.split(' ')[0] || 'your connection'} and share the details of your request.`}
                  />
                )}

                {renderedMessages.map(({ message, showDay, label, sameAsPrev, sameAsNext }) => {
                  const isMine = String(message.senderId) === currentUserId;
                  const corner = isMine
                    ? cn(sameAsPrev && 'rounded-tr-md', sameAsNext ? 'rounded-br-md' : 'rounded-br-sm')
                    : cn(sameAsPrev && 'rounded-tl-md', sameAsNext ? 'rounded-bl-md' : 'rounded-bl-sm');

                  return (
                    <div key={message._id}>
                      {showDay && (
                        <div className="my-5 flex justify-center first:mt-0" role="separator">
                          <span className="rounded-full bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-card">{label}</span>
                        </div>
                      )}
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className={cn('flex', isMine ? 'justify-end' : 'justify-start', sameAsPrev ? 'mt-1' : 'mt-3')}
                      >
                        <div
                          title={new Date(message.createdAt).toLocaleString()}
                          className={cn(
                            'max-w-[85%] sm:max-w-[65%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
                            corner,
                            isMine
                              ? 'bg-linear-to-b from-red-500 to-red-600 text-white shadow-md shadow-red-500/20'
                              : 'bg-background text-foreground shadow-card'
                          )}
                        >
                          <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
                          {!sameAsNext && (
                            <p className={cn('mt-1 text-right text-[10px] tabular-nums', isMine ? 'text-white/75' : 'text-muted-foreground')}>
                              {formatTime(message.createdAt)}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  );
                })}

                {/* Outgoing message in flight */}
                <AnimatePresence>
                  {isSending && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 flex justify-end"
                      aria-label="Sending message"
                    >
                      <div className="flex items-center gap-1 rounded-2xl rounded-br-sm bg-brand-soft px-3.5 py-3">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="h-1.5 w-1.5 rounded-full bg-brand"
                            animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={bottomRef} className="h-px" />
              </div>

              {/* Jump-to-latest */}
              <AnimatePresence>
                {!isNearBottom && activeMessages.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0, y: 8, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.9 }}
                    onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    className="absolute right-6 bottom-24 flex h-9 w-9 items-center justify-center rounded-full bg-background text-muted-foreground shadow-float hover:text-foreground cursor-pointer"
                    aria-label="Scroll to latest message"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Composer */}
              <form onSubmit={handleSend} className="shrink-0 border-t border-border p-3 sm:px-6">
                <div className="flex items-end gap-2 rounded-2xl bg-muted p-1.5 pl-4 transition-shadow focus-within:bg-background focus-within:shadow-card focus-within:ring-3 focus-within:ring-ring/15">
                  <textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                    rows={1}
                    aria-label="Message"
                    placeholder={isConnected ? 'Write a message…' : 'Connecting to chat…'}
                    className="max-h-36 flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground/80 scrollbar-thin"
                  />
                  <Button
                    type="submit"
                    variant="brand"
                    size="icon"
                    disabled={!draft.trim() || isSending || !isConnected}
                    aria-label="Send message"
                    className="rounded-xl"
                  >
                    {isSending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="mt-1.5 flex items-center justify-between px-1 text-[11px] text-muted-foreground">
                  <span className="hidden sm:inline">Enter to send · Shift + Enter for a new line</span>
                  {remaining <= 200 && (
                    <span className={cn('ml-auto tabular-nums', remaining <= 50 && 'font-semibold text-brand')}>{remaining} characters left</span>
                  )}
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}
