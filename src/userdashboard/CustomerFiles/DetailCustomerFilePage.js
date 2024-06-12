import React, { useState, useEffect } from "react";
import "../../files/file.scss";
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
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import AxiosInstance from "config/AxiosInstance";
import { useLocation } from "react-router-dom";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

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

  const [accordionStatus, setAccordionStatus] = useState();
  return (
    <>
      <nav
        aria-label="breadcrumb"
        className="my-3"
        style={{ overflow: "auto" }}
      >
        <ul className="breadcrumb">
          <li class="breadcrumb-item">
            <a href="#"> Home</a>
          </li>
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

function DetailCustomerFilePage() {
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

  useEffect(() => {
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
                  {/* <Button
                    colorScheme="blue"
                    style={{ backgroundColor: "#b19552" }}
                    onClick={onOpen}
                    className="buttonss"
                  >
                    Add Status
                  </Button> */}
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
                          <strong>Loan User:</strong>{" "}
                          {fileData?.user?.username || "N/A"}
                          <br />
                          <strong>Email:</strong>{" "}
                          {fileData?.user?.email || "N/A"}
                          <br />
                          <strong>Phone Number:</strong>{" "}
                          {fileData?.user?.number || "N/A"}
                          <br />
                          <strong>Cibil Score:</strong>{" "}
                          {fileData?.user?.cibil_score || "N/A"}
                          <br />
                        </div>
                        <div className="col-md-6">
                          <strong>Gst Number:</strong>{" "}
                          {fileData?.user?.gst_number || "N/A"}
                          <br />
                          <strong>PAN Card:</strong>{" "}
                          {fileData?.user?.pan_card || "N/A"}
                          <br />
                          <strong>Aadhar Card:</strong>{" "}
                          {fileData?.user?.aadhar_card || "N/A"}
                          <br />
                        </div>
                      </div>
                    </FormLabel>

                    {/* Progress */}
                    {/* <div
                      className="container-fluid progress-bar-area"
                      style={{ height: "20%" }}
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
                                  className="active"
                                  style={{
                                    display: "inline-block",
                                    marginRight: "10px",
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
                    </div> */}
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
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleAddStatus}
              style={{ backgroundColor: "#b19552" }}
            >
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

export default DetailCustomerFilePage;
