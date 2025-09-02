import React, { useEffect, useRef, useState } from 'react';
import { updateActionsMetadata } from '@/lib/CustomHook';
import { useParams } from 'next/navigation';
import useStore from '../store';

type GoogleFolder = {
  id: string;
  name: string;
};

async function fetchGoogleDriveFolders(accessToken: string | null): Promise<GoogleFolder[]> {
  if (!accessToken) return [];

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name,mimeType),nextPageToken&pageSize=1000`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  );

  const data = await res.json();
  console.log("Drive Folders API response:", data);
  
  // Additional filtering to ensure only actual Google Drive folders
  const filteredFolders = (data.files || []).filter((file: any) => {
    // Only include files with the exact Google Drive folder MIME type
    const isGoogleFolder = file.mimeType === 'application/vnd.google-apps.folder';
    
    // Exclude .rtfd files by name (as additional safety)
    const isRtfdFile = file.name && file.name.toLowerCase().endsWith('.rtfd');
    
    // Additional exclusions for other unwanted file types
    const isUnwantedFile = file.name && (
      file.name.toLowerCase().endsWith('.rtfd') ||
      file.name.toLowerCase().endsWith('.rtf') ||
      file.name.toLowerCase().endsWith('.pages') ||
      file.name.toLowerCase().endsWith('.numbers') ||
      file.name.toLowerCase().endsWith('.key')
    );
    
    return isGoogleFolder && !isUnwantedFile;
  });
  
  return filteredFolders;
}

const ConfigureDriveModal = ({ 
  setIsModalOpen, 
  googleAccessToken, 
  triggerRef,
  index,
  setIsUpdating
}: { 
  setIsModalOpen: (isOpen: boolean) => void, 
  googleAccessToken: string | null, 
  triggerRef: React.RefObject<HTMLDivElement | null>,
  index: number | undefined,
  setIsUpdating: (updating: boolean) => void
}) => {
  const [folders, setFolders] = useState<GoogleFolder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
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
    const loadFolders = async () => {
      if (!googleAccessToken) return;
      
      setIsLoading(true);
      setIsError(false);
      
      try {
        const folderList = await fetchGoogleDriveFolders(googleAccessToken);
        setFolders(folderList);
      } catch (error) {
        console.error('Error fetching folders:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadFolders();
  }, [googleAccessToken]);

  const handleFolderSelect = async (folder: GoogleFolder) => {
    setIsModalOpen(false);
    try {
      setIsUpdating(true);
      await updateActionsMetadata({
        zapId,
        metaData: {
          folderId: folder.id,
          folderName: folder.name,
        },
        index
      });
      if (typeof index === 'number') {
        const newMeta = { folderId: folder.id, folderName: folder.name } as unknown as JSON;
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
        <span className="text-sm font-bold">Select folder from Google Drive</span>
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
            <p className="text-sm text-red-600">Error fetching folders</p>
          )}
          {!isLoading && !isError && folders.length === 0 && (
            <p className="text-sm text-gray-500">No folders found in your Google Drive</p>
          )}
          {!isLoading && !isError && folders.length > 0 && (
            <ul className="space-y-1">
              {folders.map((folder) => (
                <li 
                  onClick={() => handleFolderSelect(folder)}
                  key={folder.id} 
                  className="p-2 text-sm hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="min-w-4 min-h-4 border-2 border-gray-400 rounded-full cursor-pointer hover:border-gray-600"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{folder.name}</span>
                      <span className="text-xs text-gray-500">{`ID: ${folder.id}`}</span>
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

export default ConfigureDriveModal;