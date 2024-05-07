import React, { useState, useEffect } from "react";
import "./file.scss";
import Loader from "react-js-loader";
import {
  FormControl,
  FormLabel,
  Flex,
  IconButton,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  Divider,
} from "@chakra-ui/react";

import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import AxiosInstance from "config/AxiosInstance";
import { useLocation } from "react-router-dom";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import axios from "axios";
import { Form, FormGroup, Table } from "reactstrap";
import { CheckBox } from "@mui/icons-material";

const FileDisplay = ({ groupedFiles }) => {
  const basePath = "https://cdn.dohost.in/upload/";
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
  return (
    <>
      <nav
        // style="--bs-breadcrumb-divider: url(&#34;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='currentColor'/%3E%3C/svg%3E&#34;);"
        aria-label="breadcrumb"
        className="my-3"
      >
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <a href="#">Home</a>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            Library
          </li>
        </ol>
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
                  onClick={() => handleAccordionClick(index)}
                  aria-expanded={index === openPanelIndex ? "true" : "false"}
                  style={{
                    color: "white",
                    fontWeight: 700,
                    fontSize: "14px",
                    backgroundColor: "#414650",
                  }}
                >
                  {title} documents
                </button>
              </h2>
              <div
                id={`panelsStayOpen-collapse-${index}`}
                className={`accordion-collapse collapse  ${
                  index === openPanelIndex ? "show" : ""
                }`}
                aria-labelledby={`panelsStayOpen-heading-${index}`}
              >
                {files.map((file, idx) => (
                  <div className="accordion-body" key={idx}>
                    {/* Render your file content here */}
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
                        className="col-xl-6 col-md-6 col-sm-12"
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
  const [statusReason, setStatusReason] = useState("");
  const [statusImage, setStatusImage] = useState(null);
  const [statusImageFile, setStatusImageFile] = useState(null);

  const uploadImageToCDN = async (file) => {
    const formData = new FormData();
    formData.append("b_video", file);

    try {
      const response = await axios.post(
        "https://cdn.dohost.in/image_upload.php/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data && response.data.iamge_path) {
        const imageName = response.data.iamge_path.split("/").pop();
        setStatusImage(imageName);

        return imageName;
      } else {
        throw new Error("Image path is missing in the response");
      }
    } catch (error) {
      console.error("Error uploading image:", error);

      return null;
    }
  };

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

  const handleAddStatus = async () => {
    let imgUrl = statusImage;
    if (statusImageFile) {
      imgUrl = (await uploadImageToCDN(statusImageFile)) || imgUrl;
    }

    const statusData = {
      file_id: fileData.file_id,
      user_id: fileData.user_id,
      reason: statusReason,
      status_img: imgUrl,
    };

    try {
      await AxiosInstance.post("/file-status/file-status", statusData);
      console.log("Status added successfully!");
      onClose();
      setStatusReason("");
    } catch (error) {
      console.error("Error adding status:", error);
    }
  };

  const [stepData, setStepData] = useState([]);
  const fetchStepsData = async () => {
    try {
      const response = await AxiosInstance.get(`/file_upload/get_steps/${id}`);
      setStepData(response.data.data);
    } catch (error) {
      console.error("Error: ", error.message);
    }
  };

  const [openStep, setOpenStep] = useState({ status: false, data: {} });
  const [cibilData, setCibilData] = useState({});
  const [accountData, setAccountData] = useState({});
  const [documentData, setDocumentData] = useState({});
  const [amountData, setAmountData] = useState({});

  const submitCibil = async () => {
    try {
      const response = await AxiosInstance.put(
        `/addusers/edituser/${cibilData.user_id}`,
        { cibil_score: cibilData.cibil_score }
      );
      if (response) {
        await fetchData();
        await fetchStepsData();
        setOpenStep({ status: false, data: {} });
      }
    } catch (error) {
      console.error("Error: ", error.message);
    }
  };

  const submitAccount = async () => {
    try {
      const response = await AxiosInstance.post(`/ibd_account`, accountData);
      if (response) {
        await fetchData();
        await fetchStepsData();
        setOpenStep({ status: false, data: {} });
      }
    } catch (error) {
      console.error("Error: ", error.message);
    }
  };

  const submitAmount = async () => {
    try {
      const response = await AxiosInstance.put(
        `/file_upload/update_amount/${id}`,
        {
          amount: amountData.amount,
          note: amountData.note,
        }
      );
      if (response) {
        await fetchData();
        await fetchStepsData();
        setOpenStep({ status: false, data: {} });
      }
    } catch (error) {
      console.error("Error: ", error.message);
    }
  };

  const submitChecked = async () => {
    try {
      if (documentData.loan_step === "Generate Documents") {
        const response = await AxiosInstance.put(
          `/file_upload/update_amount/${id}`,
          {
            stemp_paper_print: documentData.stemp_paper_print,
          }
        );
        if (response) {
          await fetchData();
          await fetchStepsData();
          setOpenStep({ status: false, data: {} });
        }
      } else {
        const response = await AxiosInstance.put(
          `/file_upload/update_amount/${id}`,
          {
            loan_dispatch: documentData.loan_dispatch,
          }
        );
        if (response) {
          await fetchData();
          await fetchStepsData();
          setOpenStep({ status: false, data: {} });
        }
      }
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
                className="mb-2 back-responsive"
                style={{ fontSize: "20px" }}
              >
                <Flex
                  alignItems="center"
                  justifyContent="space-between"
                  width="100%"
                >
                  <div>
                    <IconButton
                      icon={<ArrowBackIcon />}
                      onClick={() => history.goBack()}
                      aria-label="Back"
                      mr="4"
                      className="icon-button"
                    />
                    <b>{fileData?.loan} File Details</b>
                  </div>
                  <Button
                    colorScheme="blue"
                    style={{ backgroundColor: "#b19552" }}
                    onClick={onOpen}
                  >
                    Add Status
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

                    <u>
                      <FormLabel
                        className="my-3"
                        style={{ fontSize: "14px", paddingLeft: "20px" }}
                      >
                        <b>Loan User : {fileData?.username}</b>
                      </FormLabel>
                    </u>

                    <div
                      className="container-fluid progress-bar-area"
                      style={{ height: "20%" }}
                    >
                      <div className="row pb-4">
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
                                  className={item.status ? item.status : ""}
                                  style={{
                                    display: "inline-block",
                                    marginRight: "10px",
                                    cursor:
                                      (stepData[index - 1]?.status ===
                                        "complete" ||
                                        index === 0) &&
                                      "pointer",
                                  }}
                                  onClick={() => {
                                    if (
                                      item?.status === "complete" ||
                                      stepData[index - 1]?.status ===
                                        "complete" ||
                                      index === 0
                                    ) {
                                      setOpenStep({
                                        status: !openStep.status,
                                        data: item,
                                      });
                                      if (item.loan_step === "Cibil") {
                                        setCibilData(item);
                                      }
                                      if (item.loan_step === "Bank A/C Open") {
                                        setAccountData(item);
                                      }
                                      if (item.loan_step === "Documents") {
                                        setDocumentData(item);
                                      }
                                      if (
                                        item.loan_step === "Approval Amount"
                                      ) {
                                        setAmountData(item);
                                      }
                                      if (
                                        item.loan_step === "Generate Documents"
                                      ) {
                                        setDocumentData(item);
                                      }
                                      if (item.loan_step === "Dispatch") {
                                        setDocumentData(item);
                                      }
                                    }
                                  }}
                                >
                                  <div className="circle-container">
                                    <a href="#">
                                      <div className="circle-button"></div>
                                    </a>
                                  </div>
                                  {item.loan_step}
                                </li>
                              ))}
                          </ul>
                        </div>
                      </div>
                      {openStep.status && openStep.data.loan_step === "Cibil" && (
                        <div className="row pb-0 mb-0">
                          <div className="col px-3 pt-3">
                            <Form className="d-flex justify-content-start align-items-center">
                              <FormGroup className="px-2">
                                <label htmlFor="score">Cibil Score</label>
                                <Input
                                  type="text"
                                  value={cibilData.cibil_score}
                                  onChange={(e) => {
                                    const newCibilData = {
                                      ...cibilData,
                                      cibil_score: e.target.value,
                                    };
                                    setCibilData(newCibilData);
                                  }}
                                  placeholder="Cili_Score"
                                  disabled={cibilData.status === "complete"}
                                />
                              </FormGroup>
                              {cibilData.status !== "complete" && (
                                <Button
                                  colorScheme="blue"
                                  style={{ backgroundColor: "#b19552" }}
                                  onClick={submitCibil}
                                >
                                  Submit
                                </Button>
                              )}
                            </Form>
                          </div>
                        </div>
                      )}
                      {openStep.status &&
                        openStep.data.loan_step === "Bank A/C Open" && (
                          <div className="row">
                            <div className="col px-3 pt-3">
                              <Form className="d-flex justify-content-start align-items-center">
                                <FormGroup className="px-2">
                                  <label htmlFor="score">Name</label>
                                  <Input
                                    type="text"
                                    value={accountData.name}
                                    onChange={(e) => {
                                      const newAccountData = {
                                        ...accountData,
                                        name: e.target.value,
                                      };
                                      setAccountData(newAccountData);
                                    }}
                                    placeholder="User Name"
                                    disabled={accountData.status === "complete"}
                                  />
                                </FormGroup>
                                <FormGroup className="px-2">
                                  <label htmlFor="score">Account Number</label>
                                  <Input
                                    type="text"
                                    value={accountData.account_number}
                                    onChange={(e) => {
                                      const newAccountData = {
                                        ...accountData,
                                        account_number: e.target.value,
                                      };
                                      setAccountData(newAccountData);
                                    }}
                                    placeholder="Account Number"
                                    disabled={accountData.status === "complete"}
                                  />
                                </FormGroup>
                                <FormGroup className="px-2">
                                  <label htmlFor="score">IFC Number</label>
                                  <Input
                                    type="text"
                                    value={accountData.ifc_number}
                                    onChange={(e) => {
                                      const newAccountData = {
                                        ...accountData,
                                        ifc_number: e.target.value,
                                      };
                                      setAccountData(newAccountData);
                                    }}
                                    placeholder="Account IFC Number"
                                    disabled={accountData.status === "complete"}
                                  />
                                </FormGroup>
                                {accountData.status !== "complete" && (
                                  <Button
                                    colorScheme="blue"
                                    style={{ backgroundColor: "#b19552" }}
                                    onClick={() => submitAccount()}
                                  >
                                    Submit
                                  </Button>
                                )}
                              </Form>
                            </div>
                          </div>
                        )}
                      {openStep.status &&
                        documentData.status !== "complete" &&
                        openStep.data.loan_step === "Documents" && (
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
                                  {documentData?.pendingData?.map(
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
                              {documentData.status !== "complete" && (
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
                      {openStep.status &&
                        openStep.data.loan_step === "Approval Amount" && (
                          <div className="row">
                            <div className="col px-3 pt-3">
                              <Form className="d-flex justify-content-start align-items-center">
                                <FormGroup className="px-2">
                                  <label htmlFor="score">Loan Amount</label>
                                  <Input
                                    type="text"
                                    value={amountData.amount}
                                    onChange={(e) => {
                                      const newCibilData = {
                                        ...amountData,
                                        amount: e.target.value,
                                      };
                                      setAmountData(newCibilData);
                                    }}
                                    placeholder="Enter Amount"
                                    disabled={amountData.status === "complete"}
                                  />
                                </FormGroup>
                                <FormGroup className="px-2">
                                  <label htmlFor="score">Note</label>
                                  <Input
                                    type="text"
                                    value={amountData.note}
                                    onChange={(e) => {
                                      const newCibilData = {
                                        ...amountData,
                                        note: e.target.value,
                                      };
                                      setAmountData(newCibilData);
                                    }}
                                    placeholder="Enter Note"
                                    disabled={amountData.status === "complete"}
                                  />
                                </FormGroup>
                                {amountData.status !== "complete" && (
                                  <Button
                                    colorScheme="blue"
                                    style={{ backgroundColor: "#b19552" }}
                                    onClick={submitAmount}
                                  >
                                    Submit
                                  </Button>
                                )}
                              </Form>
                            </div>
                          </div>
                        )}
                      {openStep.status &&
                        openStep.data.loan_step === "Generate Documents" && (
                          <div className="row">
                            <div className="col px-3 pt-3">
                              <Form>
                                <FormGroup>
                                  <label>Stemp Paper Print</label>
                                  <input
                                    type="checkbox"
                                    className="mx-2"
                                    disabled={cibilData.status === "complete"}
                                    checked={documentData.stemp_paper_print}
                                    onChange={(e) => {
                                      const newDocumentData = {
                                        ...documentData,
                                        stemp_paper_print: e.target.checked,
                                      };
                                      setDocumentData(newDocumentData);
                                    }}
                                    style={{
                                      fontSize: "1rem",
                                      fontWeight: "bold",
                                      cursor: "pointer",
                                      accentColor: "#b19552",
                                    }}
                                  />
                                  {documentData.status !== "complete" && (
                                    <Button
                                      colorScheme="blue"
                                      style={{ backgroundColor: "#b19552" }}
                                      onClick={submitChecked}
                                    >
                                      Submit
                                    </Button>
                                  )}
                                </FormGroup>
                              </Form>
                            </div>
                          </div>
                        )}
                      {openStep.status &&
                        openStep.data.loan_step === "Dispatch" && (
                          <div className="row">
                            <div className="col px-3 pt-3">
                              <Form>
                                <FormGroup>
                                  <label>Loan Dispatch</label>
                                  <input
                                    type="checkbox"
                                    className="mx-2"
                                    disabled={cibilData.status === "complete"}
                                    checked={documentData.loan_dispatch}
                                    onChange={(e) => {
                                      const newDocumentData = {
                                        ...documentData,
                                        loan_dispatch: e.target.checked,
                                      };
                                      setDocumentData(newDocumentData);
                                    }}
                                    style={{
                                      fontSize: "1rem",
                                      fontWeight: "bold",
                                      cursor: "pointer",
                                      accentColor: "#b19552",
                                    }}
                                  />
                                  {documentData.status !== "complete" && (
                                    <Button
                                      colorScheme="blue"
                                      style={{ backgroundColor: "#b19552" }}
                                      onClick={submitChecked}
                                    >
                                      Submit
                                    </Button>
                                  )}
                                </FormGroup>
                              </Form>
                            </div>
                          </div>
                        )}
                    </div>
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

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add a New Status</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Reason for status</FormLabel>
              <Input
                placeholder="Enter reason"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Status Image (optional)</FormLabel>
              <Input
                type="file"
                onChange={(e) => setStatusImageFile(e.target.files[0])}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleAddStatus}>
              Save
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default ViewFile;
