import React, { useEffect, useRef } from 'react';
import { useGetGmailLabels } from './ConfigureGmail';
import { updateActionsMetadata } from '@/lib/CustomHook';
import { useParams } from 'next/navigation';

const ConfigureGmailModal = ({ 
  setIsModalOpen, 
  googleAccessToken, 
  triggerRef,
  index
}: { 
  setIsModalOpen: (isOpen: boolean) => void, 
  googleAccessToken: string | null, 
  triggerRef: React.RefObject<HTMLDivElement | null>,
  index: number | undefined
}) => {
  const { data: gmailLabels, isLoading: isLoadingGmailLabels, isError: isErrorGmailLabels, error: errorGmailLabels } = useGetGmailLabels(googleAccessToken);
  const modalContentRef = useRef<HTMLDivElement | null>(null);
  const params = useParams();
  const zapId = params.id;

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

  return (
    <div
      ref={modalContentRef}
      className="absolute shadow-2xl right-full mr-2 top-40 border w-80 bg-white z-10 rounded-md flex flex-col"
    >
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 px-4 py-4">
        <span className="text-sm font-bold">Select value for label or mailbox</span>
        <button 
          onClick={() => setIsModalOpen(false)} 
          className="text-gray-500 hover:text-gray-700 h-10 w-10 cursor-pointer text-lg font-bold"
        >
          ×
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto px-4 pb-4">
        <div className="space-y-2">
          {isLoadingGmailLabels && (
            <ul className="space-y-1">
              {[...Array(3)].map((_, index) => (
                <li 
                  key={`skeleton-${index}`} 
                  className="p-2 text-sm rounded border-b border-gray-100 last:border-b-0 bg-gray-200 animate-pulse h-12"
                />
              ))}
            </ul>
          )}
          {isErrorGmailLabels && (
            <p className="text-sm text-red-600">Error fetching labels</p>
          )}
          {gmailLabels && (
            <ul className="space-y-1">
              {gmailLabels.map((label: any) => (
                <li 
                onClick={() => {
                  setIsModalOpen(false);
                  updateActionsMetadata({
                    zapId,
                    metaData: {
                      labelId: label.id,
                      labelName: label.name,
                    },
                    index
                  });
                }}
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
        </div>
      </div>
    </div>
  );
}

export default ConfigureGmailModal;