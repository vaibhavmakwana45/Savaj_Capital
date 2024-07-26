import React, { useState, useEffect } from "react";
import "./file.scss";
import Loader from "react-js-loader";
import {
  FormControl,
  FormLabel,
  Flex,
  IconButton,
  Button,
  Input,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Checkbox,
  Select,
  Box,
  Tooltip,
  Text,
} from "@chakra-ui/react";
import { CircularProgress } from "@material-ui/core";
import { TiArrowMaximise, TiArrowMinimise } from "react-icons/ti";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import AxiosInstance from "config/AxiosInstance";
import { useLocation } from "react-router-dom";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Form, Table } from "reactstrap";
import { AiOutlineClose } from "react-icons/ai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Icon } from "@chakra-ui/react";
import {
  FaUndo,
  FaWhatsapp,
  FaEnvelope,
  FaFolder,
  FaInfoCircle,
} from "react-icons/fa";
import {
  faChevronDown,
  faChevronUp,
  faEdit,
  faTrashAlt,
  faMaximize,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useForm } from "react-hook-form";
import { jsPDF } from "jspdf";
import { jwtDecode } from "jwt-decode";

function ViewFile() {
  const location = useLocation();
  const history = useHistory();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
  const [fileData, setFileData] = useState(null);
  const [loanStatus, setLoanStatus] = useState(null);
  const [fileBankAssignData, setFileBankAssignData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessType, setAccessType] = useState("");

  React.useEffect(() => {
    const jwt = jwtDecode(localStorage.getItem("authToken"));
    setAccessType(jwt._id);
  }, []);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    isOpen: isOpensGuarantor,
    onOpen: onOpensGuarantor,
    onClose: onClosesGuarantor,
  } = useDisclosure();

  const {
    isOpen: isOpensLogs,
    onOpen: onOpensLogs,
    onClose: onClosesLogs,
  } = useDisclosure();

  const [logs, setLogs] = useState([]);
  const [logMessage, setLogMessage] = useState("");
  const basePath = "https://cdn.savajcapital.com/cdn/files/";
  const [openPanelIndex, setOpenPanelIndex] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);

  const handleAccordionClickDocument = (index) => {
    setOpenPanelIndex(index === openPanelIndex ? -1 : index);
  };
  const [selectedFolder, setSelectedFolder] = useState(null);
  const handleFolderClick = (folder) => {
    setSelectedFolder(folder);
  };

  const handleBackClick = () => {
    setSelectedFolder(null);
  };

  const handleFileClick = (file) => {
    setSelectedFile(file);
    setIsMaximized(false);
  };

  const handleCloseModal = () => {
    setSelectedFile(null);
    setIsMaximized(false);
  };

  const handleDownload = async () => {
    if (selectedFile) {
      try {
        const fileHandle = await window.showSaveFilePicker();
        const writableStream = await fileHandle.createWritable();
        const response = await fetch(`${basePath}${selectedFile.file_path}`);
        const blob = await response.blob();
        await writableStream.write(blob);
        await writableStream.close();
      } catch (error) {
        console.error("Error downloading file:", error);
      }
    }
  };

  const handleConvertToPdf = () => {
    if (selectedFile && !selectedFile.file_path.endsWith(".pdf")) {
      const pdf = new jsPDF();
      pdf.addImage(
        `https://cdn.savajcapital.com/api/upload/${selectedFile.file_path}`,
        "JPEG",
        15,
        40,
        180,
        160
      );
      pdf.save(`${selectedFile.loan_document_id}.pdf`);
    }
  };

  const handleShareWhatsApp = () => {
    const url = `${basePath}${selectedFile.file_path}`;
    const message = `Check out this document: ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  // const handleShareEmail = () => {
  //   const url = `${basePath}${selectedFile.file_path}`;
  //   const subject = "Check out this document";
  //   const body = `Here is the link to the document: ${url}`;
  //   const mailtoUrl = `mailto:?subject=${encodeURIComponent(
  //     subject
  //   )}&body=${encodeURIComponent(body)}`;
  //   window.open(mailtoUrl, "_blank");
  // };

  const handleShareEmail = () => {
    const documentUrl = 'https://cdn.savajcapital.com/cdn/files/20240622120000_1.PNG';
    const subject = "Check out this document";
    const body = `
      Here is the image:\n\n
      [Shared Image](${documentUrl})\n\n
      Click the link to view/download the image: ${documentUrl}
    `;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, "_blank");
  };
  

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const [formData, setFormData] = useState({
    user_id: "",
    file_id: "",
    username: "",
    number: "",
    email: "",
    pan_card: "",
    aadhar_card: "",
    unit_address: "",
    occupation: "",
    reference: "",
  });

  const handleAddGuarantor = () => {
    setIsEditMode(false);
    setFormData({
      user_id: "",
      file_id: "",
      username: "",
      number: "",
      email: "",
      pan_card: "",
      aadhar_card: "",
      unit_address: "",
      occupation: "",
      reference: "",
    });
    onOpen();
  };

  const [isEditMode, setIsEditMode] = useState(false);
  const [currentGuarantorId, setCurrentGuarantorId] = useState(null);

  const handleEditGuarantor = (guarantor) => {
    setIsEditMode(true);
    setCurrentGuarantorId(guarantor.guarantor_id);
    setFormData(guarantor);

    for (const key in guarantor) {
      setValue(key, guarantor[key]);
    }
    onOpen();
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGuarantorId, setSelectedGuarantorId] = useState(null);

  const openDeleteModal = (id) => {
    setSelectedGuarantorId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };
  const handleDeleteGuarantor = async () => {
    if (selectedGuarantorId) {
      try {
        const response = await AxiosInstance.delete(
          `/add-guarantor/delete-guarantor/${selectedGuarantorId}`
        );
        const { success, message } = response.data;
        if (success) {
          toast.success(message);
          setGuarantors((prevGuarantors) =>
            prevGuarantors.filter((g) => g.guarantor_id !== selectedGuarantorId)
          );
        } else {
          toast.error(message);
        }
        closeDeleteModal();
      } catch (error) {
        console.error("Error deleting guarantor:", error);
        if (error.response && error.response.status === 400) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Please try again later!");
        }
        closeDeleteModal();
      }
    }
  };

  const fetchData = async () => {
    try {
      const response = await AxiosInstance.get(
        "/file_upload/file_upload/" + id
      );
      setFileData(response.data.data.file);
      setLoanStatus(response.data.data.loanStatus);
      setFileBankAssignData(response.data.data.bankApproval);
      setLogs(response.data.data.file.logs || []);
    } catch (error) {
      console.error("Error fetching file data:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
    fetchStepsData();
  }, [id]);

  const [isOpenGuarantor, setIsOpenGuarantor] = useState(false);

  const handleAccordionClick = () => {
    setIsOpenGuarantor(!isOpenGuarantor);
  };
  const [guarantors, setGuarantors] = useState([]);

  useEffect(() => {
    const fetchGuarantors = async () => {
      try {
        const response = await AxiosInstance.get(
          `/add-guarantor/guarantors/${id}`
        );
        setGuarantors(response.data.data);
      } catch (error) {
        console.error("Failed to fetch guarantors", error);
      }
    };

    fetchGuarantors();
  }, []);

  const uploadImageToCDN = async (file) => {
    const formData = new FormData();
    formData.append("files", file);

    try {
      const response = await axios.post(
        "https://cdn.savajcapital.com/api/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data && response.data.files && response.data.files.length) {
        const uploadedFilesInfo = response.data.files.map(
          (file) => file.filename
        );
        return uploadedFilesInfo[0];
      } else {
        throw new Error("No files were processed.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const [stepData, setStepData] = useState([]);
  const [stepLoader, setStepLoader] = useState(false);
  const [open, setOpen] = useState({
    is: false,
    data: {},
    index: "",
    guarantors: [],
  });

  const [selectedGuarantor, setSelectedGuarantor] = useState();
  const [selectedGuarantorID, setSelectedGuarantorID] = useState([]);

  const processStepsData = (data) => {
    let rejected = false;
    return data.map((item) => {
      if (rejected) {
        return { ...item, status: "reject" };
      }
      if (item.status === "reject") {
        rejected = true;
      }
      return item;
    });
  };

  const fetchStepsData = async () => {
    try {
      setStepLoader(true);
      const response = await AxiosInstance.get(`/loan_step/get_steps/${id}`);
      // const processedData = processStepsData(response.data.data);
      // setStepData(processedData);
      setStepData(response.data.data);
      setStepLoader(false);
    } catch (error) {
      console.error("Error: ", error.message);
      setStepLoader(false);
    }
  };

  useEffect(() => {
    fetchStepsData();
  }, []);

  const allPreviousComplete = (stepData, currentIndex) => {
    for (let i = 0; i < currentIndex; i++) {
      if (stepData[i]?.status !== "complete") {
        return false;
      }
    }
    return true;
  };

  const handleChange = async (e, index, dataIndex = null) => {
    const { name, value, checked, type, files } = e.target;
    const newData = { ...open.data };
    const inputs =
      dataIndex !== null
        ? [...newData.guarantorSteps[dataIndex].inputs]
        : [...newData.inputs];

    if (type === "checkbox") {
      inputs[index].value = checked;
      inputs[index].is_required = false;
    } else if (type === "text") {
      inputs[index].value = value;
      inputs[index].is_required = value === "";
    } else if (type === "file") {
      if (files.length > 0) {
        try {
          const uploadedFilePath = await uploadImageToCDN(files[0]);
          inputs[index].value = uploadedFilePath;
          inputs[index].is_required = false;
        } catch (error) {
          console.error("Failed to upload file:", error);
        }
      } else {
        inputs[index].is_required = true;
      }
    }

    if (dataIndex !== null) {
      newData.guarantorSteps[dataIndex].inputs = inputs;
    } else {
      newData.inputs = inputs;
    }

    setOpen({ ...open, data: newData });
  };

  const handleClick = (newData) => {
    const updatedInputs = newData.data.inputs.map((item) => {
      if (item.type === "input" || item.type === "file") {
        return { ...item, value: "" };
      }
      if (item.type === "checkbox") {
        return { ...item, value: false };
      }
      return item;
    });

    setModalOpen((prevState) => ({
      ...prevState,
      data: prevState?.data
        ? [
            ...prevState.data,
            {
              ...newData,
              is: false,
              data: {
                ...newData.data,
                inputs: updatedInputs,
              },
            },
          ]
        : [
            {
              ...newData,
              is: false,
              data: {
                ...newData.data,
                inputs: updatedInputs,
              },
            },
          ],
    }));
  };

  const addUserToModel = () => {
    setModalOpen((prevState) => {
      if (!prevState?.data || prevState.data.length === 0) {
        return prevState;
      }

      const updatedData = [...prevState.data];
      const selectedId = selectedGuarantorID[selectedGuarantorID.length - 1];
      const selectedGuarantor = guarantors.find(
        (g) => g.guarantor_id === selectedId
      );

      if (!selectedGuarantor) {
        return prevState;
      }

      updatedData[updatedData.length - 1] = {
        ...updatedData[updatedData.length - 1],
        is: true,
        username: selectedGuarantor.username,
        guarantorId: selectedGuarantor.guarantor_id,
      };

      return {
        ...prevState,
        data: updatedData,
      };
    });
  };

  const [modalOpen, setModalOpen] = useState(null);

  const handleModalChange = async (e, dataIndex, inputIndex) => {
    const { type, value, checked, files } = e.target;

    if (type === "file" && files.length > 0) {
      try {
        const uploadedFilePath = await uploadImageToCDN(files[0]);
        setModalOpen((prevState) => {
          if (!prevState || !prevState.data) {
            console.error("Modal state is not properly initialized.");
            return prevState;
          }

          const updatedData = [...prevState.data];
          const updatedInputs = [...updatedData[dataIndex].data.inputs];
          updatedInputs[inputIndex].value = uploadedFilePath;
          updatedInputs[inputIndex].is_required = false;

          return {
            ...prevState,
            data: updatedData,
          };
        });
      } catch (error) {
        console.error("Failed to upload file:", error);
      }
      return;
    }

    setModalOpen((prevState) => {
      if (!prevState || !prevState.data) {
        console.error("Modal state is not properly initialized.");
        return prevState;
      }

      const updatedData = [...prevState.data];
      const updatedInputs = [...updatedData[dataIndex].data.inputs];

      if (type === "checkbox") {
        updatedInputs[inputIndex].value = checked;
        updatedInputs[inputIndex].is_required = false;
      } else if (type === "text") {
        updatedInputs[inputIndex].value = value;
        updatedInputs[inputIndex].is_required = value === "";
      } else {
        updatedInputs[inputIndex].value = value;
      }

      updatedData[dataIndex].data.inputs = updatedInputs;

      return {
        ...prevState,
        data: updatedData,
      };
    });
  };

  const submitStep = async () => {
    try {
      const updatedData = {
        ...open.data,
        status: "complete",
      };

      const isNumeric = open.data.inputs
        .filter(
          (input) =>
            input.label === "Amount" || input.label === "APPROVAL AMOUNT"
        )
        .every((input) => !isNaN(parseFloat(input.value)));

      if (!isNumeric) {
        toast.error("Amount must be numeric.");
        return;
      }

      await AxiosInstance.post(`/loan_step/steps/${id}`, updatedData);

      const userId = open.data.user_id;

      if (open.data.loan_step_id === "1715348482585") {
        const cibilScore = open.data.inputs.find(
          (input) => input.label === "Cibil Score"
        )?.value;

        const formData = {
          cibil_score: cibilScore,
        };

        await AxiosInstance.put(`/addusers/edituser/${userId}`, formData);
      }

      if (open.data.loan_step_id === "1715348798228") {
        await AxiosInstance.put(`/file_upload/updatestatus/${id}`, {
          status: "1718861579508",
        });
      }

      fetchData();
      fetchStepsData();
      setOpen({ is: false, data: {}, index: "" });
    } catch (error) {
      console.error("Error: ", error.message);
    }
  };

  const submitGuarantorStep = async () => {
    try {
      if (open.data && open.data.guarantorSteps) {
        for (const guarantor of open.data.guarantorSteps) {
          await AxiosInstance.post(
            `/guarantor-step/guarantor-step/${id}`,
            guarantor
          );
        }
      }

      if (modalOpen && modalOpen.data) {
        for (const item of modalOpen.data) {
          const final = {
            ...item.data,
            guarantor_id: item.guarantorId,
          };
          await AxiosInstance.post(
            `/guarantor-step/guarantor-step/${id}`,
            final
          );
        }
      }

      await fetchData();
      await fetchStepsData();
      setModalOpen({ data: [] });
      setOpen({ is: false, data: {}, index: "", guarantors: [] });
    } catch (error) {
      console.error("Error: ", error.message);
    }
  };

  const removeGuarantorStep = async (dataIndex, stepType = "open") => {
    if (stepType === "open") {
      const guarantorStep = open.data.guarantorSteps[dataIndex];
      try {
        await AxiosInstance.delete(
          `/guarantor-step/guarantor-step/${guarantorStep.loan_step_id}/${guarantorStep.guarantor_id}`
        );
      } catch (error) {
        console.error("Failed to delete guarantor step:", error.message);
      }
      setOpen((prevState) => {
        const updatedGuarantorSteps = prevState.data.guarantorSteps.filter(
          (_, i) => i !== dataIndex
        );
        return {
          ...prevState,
          data: {
            ...prevState.data,
            guarantorSteps: updatedGuarantorSteps,
          },
        };
      });
    } else if (stepType === "modalOpen") {
      setModalOpen((prevState) => {
        const updatedData = prevState.data.filter((_, i) => i !== dataIndex);
        return {
          ...prevState,
          data: updatedData,
        };
      });
    }
  };
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectMessage, setRejectMessage] = useState("");

  const handleReject = () => {
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    try {
      if (!rejectMessage.trim()) {
        toast.error("Please provide a reason for rejection.");
        return;
      }
      const updatedStepData = {
        ...open.data,
        status: "reject",
        statusMessage: rejectMessage,
      };

      const response = await AxiosInstance.post(
        `/loan_step/steps/${id}`,
        updatedStepData
      );

      await AxiosInstance.put(`/file_upload/updatestatus/${id}`, {
        status: "1718861593296",
      });
      if (response.status === 200) {
        fetchStepsData();
        setRejectModalOpen(false);
        setOpen({ is: false, data: {}, index: "" });
        setRejectMessage("");
      } else {
        console.error("Failed to update status.");
      }
    } catch (error) {
      console.error("Error: ", error.message);
    }
  };

  const closeRejectModal = () => {
    setRejectModalOpen(false);
    setRejectMessage("");
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Loader
          type="spinner-circle"
          bgColor={"#3182CE"}
          color={"black"}
          size={50}
        />
      </Flex>
    );
  }

  function copyText(elementId) {
    var textToCopy = document.getElementById(elementId).innerText;
    var tempInput = document.createElement("input");
    tempInput.setAttribute("value", textToCopy);
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    var messageElement = document.createElement("div");
    messageElement.innerText = "Copied!";
    messageElement.style.color = "green";
    var clickedSpan = document.getElementById(elementId);
    clickedSpan.parentNode.insertBefore(
      messageElement,
      clickedSpan.nextSibling
    );
    setTimeout(function () {
      messageElement.parentNode.removeChild(messageElement);
    }, 2000);
  }

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      user_id: fileData.user_id,
      file_id: fileData.file_id,
    };

    try {
      if (isEditMode) {
        await AxiosInstance.put(
          `/add-guarantor/update-guarantor/${currentGuarantorId}`,
          payload
        );
        toast.success("Guarantor Updated Successfully!");
        setGuarantors((prev) =>
          prev.map((g) =>
            g.guarantor_id === currentGuarantorId ? { ...g, ...payload } : g
          )
        );
      } else {
        const { data } = await AxiosInstance.post(
          "/add-guarantor/add-guarantor",
          payload
        );
        toast.success("Guarantor Added Successfully!");
        setGuarantors((prev) => [
          ...prev,
          { ...payload, guarantor_id: data.guarantor_id },
        ]);
      }

      onClose();
      fetchData();
      reset();
    } catch (error) {
      console.error("Error adding/updating guarantor:", error);
      toast.error("Please try again later!");
    }
  };
  const handleChangeGuarantor = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleadharChange = (e) => {
    const { name, value } = e.target;
    if (name === "aadhar_card" && /^\d{0,12}$/.test(value)) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handlePanChange = (e) => {
    const { name, value } = e.target;
    if (name === "pan_card" && value.toUpperCase().length <= 10) {
      setFormData({
        ...formData,
        [name]: value,
        [name]: value.toUpperCase(),
      });
    }
  };

  const isGuarantorAlreadyAdded = (guarantorId) => {
    const alreadyAddedInGuarantorSteps =
      open.data.guarantorSteps &&
      open.data.guarantorSteps.some(
        (guarantorStep) => guarantorStep.guarantor_id === guarantorId
      );

    const alreadyAddedInModal = modalOpen?.data?.some(
      (item) => item.guarantorId === guarantorId
    );

    return alreadyAddedInGuarantorSteps || alreadyAddedInModal;
  };

  const handleReverse = async () => {
    try {
      const updatedStepData = {
        ...open.data,
        status: "active",
        statusMessage: "",
      };

      const currentIndex = stepData.findIndex(
        (step) => step.loan_step_id === open.data.loan_step_id
      );

      let isCompleteStepFound = false;
      for (let i = currentIndex + 1; i < stepData.length; i++) {
        if (stepData[i]?.status === "complete") {
          isCompleteStepFound = true;
          break;
        }
      }

      if (isCompleteStepFound) {
        updatedStepData.status = "complete";
      } else {
        updatedStepData.status = "active";
      }

      const stepUpdateResponse = await AxiosInstance.post(
        `/loan_step/steps/${id}`,
        updatedStepData
      );

      if (updatedStepData.loan_step_id === "1715348651727") {
        const fileStatusUpdateResponse = await AxiosInstance.put(
          `/file_upload/updatestatus/${updatedStepData.file_id}`,
          {
            status:
              updatedStepData.status === "complete"
                ? "1718861579508"
                : "1718861587262",
          }
        );
      }

      if (stepUpdateResponse.status === 200) {
        fetchStepsData();
        setOpen({ is: false, data: {}, index: "" });
      } else {
        console.error("Failed to update step status.");
      }
    } catch (error) {
      console.error("Error: ", error.message);
    }
  };

  const handleAddLog = async () => {
    if (logMessage.trim()) {
      const newLog = {
        message: logMessage,
        timestamp: new Date().toISOString(),
        role: "superadmin",
        superadmin_id: accessType.superadmin_id,
      };

      try {
        const response = await AxiosInstance.put(`/file_upload/logs/${id}`, {
          logs: [newLog, ...logs],
        });

        setLogs(response.data.data.logs);
        setLogMessage("");
        toast.success("Log Added Successfully!");
      } catch (error) {
        console.error("Error adding log:", error);
        toast.error("Please try again later!");
      }
    }
  };

  const handleDeleteLog = async (logId) => {
    try {
      const response = await AxiosInstance.delete(
        `/file_upload/logs/${id}/${logId}`
      );

      if (response.data.success) {
        const updatedLogs = logs.filter((log) => log.log_id !== logId);
        setLogs(updatedLogs);
      } else {
        console.error("Failed to delete log:", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting log:", error);
    }
  };

  return (
    <div>
      {loading ? (
        <Flex justify="center" align="center" height="100vh">
          <Loader
            type="spinner-circle"
            bgColor={"#3182CE"}
            color={"black"}
            size={50}
          />
        </Flex>
      ) : (
        <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
          <Card overflowX={{ sm: "scroll", xl: "hidden" }}>
            <CardBody style={{ padding: "40px" }} className="cardss">
              <FormLabel
                className="mb-2 back-responsive ttext"
                style={{ fontSize: "20px" }}
              >
                <Flex
                  justifyContent="space-between"
                  alignItems="center"
                  className="thead"
                >
                  {/* Left Section */}
                  <Flex alignItems="center">
                    <IconButton
                      icon={<ArrowBackIcon />}
                      onClick={() => history.goBack()}
                      aria-label="Back"
                      mr="4"
                    />
                    <div>
                      <b>{fileData?.loan} File Details</b>
                      <b
                        style={{
                          backgroundColor: loanStatus?.color,
                          padding: "5px",
                          borderRadius: "5px",
                          color: "#fff",
                          marginTop: "5px",
                          marginLeft: "5px",
                        }}
                      >
                        {" "}
                        {loanStatus?.loanstatus}
                      </b>
                    </div>
                  </Flex>

                  <Flex>
                    <Button
                      colorScheme="blue"
                      style={{
                        backgroundColor: "#b19552",
                        marginRight: "10px",
                      }}
                      onClick={onOpensLogs}
                    >
                      Logs
                    </Button>
                    <Button
                      colorScheme="blue"
                      style={{ backgroundColor: "#b19552" }}
                      onClick={handleAddGuarantor}
                    >
                      Add Guarantor
                    </Button>
                  </Flex>
                </Flex>
              </FormLabel>

              <div>
                <FormControl id="user_id" mt={4}>
                  <div
                    className="card col-xl-12 col-md-8 col-sm-12"
                    style={{
                      borderRadius: "10px",
                      boxShadow: "rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px",
                    }}
                  >
                    <div
                      className="card-header"
                      style={{
                        fontSize: "15px",
                        backgroundColor: "#b19552",
                        borderTopLeftRadius: "10px",
                        borderTopRightRadius: "10px",
                        color: "white",
                      }}
                    >
                      {fileData?.loan} File
                      {fileData?.loan_type && ` - ${fileData.loan_type}`}
                      {fileData?.subtype && ` - ${fileData.subtype}`}
                    </div>

                    <FormLabel
                      className="my-3"
                      style={{ fontSize: "14px", paddingLeft: "20px" }}
                    >
                      <div className="row">
                        <div className="col-md-4">
                          <div className="card shadow-sm mb-4">
                            <div className="card-body">
                              <div className="mb-3">
                                <strong>Loan User:</strong>
                                <span>{fileData?.user?.username || "N/A"}</span>
                              </div>
                              <div className="mb-3">
                                <strong>Email:</strong>{" "}
                                <span>{fileData?.user?.email || "N/A"}</span>
                              </div>
                              <div className="mb-3">
                                <strong>Phone Number:</strong>{" "}
                                <span>{fileData?.user?.number || "N/A"}</span>
                              </div>
                              <div className="mb-3">
                                <strong>City:</strong>{" "}
                                {fileData?.user?.city || "N/A"}
                              </div>
                              <div className="mb-3">
                                <strong>State:</strong>{" "}
                                {fileData?.user?.state || "N/A"}
                              </div>
                              {/* <div>
                                <strong>Country:</strong>{" "}
                                {fileData?.user?.country || "N/A"}
                              </div> */}
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="card shadow-sm mb-4">
                            <div className="card-body">
                              <div className="mb-3">
                                <strong>File Id:</strong>{" "}
                                <span>{fileData?.file_id || "N/A"}</span>
                              </div>
                              <div className="mb-3">
                                <strong>Cibil Score:</strong>{" "}
                                <span>
                                  {fileData?.user?.cibil_score || "N/A"}
                                </span>
                              </div>
                              <div className="mb-3">
                                <strong>GST Number:</strong>{" "}
                                <span
                                  id="gstNumberText"
                                  onClick={() => copyText("gstNumberText")}
                                  style={{ cursor: "pointer" }}
                                >
                                  {fileData?.user?.gst_number || "N/A"}{" "}
                                  <i
                                    className="fa-solid fa-copy"
                                    style={{
                                      color: "#B19552",
                                      marginLeft: "5px",
                                    }}
                                  ></i>
                                </span>
                              </div>
                              <div className="mb-3">
                                <strong>PAN Card:</strong>{" "}
                                <span
                                  id="panCardText"
                                  onClick={() => copyText("panCardText")}
                                  style={{ cursor: "pointer" }}
                                >
                                  {fileData?.user?.pan_card || "N/A"}{" "}
                                  <i
                                    className="fa-solid fa-copy"
                                    style={{
                                      color: "#B19552",
                                      marginLeft: "10px",
                                    }}
                                  ></i>
                                </span>
                              </div>
                              <div className="mb-3">
                                <strong>Aadhar Card:</strong>{" "}
                                <span
                                  id="aadharCardText"
                                  onClick={() => copyText("aadharCardText")}
                                  style={{ cursor: "pointer" }}
                                >
                                  {fileData?.user?.aadhar_card || "N/A"}{" "}
                                  <i
                                    className="fa-solid fa-copy"
                                    style={{
                                      color: "#B19552",
                                      marginLeft: "10px",
                                    }}
                                  ></i>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="card shadow-sm mb-4">
                            <div className="card-body">
                              <h5 className="card-title mb-3">
                                Bank Assign Detail
                              </h5>
                              <div className="mb-3">
                                <strong>Bank Name:</strong>{" "}
                                <span>
                                  {fileBankAssignData?.bank_name || "N/A"}{" "}
                                  {fileBankAssignData?.bankbranch_name
                                    ? `(${fileBankAssignData.bankbranch_name})`
                                    : ""}
                                </span>
                              </div>
                              <div>
                                <strong>Bank User:</strong>{" "}
                                <span>
                                  {fileBankAssignData?.bank_user
                                    ?.bankuser_name || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </FormLabel>

                    <div className="accordion my-3 mx-3">
                      <div
                        className={`accordion-item ${
                          isOpenGuarantor ? "show" : ""
                        }`}
                      >
                        <h2
                          className="accordion-header"
                          id="panelsStayOpen-heading-0"
                        >
                          <button
                            className="accordion-button"
                            type="button"
                            onClick={handleAccordionClick}
                            aria-expanded={isOpenGuarantor ? "true" : "false"}
                            style={{
                              color: "white",
                              fontWeight: 700,
                              fontSize: "14px",
                              backgroundColor: "#414650",
                              justifyContent: "space-between",
                            }}
                            id="staticTitle"
                          >
                            All Guarantors
                            <FontAwesomeIcon
                              icon={
                                isOpenGuarantor ? faChevronUp : faChevronDown
                              }
                            />
                          </button>
                        </h2>
                        <div
                          id="panelsStayOpen-collapse-0"
                          className={`accordion-collapse collapse ${
                            isOpenGuarantor ? "show" : ""
                          }`}
                          aria-labelledby="panelsStayOpen-heading-0"
                        >
                          <div
                            className="accordion-body"
                            style={{
                              padding: "1rem",
                              overflow: "auto",
                              maxHeight: "300px",
                            }}
                          >
                            <table className="table">
                              <thead>
                                <tr>
                                  <th>Username</th>
                                  <th>Contact Number</th>
                                  <th>Email</th>
                                  <th>PAN Card</th>
                                  <th>Aadhar Card</th>
                                  <th>Unit Address</th>
                                  <th>Occupation</th>
                                  <th>Reference</th>
                                  <th>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {guarantors.map((guarantor, index) => (
                                  <tr key={index}>
                                    <td>{guarantor.username}</td>
                                    <td>{guarantor.number}</td>
                                    <td>{guarantor.email}</td>
                                    <td>{guarantor.pan_card}</td>
                                    <td>{guarantor.aadhar_card}</td>
                                    <td>{guarantor.unit_address}</td>
                                    <td>{guarantor.occupation}</td>
                                    <td>{guarantor.reference}</td>
                                    <td>
                                      <Button
                                        onClick={() =>
                                          handleEditGuarantor(guarantor)
                                        }
                                        colorScheme="yellow"
                                        size="sm"
                                        mr="2"
                                      >
                                        <FontAwesomeIcon icon={faEdit} />
                                      </Button>
                                      <Button
                                        onClick={() =>
                                          openDeleteModal(
                                            guarantor.guarantor_id
                                          )
                                        }
                                        colorScheme="red"
                                        size="sm"
                                      >
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>

                    {stepLoader ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "100px",
                        }}
                      >
                        <CircularProgress />
                      </div>
                    ) : (
                      <div
                        className="container-fluid progress-bar-area"
                        style={{ height: "20%", overflow: "auto" }}
                      >
                        <div className="row">
                          <div
                            className="col"
                            style={{ position: "relative", zIndex: "9" }}
                          >
                            <ul
                              className="progressbar"
                              style={{
                                display: "flex",
                                listStyle: "none",
                                padding: 0,
                              }}
                            >
                              {stepData &&
                                stepData.map((item, index) => (
                                  <li
                                    key={index}
                                    id={`step${index + 1}`}
                                    className={
                                      item.status ? item.status : "active"
                                    }
                                    style={{
                                      display: "inline-block",
                                      marginRight: "10px",
                                      cursor:
                                        (item?.status === "complete" ||
                                          allPreviousComplete(
                                            stepData,
                                            index
                                          ) ||
                                          index === 0) &&
                                        "pointer",
                                    }}
                                    onClick={() => {
                                      if (
                                        item?.status === "complete" ||
                                        allPreviousComplete(stepData, index) ||
                                        index === 0
                                      ) {
                                        if (open.index === index) {
                                          setOpen({
                                            is: false,
                                            data: {},
                                            index: "",
                                            guarantors: [],
                                          });
                                        } else {
                                          setOpen({
                                            is: true,
                                            data: item,
                                            index,
                                            guarantors: [],
                                          });
                                        }
                                      }
                                    }}
                                  >
                                    {item?.loan_step}
                                  </li>
                                ))}
                            </ul>
                          </div>

                          <div className="d-flex gap-3">
                            {open.is &&
                              open.data.loan_step_id !== "1715348523661" && (
                                <div
                                  className="card shadow-sm mb-4"
                                  style={{
                                    marginTop: "30px",
                                    marginLeft: "40px",
                                  }}
                                >
                                  <div className="card-body">
                                    <Form
                                      onSubmit={(e) => {
                                        e.preventDefault();
                                        submitStep();
                                      }}
                                    >
                                      <Flex alignItems="center">
                                        <p>
                                          {fileData?.user?.username}{" "}
                                          {open.data.loan_step}
                                        </p>
                                      </Flex>
                                      {open.data.status !== "reject" &&
                                        open.data.inputs.map((input, index) => (
                                          <>
                                            <FormControl
                                              key={index}
                                              id="step"
                                              className="d-flex justify-content-between align-items-center mt-4"
                                            >
                                              {input.type === "input" ? (
                                                <div className="col-8">
                                                  <label>{input.label}</label>
                                                  <Input
                                                    name="step"
                                                    required={input.is_required}
                                                    value={input.value}
                                                    placeholder={`Enter ${input.value}`}
                                                    onChange={(e) =>
                                                      handleChange(e, index)
                                                    }
                                                  />
                                                </div>
                                              ) : input.type === "checkbox" ? (
                                                <div className="col-4">
                                                  <input
                                                    type="checkbox"
                                                    checked={input.value}
                                                    required={input.is_required}
                                                    onChange={(e) =>
                                                      handleChange(e, index)
                                                    }
                                                  />{" "}
                                                  {input.label}
                                                </div>
                                              ) : (
                                                input.type === "file" && (
                                                  <div>
                                                    <label
                                                      style={{
                                                        display: "block",
                                                        marginBottom: "8px",
                                                      }}
                                                    >
                                                      {input.label}
                                                    </label>
                                                    <label
                                                      style={{
                                                        display: "inline-block",
                                                        padding: "5px 20px",
                                                        backgroundColor:
                                                          "rgb(65, 70, 80)",
                                                        color: "white",
                                                        borderRadius: "5px",
                                                        cursor: "pointer",
                                                      }}
                                                    >
                                                      Choose File
                                                      <Input
                                                        type="file"
                                                        required={
                                                          input.is_required
                                                        }
                                                        onChange={(e) =>
                                                          handleChange(e, index)
                                                        }
                                                        style={{
                                                          display: "none",
                                                        }}
                                                      />
                                                    </label>
                                                    {input.value && (
                                                      <>
                                                        {input.value.endsWith(
                                                          ".pdf"
                                                        ) ? (
                                                          <div
                                                            style={{
                                                              position:
                                                                "relative",
                                                              width: "100%",
                                                              height: "260px",
                                                              marginTop: "10px",
                                                            }}
                                                          >
                                                            <iframe
                                                              src={`https://cdn.savajcapital.com/cdn/files/${input.value}#toolbar=0`}
                                                              type="application/pdf"
                                                              className="pdf-viewer"
                                                              height="100%"
                                                              width="100%"
                                                              title="PDF Viewer"
                                                            />
                                                            <div className="pdf-overlay">
                                                              <FontAwesomeIcon
                                                                icon={
                                                                  faMaximize
                                                                }
                                                                onClick={() =>
                                                                  handleFileClick(
                                                                    {
                                                                      file_path:
                                                                        input.value,
                                                                    }
                                                                  )
                                                                }
                                                                style={{
                                                                  position:
                                                                    "absolute",
                                                                  bottom: "8px",
                                                                  right: "25px",
                                                                  color:
                                                                    "black",
                                                                  cursor:
                                                                    "pointer",
                                                                }}
                                                              />
                                                            </div>
                                                          </div>
                                                        ) : input.value.match(
                                                            /\.(jpeg|jpg|gif|png)$/
                                                          ) ? (
                                                          <img
                                                            src={`https://cdn.savajcapital.com/cdn/files/${input.value}`}
                                                            alt="Uploaded"
                                                            style={{
                                                              width: "100%",
                                                              height: "260px",
                                                              borderRadius:
                                                                "12px",
                                                              boxShadow:
                                                                "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                                                              cursor: "pointer",
                                                              marginTop: "10px",
                                                            }}
                                                            className="details-image"
                                                            onClick={() =>
                                                              handleFileClick({
                                                                file_path:
                                                                  input.value,
                                                              })
                                                            }
                                                          />
                                                        ) : (
                                                          <div>
                                                            No preview available
                                                            for this file type
                                                          </div>
                                                        )}
                                                      </>
                                                    )}
                                                  </div>
                                                )
                                              )}
                                            </FormControl>
                                          </>
                                        ))}
                                      <div className="mt-4">
                                        <strong>Date:</strong>{" "}
                                        {new Date(
                                          open.data.updatedAt
                                        ).toLocaleString()}
                                      </div>
                                      {open.data.status !== "reject" && (
                                        <>
                                          <Button
                                            colorScheme="blue"
                                            className="mt-3"
                                            type="submit"
                                            mr={3}
                                            style={{
                                              backgroundColor: "#b19552",
                                            }}
                                          >
                                            Submit
                                          </Button>
                                          <Button
                                            colorScheme="blue"
                                            className="buttonss mt-3"
                                            mr={3}
                                            style={{
                                              backgroundColor: "#b19552",
                                            }}
                                            onClick={() => {
                                              onOpensGuarantor();
                                              handleClick(open);
                                            }}
                                          >
                                            Add
                                          </Button>
                                        </>
                                      )}

                                      {open.data.status === "reject" &&
                                        open.data.statusMessage && (
                                          <div
                                            className="status-message mt-3"
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                            }}
                                          >
                                            <p style={{ marginRight: "10px" }}>
                                              Reject Message:{" "}
                                              <span style={{ color: "red" }}>
                                                {open.data.statusMessage}
                                              </span>
                                            </p>
                                            <IconButton
                                              icon={<Icon as={FaUndo} />}
                                              onClick={handleReverse}
                                              colorScheme="blue"
                                              className="buttonss mt-3"
                                              style={{
                                                backgroundColor: "#007bff",
                                              }}
                                              aria-label="Reverse"
                                            />
                                          </div>
                                        )}

                                      {open.data.status !== "reject" && (
                                        <Button
                                          colorScheme="red"
                                          className="buttonss mt-3"
                                          style={{ backgroundColor: "#FF0000" }}
                                          onClick={handleReject}
                                        >
                                          Reject
                                        </Button>
                                      )}
                                    </Form>
                                  </div>
                                </div>
                              )}

                            {open.is &&
                              open.data.status !== "reject" &&
                              open.data.guarantorSteps &&
                              open.data.guarantorSteps.map(
                                (guarantor, dataIndex) => (
                                  <div
                                    className="card shadow-sm mb-4"
                                    style={{
                                      marginTop: "30px",
                                      marginLeft: "40px",
                                    }}
                                  >
                                    <div className="card-body">
                                      <Form
                                        onSubmit={(e) => {
                                          e.preventDefault();
                                          submitGuarantorStep();
                                        }}
                                        // style={{ marginTop: "20px" }}
                                        key={dataIndex}
                                      >
                                        <Flex alignItems="center">
                                          <p>
                                            {guarantor.username}{" "}
                                            {guarantor.loan_step}
                                          </p>
                                          <AiOutlineClose
                                            onClick={() =>
                                              removeGuarantorStep(
                                                dataIndex,
                                                "open"
                                              )
                                            }
                                            style={{
                                              cursor: "pointer",
                                              color: "red",
                                              marginLeft: "10px",
                                            }}
                                          />
                                        </Flex>
                                        {guarantor.inputs?.map(
                                          (input, inputIndex) => (
                                            <FormControl
                                              key={`${dataIndex}-${inputIndex}`}
                                              id="step"
                                              className="d-flex justify-content-between align-items-center mt-4"
                                            >
                                              {input.type === "input" ? (
                                                <div>
                                                  <label>{input.label}</label>
                                                  <Input
                                                    name="step"
                                                    value={input.value}
                                                    placeholder={`Enter ${input.label}`}
                                                    onChange={(e) =>
                                                      handleChange(
                                                        e,
                                                        inputIndex,
                                                        dataIndex
                                                      )
                                                    }
                                                  />
                                                </div>
                                              ) : input.type === "checkbox" ? (
                                                <div>
                                                  <input
                                                    type="checkbox"
                                                    checked={input.value}
                                                    required={input.is_required}
                                                    onChange={(e) =>
                                                      handleChange(
                                                        e,
                                                        inputIndex,
                                                        dataIndex
                                                      )
                                                    }
                                                  />{" "}
                                                  {input.label}
                                                </div>
                                              ) : (
                                                input.type === "file" && (
                                                  <div>
                                                    <label
                                                      style={{
                                                        display: "block",
                                                        marginBottom: "8px",
                                                      }}
                                                    >
                                                      {input.label}
                                                    </label>
                                                    <label
                                                      style={{
                                                        display: "inline-block",
                                                        padding: "5px 20px",
                                                        backgroundColor:
                                                          "rgb(65, 70, 80)",
                                                        color: "white",
                                                        borderRadius: "5px",
                                                        cursor: "pointer",
                                                      }}
                                                    >
                                                      Choose File
                                                      <Input
                                                        type="file"
                                                        required={
                                                          input.is_required
                                                        }
                                                        onChange={(e) =>
                                                          handleChange(
                                                            e,
                                                            inputIndex,
                                                            dataIndex
                                                          )
                                                        }
                                                        style={{
                                                          display: "none",
                                                        }}
                                                      />
                                                    </label>
                                                    {input.value && (
                                                      <>
                                                        {input.value.endsWith(
                                                          ".pdf"
                                                        ) ? (
                                                          <div
                                                            style={{
                                                              position:
                                                                "relative",
                                                              width: "100%",
                                                              height: "260px",
                                                              marginTop: "10px",
                                                            }}
                                                          >
                                                            <iframe
                                                              src={`https://cdn.savajcapital.com/cdn/files/${input.value}#toolbar=0`}
                                                              type="application/pdf"
                                                              className="pdf-viewer"
                                                              height="100%"
                                                              width="100%"
                                                              title="PDF Viewer"
                                                            />
                                                            <div className="pdf-overlay">
                                                              <FontAwesomeIcon
                                                                icon={
                                                                  faMaximize
                                                                }
                                                                onClick={() =>
                                                                  handleFileClick(
                                                                    {
                                                                      file_path:
                                                                        input.value,
                                                                    }
                                                                  )
                                                                }
                                                                style={{
                                                                  position:
                                                                    "absolute",
                                                                  bottom: "8px",
                                                                  right: "25px",
                                                                  color:
                                                                    "black",
                                                                  cursor:
                                                                    "pointer",
                                                                }}
                                                              />
                                                            </div>
                                                          </div>
                                                        ) : input.value.match(
                                                            /\.(jpeg|jpg|gif|png)$/
                                                          ) ? (
                                                          <img
                                                            src={`https://cdn.savajcapital.com/cdn/files/${input.value}`}
                                                            alt="Uploaded"
                                                            style={{
                                                              width: "100%",
                                                              height: "260px",
                                                              borderRadius:
                                                                "12px",
                                                              boxShadow:
                                                                "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                                                              cursor: "pointer",
                                                              marginTop: "10px",
                                                            }}
                                                            className="details-image"
                                                            onClick={() =>
                                                              handleFileClick({
                                                                file_path:
                                                                  input.value,
                                                              })
                                                            }
                                                          />
                                                        ) : (
                                                          <div>
                                                            No preview available
                                                            for this file type
                                                          </div>
                                                        )}
                                                      </>
                                                    )}
                                                  </div>
                                                )
                                              )}
                                            </FormControl>
                                          )
                                        )}
                                        <div className="mt-4">
                                          <strong>Date:</strong>{" "}
                                          {new Date(
                                            guarantor.updatedAt
                                          ).toLocaleString()}
                                        </div>
                                        {dataIndex ===
                                          open.data.guarantorSteps.length -
                                            1 && (
                                          <Button
                                            colorScheme="blue"
                                            className="mt-3"
                                            type="submit"
                                            style={{
                                              backgroundColor: "#b19552",
                                            }}
                                          >
                                            Submit
                                          </Button>
                                        )}
                                      </Form>
                                    </div>
                                  </div>
                                )
                              )}

                            {modalOpen &&
                              modalOpen.data?.map((item, dataIndex) =>
                                item.is &&
                                item.data.loan_step_id !== "1715348523661" ? (
                                  <Form
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      submitGuarantorStep();
                                    }}
                                    style={{ marginTop: "20px" }}
                                    key={dataIndex}
                                  >
                                    <p>
                                      {item.username} {item.data.loan_step}
                                    </p>
                                    <AiOutlineClose
                                      onClick={() =>
                                        removeGuarantorStep(
                                          dataIndex,
                                          "modalOpen"
                                        )
                                      }
                                      style={{
                                        cursor: "pointer",
                                        color: "red",
                                        marginLeft: "10px",
                                      }}
                                    />
                                    {item.data.inputs?.map(
                                      (input, inputIndex) => (
                                        <FormControl
                                          key={`${dataIndex}-${inputIndex}`}
                                          id="step"
                                          className="d-flex justify-content-between align-items-center mt-4"
                                        >
                                          {input.type === "input" ? (
                                            <div>
                                              <label>{input.label}</label>
                                              <Input
                                                name="step"
                                                value={input.value}
                                                placeholder={`Enter ${input.label}`}
                                                onChange={(e) =>
                                                  handleModalChange(
                                                    e,
                                                    dataIndex,
                                                    inputIndex
                                                  )
                                                }
                                              />
                                            </div>
                                          ) : input.type === "checkbox" ? (
                                            <div>
                                              <input
                                                type="checkbox"
                                                checked={input.value}
                                                onChange={(e) =>
                                                  handleModalChange(
                                                    e,
                                                    dataIndex,
                                                    inputIndex
                                                  )
                                                }
                                              />{" "}
                                              {input.label}
                                            </div>
                                          ) : (
                                            input.type === "file" && (
                                              <div>
                                                <label>{input.label}</label>
                                                <Input
                                                  type="file"
                                                  onChange={(e) =>
                                                    handleModalChange(
                                                      e,
                                                      dataIndex,
                                                      inputIndex
                                                    )
                                                  }
                                                />
                                              </div>
                                            )
                                          )}
                                        </FormControl>
                                      )
                                    )}
                                    {dataIndex ===
                                      modalOpen.data.length - 1 && (
                                      <Button
                                        colorScheme="blue"
                                        className="mt-3"
                                        type="submit"
                                        mr={3}
                                        style={{ backgroundColor: "#b19552" }}
                                      >
                                        Submit
                                      </Button>
                                    )}
                                  </Form>
                                ) : null
                              )}
                          </div>
                          {open.is &&
                            open.data.loan_step_id === "1715348523661" && (
                              <div className="row">
                                <div className="col px-5">
                                  {open.data?.pendingData &&
                                    open.data.pendingData.length > 0 && (
                                      <React.Fragment>
                                        <h2
                                          className="my-4"
                                          style={{
                                            fontSize: "18px",
                                            fontWeight: 700,
                                            color: "#333",
                                          }}
                                        >
                                          Pending Documents
                                        </h2>
                                        <Table size="sm" aria-label="documents">
                                          <thead>
                                            <tr className="py-2">
                                              <th
                                                className="font-weight-bold"
                                                style={{ fontSize: "1rem" }}
                                              >
                                                Document
                                              </th>
                                              <th
                                                className="status font-weight-bold"
                                                style={{ fontSize: "1rem" }}
                                              >
                                                Status
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {open.data.pendingData.map(
                                              (documentRow, index) => (
                                                <tr key={index}>
                                                  <td>{documentRow?.name}</td>
                                                  <td>
                                                    <span
                                                      style={{
                                                        color: "#FFB302",
                                                        fontWeight: "bold",
                                                      }}
                                                    >
                                                      Pending
                                                    </span>
                                                  </td>
                                                </tr>
                                              )
                                            )}
                                          </tbody>
                                        </Table>
                                        {open.data.status !== "complete" && (
                                          <Button
                                            colorScheme="blue"
                                            style={{
                                              backgroundColor: "#b19552",
                                            }}
                                            onClick={() =>
                                              history.push(
                                                `/superadmin/editfile?id=${id}`
                                              )
                                            }
                                          >
                                            Upload
                                          </Button>
                                        )}
                                      </React.Fragment>
                                    )}
                                  <div>
                                    {fileData?.documents && (
                                      <div className="mt-3">
                                        <nav
                                          aria-label="breadcrumb"
                                          className="my-3"
                                          style={{ overflow: "auto" }}
                                        >
                                          <h2
                                            className="my-4"
                                            style={{
                                              fontSize: "18px",
                                              fontWeight: 700,
                                              color: "#333",
                                            }}
                                          >
                                            Uploaded Documents
                                          </h2>
                                          <ul className="breadcrumb">
                                            {Object.entries(
                                              fileData.documents
                                            ).map(([title, files], index) => (
                                              <li
                                                key={title}
                                                className="breadcrumb-item"
                                              >
                                                <a
                                                  href={`#${title}`}
                                                  onClick={() =>
                                                    handleFolderClick({
                                                      title,
                                                      files,
                                                    })
                                                  }
                                                  style={{ color: "#414650" }}
                                                >
                                                  {title} documents
                                                </a>
                                              </li>
                                            ))}
                                          </ul>
                                        </nav>

                                        {selectedFolder ? (
                                          <div>
                                            <Box>
                                              <Flex alignItems="center" mb={4}>
                                                <IconButton
                                                  icon={<ArrowBackIcon />}
                                                  aria-label="Back"
                                                  // colorScheme="teal"
                                                  onClick={handleBackClick}
                                                  mr={4}
                                                />
                                                <Text
                                                  fontSize="24px"
                                                  fontWeight="bold"
                                                  color="#333"
                                                >
                                                  {selectedFolder.title}{" "}
                                                  documents
                                                </Text>
                                              </Flex>
                                            </Box>
                                            <div
                                              className="accordion-body"
                                              style={{
                                                display: "flex",
                                                flexWrap: "wrap",
                                                gap: "15px",
                                              }}
                                            >
                                              {selectedFolder.files.map(
                                                (file, idx) => (
                                                  <div
                                                    key={idx}
                                                    className="image-responsive"
                                                    style={{ width: "45%" }}
                                                  >
                                                    <p className="mb-3">
                                                      {file.document_name}
                                                    </p>
                                                    {file.file_path.endsWith(
                                                      ".pdf"
                                                    ) ? (
                                                      <div
                                                        style={{
                                                          position: "relative",
                                                          width: "100%",
                                                          height: "260px",
                                                        }}
                                                      >
                                                        <iframe
                                                          src={`${basePath}${file.file_path}`}
                                                          type="application/pdf"
                                                          className="pdf-viewer"
                                                          height="100%"
                                                          width="100%"
                                                          title="PDF Viewer"
                                                          style={{
                                                            borderRadius:
                                                              "12px",
                                                            boxShadow:
                                                              "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                                                          }}
                                                        />
                                                        <div className="pdf-overlay">
                                                          <FontAwesomeIcon
                                                            icon={faMaximize}
                                                            onClick={() =>
                                                              handleFileClick(
                                                                file
                                                              )
                                                            }
                                                            style={{
                                                              position:
                                                                "absolute",
                                                              bottom: "8px",
                                                              right: "25px",
                                                              color: "black",
                                                              cursor: "pointer",
                                                            }}
                                                          />
                                                        </div>
                                                      </div>
                                                    ) : (
                                                      <img
                                                        src={`${basePath}${file.file_path}`}
                                                        alt={
                                                          file.loan_document_id
                                                        }
                                                        style={{
                                                          width: "100%",
                                                          height: "260px",
                                                          borderRadius: "12px",
                                                          boxShadow:
                                                            "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                                                          cursor: "pointer",
                                                        }}
                                                        className="details-image"
                                                        onClick={() =>
                                                          handleFileClick(file)
                                                        }
                                                      />
                                                    )}
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          </div>
                                        ) : (
                                          <div
                                            className="folder-view"
                                            style={{
                                              display: "flex",
                                              flexWrap: "wrap",
                                              gap: "20px",
                                            }}
                                          >
                                            {Object.entries(
                                              fileData.documents
                                            ).map(([title, files], index) => (
                                              <Box
                                                key={index}
                                                borderWidth="1px"
                                                borderRadius="lg"
                                                overflow="hidden"
                                                p="6"
                                                textAlign="center"
                                                boxShadow="md"
                                                transition="transform 0.2s"
                                                _hover={{
                                                  transform: "scale(1.05)",
                                                  backgroundColor: "#f0f4f7",
                                                }}
                                                position="relative"
                                                width="200px"
                                                m="10px"
                                                onClick={() =>
                                                  handleFolderClick({
                                                    title,
                                                    files,
                                                  })
                                                }
                                                cursor="pointer"
                                              >
                                                <Icon
                                                  as={FaFolder}
                                                  w={12}
                                                  h={12}
                                                  color="gray.400"
                                                  mb={4}
                                                />
                                                <Text
                                                  fontSize="xl"
                                                  fontWeight="bold"
                                                >
                                                  {title}
                                                </Text>
                                                <Text
                                                  fontSize="sm"
                                                  color="gray.500"
                                                >
                                                  {files.length} files
                                                </Text>
                                                <Tooltip
                                                  label="Info"
                                                  aria-label="Info Tooltip"
                                                >
                                                  <Box
                                                    position="absolute"
                                                    top="2"
                                                    right="2"
                                                  >
                                                    <Icon
                                                      as={FaInfoCircle}
                                                      w={5}
                                                      h={5}
                                                      color="gray.400"
                                                    />
                                                  </Box>
                                                </Tooltip>
                                              </Box>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  {/* {!open.data?.pendingData ||
                                    (open.data.pendingData.length === 0 && (
                                      <p>No pending documents available.</p>
                                    ))} */}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* <div>
                    {fileData?.documents && (
                      <FileDisplay fileData?.documents={fileData?.documents} />
                    )}
                  </div> */}
                </FormControl>
              </div>
            </CardBody>
          </Card>
        </Flex>
      )}
      <>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent
            style={{
              height: "80%",
              overflow: "scroll",
              scrollbarWidth: "thin",
            }}
          >
            <ModalHeader>
              {isEditMode ? "Edit Guarantor" : "Add New Guarantor"}
            </ModalHeader>
            <ModalCloseButton />
            <form onSubmit={handleSubmit(onSubmit)}>
              <ModalBody pb={6}>
                <FormControl>
                  <FormLabel>Guarantor Name</FormLabel>
                  <Input
                    name="username"
                    type="string"
                    onChange={handleChangeGuarantor}
                    defaultValue={formData.username}
                    placeholder="Enter username"
                    {...register("username", {
                      required: "Username is required",
                    })}
                  />
                  {errors.username && <p>{errors.username.message}</p>}
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Mobile Number</FormLabel>
                  <Input
                    name="number"
                    type="number"
                    onChange={handleChangeGuarantor}
                    defaultValue={formData.number}
                    placeholder="Enter number"
                    {...register("number", {
                      required: "Mobile number is required",
                    })}
                  />
                  {errors.number && <p>{errors.number.message}</p>}
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    type="string"
                    onChange={handleChangeGuarantor}
                    defaultValue={formData.email}
                    placeholder="Enter email"
                    {...register("email", { required: "Email is required" })}
                  />
                  {errors.email && <p>{errors.email.message}</p>}
                </FormControl>
                <FormControl id="aadharcard" mt={4} isRequired>
                  <FormLabel>Aadhar Card</FormLabel>
                  <Input
                    name="aadhar_card"
                    type="number"
                    onChange={handleadharChange}
                    defaultValue={formData.aadhar_card}
                    placeholder="XXXX - XXXX - XXXX"
                    {...register("aadhar_card", {
                      required: "Aadhar card is required",
                    })}
                  />
                </FormControl>
                <FormControl id="pancard" mt={4} isRequired>
                  <FormLabel>Pan Card</FormLabel>
                  <Input
                    name="pan_card"
                    type="text"
                    onChange={handlePanChange}
                    defaultValue={formData.pan_card}
                    placeholder="Enter your PAN"
                    {...register("pan_card", {
                      required: "PAN card is required",
                    })}
                  />
                </FormControl>
                <FormControl id="unit_address" mt={4} isRequired>
                  <FormLabel>Unit Address</FormLabel>
                  <Input
                    name="unit_address"
                    type="string"
                    onChange={handleChangeGuarantor}
                    defaultValue={formData.unit_address}
                    placeholder="Enter unit address"
                    {...register("unit_address", {
                      required: "Unit address is required",
                    })}
                  />
                </FormControl>
                <FormControl id="reference" mt={4} isRequired>
                  <FormLabel>Reference</FormLabel>
                  <Input
                    name="reference"
                    type="string"
                    onChange={handleChangeGuarantor}
                    defaultValue={formData.reference}
                    placeholder="Enter reference"
                    {...register("reference", {
                      required: "Reference is required",
                    })}
                  />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Occupation</FormLabel>
                  <Input
                    name="occupation"
                    type="string"
                    onChange={handleChangeGuarantor}
                    defaultValue={formData.occupation}
                    placeholder="Enter occupation"
                    {...register("occupation")}
                  />
                  {errors.occupation && <p>{errors.occupation.message}</p>}
                </FormControl>
              </ModalBody>

              <ModalFooter>
                <Button
                  colorScheme="blue"
                  mr={3}
                  type="submit"
                  style={{ backgroundColor: "#b19552" }}
                >
                  Save
                </Button>
                <Button onClick={onClose}>Cancel</Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      </>
      <>
        <Modal isOpen={isOpensGuarantor} onClose={onClosesGuarantor}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add Guarantor</ModalHeader>
            <ModalCloseButton />
            <form>
              <ModalBody pb={6}>
                <FormControl id="role" mt={4}>
                  <FormLabel>Guarantor</FormLabel>
                  <Select
                    placeholder="Select Guarantor"
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setSelectedGuarantorID((prevSelected) => {
                        if (prevSelected.includes(selectedId)) {
                          return prevSelected.filter((id) => id !== selectedId);
                        } else {
                          return [...prevSelected, selectedId];
                        }
                      });
                      setSelectedGuarantor(e.target.value);
                    }}
                  >
                    {guarantors
                      .filter(
                        (guarantor) =>
                          !isGuarantorAlreadyAdded(guarantor.guarantor_id)
                      )
                      .map((guarantor, index) => (
                        <option key={index} value={guarantor.guarantor_id}>
                          {guarantor.username}
                        </option>
                      ))}
                  </Select>
                </FormControl>
              </ModalBody>
              <ModalFooter>
                <Button
                  colorScheme="blue"
                  mr={3}
                  type="button"
                  onClick={() => {
                    onClosesGuarantor();
                    addUserToModel();
                  }}
                >
                  Save
                </Button>
                <Button onClick={onClosesGuarantor}>Cancel</Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      </>
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Guarantor</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Are you sure you want to delete this guarantor?</ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleDeleteGuarantor}>
              Delete
            </Button>
            <Button variant="ghost" onClick={closeDeleteModal}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={rejectModalOpen} onClose={closeRejectModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reject Step</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <label>Please provide a reason for rejection:</label>
              <Input
                type="text"
                value={rejectMessage}
                onChange={(e) => setRejectMessage(e.target.value)}
                required
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleRejectConfirm}>
              Confirm
            </Button>
            <Button onClick={closeRejectModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {selectedFile && (
        <Modal
          isOpen={true}
          onClose={handleCloseModal}
          size={isMaximized ? "full" : "6xl"}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>Download or Share File</div>
              <div
                onClick={toggleMaximize}
                style={{
                  cursor: "pointer",
                  marginRight: "30px",
                  marginBottom: "40px",
                }}
              >
                {isMaximized ? <TiArrowMinimise /> : <TiArrowMaximise />}
              </div>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedFile.file_path.endsWith(".pdf") ? (
                <iframe
                  src={`${basePath}${selectedFile.file_path}`}
                  type="application/pdf"
                  className="pdf-viewer"
                  height="500"
                  style={{ border: "none", width: "100%" }}
                  title="PDF Viewer"
                />
              ) : (
                <img
                  src={`${basePath}${selectedFile.file_path}`}
                  alt={selectedFile.loan_document_id}
                  style={{
                    width: "100%",
                    height: "500px",
                    borderRadius: "12px",
                    boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                  }}
                  className="details-image"
                />
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="blue"
                style={{ backgroundColor: "#b19552" }}
                mr={3}
                onClick={handleDownload}
              >
                Download
              </Button>
              {!selectedFile.file_path.endsWith(".pdf") && (
                <Button
                  colorScheme="blue"
                  style={{ backgroundColor: "#b19552" }}
                  mr={3}
                  onClick={handleConvertToPdf}
                >
                  Convert to PDF
                </Button>
              )}
              <Button
                leftIcon={<FaWhatsapp />}
                colorScheme="whatsapp"
                mr={3}
                onClick={handleShareWhatsApp}
              />
              <Button
                leftIcon={<FaEnvelope />}
                colorScheme="teal"
                mr={3}
                onClick={handleShareEmail}
              />
              <Button variant="ghost" onClick={handleCloseModal}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
      <Modal isOpen={isOpensLogs} onClose={onClosesLogs} size="xl">
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader
            textAlign="center"
            bg="#b19552"
            color="white"
            borderTopRadius="xl"
          >
            Add Log
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Log Message</FormLabel>
              <Input
                value={logMessage}
                onChange={(e) => setLogMessage(e.target.value)}
                placeholder="Enter log message"
              />
            </FormControl>

            <Box mt={4} maxHeight="400px" overflowY="scroll" overflowX="hidden">
              <ul style={{ listStyleType: "none", padding: 0 }}>
                {logs.map((log, index) => (
                  <li
                    key={index}
                    style={{
                      marginBottom: "10px",
                      padding: "12px",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      backgroundColor: log.role?.startsWith("bankuser")
                        ? "#f0f5ff"
                        : log.role === "superadmin" ||
                          log.role?.startsWith("savajuser")
                        ? "#f0f5ff"
                        : "#fff",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                      // transition: "transform 0.2s",
                    }}
                    // onMouseEnter={(e) =>
                    //   (e.currentTarget.style.transform = "scale(1.02)")
                    // }
                    // onMouseLeave={(e) =>
                    //   (e.currentTarget.style.transform = "scale(1)")
                    // }
                  >
                    <div>
                      <strong>
                        {log.role === "superadmin"
                          ? "Superadmin added this log:"
                          : log.role?.startsWith("savajuser")
                          ? `${log.role} added this log:`
                          : log.role?.startsWith("bankuser")
                          ? `${log.role} added this log:`
                          : ""}
                      </strong>{" "}
                      {log.message}
                    </div>
                    <div
                      style={{
                        textAlign: "right",
                        fontSize: "0.85em",
                        color: "#666",
                        marginTop: "8px",
                      }}
                    >
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                    {((log.role === "superadmin" && accessType.superadmin_id) ||
                      (log.role?.startsWith("bankuser") &&
                        log.bankuser_id === accessType.bankuser_id) ||
                      (log.role?.startsWith("savajuser") &&
                        log.branchuser_id === accessType.branchuser_id)) && (
                      <Button
                        colorScheme="red"
                        size="xs"
                        onClick={() => handleDeleteLog(log.log_id)}
                        style={{ marginLeft: "10px" }}
                      >
                        Delete
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={handleAddLog}
              mr={3}
              style={{
                backgroundColor: "#b19552",
                marginRight: "10PX",
              }}
            >
              Add Log
            </Button>
            <Button onClick={onClosesLogs}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Toaster />
    </div>
  );
}

export default ViewFile;
