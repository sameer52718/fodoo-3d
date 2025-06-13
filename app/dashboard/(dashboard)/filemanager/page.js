"use client";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Folder, File, Plus, Upload, Share2, Lock, Unlock, Trash2 } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import AddLinkModal from "@/components/shared/AddLinkModal";

const FileManager = () => {
  const { userType: role } = useSelector((state) => state.auth);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([]); // For breadcrumb navigation
  const [newFolderName, setNewFolderName] = useState("");
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [isActive, setIsActive] = useState(false);

  // Fetch folders and files
  const fetchFolders = async () => {
    try {
      const res = await axiosInstance.get("/folders", {
        params: { parent: currentFolder?._id || null },
      });
      setFolders(res.data.folders);
    } catch (error) {
      toast.error("Failed to fetch folders");
    }
  };

  const fetchFiles = async () => {
    if (!currentFolder) {
      setFiles([]);
      return;
    }
    try {
      const res = await axiosInstance.get("/files", {
        params: { folder: currentFolder._id },
      });
      setFiles(res.data.files);
    } catch (error) {
      toast.error("Failed to fetch files");
    }
  };

  useEffect(() => {
    fetchFolders();
    fetchFiles();
  }, [currentFolder]);

  // Folder operations
  const createFolder = async () => {
    if (!newFolderName) return toast.error("Folder name is required");
    try {
      await axiosInstance.post("/folders", {
        name: newFolderName,
        parent: currentFolder?._id || null,
      });
      setNewFolderName("");
      fetchFolders();
      toast.success("Folder created");
    } catch (error) {
      toast.error("Failed to create folder");
    }
  };

  const deleteFolder = async (folderId) => {
    try {
      await axiosInstance.delete(`/folders/${folderId}`);
      fetchFolders();
      toast.success("Folder deleted");
    } catch (error) {
      toast.error("Failed to delete folder");
    }
  };

  // Navigate to a folder on double-click
  const navigateToFolder = async (folder) => {
    setCurrentFolder(folder);
  };

  // File operations
  const uploadFile = async (data) => {
    if (!data || !currentFolder) return toast.error("Please select a file and folder");
    try {
      await axiosInstance.post("/files/upload", { ...data, folder: currentFolder._id });
      fetchFiles();
      toast.success("Link uploaded");
    } catch (error) {
      toast.error("Failed to upload Link");
    }
  };

  const toggleFilePrivacy = async (fileId, isPublic) => {
    try {
      await axiosInstance.patch(`/files/${fileId}/privacy`, { isPublic: !isPublic });
      fetchFiles();
      toast.success(`File marked as ${!isPublic ? "public" : "private"}`);
    } catch (error) {
      toast.error("Failed to update privacy");
    }
  };

  const generateShareLink = async (fileId) => {
    try {
      const res = await axiosInstance.post(`/files/${fileId}/share`);
      console.log(res.data.shareLink);

      navigator.clipboard.writeText(res.data.shareLink);
      toast.success("Share link copied to clipboard");
    } catch (error) {
      toast.error("Failed to generate share link");
    }
  };

  // User assignment
  const assignUserToFolder = async (userId, folderId) => {
    try {
      await axiosInstance.patch(`/folders/${folderId}/assign`, { userId });
      fetchFolders();
      toast.success("User assigned to folder");
    } catch (error) {
      toast.error("Failed to assign user");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">File Manager</h1>
        {role === "ADMIN" && (
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="New Folder Name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="border p-2 rounded"
              />
              <button onClick={createFolder} className="bg-blue-500 text-white p-2 rounded">
                <Plus size={20} />
              </button>
            </div>
            {currentFolder && (
              <button
                onClick={() => setIsActive(true)}
                className="bg-blue-500 text-white p-2 rounded flex items-center gap-2"
              >
                <Plus size={20} /> Add Link
              </button>
            )}
          </div>
        )}
      </div>

      {/* Breadcrumb Navigation */}
      <div className="mb-4 flex items-center gap-2">
        <button onClick={() => navigateToFolder(null)} className="text-blue-500 hover:underline">
          Home
        </button>
      </div>

      {/* Folders */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {folders.map((folder) => (
          <div
            key={folder._id}
            className="border p-4 rounded flex items-center justify-between hover:bg-gray-100 cursor-pointer"
            onDoubleClick={() => navigateToFolder(folder)}
          >
            <div className="flex items-center gap-2">
              <Folder size={24} />
              <span>{folder.name}</span>
            </div>
            {role === "ADMIN" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFolder(folder._id);
                }}
                className="text-red-500"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Files */}
      {currentFolder && (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file) => (
              <div key={file._id} className="border p-4 rounded flex flex-col gap-2 hover:bg-gray-100">
                <div className="flex items-center gap-2">
                  <File size={24} />
                  <span>{file.name}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    title={file.isPublic ? "Make Private" : "Make Public"}
                    onClick={() => toggleFilePrivacy(file._id, file.isPublic)}
                    className={`p-1 rounded ${file.isPublic ? "bg-green-500" : "bg-red-500"} text-white`}
                  >
                    {file.isPublic ? <Unlock size={16} /> : <Lock size={16} />}
                  </button>
                  {/* <button
                    onClick={() => generateShareLink(file._id)}
                    className="p-1 bg-blue-500 text-white rounded"
                  >
                    <Share2 size={16} />
                  </button> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin: User Assignment */}
      {role === "ADMIN" && currentFolder && (
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Assign Users to Folder</h2>
          {/* Implement user selection and assignment UI */}
        </div>
      )}
      <AddLinkModal handleClose={() => setIsActive(false)} active={isActive} submitData={uploadFile} />
    </div>
  );
};

export default FileManager;
