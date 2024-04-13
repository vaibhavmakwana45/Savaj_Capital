import React, { useState, useEffect, useRef, createRef } from "react";
import "./file.scss";
import { useHistory } from "react-router-dom";
import {
  Button,
  Select,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useColorModeValue,
  FormControl,
  FormLabel,
  Input,
  Flex,
  Text,
} from "@chakra-ui/react";
import { IconButton } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import toast, { Toaster } from "react-hot-toast";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import AxiosInstance from "config/AxiosInstance";
import axios from "axios";

function AddFiles() {
  const history = useHistory();
  const textColor = useColorModeValue("gray.700", "white");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [loanType, setLoanType] = useState([]);
  const [loanSubType, setLoanSubType] = useState([]);
  const [selectedLoanType, setSelectedLoanType] = useState({});

  const fetchUsers = async () => {
    try {
      const response = await AxiosInstance.get("/addusers/getusers");
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchLoanType = async () => {
    try {
      const response = await AxiosInstance.get("/loan");
      setLoanType(response.data.data);
    } catch (error) {
      console.error("Error fetching loans:", error);
    }
  };
  useEffect(() => {
    fetchLoanType();
  }, []);

  const handleLoanTypeChange = async (event) => {
    const loanId = event.target.value;
    const selectedType = loanType.find((loan) => loan.loan_id === loanId);
    setSelectedLoanType(selectedType || {});

    if (selectedType && selectedType.is_subtype) {
      try {
        const response = await AxiosInstance.get(
          `/loan_type/loan_type/${loanId}`
        );
        setLoanSubType(response.data.data);
      } catch (error) {
        console.error("Error fetching loan subtypes:", error);
        setLoanSubType([]);
      }
    } else {
      setLoanSubType([]);
    }
  };

  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loanDocuments, setLoanDocuments] = useState([]);

  const imagesTypes = ["jpeg", "png", "svg", "gif"];

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    uploadFile(file);
  };

  const progressMove = () => {
    let counter = 0;
    setTimeout(() => {
      const counterIncrease = setInterval(() => {
        if (counter === 100) {
          clearInterval(counterIncrease);
        } else {
          counter += 10;
          setUploadProgress(counter);
        }
      }, 100);
    }, 600);
  };

  useEffect(() => {
    const fetchLoanDocuments = async () => {
      try {
        let url;
        if (selectedLoanType.loan_id && selectedLoanType.loansubtype_id) {
          url = `/loan_docs/loan_docs/${selectedLoanType.loan_id}/${selectedLoanType.loansubtype_id}`;
        } else if (selectedLoanType.loan_id) {
          url = `/loan_docs/${selectedLoanType.loan_id}`;
        }
        if (url) {
          const response = await AxiosInstance.get(url);
          setLoanDocuments(response.data.data);
          console.log("response.data.data", response.data.data);
        }
      } catch (error) {
        console.error("Error fetching loan documents:", error);
      }
    };

    fetchLoanDocuments();
  }, [selectedLoanType]);

  const fileInputRefs = useRef([]);

  useEffect(() => {
    fileInputRefs.current = loanDocuments.map(
      (_, index) => fileInputRefs.current[index] || createRef()
    );
  }, [loanDocuments]);

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [selectedLoanSubtypeId, setSelectedLoanSubtypeId] = useState("");

  const handleUserChange = (event) => {
    setSelectedUser(event.target.value);
  };

  const handleLoanChange = (event) => {
    setSelectedLoanId(event.target.value);
  };

  const handleLoanSubtypeChange = (event) => {
    setSelectedLoanSubtypeId(event.target.value);
  };

  const [fileData, setFileData] = useState([]);

  const handleFileInputChange = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      const filePreview = {
        name: file.name,
        url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        type: file.type,
        documentId: loanDocuments[index].loan_document_id, // Store the document ID along with the file info
      };
      setFileData((prevData) => {
        const newData = prevData.slice();
        newData[index] = filePreview;
        return newData;
      });
      setUploadedFileName((prevFiles) => [
        ...prevFiles,
        {
          file,
          name: file.name,
          documentId: loanDocuments[index].loan_document_id,
        },
      ]);
    }
  };

  const handleRemoveFile = (index) => {
    setFileData((prevData) => {
      const newData = [...prevData];
      newData[index] = undefined;
      return newData;
    });
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index].current.value = "";
    }
  };

  const handleSubmitData = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Form submission started");

    try {
      const uploadPromises = uploadedFileName.map(async (item) => {
        const formData = new FormData();
        formData.append("b_video", item.file);
        console.log("Uploading file", item.file.name);

        const response = await axios.post(
          "https://cdn.dohost.in/image_upload.php/",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("Upload response", response.data);

        if (!response.data.success) {
          throw new Error(response.data.msg || "File upload failed");
        }

        if (!response.data.iamge_path) {
          throw new Error("Image path is missing in the response");
        }

        const imageName = response.data.iamge_path.split("/").pop();
        console.log("Extracted image name", imageName);
        return { ...item, path: imageName, documentId: item.documentId };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      console.log("Uploaded files", uploadedFiles);

      const payload = {
        user_id: selectedUser,
        loan_id: selectedLoanId,
        loantype_id: selectedLoanSubtypeId,
        documents: uploadedFiles.map((file) => ({
          file_path: file.path,
          loan_document_id: file.documentId,
        })),
      };

      console.log("Payload to send", payload);
      const response = await AxiosInstance.post("/file_uplode", payload);
      console.log("Server response", response.data);

      history.push("/superadmin/filetable");
      toast.success("All data submitted successfully!");
    } catch (error) {
      console.error("Error while uploading files or submitting data:", error);
      toast.error("Submission failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }}>
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" color={textColor} fontWeight="bold">
                Add File
              </Text>
            </Flex>
          </CardHeader>
          <CardBody>
            <FormControl id="user_id" mt={4} isRequired>
              <FormLabel>User</FormLabel>
              <Select placeholder="Select user" onChange={handleUserChange}>
                {users.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {`${user.username} (${user.email})`}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl
              id="loan_id"
              mt={4}
              isRequired
              onChange={handleLoanChange}
            >
              <FormLabel>Loan Type</FormLabel>
              <Select placeholder="Select Loan" onChange={handleLoanTypeChange}>
                {loanType.map((loan) => (
                  <option key={loan.loan_id} value={loan.loan_id}>
                    {loan.loan}
                  </option>
                ))}
              </Select>
            </FormControl>
            {selectedLoanType.is_subtype && loanSubType.length > 0 && (
              <FormControl
                id="loantype_id"
                mt={4}
                isRequired
                onChange={handleLoanSubtypeChange}
              >
                <FormLabel>Loan Subtype</FormLabel>
                <Select
                  placeholder="Select Loan Subtype"
                  onChange={(event) => {
                    setSelectedLoanType({
                      ...selectedLoanType,
                      loansubtype_id: event.target.value,
                    });
                  }}
                >
                  {loanSubType.map((subType) => (
                    <option
                      key={subType.loantype_id}
                      value={subType.loantype_id}
                    >
                      {subType.loan_type}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}

            <div style={{ marginTop: "40px" }}>
              <div className="d-flex">
                <div className="d-flex">
                  {loanDocuments.map((document, index) => (
                    <div key={document._id} className="upload-area col-6">
                      <Text fontSize="xl" className="mx-3" color={textColor}>
                        {document.loan_document}
                      </Text>
                      <input
                        type="file"
                        ref={fileInputRefs.current[index]}
                        className="drop-zoon__file-input"
                        onChange={(event) =>
                          handleFileInputChange(event, index)
                        }
                        style={{ display: "none" }}
                      />
                      {fileData[index] ? (
                        <div
                          className="file-preview"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          {fileData[index].url ? (
                            <img
                              src={fileData[index].url}
                              alt="Preview"
                              style={{
                                width: 100,
                                height: 100,
                                marginRight: "auto",
                                marginLeft: "auto",
                              }}
                            />
                          ) : (
                            <span
                              style={{
                                marginRight: "auto",
                                marginLeft: "auto",
                              }}
                            >
                              {fileData[index].name}
                            </span>
                          )}
                          <IconButton
                            aria-label="Remove file"
                            icon={<CloseIcon />}
                            size="sm"
                            onClick={() => handleRemoveFile(index)}
                            style={{ margin: "0 10px" }}
                          />
                        </div>
                      ) : (
                        <div
                          className={`upload-area__drop-zoon drop-zoon ${
                            isDragging ? "drop-zoon--over" : ""
                          }`}
                          onClick={() =>
                            fileInputRefs.current[index].current.click()
                          }
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                          }}
                        >
                          <span className="drop-zoon__icon">
                            <i className="bx bxs-file-image"></i>
                          </span>
                          <p className="drop-zoon__paragraph">
                            Drop your file here or click to browse
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button
              mt={4}
              colorScheme="teal"
              onClick={handleSubmitData}
              isLoading={loading}
              loadingText="Submitting"
              style={{ marginTop: 40 }}
            >
              Submit
            </Button>
          </CardBody>
        </Card>
      </Flex>
      <Toaster />
    </>
  );
}

export default AddFiles;
