import React, { useEffect, useRef, useState } from 'react';
import { updateActionsMetadata } from '@/lib/CustomHook';
import { useParams } from 'next/navigation';
import useStore from '../store';

type GmailLabel = {
  id: string;
  name: string;
};

type GmailMessage = {
  id: string;
  snippet: string;
  subject?: string;
};

async function fetchGmailLabels(accessToken: string | null): Promise<GmailLabel[]> {
  if (!accessToken) return [];
  
  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/labels",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await res.json();
  return data.labels || [];
}

async function fetchGmailMessages(accessToken: string | null, pageToken?: string): Promise<{messages: GmailMessage[], nextPageToken?: string}> {
  if (!accessToken) return {messages: []};
  
  const url = pageToken 
    ? `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50&pageToken=${pageToken}`
    : "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50";
  
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await res.json();
  const messages = data.messages || [];
  
  // Fetch detailed info for each message
  const detailedMessages = await Promise.all(
    messages.slice(0, 20).map(async (msg: any) => {
      const detailRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const detail = await detailRes.json();
      const subjectHeader = detail.payload?.headers?.find((h: any) => h.name === 'Subject');
      return {
        id: msg.id,
        snippet: detail.snippet || '',
        subject: subjectHeader?.value || 'No Subject'
      };
    })
  );

  return {
    messages: detailedMessages,
    nextPageToken: data.nextPageToken
  };
}

