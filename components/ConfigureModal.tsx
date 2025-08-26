import React, { useEffect, useRef } from 'react'
import { useGetGmailLabels } from './ConfigureGmail';

const ConfigureModal = ({ setIsModalOpen , googleAccessToken, triggerRef}: { setIsModalOpen: (isOpen: boolean) => void , googleAccessToken: string | null, triggerRef: React.RefObject<HTMLDivElement | null> }) => {
  const { data: gmailLabels, isLoading: isLoadingGmailLabels, isError: isErrorGmailLabels, error: errorGmailLabels } = useGetGmailLabels(googleAccessToken);
  const modalContentRef = useRef<HTMLDivElement | null>(null);

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

    // Listen to multiple events for better coverage
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
      className="absolute shadow-2xl right-full mr-2 top-40 border w-80 max-h-80 overflow-y-auto py-4 px-4 bg-white z-10 rounded-md"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold">Gmail Labels</span>
        <button 
          onClick={() => setIsModalOpen(false)} 
          className="text-gray-500 hover:text-gray-700 text-lg font-bold"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2">
        {isLoadingGmailLabels && (
          <p className="text-sm text-gray-600">Loading labels...</p>
        )}
        {isErrorGmailLabels && (
          <p className="text-sm text-red-600">Error fetching labels</p>
        )}
        {gmailLabels && (
          <ul className="space-y-1">
            {gmailLabels.map((label: any) => (
              <li 
                key={label.id} 
                className="p-2 text-sm hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                {label.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default ConfigureModal