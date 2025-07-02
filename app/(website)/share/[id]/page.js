"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const KuulaEmbed = () => {
  const { token } = useSelector((state) => state.auth);
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!id) return;

    const fetchFile = async () => {
      try {
        const res = await fetch(`/api/files/${id}`, {
          headers: {
            Authorization: token,
          },
        });
        if (res.status === 404) return setStatus("notfound");
        if (res.status === 403) return setStatus("unauthorized");
        if (!res.ok) throw new Error("Unexpected error");

        const data = await res.json();
        setFile(data.file);
        setStatus("ready");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    fetchFile();
  }, [id]);

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="flex items-center justify-center h-screen">
            <div className="text-gray-600 text-lg animate-pulse">Loading 3D view...</div>
          </div>
        );
      case "notfound":
        return (
          <div className="flex items-center justify-center h-screen bg-red-50 text-red-600 text-xl">
            File not found.
          </div>
        );
      case "unauthorized":
        return (
          <div className="flex items-center justify-center h-screen bg-yellow-50 text-yellow-700 text-xl">
            You do not have permission to view this file.
          </div>
        );
      case "error":
        return (
          <div className="flex items-center justify-center h-screen bg-gray-100 text-gray-700 text-xl">
            An unexpected error occurred. Please try again later.
          </div>
        );
      case "ready":
        return (
          <div className="w-full h-screen">
            <iframe
              title={file.name}
              src={file.s3Key}
              width="100%"
              height="100%"
              allowFullScreen
              className="border-none"
            ></iframe>
          </div>
        );
      default:
        return null;
    }
  };

  return renderContent();
};

export default KuulaEmbed;