const ConfigureGmailActionsModal = ({ 
  setIsModalOpen, 
  googleAccessToken, 
  triggerRef,
  index,
  setIsUpdating,
  mode
}: { 
  setIsModalOpen: (isOpen: boolean) => void, 
  googleAccessToken: string | null, 
  triggerRef: React.RefObject<HTMLDivElement | null>,
  index: number | undefined,
  setIsUpdating: (updating: boolean) => void,
  mode: "label" | "message"
}) => {
  const [labels, setLabels] = useState<GmailLabel[]>([]);
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isError, setIsError] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const modalContentRef = useRef<HTMLDivElement | null>(null);
  const params = useParams();
  const zapId = params.id;
  const actions = useStore((state) => state.actions);
  const setActions = useStore((state) => state.setActions);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        modalContentRef.current &&
        event.target instanceof Node &&
        !modalContentRef.current.contains(event.target) &&
        !triggerRef?.current?.contains(event.target)
      ) {
        setIsModalOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside, true);
    window.addEventListener("click", handleClickOutside, true);
    window.addEventListener("touchstart", handleClickOutside, true);
    
    return () => {
      window.removeEventListener("mousedown", handleClickOutside, true);
      window.removeEventListener("click", handleClickOutside, true);
      window.removeEventListener("touchstart", handleClickOutside, true);
    };
  }, [setIsModalOpen, triggerRef]);

  useEffect(() => {
    const loadData = async () => {
      if (!googleAccessToken) return;
      
      setIsLoading(true);
      setIsError(false);
      
      try {
        if (mode === "label") {
          const labelList = await fetchGmailLabels(googleAccessToken);
          setLabels(labelList);
        } else if (mode === "message") {
          const result = await fetchGmailMessages(googleAccessToken);
          setMessages(result.messages);
          setNextPageToken(result.nextPageToken);
        }
      } catch (error) {
        console.error(`Error fetching ${mode}s:`, error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [googleAccessToken, mode]);

  const loadMoreMessages = async () => {
    if (!googleAccessToken || !nextPageToken) return;
    setIsLoadingMore(true);
    try {
      const result = await fetchGmailMessages(googleAccessToken, nextPageToken);
      setMessages(prev => [...prev, ...result.messages]);
      setNextPageToken(result.nextPageToken);
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleLabelSelect = async (label: GmailLabel) => {
    

    setIsModalOpen(false);
    try {
      setIsUpdating(true);
      const currentAction = actions.find(a => a.index === index);
      const mergedMetaData = {
        ...(currentAction?.metadata as object || {}),
        labelId: label.id,
        labelName: label.name,
      };
      await updateActionsMetadata({
        zapId,
        metaData: mergedMetaData,
        index
      });
      if (typeof index === 'number') {
        const newMeta = { 
          ...currentAction?.metadata,
          labelId: label.id, 
          labelName: label.name 
        } as unknown as JSON;
        setActions(
          actions.map((a) =>
            a.index === index ? { ...a, metadata: newMeta } : a
          )
        );
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMessageSelect = async (message: GmailMessage) => {
    
    
    setIsModalOpen(false);
    try {
      setIsUpdating(true);
      const currentAction = actions.find(a => a.index === index);
      const mergedMetaData = {
        ...(currentAction?.metadata as object || {}),
        messageId: message.id,
        messageName: message.subject || message.snippet.substring(0, 50) + "...",
      };
      await updateActionsMetadata({
        zapId,
        metaData: mergedMetaData,
        index
      });
      if (typeof index === 'number') {
        const newMeta = { 
          ...currentAction?.metadata,
          messageId: message.id, 
          messageName: message.subject || message.snippet.substring(0, 50) + "..." 
        } as unknown as JSON;
        setActions(
          actions.map((a) =>
            a.index === index ? { ...a, metadata: newMeta } : a
          )
        );
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      ref={modalContentRef}
      className="absolute shadow-2xl right-full mr-2 top-40 border w-80 bg-white z-10 rounded-md flex flex-col"
    >
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 px-4 py-4">
        <span className="text-sm font-bold">
          {mode === "label" ? "Select label" : "Select message"}
        </span>
        <button 
          onClick={() => setIsModalOpen(false)} 
          className="text-gray-500 hover:text-gray-700 h-10 w-10 cursor-pointer text-lg font-bold"
        >
          ×
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto px-4 pb-4">
        <div className="space-y-2">
          {isLoading && (
            <ul className="space-y-1">
              {[...Array(3)].map((_, index) => (
                <li 
                  key={`skeleton-${index}`} 
                  className="p-2 text-sm rounded border-b border-gray-100 last:border-b-0 bg-gray-200 animate-pulse h-12"
                />
              ))}
            </ul>
          )}
          {isError && (
            <p className="text-sm text-red-600">Error fetching {mode}s</p>
          )}
          
          {/* Label List */}
          {!isLoading && !isError && mode === "label" && (
            <ul className="space-y-1">
              {labels.map((label) => (
                <li 
                  onClick={() => handleLabelSelect(label)}
                  key={label.id} 
                  className="p-2 text-sm hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="min-w-4 min-h-4 border-2 border-gray-400 rounded-full cursor-pointer hover:border-gray-600"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{label.name}</span>
                      <span className="text-xs text-gray-500">{`ID: ${label.id}`}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Message List */}
          {!isLoading && !isError && mode === "message" && (
            <ul className="space-y-1">
              {messages.map((message) => (
              <li 
              onClick={() => handleMessageSelect(message)}
              key={message.id} 
              className="p-2 text-sm hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex  items-start gap-2">
                <div 
                  className="min-w-4 min-h-4 mt-1 border-2 border-gray-400 rounded-full cursor-pointer hover:border-gray-600"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-medium break-words">{message.subject}</span>
                  
                  <span className="text-xs text-gray-400 break-all">{`ID: ${message.id}`}</span>
                </div>
              </div>
            </li>
              ))}
            </ul>
          )}

          {!isLoading && !isError && mode === "label" && labels.length === 0 && (
            <p className="text-sm text-gray-500">No labels found</p>
          )}
          
          {!isLoading && !isError && mode === "message" && messages.length === 0 && (
            <p className="text-sm text-gray-500">No messages found</p>
          )}
        </div>
        
        {/* Load More Button */}
        {mode === "message" && !isLoading && !isError && nextPageToken && (
          <div className="px-4 pb-4">
            <button
              onClick={async () => {
                if (!googleAccessToken || !nextPageToken) return;
                setIsLoadingMore(true);
                try {
                  const result = await fetchGmailMessages(googleAccessToken, nextPageToken);
                  setMessages(prev => [...prev, ...result.messages]);
                  setNextPageToken(result.nextPageToken);
                } catch (error) {
                  console.error('Error loading more messages:', error);
                } finally {
                  setIsLoadingMore(false);
                }
              }}
              disabled={isLoadingMore}
              className="w-full py-2 px-4 bg-[#695be8] text-white rounded hover:bg-[#5a4dd4] disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isLoadingMore ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConfigureGmailActionsModal;
