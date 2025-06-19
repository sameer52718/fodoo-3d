"use client";
import Link from "next/link";
import useDarkMode from "@/hooks/useDarkMode";
import React, { useState } from "react";
import Textinput from "@/components/ui/Textinput";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import Checkbox from "@/components/ui/Checkbox";
import handleError from "@/lib/handleError";
import axiosInstance from "@/lib/axiosInstance";
import SubmitButton from "@/components/ui/SubmitButton";
import { useDispatch } from "react-redux";
import { setAuth } from "@/store/auth";
import { userTypes } from "@/constant/data";
import { toast, ToastContainer } from "react-toastify";
const schema = yup
  .object({
    email: yup.string().email("Invalid email").required("Email is Required"),
    password: yup.string().required("Password is Required"),
    rememberMe: yup.boolean().default(false),
  })
  .required();
const Login2 = () => {
  const dispatch = useDispatch();
  const [isDark] = useDarkMode();

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    control,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "all",
  });
  const router = useRouter();
  const onSubmit = async (values) => {
    try {
      const { data } = await axiosInstance.post("/auth/login", values);
      if (!data.error) {
        const { user, token, role } = data;
        dispatch(setAuth({ user: user, token: token, userType: role }));
        router.replace("/dashboard");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <>
      <div className="loginwrapper ">
        <div className="lg-inner-column ">
          <div className="right-column relative">
            <div className="inner-content h-full flex justify-center items-center bg-purple-500">
              <div className="bg-white justify-center p-8 rounded-lg">
                <div className="w-full md:w-[400px]  flex flex-col justify-center ">
                  <div className="text-center 2xl:mb-10 mb-4">
                    <h4 className="font-medium">Sign in</h4>
                    <div className="text-slate-500 dark:text-slate-400 text-base">
                      Sign in to your account to start using Admin Dashboard
                    </div>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">
                    <Textinput
                      name="email"
                      label="email"
                      type="email"
                      register={register}
                      error={errors?.email}
                      placeholder="Enter your email address"
                      onChange={(e) => setValue("email", e.target.value)}
                    />
                    <Textinput
                      name="password"
                      label="passwrod"
                      type="password"
                      register={register}
                      error={errors.password}
                      placeholder="Enter your password"
                      onChange={(e) => setValue("password", e.target.value)}
                      hasicon
                    />
                    <div className="flex justify-between">
                      <Controller
                        control={control}
                        name="rememberMe"
                        render={({ field }) => (
                          <Checkbox
                            value={field.value}
                            onChange={() => field.onChange(!field.value)}
                            label="Keep me signed in"
                          />
                        )}
                      />

                      <Link
                        href="/dashboard/forgot"
                        className="text-sm text-slate-800 dark:text-slate-400 leading-6 font-medium"
                      >
                        Forgot Password?{" "}
                      </Link>
                    </div>
                    <SubmitButton
                      className="btn btn-primary block w-full text-center"
                      isSubmitting={isSubmitting}
                    >
                      Sign in
                    </SubmitButton>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Login2;
