"use client";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Folder, File, Plus, Upload, Share2, Lock, Unlock, Trash2, Eye } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import AddLinkModal from "@/components/shared/AddLinkModal";
import SubmitButton from "@/components/ui/SubmitButton";
import handleError from "@/lib/handleError";

const FileManager = () => {
  const { userType: role, user } = useSelector((state) => state.auth);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([]); // For breadcrumb navigation
  const [newFolderName, setNewFolderName] = useState("");
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false); // Loading state for folders
  const [isLoadingFiles, setIsLoadingFiles] = useState(false); // Loading state for files
  const [isFolderCreating, setIsFolderCreating] = useState(false);
  const [categories, setCategories] = useState([]); // State for categories
  const [selectedCategory, setSelectedCategory] = useState(null); // State for selected category filter

  // Fetch folders
  const fetchFolders = async () => {
    setIsLoadingFolders(true); // Start loading
    try {
      const res = await axiosInstance.get("/folders", {
        params: { parent: currentFolder?._id || null },
      });
      setFolders(res.data.folders);
    } catch (error) {
      toast.error("Failed to fetch folders");
    } finally {
      setIsLoadingFolders(false); // Stop loading
    }
  };

  // Fetch files
  const fetchFiles = async () => {
    if (!currentFolder) {
      setFiles([]);
      setIsLoadingFiles(false); // No loading needed if no folder
      return;
    }
    setIsLoadingFiles(true); // Start loading
    try {
      const res = await axiosInstance.get("/files", {
        params: { folder: currentFolder._id },
      });
      let filteredFiles = res.data.files;
      if (selectedCategory) {
        filteredFiles = filteredFiles.filter(file => file.category?._id === selectedCategory);
      }
      setFiles(filteredFiles);
    } catch (error) {
      toast.error("Failed to fetch files");
    } finally {
      setIsLoadingFiles(false); // Stop loading
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get("/category", {
        params: { limit: -1 }, // Fetch all categories
      });
      setCategories(res.data.categories);
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    fetchFolders();
    fetchFiles();
    fetchCategories(); // Fetch categories on mount
  }, [currentFolder, selectedCategory]); // Re-fetch files when category changes

  // Folder operations
  const createFolder = async () => {
    if (!newFolderName.trim()) return toast.error("Folder name is required");
    try {
      setIsFolderCreating(true);
      await axiosInstance.post("/folders", {
        name: newFolderName.trim(),
        parent: currentFolder?._id || null,
      });
      setNewFolderName("");
      fetchFolders();
      toast.success("Folder created");
    } catch (error) {
      toast.error("Failed to create folder");
    } finally {
      setIsFolderCreating(false);
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
    setFolders([]);
    setFiles([]);
  };

  // File operations
  const uploadFile = async (data) => {
    if (!data || !currentFolder) return toast.error("Please select a file and folder");
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("link", data.link);
      formData.append("folder", currentFolder._id);
      if (data.category) formData.append("category", data.category);
      if (data.thumbnail) formData.append("thumbnail", data.thumbnail); // Append thumbnail file

      await axiosInstance.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
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

  // Construct S3 URL for thumbnail (replace with your S3 bucket URL)
  const getThumbnailUrl = (thumbnailKey) => {
    if (!thumbnailKey) return "https://via.placeholder.com/100"; // Placeholder image
    return `${process.env.NEXT_PUBLIC_S3_URL}${thumbnailKey}`; // Replace with your S3 bucket URL
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">File Manager</h1>
        {role === "ADMIN" && (
          <div className="flex gap-4">
            {currentFolder && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="New Folder Name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="border p-2 rounded"
                />
                <SubmitButton onClick={createFolder} type="button" isSubmitting={isFolderCreating} className="bg-purple-700 text-white p-2 rounded">
                  <Plus size={20} />
                </SubmitButton>
              </div>
            )}
            {currentFolder && (
              <button
                onClick={() => setIsActive(true)}
                className="bg-purple-700 text-white p-2 rounded flex items-center gap-2"
              >
                <Plus size={20} /> Add Link
              </button>
            )}
            {/* Category Filter Pills */}
            {currentFolder && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1 rounded-full text-sm ${!selectedCategory ? "bg-purple-700 text-white" : "bg-gray-200 text-gray-700"}`}
                >
                  All Categories
                </button>

              </div>
            )}
          </div>
        )}
      </div>

      {/* Breadcrumb Navigation */}
      <div className="mb-4 flex items-center gap-2">
        <button onClick={() => navigateToFolder(null)} className="text-purple-700 hover:underline">
          Home
        </button>
      </div>

      {/* Folders */}
      <div className="mb-6">
        {isLoadingFolders ? (
          <div className="text-center text-gray-500">Loading folders...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                {role === "ADMIN" && currentFolder && (
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
        )}
      </div>
      {currentFolder && categories.map((category) => (
        <button
          key={category._id}
          onClick={() => setSelectedCategory(category._id)}
          className={`px-3 py-1 rounded-full text-sm mx-1 ${selectedCategory === category._id ? "bg-purple-700 text-white" : "bg-gray-200 text-gray-700"}`}
        >
          {category.name}
        </button>
      ))}
      {/* Files */}
      {currentFolder && (
        <div className="mb-6">
          {isLoadingFiles ? (
            <div className="text-center text-gray-500">Loading files...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map((file) => (
                <div key={file._id} className="border p-4 rounded flex flex-col gap-2 hover:bg-gray-100">
                  {/* Thumbnail */}
                  <div className="flex justify-center">
                    <img
                      src={getThumbnailUrl(file.thumbnailKey)}
                      alt={file.name}
                      className="w-full h-48 object-cover rounded"
                    />
                  </div>
                  {/* File Info */}
                  <div className="flex items-center gap-2">
                    <File size={24} />
                    <span>{file.name}</span>
                  </div>
                  {/* Category */}
                  <div className="text-sm text-gray-600">
                    Category: {file.category?.name || "No Category"}
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2">
                    {(role === "ADMIN" || file.uploadedBy === user?._id) && (<button
                      title={file.isPublic ? "Make Private" : "Make Public"}
                      onClick={() => toggleFilePrivacy(file._id, file.isPublic)}
                      className={`p-1 rounded ${file.isPublic ? "bg-green-500" : "bg-red-500"} text-white`}
                    >
                      {file.isPublic ? <Unlock size={16} /> : <Lock size={16} />}
                    </button>)}
                    <button
                      title={"View"}
                      onClick={() => window.open(file.s3Key, "_blank")}
                      className={`p-1 rounded bg-primary-500 text-white`}
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <AddLinkModal handleClose={() => setIsActive(false)} active={isActive} submitData={uploadFile} />
    </div>
  );
};

export default FileManager;