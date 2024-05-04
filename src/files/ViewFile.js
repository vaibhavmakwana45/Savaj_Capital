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
} from "@chakra-ui/react";

import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import AxiosInstance from "config/AxiosInstance";
import { useLocation } from "react-router-dom";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

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

  return (
    <div>
      <div
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
      </div>
    </div>
  );
};

function ViewFile() {
  const location = useLocation();
  const history = useHistory();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [statusReason, setStatusReason] = useState("");
  const [statusImage, setStatusImage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await AxiosInstance.get(
          "/file_upload/file_upload/" + id
        );
        setFileData(response.data.data.file);
        console.log("response.data.data.file", response.data.data.file);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching file data:", error);
      }
    };

    fetchData();
  }, []);

  const handleAddStatus = async () => {
    try {
      const statusData = {
        file_id: fileData.file_id,
        user_id: fileData.user_id,
        reason: statusReason,
        status_img: statusImage,
      };

      await AxiosInstance.post("/file-status/file-status", statusData);
      console.log("Status added successfully!");
      onClose();
    } catch (error) {
      console.error("Error adding status:", error);
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
                  <Button colorScheme="blue" onClick={onOpen}>
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
                        backgroundColor: "#3182CE",
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
                      <div className="row  ">
                        <div
                          className="col"
                          style={{ position: "relative", zIndex: "9" }}
                        >
                          <ul className="progressbar">
                            <li id="step1" className="complete">
                              <div className="circle-container">
                                <a href="#">
                                  <div className="circle-button"></div>
                                </a>
                              </div>
                              Step 1
                            </li>

                            <li id="step2" className="complete">
                              <div className="circle-container">
                                <a href="#">
                                  <div className="circle-button"></div>
                                </a>
                              </div>
                              Step 2
                            </li>

                            <li id="step3" className="active">
                              <div className="circle-container">
                                <a href="#">
                                  <div className="circle-button"></div>
                                </a>
                              </div>
                              Step 3
                            </li>

                            <li id="step4">
                              <div className="circle-container">
                                <a href="#">
                                  <div className="circle-button"></div>
                                </a>
                              </div>
                              Step 4
                            </li>

                            <li id="step5">
                              <div className="circle-container">
                                <a href="#">
                                  <div className="circle-button"></div>
                                </a>
                              </div>
                              Step 5
                            </li>
                          </ul>
                        </div>
                      </div>
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
              <FormLabel>Status Image URL (optional)</FormLabel>
              <Input
                placeholder="Enter image URL"
                value={statusImage}
                onChange={(e) => setStatusImage(e.target.value)}
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
