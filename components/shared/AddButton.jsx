"use client"
import { useRouter } from "next/navigation";
import React from "react";

const AddButton = ({ title = "Add", children , route}) => {
  const router = useRouter();
  //   const navigate = useNavigate();

  return (
    <button type="button" className="btn btn-dark py-1.5" onClick={() => router.push(route)}>
      {children || title}
    </button>
  );
};

export default AddButton;
