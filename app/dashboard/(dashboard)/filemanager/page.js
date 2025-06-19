"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
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
  const [folderPath, setFolderPath] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isFolderCreating, setIsFolderCreating] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchFolders = async () => {
    setIsLoadingFolders(true);
    try {
      const res = await axiosInstance.get("/folders", {
        params: { parent: currentFolder?._id || null },
      });
      setFolders(res.data.folders);
    } catch (error) {
      toast.error("Failed to fetch folders");
    } finally {
      setIsLoadingFolders(false);
    }
  };

  const fetchFiles = async () => {
    if (!currentFolder) {
      setFiles([]);
      setIsLoadingFiles(false);
      return;
    }
    setIsLoadingFiles(true);
    try {
      const res = await axiosInstance.get("/files", {
        params: { folder: currentFolder._id },
      });
      let filteredFiles = res.data.files;
      if (selectedCategory) {
        filteredFiles = filteredFiles.filter((file) => file.category?._id === selectedCategory);
      }
      setFiles(filteredFiles);
    } catch (error) {
      toast.error("Failed to fetch files");
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get("/category", {
        params: { limit: -1 },
      });
      setCategories(res.data.categories);
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    fetchFolders();
    fetchFiles();
    fetchCategories();
  }, [currentFolder, selectedCategory]);

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

  const navigateToFolder = async (folder) => {
    setCurrentFolder(folder);
    setFolders([]);
    setFiles([]);
  };

  const uploadFile = async (data) => {
    if (!data || !currentFolder) return toast.error("Please select a file and folder");
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("link", data.link);
      formData.append("folder", currentFolder._id);
      if (data.category) formData.append("category", data.category);
      if (data.thumbnail) formData.append("thumbnail", data.thumbnail);

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

  const getThumbnailUrl = (thumbnailKey) => {
    if (!thumbnailKey) return "https://via.placeholder.com/100";
    return `${process.env.NEXT_PUBLIC_S3_URL}${thumbnailKey}`;
  };

  return (
    <div className="p-4 sm:p-6 max-w-[90rem] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">File Manager</h1>
        {role === "ADMIN" && (
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {currentFolder && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="New Folder Name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="border p-2 rounded w-full sm:w-48 text-sm"
                />
                <SubmitButton
                  onClick={createFolder}
                  type="button"
                  isSubmitting={isFolderCreating}
                  className="bg-purple-500 text-white p-2 rounded hover:bg-purple-600 transition-colors"
                >
                  <Plus size={18} />
                </SubmitButton>
              </div>
            )}
            {currentFolder && (
              <button
                onClick={() => setIsActive(true)}
                className="bg-purple-500 text-white p-2 rounded flex items-center gap-2 hover:bg-purple-600 transition-colors text-sm w-full sm:w-auto justify-center"
              >
                <Plus size={18} /> Add Link
              </button>
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

      {currentFolder && (
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-sm ${
              !selectedCategory ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-700"
            } hover:bg-purple-400 hover:text-white transition-colors`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => setSelectedCategory(category._id)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === category._id ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-700"
              } hover:bg-purple-400 hover:text-white transition-colors`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      <div className="mb-6">
        {isLoadingFolders ? (
          <div className="text-center text-gray-500 text-sm">Loading folders...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <div
                key={folder._id}
                className="border p-4 rounded flex items-center justify-between hover:bg-gray-100 cursor-pointer transition-colors"
                onDoubleClick={() => navigateToFolder(folder)}
              >
                <div className="flex items-center gap-2">
                  <Folder size={20} />
                  <span className="text-sm truncate max-w-[150px]">{folder.name}</span>
                </div>
                {role === "ADMIN" && currentFolder && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFolder(folder._id);
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {currentFolder && (
        <div className="mb-6">
          {isLoadingFiles ? (
            <div className="text-center text-gray-500 text-sm">Loading files...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {files.map((file) => (
                <div
                  key={file._id}
                  className="border p-4 rounded flex flex-col gap-2 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-center">
                    <Image
                      src={getThumbnailUrl(file.thumbnailKey)}
                      alt={file.name}
                      width={200}
                      height={192}
                      className="w-full h-48 object-cover rounded"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <File size={20} />
                    <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Category: {file.category?.name || "No Category"}
                  </div>
                  <div className="flex gap-2">
                    {(role === "ADMIN" || file.uploadedBy === user?._id) && (
                      <button
                        title={file.isPublic ? "Make Private" : "Make Public"}
                        onClick={() => toggleFilePrivacy(file._id, file.isPublic)}
                        className={`p-2 rounded ${file.isPublic ? "bg-green-500" : "bg-red-500"} text-white hover:opacity-80 transition-opacity`}
                      >
                        {file.isPublic ? <Unlock size={16} /> : <Lock size={16} />}
                      </button>
                    )}
                    <button
                      title="View"
                      onClick={() => window.open(file.s3Key, "_blank")}
                      className="p-2 rounded bg-purple-500 text-white hover:bg-purple-600 transition-colors"
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