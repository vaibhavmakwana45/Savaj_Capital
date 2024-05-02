import React, { useState, useEffect, useRef } from "react";
import "./file.scss";
import {
  Button,
  Select,
  useColorModeValue,
  FormControl,
  FormLabel,
  Flex,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { useHistory, useLocation } from "react-router-dom";
import { CloseIcon } from "@chakra-ui/icons";
import toast, { Toaster } from "react-hot-toast";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import AxiosInstance from "config/AxiosInstance";
import axios from "axios";

function EditFile() {
  const history = useHistory();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
  const textColor = useColorModeValue("gray.700", "white");
  const [loading, setLoading] = useState(false);
  const [loanType, setLoanType] = useState([]);
  const [loanSubType, setLoanSubType] = useState([]);
  const [selectedLoanType, setSelectedLoanType] = useState({});
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [selectedLoanSubtypeId, setSelectedLoanSubtypeId] = useState("");
  const [fileData, setFileData] = useState({});
  const CDN_BASE_URL = "https://cdn.dohost.in/upload/";
  const fileInputRefs = useRef({});
  const [uploadedFileName, setUploadedFileName] = useState([]);
  const [groupedLoanDocuments, setGroupedLoanDocuments] = useState({});
  console.log('groupedLoanDocuments', groupedLoanDocuments)
  console.log('fileData', fileData)

  useEffect(() => {
    const fetchFileDetails = async () => {
      try {
        const response = await AxiosInstance.get(`/file_upload/edit_file_upload/${id}`);
        if (response.data && response.data.statusCode === 200) {
          const details = response.data.data.fileDetails;
          setSelectedLoanId(details.loan_id);
          setSelectedLoanSubtypeId(details.loantype_id);
  
          // Log documents array to ensure correct data
          console.log("Fetched documents:", details.documents);
  
          // Initialize fileData with existing files
          const initialFileData = {};
          if (Array.isArray(details.documents) && details.documents.length > 0) {
            details.documents.forEach((document, index) => {
              const key = `${document.title_id}-${index}`;
              initialFileData[key] = {
                url: `${CDN_BASE_URL}${document.file_path}`,
                name: document.title_id,
                type: document.file_path.endsWith(".pdf") ? "application/pdf" : "image",
                new: false,
              };
            });
          }
          console.log("initialFileData:", initialFileData); // Log initialFileData
          setFileData(initialFileData);
  
          // Other code...
        } else {
          throw new Error("Failed to fetch file details");
        }
      } catch (error) {
        console.error("Error fetching file details:", error);
        toast.error("Failed to load file details.");
      }
    };
  
    fetchFileDetails();
  }, [id]);
  
  
  
  

  useEffect(() => {
    const fetchLoanType = async () => {
      try {
        const response = await AxiosInstance.get("/loan");
        setLoanType(response.data.data);
      } catch (error) {
        console.error("Error fetching loans:", error);
      }
    };
    fetchLoanType();
  }, []);

  useEffect(() => {
    const fetchLoanSubtypes = async () => {
      if (!selectedLoanId) return;

      const selectedType =
        loanType.find((loan) => loan.loan_id === selectedLoanId) || {};
      setSelectedLoanType(selectedType);

      if (selectedType.is_subtype) {
        try {
          const response = await AxiosInstance.get(
            `/loan_type/loan_type/${selectedLoanId}`
          );
          const subtypes = response.data.data || [];
          setLoanSubType(subtypes);
          setSelectedLoanSubtypeId(
            subtypes.length > 0 ? subtypes[0].loantype_id : ""
          );
        } catch (error) {
          console.error("Error fetching loan subtypes:", error);
          setLoanSubType([]);
          setSelectedLoanSubtypeId("");
        }
      } else {
        setLoanSubType([]);
        setSelectedLoanSubtypeId("");
      }
    };

    fetchLoanSubtypes();
  }, [selectedLoanId, loanType]);

  useEffect(() => {
    const fetchLoanDocuments = async () => {
      try {
        let url;
        if (selectedLoanType.is_subtype) {
          if (selectedLoanType.loan_id && selectedLoanType.loansubtype_id) {
            url = `/loan_docs/documents/${selectedLoanType.loan_id}/${selectedLoanType.loansubtype_id}`;
          }
        } else if (selectedLoanType.loan_id) {
          url = `/loan_docs/${selectedLoanType.loan_id}`;
        }

        if (url) {
          const response = await AxiosInstance.get(url);
          const data = response.data.data;

          const grouped = data.reduce((acc, document) => {
            if (!acc[document.title_id]) {
              acc[document.title_id] = [];
            }
            acc[document.title_id].push(document);
            return acc;
          }, {});

          setGroupedLoanDocuments(grouped);
        }
      } catch (error) {
        console.error("Error fetching loan documents:", error);
      }
    };

    if (
      (selectedLoanType.is_subtype && selectedLoanType.loansubtype_id) ||
      !selectedLoanType.is_subtype
    ) {
      fetchLoanDocuments();
    } else {
      setGroupedLoanDocuments({});
    }
  }, [selectedLoanType]);

  useEffect(() => {
    const newFileInputRefs = {};
    Object.keys(groupedLoanDocuments).forEach((title_id) => {
      groupedLoanDocuments[title_id].forEach((documentGroup, index) => {
        documentGroup.document_ids.forEach((documentId, innerIndex) => {
          const refKey = `${title_id}-${index}-${innerIndex}`;
          newFileInputRefs[refKey] = () => {
            const element = document.getElementById(
              `fileInput-${title_id}-${index}-${innerIndex}`
            );
            if (element) {
              element.click();
            } else {
              console.error("Ref or current element is null or undefined");
            }
          };
        });
      });
    });
    fileInputRefs.current = newFileInputRefs;
  }, [groupedLoanDocuments]);

  const handleLoanTypeChange = (event) => {
    const loanId = event.target.value;
    const selectedLoan = loanType.find((loan) => loan.loan_id === loanId);
    setSelectedLoanType(selectedLoan || {});
  };

  const handleFileInputChange = (event, title_id, index, innerIndex, doc_id) => {
    const file = event.target.files[0];
    if (file) {
      const key = `${title_id}-${index}-${innerIndex}-${doc_id}`; // Append doc_id to ensure uniqueness
      const filePreview = {
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        documentId: doc_id, // Use doc_id instead of groupedLoanDocuments[title_id][index].document_ids[innerIndex]
        key: key,
        new: true, // Indicate that this file is newly uploaded
      };
  
      setFileData((prevData) => ({
        ...prevData,
        [key]: filePreview,
      }));
  
      // Ensure unique key for each uploaded file
      const newKey = `${title_id}-${index}-${innerIndex}-${doc_id}-${Date.now()}`;
      setUploadedFileName((prevUploadedFiles) => [
        ...prevUploadedFiles,
        { file: file, documentId: doc_id, title_id: title_id, key: newKey, new: true },
      ]);
    }
  };
  

  const handleRemoveFile = (key) => {
    setFileData((prevData) => {
      const newData = { ...prevData };
      delete newData[key];
      return newData;
    });

    setUploadedFileName((prevUploadedFiles) => {
      return prevUploadedFiles.filter(
        (uploadedFile) => uploadedFile.key !== key
      );
    });
  };

  const handleSubmitData = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fileDataArray = Object.values(uploadedFileName);

    try {
      const newFiles = fileDataArray.filter((file) => file.new);
      const existingFiles = fileDataArray.filter((file) => !file.new);

      const uploadPromises = newFiles.map(async (item) => {
        const formData = new FormData();
        formData.append("b_video", item.file);

        const response = await axios.post(
          "https://cdn.dohost.in/image_upload.php/",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (!response.data.success) {
          throw new Error(response.data.msg || "File upload failed");
        }

        return {
          path: response.data.image_path,
          loan_document_id: item.loan_document_id,
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      const documents = existingFiles
        .map((file) => ({
          file_path: file.url.split(CDN_BASE_URL).pop(),
          loan_document_id: file.loan_document_id,
        }))
        .concat(
          uploadedFiles.map((file) => ({
            file_path: file.path.split("/").pop(),
            loan_document_id: file.loan_document_id,
          }))
        );

      const payload = {
        user_id: selectedUser,
        loan_id: selectedLoanId,
        loantype_id: selectedLoanSubtypeId,
        documents: documents,
      };

      await AxiosInstance.put(`/file_upload/${id}`, payload);

      history.push("/superadmin/filetable");
      toast.success("All data updated successfully!");
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
                Edit File
              </Text>
            </Flex>
          </CardHeader>
          <CardBody>
            {/* Loan Type Select */}
            <FormControl id="loan_id" mt={4} isRequired>
              <FormLabel>Loan Type</FormLabel>
              <Select
                placeholder="Select loan type"
                onChange={handleLoanTypeChange}
                value={selectedLoanId}
              >
                {loanType.map((loan) => (
                  <option key={loan.loan_id} value={loan.loan_id}>
                    {loan.loan}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Loan Subtype Select */}
            {selectedLoanType.is_subtype && (
              <FormControl id="loantype_id" mt={4}>
                <FormLabel>Loan Subtype</FormLabel>
                <Select
                  placeholder="Select loan subtype"
                  onChange={(event) =>
                    setSelectedLoanSubtypeId(event.target.value)
                  }
                  value={selectedLoanSubtypeId}
                >
                  {loanSubType.length > 0 ? (
                    loanSubType.map((subType) => (
                      <option
                        key={subType.loantype_id}
                        value={subType.loantype_id}
                      >
                        {subType.loan_type}
                      </option>
                    ))
                  ) : (
                    <option disabled>No subtypes available</option>
                  )}
                </Select>
              </FormControl>
            )}

            {/* File Upload Section */}
            <div>
              {Object.keys(groupedLoanDocuments).map((title_id) => (
                <div key={title_id} className="my-3">
                  <h2 className="mx-4">
                    <i>
                      <u>
                        <b>{groupedLoanDocuments[title_id][0].title}</b>
                      </u>
                    </i>
                  </h2>
                  <div className="d-flex mainnnn" style={{ overflow: "auto" }}>
                    {groupedLoanDocuments[title_id].map(
                      (documentGroup, index) => (
                        <div key={`${title_id}-${index}`} className="d-flex ">
                          {documentGroup.document_names.map(
                            (documentName, innerIndex) => (
                              <div
                                key={`${title_id}-${index}-${innerIndex}`}
                                className="upload-area col-xl-12 col-md-12 col-sm-12"
                              >
                                <Text
                                  fontSize="xl"
                                  className="mx-3"
                                  style={{
                                    fontSize: "12px",
                                    textTransform: "capitalize",
                                  }}
                                >
                                  {documentName}
                                </Text>
                                <div className="upload-option">
                                  <input
                                    type="file"
                                    id={`fileInput-${title_id}-${index}-${innerIndex}`}
                                    className="drop-zoon__file-input"
                                    onChange={(event) =>
                                      handleFileInputChange(
                                        event,
                                        title_id,
                                        index,
                                        innerIndex
                                      )
                                    }
                                    style={{ display: "none" }}
                                  />

                                  {fileData[
                                    `${title_id}-${index}-${innerIndex}`
                                  ] ? (
                                    <div className="file-preview text-end">
                                      {fileData[
                                        `${title_id}-${index}-${innerIndex}`
                                      ].url ? (
                                        fileData[
                                          `${title_id}-${index}-${innerIndex}`
                                        ].type === "application/pdf" ? (
                                          <embed
                                            src={
                                              fileData[
                                                `${title_id}-${index}-${innerIndex}`
                                              ].url
                                            }
                                            type="application/pdf"
                                            width="100%"
                                            height="300"
                                          />
                                        ) : (
                                          <img
                                            src={
                                              fileData[
                                                `${title_id}-${index}-${innerIndex}`
                                              ].url
                                            }
                                            alt="preview"
                                            className="img-preview"
                                          />
                                        )
                                      ) : null}
                                      <IconButton
                                        variant="outline"
                                        colorScheme="red"
                                        aria-label="Delete Image"
                                        icon={<CloseIcon />}
                                        onClick={() =>
                                          handleRemoveFile(
                                            `${title_id}-${index}-${innerIndex}`
                                          )
                                        }
                                      />
                                    </div>
                                  ) : (
                                    <div
                                      className="file-upload d-flex align-items-center justify-content-center"
                                      onClick={
                                        fileInputRefs.current[
                                          `${title_id}-${index}-${innerIndex}`
                                        ]
                                      }
                                    >
                                      <p>Upload</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </Flex>
      <Button
        colorScheme="blue"
        isLoading={loading}
        loadingText="Updating..."
        onClick={handleSubmitData}
        mt="20px"
      >
        Update
      </Button>
      <Toaster position="top-right" />
    </>
  );
}

export default EditFile;
