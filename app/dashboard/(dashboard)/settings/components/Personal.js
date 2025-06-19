import Textinput from "@/components/ui/Textinput";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import SubmitButton from "@/components/ui/SubmitButton";
import handleError from "@/lib/handleError";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axiosInstance";

const schema = yup.object({
    name: yup.string().required("Name is Required").optional(),
    email: yup.string().required("Email is Required").optional(),
});

const Personal = () => {
    const { user } = useSelector((state) => state.auth);

    const {
        register,
        formState: { errors, isSubmitting },
        handleSubmit,
        reset,
    } = useForm({ resolver: yupResolver(schema), mode: "all" });

    useEffect(() => {
        const { name, phone, email } = user;
        reset({ name, phone, email });
    }, []);

    const onSubmit = async (values) => {
        try {
            const { data } = await axiosInstance.post("/profile", values);
            if (!data.error) {
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            handleError(error);
        }
    };
    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full p-2 md:p-4 ">
                <div className="input-area">
                    <div className="input-item mb-3 md:mb-5 flex-1 ">
                        <Textinput
                            placeholder="Enter Your Name"
                            label="Name"
                            type="text"
                            name={"name"}
                            register={register}
                            error={errors.name}
                            isRequired
                        />
                    </div>
                    <div className="flex flex-col md:flex-row gap-2">
                        <div className="input-item mb-3 md:mb-5 flex-1 ">
                            <Textinput
                                placeholder="Enter Your Email"
                                label="Email"
                                type="email"
                                name={"email"}
                                register={register}
                                error={errors.email}
                                disabled
                                isRequired
                            />
                        </div>
                        <div className="input-item mb-3 md:mb-5 flex-1 ">
                            <Textinput
                                placeholder="Enter Your Phone"
                                label="Phone"
                                type="number"
                                name={"phone"}
                                register={register}
                                error={errors.phone}
                                isRequired
                            />
                        </div>
                    </div>
                    <div className="signin-area mb-3.5">
                        <div className="flex justify-end">
                            <SubmitButton isSubmitting={isSubmitting} className={"btn btn-primary py-2 px-4"}>
                                Update
                            </SubmitButton>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
};

export default Personal;