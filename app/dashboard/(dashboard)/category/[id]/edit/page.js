"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import SubmitButton from "@/components/ui/SubmitButton";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosInstance";
import handleError from "@/lib/handleError";
import BackButton from "@/components/ui/BackButton";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const validationSchema = yup.object().shape({
  name: yup.string().required("Category Name is required"),
});

const CategoryForm = () => {
  const { id } = useParams();
  const router = useRouter();
  const isEdit = Boolean(id);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "all",
  });

  useEffect(() => {
    if (isEdit) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      const { data } = await axiosInstance.get(`/category/${id}`);
      const category = data.category;
      if (category) {
        setValue("name", category.name);
      }
    } catch (error) {
      handleError(error);
      router.push("/dashboard/category");
    }
  };

  const onSubmit = async (data) => {
    try {
      const res = isEdit
        ? await axiosInstance.put(`/category/${id}`, data)
        : await axiosInstance.post("/category", data);

      toast.success(res.data.message);
      router.push("/dashboard/category");
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Card title={isEdit ? "Edit Category" : "Create Category"} headerslot={<BackButton />}>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Textinput
          name="name"
          error={errors.name}
          label="Name"
          register={register}
          placeholder="Enter Category name"
          type="text"
          isRequired
          msgTooltip
          onChange={(e) => setValue("name", e.target.value)}
        />

        <div className="col-span-2 text-end">
          <SubmitButton type="submit" isSubmitting={isSubmitting}>
            {isEdit ? "Update" : "Create"}
          </SubmitButton>
        </div>
      </form>
    </Card>
  );
};

export default CategoryForm;
