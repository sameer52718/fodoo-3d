import Textinput from "@/components/ui/Textinput";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import  handleError  from "@/lib/handleError";
import { toast } from "react-toastify";
import SubmitButton from "@/components/ui/SubmitButton";
import axiosInstance from "@/lib/axiosInstance";

const schema = yup.object({
  password: yup.string().required("Current password is Required"),
  newPassword: yup.string().required("New password is Required"),
  cpassword: yup.string().oneOf([yup.ref("newPassword"), null], "Passwords must match"),
});

const Password = () => {
  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
  } = useForm({ resolver: yupResolver(schema), mode: "all" });

  const onSubmit = async (values) => {
    try {
      const { data } = await axiosInstance.post("/profile/change-password", values);
      if (!data.error) {
        toast.success(data.message);
        reset();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      handleError(error);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full p-2 md:p-4 ">
      <div className="input-area">
        <div className="input-item mb-3 md:mb-5 flex-1 ">
          <Textinput
            placeholder="Enter Your Current Password"
            label="Current Password"
            type="password"
            name={"password"}
            register={register}
            error={errors.password}
            hasicon
            isRequired
          />
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <div className="input-item mb-3 md:mb-5 flex-1 ">
            <Textinput
              placeholder="Enter Your Password"
              label="New Password"
              type="password"
              name={"newPassword"}
              register={register}
              error={errors.newPassword}
              hasicon
              isRequired
            />
          </div>
          <div className="input-item mb-3 md:mb-5 flex-1">
            <Textinput
              placeholder="Confirm Your Password"
              label="Confirm Passoword"
              type="password"
              name={"cpassword"}
              register={register}
              error={errors.cpassword}
              hasicon
              isRequired
            />
          </div>
        </div>

        <div className="signin-area mb-3.5">
          <div className="flex justify-end">
            <SubmitButton isSubmitting={isSubmitting}>Update</SubmitButton>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Password;