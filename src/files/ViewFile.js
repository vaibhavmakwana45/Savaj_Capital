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
} from "@chakra-ui/react";
import { CircularProgress } from "@material-ui/core";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import AxiosInstance from "config/AxiosInstance";
import { useLocation } from "react-router-dom";
import { ArrowBackIcon, CloseIcon } from "@chakra-ui/icons";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Form, FormGroup, Table } from "reactstrap";
import { CheckBox } from "@mui/icons-material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { useForm } from "react-hook-form";
import { Typography } from "@mui/material";

const FileDisplay = ({ groupedFiles }) => {
  const basePath = "https://cdn.savajcapital.com/cdn/files/";
  if (!groupedFiles || Object.keys(groupedFiles).length === 0) {
    return <div>No documents available</div>;
  }

  const handleDownload = async (filePath) => {
    try {
      const fileHandle = await window.showSaveFilePicker();
      const writableStream = await fileHandle.createWritable();
      const response = await fetch(filePath);
      const blob = await response.blob();
      await writableStream.write(blob);
      await writableStream.close();
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };
  // const [openPanelIndex, setOpenPanelIndex] = useState(null);

  // const handleAccordionClick = (index) => {
  //   setOpenPanelIndex(index === openPanelIndex ? null : index);
  // };

  const [openPanelIndex, setOpenPanelIndex] = useState(0);

  const handleAccordionClick = (index) => {
    setOpenPanelIndex(index === openPanelIndex ? -1 : index);
  };

  const [accordionStatus, setAccordionStatus] = useState();

  return (
    <>
      <nav
        aria-label="breadcrumb"
        className="my-3"
        style={{ overflow: "auto" }}
      >
        <ul className="breadcrumb">
          {Object.entries(groupedFiles).map(([title, files], index) => (
            <li key={title} className="breadcrumb-item">
              <a
                href={`#${title}`}
                onClick={() => handleAccordionClick(index)}
                style={{ color: "#414650" }}
              >
                {title} documents
              </a>
              {accordionStatus && accordionStatus[title] && (
                <div className="accordion-content">
                  {/* Render files related to this title */}
                  {files.map((file, index) => (
                    <div key={index}>{file.name}</div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <h2
        className="my-4"
        style={{ fontSize: "18px", fontWeight: 700, color: "#333" }}
      >
        Uploaded Documents
      </h2>
      <div>
        {Object.entries(groupedFiles).map(([title, files], index) => (
          <div
            className="accordion my-3"
            id={`accordionPanelsStayOpenExample-${index}`}
            key={index}
          >
            <div
              className={`accordion-item ${
                index === openPanelIndex ? "show" : ""
              }`}
              key={index}
            >
              <h2
                className="accordion-header"
                id={`panelsStayOpen-heading-${index}`}
              >
                <button
                  className="accordion-button"
                  type="button"
                  // name="butonnnns"
                  onClick={() => handleAccordionClick(index)}
                  aria-expanded={index === openPanelIndex ? "true" : "false"}
                  style={{
                    color: "white",
                    fontWeight: 700,
                    fontSize: "14px",
                    backgroundColor: "#414650",
                    justifyContent: "space-between",
                  }}
                  id={title}
                >
                  {title} documents
                  <FontAwesomeIcon
                    icon={
                      index === openPanelIndex ? faChevronUp : faChevronDown
                    }
                  />
                </button>
              </h2>
              {/* <div
                id={`panelsStayOpen-collapse-${index}`}
                className={`accordion-collapse collapse  ${
                  index === openPanelIndex ? "show" : ""
                }`}
                aria-labelledby={`panelsStayOpen-heading-${index}`}
              >
                {files.map((file, idx) => (
                  <div className="accordion-body" key={idx}>
                    <p className="mb-3">{file.document_name}</p>
                    {file.file_path.endsWith(".pdf") ? (
                      <iframe
                        src={`${basePath}${file.file_path}`}
                        type="application/pdf"
                        className="col-xl-6 col-md-6 col-sm-12"
                        height="260"
                        style={{
                          border: "none",
                          boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                          borderRadius: "12px",
                          width: "40%",
                        }}
                        title="PDF Viewer"
                      />
                    ) : (
                      <img
                        src={`${basePath}${file.file_path}`}
                        alt={file.loan_document_id}
                        style={{
                          width: "40%",
                          height: "260px",
                          borderRadius: "12px",
                          boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                          cursor: "pointer",
                        }}
                        className="col-xl-6 col-md-6 col-sm-12 details-image"
                        onClick={() =>
                          handleDownload(
                            `${basePath}${file.file_path}`,
                            file.loan_document_id
                          )
                        }
                      />
                    )}
                  </div>
                ))}
              </div> */}
              <div
                id={`panelsStayOpen-collapse-${index}`}
                className={`accordion-collapse collapse ${
                  index === openPanelIndex ? "show" : ""
                }`}
                aria-labelledby={`panelsStayOpen-heading-${index}`}
              >
                <div
                  className="accordion-body"
                  style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}
                >
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="image-responsive"
                      style={{ width: "45%" }}
                    >
                      <p className="mb-3">{file.document_name}</p>
                      {file.file_path.endsWith(".pdf") ? (
                        <iframe
                          src={`${basePath}${file.file_path}`}
                          type="application/pdf"
                          className="col-xl-6 col-md-6 col-sm-12"
                          height="260"
                          style={{
                            border: "none",
                            boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                            borderRadius: "12px",
                            width: "100%",
                          }}
                          title="PDF Viewer"
                        />
                      ) : (
                        <img
                          src={`${basePath}${file.file_path}`}
                          alt={file.loan_document_id}
                          style={{
                            width: "100%",
                            height: "260px",
                            borderRadius: "12px",
                            boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                            cursor: "pointer",
                          }}
                          className="details-image"
                          onClick={() =>
                            handleDownload(
                              `${basePath}${file.file_path}`,
                              file.loan_document_id
                            )
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
        {/* <div
        className="d-flex flex-wrap justify-content-start image-responsive"
        style={{ overflow: "auto" }}
      >
        {Object.entries(groupedFiles).map(([title, files], index) => (
          <div key={index} className="mx-3 mb-4 " style={{ flexBasis: "30%" }}>
            <h2
              className="my-4"
              style={{ fontSize: "18px", fontWeight: 700, color: "#333" }}
            >
              <u>{title} documents</u>
            </h2>
            {files.map((file, idx) => (
              <div key={idx} className="mb-3">
                <p className="mb-3">{file.document_name}</p>
                {file.file_path.endsWith(".pdf") ? (
                  <iframe
                    src={`${basePath}${file.file_path}`}
                    type="application/pdf"
                    width="100%"
                    height="260"
                    style={{
                      border: "none",
                      boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                      borderRadius: "12px",
                    }}
                    title="PDF Viewer"
                  />
                ) : (
                  <img
                    src={`${basePath}${file.file_path}`}
                    alt={file.loan_document_id}
                    style={{
                      width: "100%",
                      height: "260px",
                      borderRadius: "12px",
                      boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      handleDownload(
                        `${basePath}${file.file_path}`,
                        file.loan_document_id
                      )
                    }
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div> */}
      </div>
    </>
  );
};

function ViewFile() {
  const location = useLocation();
  const history = useHistory();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpensGuarantor,
    onOpen: onOpensGuarantor,
    onClose: onClosesGuarantor,
  } = useDisclosure();

  const {
    register,
    handleSubmit,
    reset,
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

  const fetchData = async () => {
    try {
      const response = await AxiosInstance.get(
        "/file_upload/file_upload/" + id
      );
      setFileData(response.data.data.file);
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

  const fetchStepsData = async () => {
    try {
      setStepLoader(true);
      const response = await AxiosInstance.get(`/loan_step/get_steps/${id}`);
      const steps = response.data.data;

      // Assuming the main step is the first one in the stepData array
      const mainStepInputs = steps[0]?.inputs || [];

      // Iterate through each step and update guarantor steps if necessary
      const updatedSteps = steps.map((step) => {
        if (step.guarantorSteps) {
          step.guarantorSteps = step.guarantorSteps.map((guarantorStep) => {
            const existingInputs = guarantorStep.inputs || [];
            const updatedInputs = mainStepInputs.map((mainInput) => {
              const existingInput = existingInputs.find(
                (input) => input.label === mainInput.label
              );
              return existingInput || { ...mainInput, value: "" };
            });
            return { ...guarantorStep, inputs: updatedInputs };
          });
        }
        return step;
      });

      setStepData(updatedSteps);
      setStepLoader(false);
    } catch (error) {
      console.error("Error: ", error.message);
      setStepLoader(false);
    }
  };

  const [open, setOpen] = useState({ is: false, data: {}, index: "" });

  function allPreviousComplete(stepData, currentIndex) {
    for (let i = 0; i < currentIndex; i++) {
      if (stepData[i]?.status !== "complete") {
        return false;
      }
    }
    return true;
  }

  const [modalOpen, setModalOpen] = useState(null);
  const [selectedGuarantor, setSelectedGuarantor] = useState("");

  const handleChange = async (e, index) => {
    const { name, value, checked, type, files } = e.target;
    const newData = { ...open.data };
    const inputs = [...newData.inputs];

    if (type === "checkbox") {
      inputs[index].value = checked;
      if (checked) {
        inputs[index].is_required = false;
      } else {
        inputs[index].is_required =
          stepData[open?.index]?.inputs[index]?.is_required;
      }
    } else if (type === "text") {
      inputs[index].value = value;
      if (value !== "") {
        inputs[index].is_required = false;
      } else {
        inputs[index].is_required =
          stepData[open?.index]?.inputs[index]?.is_required;
      }
    } else if (type === "file") {
      if (files.length > 0) {
        try {
          const uploadedFilePath = await uploadImageToCDN(files[0]);
          inputs[index].value = uploadedFilePath;
          inputs[index].is_required = false;
        } catch (error) {
          console.error("Failed to upload file:", error);
          inputs[index].is_required = true;
        }
      } else {
        inputs[index].is_required =
          stepData[open?.index]?.inputs[index]?.is_required;
      }
    }

    setOpen({ is: open.is, data: { ...newData, inputs }, index: open.index });
  };

  const handleModalChange = async (e, dataIndex, inputIndex) => {
    const { name, type, value, checked, files } = e.target;

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
          updatedInputs[inputIndex].is_required = false; // Assuming file upload makes the field not required

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
        updatedInputs[inputIndex].is_required = !checked;
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
      updatedData[updatedData.length - 1] = {
        ...updatedData[updatedData.length - 1],
        is: true,
        username: selectedGuarantor,
      };

      return {
        ...prevState,
        data: updatedData,
      };
    });
  };

  const submitStep = async () => {
    try {
      await AxiosInstance.post(`/loan_step/steps/${id}`, open.data);
      const cibilScore = open.data.inputs.find(
        (input) => input.label === "Cibil Score"
      )?.value;

      const userId = open.data.user_id;

      const formData = {
        cibil_score: cibilScore,
      };

      const response = await AxiosInstance.put(
        "/addusers/edituser/" + userId,
        formData
      );
      console.log(response, "response");
      fetchData();
      fetchStepsData();
      setOpen({ is: false, data: {}, index: "" });
    } catch (error) {
      console.error("Error: ", error.message);
    }
  };

  const submitGuarantorStep = async () => {
    try {
      const response = await AxiosInstance.post(
        `/guarantor-step/guarantor-step/${id}`,
        open.data
      );

      console.log(response, "response");
      fetchData();
      fetchStepsData();
      setOpen({ is: false, data: {}, index: "" });
    } catch (error) {
      console.error("Error: ", error.message);
    }
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

  const onSubmit = async () => {
    const payload = {
      username: formData.username,
      number: formData.number,
      email: formData.email,
      pan_card: formData.pan_card,
      aadhar_card: formData.aadhar_card,
      unit_address: formData.unit_address,
      occupation: formData.occupation,
      reference: formData.reference,
      user_id: fileData.user_id,
      file_id: fileData.file_id,
    };
    try {
      await AxiosInstance.post("/add-guarantor/add-guarantor", payload);
      toast.success("Guarantor Added Successfully!");
      onClose();
      fetchData();
      reset();
    } catch (error) {
      console.error("Error adding guarantor:", error);
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
    return (
      open.data.guarantorSteps &&
      open.data.guarantorSteps.some(
        (guarantorStep) => guarantorStep.guarantor_id === guarantorId
      )
    );
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
                  width="100%"
                  className="thead"
                >
                  <div className="theadd">
                    <IconButton
                      icon={<ArrowBackIcon />}
                      onClick={() => history.goBack()}
                      aria-label="Back"
                      mr="4"
                    />
                    <b>{fileData?.loan} File Details</b>
                  </div>
                  <Button
                    colorScheme="blue"
                    style={{ backgroundColor: "#b19552" }}
                    onClick={onOpen}
                    className="buttonss"
                  >
                    Add Guarantor
                  </Button>
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
                        <div className="col-md-6">
                          <div>
                            <strong>Loan User :</strong>{" "}
                            <span> {fileData?.user?.username || "N/A"}</span>
                          </div>
                          {/* <br /> */}
                          <div>
                            <strong>Email :</strong>{" "}
                            <span> {fileData?.user?.email || "N/A"}</span>
                          </div>
                          {/* <br /> */}
                          <div>
                            <strong>Phone Number :</strong>{" "}
                            <span> {fileData?.user?.number || "N/A"}</span>
                          </div>
                          {/* <br /> */}
                          <div>
                            <strong>Cibil Score :</strong>{" "}
                            <span> {fileData?.user?.cibil_score || "N/A"}</span>
                          </div>
                          {/* <br /> */}
                          <div>
                            <strong id="gstNumber">Gst Number :</strong>{" "}
                            <span
                              id="gstNumberText"
                              onClick={() => copyText("gstNumberText")}
                              style={{ cursor: "pointer" }}
                            >
                              {fileData?.user?.gst_number || "N/A"}{" "}
                              <i
                                class="fa-solid fa-copy"
                                style={{ color: "#B19552", marginLeft: "5px" }}
                              ></i>
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div>
                            <strong id="panCard">PAN Card :</strong>{" "}
                            <span
                              id="panCardText"
                              onClick={() => copyText("panCardText")}
                              style={{ cursor: "pointer" }}
                            >
                              {fileData?.user?.pan_card || "N/A"}{" "}
                              <i
                                class="fa-solid fa-copy"
                                style={{ color: "#B19552", marginLeft: "10px" }}
                              ></i>
                            </span>
                          </div>
                          {/* <br /> */}
                          <div>
                            <strong id="aadharCard">Aadhar Card :</strong>{" "}
                            <span
                              id="aadharCardText"
                              onClick={() => copyText("aadharCardText")}
                              style={{ cursor: "pointer" }}
                            >
                              {fileData?.user?.aadhar_card || "N/A"}{" "}
                              <i
                                class="fa-solid fa-copy"
                                style={{ color: "#B19552", marginLeft: "10px" }}
                              ></i>
                            </span>
                          </div>
                          <div>
                            <strong>City :</strong>{" "}
                            {fileData?.user?.city || "N/A"}
                          </div>
                          <div>
                            {/* <br /> */}
                            <strong>State :</strong>{" "}
                            {fileData?.user?.state || "N/A"}
                          </div>
                          {/* <br /> */}
                          <div>
                            <strong>Country :</strong>{" "}
                            {fileData?.user?.country || "N/A"}
                            {/* <br /> */}
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
                            style={{ padding: "1rem" }}
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
                                stepData?.map((item, index) => (
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
                                          });
                                        } else {
                                          setOpen({
                                            is: true,
                                            data: item,
                                            index,
                                          });
                                          setModalOpen();
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
                                <Form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    submitStep();
                                  }}
                                >
                                  {open?.data?.inputs?.map((input, index) => (
                                    <FormControl
                                      key={index}
                                      id="step"
                                      className="d-flex justify-content-between align-items-center mt-4"
                                    >
                                      {input.type === "input" ? (
                                        <div>
                                          <label>{input.label}</label>
                                          <Input
                                            name="step"
                                            required={input.is_required}
                                            // disabled={open.data.status === "complete"}
                                            value={input.value}
                                            placeholder={`Enter ${input.value}`}
                                            onChange={(e) =>
                                              handleChange(e, index)
                                            }
                                          />
                                        </div>
                                      ) : input.type === "checkbox" ? (
                                        <div>
                                          <input
                                            type="checkbox"
                                            checked={input.value}
                                            // disabled={open.data.status === "complete"}
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
                                            <label>{input.label}</label>
                                            <Input
                                              type="file"
                                              required={input.is_required}
                                              onChange={(e) =>
                                                handleChange(e, index)
                                              }
                                            />
                                            {input.value && (
                                              <div
                                                style={{ marginTop: "10px" }}
                                              >
                                                {input.value
                                                  .toLowerCase()
                                                  .endsWith(".pdf") ? (
                                                  <embed
                                                    src={`https://cdn.savajcapital.com/cdn/files/${input.value}#toolbar=0`}
                                                    type="application/pdf"
                                                    width="100%"
                                                    height="200px"
                                                  />
                                                ) : (
                                                  <img
                                                    src={`https://cdn.savajcapital.com/cdn/files/${input.value}`}
                                                    alt="Uploaded"
                                                    style={{
                                                      width: "100%",
                                                      height: "200px",
                                                    }}
                                                  />
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        )
                                      )}
                                    </FormControl>
                                  ))}
                                  <Button
                                    colorScheme="blue"
                                    className="mt-3"
                                    type="submit"
                                    mr={3}
                                    style={{ backgroundColor: "#b19552" }}
                                  >
                                    Submit
                                  </Button>

                                  <Button
                                    colorScheme="blue"
                                    className="buttonss mt-3"
                                    style={{ backgroundColor: "#b19552" }}
                                    onClick={() => {
                                      onOpensGuarantor();
                                      handleClick(open);
                                    }}
                                  >
                                    Add
                                  </Button>
                                </Form>
                              )}
                            {open.is &&
                              open.data.guarantorSteps &&
                              open.data.guarantorSteps.map(
                                (guarantor, dataIndex) => (
                                  <Form
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      submitGuarantorStep();
                                    }}
                                    style={{ marginTop: "20px" }}
                                    key={dataIndex}
                                  >
                                    {/* Ensure to access the guarantor's name correctly */}
                                    <p>{guarantor.guarantor_id} Cibil Score</p>
                                    {console.log(guarantor, "guarantor")}
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
                                                  handleModalChange(
                                                    e,
                                                    dataIndex,
                                                    inputIndex,
                                                    "guarantorSteps"
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
                                                    inputIndex,
                                                    "guarantorSteps"
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
                                                      inputIndex,
                                                      "guarantorSteps"
                                                    )
                                                  }
                                                />
                                              </div>
                                            )
                                          )}
                                        </FormControl>
                                      )
                                    )}
                                    <Button
                                      colorScheme="blue"
                                      className="mt-3"
                                      type="submit"
                                      mr={3}
                                      style={{ backgroundColor: "#b19552" }}
                                    >
                                      Submit
                                    </Button>
                                  </Form>
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
                                    <p>{item.username} Cibil Score</p>
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
                                    <Button
                                      colorScheme="blue"
                                      className="mt-3"
                                      type="submit"
                                      mr={3}
                                      style={{ backgroundColor: "#b19552" }}
                                    >
                                      Submit
                                    </Button>
                                  </Form>
                                ) : null
                              )}
                          </div>
                          {open.is &&
                            open.data.loan_step_id === "1715348523661" &&
                            open.data.pendingData.length !== 0 && (
                              <div className="row">
                                <div
                                  className="col px-5 pt-3
                            d-flex justify-content-start align-items-top"
                                >
                                  <Table
                                    size="sm"
                                    aria-label="documents"
                                    className="mx-4"
                                  >
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
                                      {open.data?.pendingData?.map(
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
                                      style={{ backgroundColor: "#b19552" }}
                                      className="mx-3"
                                      onClick={() =>
                                        history.push(
                                          `/superadmin/editfile?id=${id}`
                                        )
                                      }
                                    >
                                      Upload
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    {fileData?.documents && (
                      <FileDisplay groupedFiles={fileData?.documents} />
                    )}
                  </div>
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
            <ModalHeader>Add New Guarantor</ModalHeader>
            <ModalCloseButton />
            <form onSubmit={handleSubmit(onSubmit)}>
              <ModalBody pb={6}>
                <FormControl>
                  <FormLabel>Guarantor Name</FormLabel>
                  <Input
                    name="username"
                    type="string"
                    onChange={handleChangeGuarantor}
                    value={formData.username}
                    placeholder="Enter username"
                  />
                  {errors.username && <p>{errors.username.message}</p>}
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Mobile Number</FormLabel>
                  <Input
                    name="number"
                    type="number"
                    onChange={handleChangeGuarantor}
                    value={formData.number}
                    placeholder="Enter number"
                  />
                  {errors.number && <p>{errors.number.message}</p>}
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    type="string"
                    onChange={handleChangeGuarantor}
                    value={formData.email}
                    placeholder="Enter email"
                  />
                  {errors.email && <p>{errors.email.message}</p>}
                </FormControl>
                <FormControl id="aadharcard" mt={4} isRequired>
                  <FormLabel>Aadhar Card</FormLabel>
                  <Input
                    name="aadhar_card"
                    type="number"
                    onChange={handleadharChange}
                    value={formData.aadhar_card}
                    placeholder="XXXX - XXXX - XXXX"
                  />
                </FormControl>
                <FormControl id="pancard" mt={4} isRequired>
                  <FormLabel>Pan Card</FormLabel>
                  <Input
                    name="pan_card"
                    type="text"
                    onChange={handlePanChange}
                    value={formData.pan_card}
                    placeholder="Enyrt your PAN"
                  />
                </FormControl>
                <FormControl id="unit_address" mt={4} isRequired>
                  <FormLabel>Unit Address</FormLabel>
                  <Input
                    name="unit_address"
                    type="string"
                    onChange={handleChangeGuarantor}
                    value={formData.unit_address}
                    placeholder="Enter unit address"
                  />
                </FormControl>
                <FormControl id="reference" mt={4} isRequired>
                  <FormLabel>Reference</FormLabel>
                  <Input
                    name="reference"
                    type="string"
                    onChange={handleChangeGuarantor}
                    value={formData.reference}
                    placeholder="Enter reference"
                  />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Occupation</FormLabel>
                  <Input
                    name="occupation"
                    type="string"
                    onChange={handleChangeGuarantor}
                    value={formData.occupation}
                    placeholder="Enter occupation"
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
          <ModalContent
          // style={{
          //   height: "40%",
          //   overflow: "scroll",
          //   scrollbarWidth: "thin",
          // }}
          >
            <ModalHeader>Add Guarantor</ModalHeader>
            <ModalCloseButton />
            <form>
              <ModalBody pb={6}>
                <FormControl id="role" mt={4}>
                  <FormLabel>Guarantor</FormLabel>
                  <Select
                    placeholder="Select Guarantor"
                    onChange={(e) => setSelectedGuarantor(e.target.value)}
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
      <Toaster />
    </div>
  );
}

export default ViewFile;
