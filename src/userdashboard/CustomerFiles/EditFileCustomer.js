import React, { useState, useEffect, useRef } from "react";
import "./userfile.scss";
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

function EditFileCustomer() {
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
  const [selectedUser, setSelectedUser] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchFileDetails = async () => {
      try {
        const response = await AxiosInstance.get(
          `/file_upload/edit_file_upload/${id}`
        );

        if (response.data && response.data.statusCode === 200) {
          const details = response.data.data.fileDetails;
          setSelectedUser(details.user_id);
          setSelectedLoanId(details.loan_id);
          setSelectedLoanSubtypeId(details.loantype_id);
          const documentsWithCDN = details.documents.map((document) => ({
            ...document,
            file_path: `${CDN_BASE_URL}${document.file_path}`,
          }));

          const initialFileData = documentsWithCDN.reduce((acc, doc) => {
            const key = `${doc.key}`;
            return {
              ...acc,
              [key]: {
                url: doc.file_path,
                name: doc.title_id,
                key: doc.key,
                type: doc.file_path.endsWith(".pdf")
                  ? "application/pdf"
                  : "image",
                documentId: doc.loan_document_id,
                new: false,
              },
            };
          }, {});

          setFileData(initialFileData);

          const selectedLoan = loanType.find(
            (loan) => loan.loan_id === details.loan_id
          );
          setSelectedLoanType(selectedLoan || {});

          if (selectedLoan && selectedLoan.is_subtype) {
            const selectedSubtype = loanSubType.find(
              (subtype) => subtype.loantype_id === details.loantype_id
            );
            if (selectedSubtype) {
              setSelectedLoanType({
                ...selectedLoan,
                loansubtype_id: selectedSubtype.loantype_id,
              });
            }
          }
        } else {
          throw new Error("Failed to fetch file details");
        }
      } catch (error) {
        console.error("Error fetching file details:", error);
        toast.error("Failed to load file details.");
      }
    };

    fetchFileDetails();
  }, [loanType, loanSubType]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await AxiosInstance.get("/addusers/getusers");
        setUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

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

  const handleLoanTypeChange = (event) => {
    const loanId = event.target.value;
    const selectedLoan = loanType.find((loan) => loan.loan_id === loanId);
    setSelectedLoanType(selectedLoan || {});
  };

  const handleFileInputChange = (
    event,
    title_id,
    index,
    groupIndex,
    innerIndex
  ) => {
    const file = event.target.files[0];
    if (file) {
      const documentId =
        groupedLoanDocuments[title_id][groupIndex].document_ids[innerIndex];
      const key = `${title_id}-${index}-${innerIndex}`;
      const isImage = file.type.startsWith("image/");
      const filePreview = {
        name: file.name,
        url: isImage ? URL.createObjectURL(file) : null,
        type: file.type,
        documentId: documentId,
        key: key,
      };

      setFileData((prevData) => ({
        ...prevData,
        [key]: filePreview,
      }));

      setUploadedFileName((prevUploadedFiles) => [
        ...prevUploadedFiles,
        { file: file, documentId: documentId, title_id: title_id, key: key },
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

  const handleSubmitData = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const uploadedFiles = await Promise.all(
        uploadedFileName.map(async (item) => {
          const formData = new FormData();
          formData.append("b_video", item.file);

          const response = await axios.post(
            "https://cdn.dohost.in/image_upload.php/",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          if (!response.data.success) {
            throw new Error(response.data.msg || "File upload failed");
          }

          if (!response.data.iamge_path) {
            throw new Error("Image path is missing in the response");
          }

          const imageName = response.data.iamge_path.split("/").pop();
          return {
            ...item,
            path: imageName,
            loan_document_id: item.documentId,
          };
        })
      );

      const adjustedFileData = Object.fromEntries(
        Object.entries(fileData).map(([key, file]) => {
          const fileName = file.url ? file.url.split("/").pop() : file.name;
          return [
            key,
            {
              file_path: fileName,
              loan_document_id: file.documentId,
              title_id: file.name,
              key: file.key,
            },
          ];
        })
      );

      uploadedFiles.forEach((file) => {
        adjustedFileData[file.key] = {
          file_path: file.path,
          loan_document_id: file.loan_document_id,
          title_id: file.title_id,
          key: file.key,
        };
      });

      const combinedFiles = Object.values(adjustedFileData);

      const payload = {
        user_id: selectedUser,
        loan_id: selectedLoanId,
        loantype_id: selectedLoanSubtypeId,
        documents: combinedFiles.map((file) => ({
          file_path: file.file_path,
          title_id: file.title_id,
          loan_document_id: file.loan_document_id,
          key: file.key,
        })),
      };

      const response = await AxiosInstance.put(`/file_upload/${id}`, payload);

      history.push("/user/userfile");
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
                Edit File
              </Text>
            </Flex>
          </CardHeader>
          <CardBody>
            <FormControl id="user_id" mt={4} isRequired>
              <FormLabel>User</FormLabel>
              <Select
                placeholder="Select user"
                onChange={(event) => setSelectedUser(event.target.value)}
                value={selectedUser}
                disabled={true}
              >
                {users.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {`${user.username} (${user.email})`}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl id="loan_id" mt={4} isRequired>
              <FormLabel>Loan Type</FormLabel>
              <Select
                placeholder="Select loan type"
                onChange={handleLoanTypeChange}
                value={selectedLoanId}
                disabled={true}
              >
                {loanType.map((loan) => (
                  <option key={loan.loan_id} value={loan.loan_id}>
                    {loan.loan}
                  </option>
                ))}
              </Select>
            </FormControl>

            {selectedLoanType.is_subtype && (
              <FormControl id="loantype_id" mt={4}>
                <FormLabel>Loan Subtype</FormLabel>
                <Select
                  placeholder="Select loan subtype"
                  onChange={(event) =>
                    setSelectedLoanSubtypeId(event.target.value)
                  }
                  value={selectedLoanSubtypeId}
                  disabled={true}
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

            <div>
              {Object.entries(groupedLoanDocuments).map(([title_id], index) => (
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
                      (documentGroup, groupIndex) =>
                        documentGroup.document_names.map(
                          (documentName, innerIndex) => (
                            <div
                              key={`${title_id}-${index}-${innerIndex}`}
                              className="upload-area col-xl-12 col-md-12 col-sm-12"
                              onClick={() => {
                                document
                                  .getElementById(
                                    `fileInput-${title_id}-${index}-${innerIndex}`
                                  )
                                  .click();
                              }}
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
                                  className="drop-zone__file-input"
                                  onChange={(event) =>
                                    handleFileInputChange(
                                      event,
                                      title_id,
                                      index,
                                      groupIndex,
                                      innerIndex
                                    )
                                  }
                                  style={{ display: "none" }}
                                />
                                {fileData[
                                  `${title_id}-${index}-${innerIndex}`
                                ] ? (
                                  <div
                                    className="file-preview text-end"
                                    style={{
                                      marginTop: "15px",
                                      justifyContent: "space-between",
                                      width: "100%",
                                      padding: "10px",
                                      backgroundColor: "#e8f0fe",
                                      borderRadius: "8px",
                                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                    }}
                                  >
                                    <IconButton
                                      aria-label="Remove file"
                                      icon={<CloseIcon />}
                                      size="sm"
                                      onClick={() =>
                                        handleRemoveFile(
                                          `${title_id}-${index}-${innerIndex}`
                                        )
                                      }
                                      style={{ margin: "0 10px" }}
                                    />
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
                                          style={{
                                            width: "100%",
                                            minHeight: "100px",
                                          }}
                                        />
                                      ) : (
                                        <img
                                          src={
                                            fileData[
                                              `${title_id}-${index}-${innerIndex}`
                                            ].url
                                          }
                                          alt="Preview"
                                          style={{
                                            width: 100,
                                            height: 100,
                                            margin: "auto",
                                            borderRadius: "4px",
                                          }}
                                        />
                                      )
                                    ) : (
                                      <span
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          width: "100%",
                                          padding: "20px",
                                        }}
                                      >
                                        <i className="bx bxs-file"></i>
                                        {
                                          fileData[
                                            `${title_id}-${index}-${innerIndex}`
                                          ].name
                                        }
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <div
                                    onClick={() => {
                                      document
                                        .getElementById(
                                          `fileInput-${title_id}-${index}-${innerIndex}`
                                        )
                                        .click();
                                    }}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      flexDirection: "column",
                                      border: "2px dashed rgb(171, 202, 255)",
                                      borderRadius: "15px",
                                      marginTop: "25px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <span className="drop-zone__icon">
                                      <i className="bx bxs-file-image"></i>
                                    </span>
                                    <p className="drop-zone__paragraph">
                                    Upload Your Documents
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        )
                    )}
                  </div>
                </div>
              ))}
            </div>
        
            <div>
              <Button
                mt={4}
                colorScheme="teal"
                onClick={handleSubmitData}
                isLoading={loading}
                loadingText="Submitting"
                style={{
                  backgroundColor: "#b19552",
                  color: "#fff",
                  marginTop: 40,
                }}
              >
                Submit
              </Button>
              <Button
                mt={4}
                style={{
                  backgroundColor: "#414650",
                  color: "#fff",
                  marginTop: 40,
                  marginLeft: 8,
                }}
                onClick={() => history.push("/user/userfile")}
              >
                Cancel
              </Button>
            </div>
          </CardBody>
        </Card>
      </Flex>

      <Toaster />
    </>
  );
}

export default EditFileCustomer;
