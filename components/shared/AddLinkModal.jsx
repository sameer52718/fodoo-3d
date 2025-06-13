import PropTypes from "prop-types";
import Modal from "@/components/ui/Modal";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import SubmitButton from "@/components/ui/SubmitButton";
import Textinput from "@/components/ui/Textinput";

const schema = yup.object({
  name: yup.string().required("Name is Required"),
  link: yup.string().url().required("Link is Required"),
});

const AddLinkModal = ({ handleClose, active, submitData }) => {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm({ resolver: yupResolver(schema), mode: "onSubmit" });

  const onSubmit = async (data) => {
    await submitData?.(data);
    reset();
    handleClose();
  };

  return (
    <Modal
      title="Add Link"
      label=""
      labelClass="btn-outline-dark"
      activeModal={active}
      onClose={handleClose}
      themeClass="bg-purple-500"
      centered={true}
      noFade={false}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Textinput
          name={"name"}
          error={errors.name}
          onChange={(e) => setValue("name", e.target.value)}
          register={register}
          label={"Name"}
          msgTooltip
          type={"text"}
          placeholder="Add Name for Link"
        />
        <Textinput
          name={"link"}
          error={errors.link}
          onChange={(e) => setValue("link", e.target.value)}
          register={register}
          label={"Link"}
          msgTooltip
          type={"url"}
          placeholder="Add Link"
        />
        <SubmitButton isSubmitting={isSubmitting}>Submit</SubmitButton>
      </form>
    </Modal>
  );
};

export default AddLinkModal;
AddLinkModal.propTypes = {
  active: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  submitData: PropTypes.func.isRequired,
};
