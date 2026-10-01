'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Droplet,
  MessageSquare,
  Send,
  ArrowLeft,
  AlertCircle,
  Search,
  X,
  RefreshCw,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/layout/navbar';
import { AmbientOrbs } from '@/components/ui/ambient-orbs';
import { useAuthStore } from '@/stores/auth.store';
import { useChatStore } from '@/stores/chat.store';
import { Conversation } from '@/types/chat.types';
import { PublicUser } from '@/types/connection.types';
import { formatBloodGroup, formatLocation, formatTime, getCurrentUserId, getInitials, timeAgo } from '@/lib/format';

const MAX_MESSAGE_LENGTH = 2000;

export default function MessagesPage() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <MessagesContent />
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

function getOtherParticipant(conversation: Conversation, currentUserId: string | null): PublicUser | null {
  return conversation.participantIds.find((p) => p && p._id !== currentUserId) ?? null;
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
  // Derived from the access token once the session is authenticated
  const currentUserId = useMemo(() => (status === 'authenticated' ? getCurrentUserId() : null), [status]);
  const bottomRef = useRef<HTMLDivElement>(null);

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

  // Keep the newest message in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, activeConversationId]);

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
    return <FullScreenLoader />;
  }

  return (
    <div className="relative min-h-screen bg-cosmic text-foreground flex flex-col overflow-hidden">
      <AmbientOrbs />
      <Navbar />

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto mt-18 px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              <span className="text-red-600">Messages</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Coordinate donations privately with your connections.</p>
          </div>
          <span
            className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider ${
              isConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
            {isConnected ? 'Live' : 'Connecting...'}
          </span>
        </div>

        {error && (
          <Card className="mb-4 p-3 rounded-2xl border-rose-500/20 bg-rose-500/5 flex flex-row items-center justify-between gap-3">
            <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </p>
            <button onClick={clearError} className="text-muted-foreground hover:text-foreground cursor-pointer" aria-label="Dismiss error">
              <X className="h-4 w-4" />
            </button>
          </Card>
        )}

        <Card className="bg-card border-border rounded-2xl overflow-hidden p-0 gap-0 h-[calc(100vh-15rem)] min-h-105 flex flex-row">
          {/* Conversation list */}
          <aside
            className={`w-full md:w-80 md:shrink-0 border-r border-border flex-col ${
              activeConversationId ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-background text-xs w-full"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-semibold">
                    {isLoadingConversations ? 'Loading...' : 'No conversations yet'}
                  </p>
                  {!isLoadingConversations && (
                    <>
                      <p className="text-xs text-muted-foreground mt-1">Chats open once a connection request is accepted.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/connections')}
                        className="mt-4 h-8 gap-1.5 text-xs cursor-pointer"
                      >
                        <Users className="h-3.5 w-3.5" />
                        View Connections
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const other = getOtherParticipant(conversation, currentUserId);
                  const last = conversation.lastMessageId;
                  const isActive = conversation._id === activeConversationId;
                  const isMine = last && String(last.senderId) === currentUserId;

                  return (
                    <button
                      key={conversation._id}
                      onClick={() => openConversation(conversation._id)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-border/60 transition-colors cursor-pointer ${
                        isActive ? 'bg-red-600/10' : 'hover:bg-muted/60'
                      }`}
                    >
                      <div className="h-11 w-11 rounded-2xl bg-red-600/10 text-red-600 font-extrabold flex items-center justify-center text-sm border border-red-600/20 shrink-0">
                        {getInitials(other?.fullName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-sm truncate">{other?.fullName || 'Unavailable account'}</span>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {timeAgo(last?.createdAt || conversation.lastMessageAt)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {last ? `${isMine ? 'You: ' : ''}${last.content}` : 'Say hello 👋'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Chat pane */}
          <section className={`flex-1 flex-col min-w-0 ${activeConversationId ? 'flex' : 'hidden md:flex'}`}>
            {!activeConversation ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="h-14 w-14 rounded-2xl bg-red-600/10 text-red-600 flex items-center justify-center mb-3">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">Select a conversation</h3>
                <p className="text-sm text-muted-foreground mt-1">Choose a connection from the list to start chatting.</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                  <button
                    onClick={() => openConversation(null)}
                    className="md:hidden p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="h-10 w-10 rounded-xl bg-red-600/10 text-red-600 font-extrabold flex items-center justify-center text-xs border border-red-600/20 shrink-0">
                    {formatBloodGroup(activePartner?.bloodGroup) || getInitials(activePartner?.fullName)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm truncate">{activePartner?.fullName || 'Unavailable account'}</h3>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {[formatLocation(activePartner), activePartner?.email].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                  {hasMore[activeConversation._id] && (
                    <div className="flex justify-center pb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isLoadingMessages}
                        onClick={() => loadOlderMessages(activeConversation._id)}
                        className="gap-1.5 text-xs text-muted-foreground cursor-pointer"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                        Load older messages
                      </Button>
                    </div>
                  )}

                  {activeMessages.length === 0 && !isLoadingMessages && (
                    <p className="text-center text-xs text-muted-foreground py-8">
                      No messages yet. Start the conversation!
                    </p>
                  )}

                  {activeMessages.map((message) => {
                    const isMine = String(message.senderId) === currentUserId;
                    return (
                      <motion.div
                        key={message._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] sm:max-w-[65%] rounded-2xl px-3.5 py-2 text-sm shadow-xs ${
                            isMine
                              ? 'bg-linear-to-r from-red-600 to-rose-600 text-white rounded-br-md'
                              : 'bg-muted text-foreground rounded-bl-md'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{message.content}</p>
                          <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-white/70' : 'text-muted-foreground'}`}>
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Composer */}
                <form onSubmit={handleSend} className="p-3 border-t border-border flex items-end gap-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                    rows={1}
                    placeholder={isConnected ? 'Type a message...' : 'Connecting to chat...'}
                    className="flex-1 resize-none max-h-32 min-h-10 rounded-lg border border-input bg-background dark:bg-input/30 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-all"
                  />
                  <Button
                    type="submit"
                    disabled={!draft.trim() || isSending || !isConnected}
                    className="h-10 w-10 p-0 bg-red-600 hover:bg-red-700 text-white cursor-pointer shrink-0"
                    aria-label="Send message"
                  >
                    {isSending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
              </>
            )}
          </section>
        </Card>
      </main>
    </div>
  );
}
