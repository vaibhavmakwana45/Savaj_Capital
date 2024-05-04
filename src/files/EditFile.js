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
  const [isDragging, setIsDragging] = useState(false);
  const [datachanged, setDataChanged] = useState(false);

  useEffect(() => {
    const fetchFileDetails = async () => {
      try {
        const response = await AxiosInstance.get(
          `/file_upload/edit_file_upload/${id}`
        );
        console.log(response.data);

        if (response.data && response.data.statusCode === 200) {
          const details = response.data.data.fileDetails;
          setSelectedLoanId(details.loan_id);
          setSelectedLoanSubtypeId(details.loantype_id);
          const documentsWithCDN = details.documents.map((document) => ({
            ...document,
            file_path: `${CDN_BASE_URL}${document.file_path}`,
          }));

          
          const initialFileData = documentsWithCDN.reduce((acc, doc, index) => {
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
                new: false,
              },
            };
          }, {});
          
          console.log(documentsWithCDN, "documentsWithCDN", initialFileData)
          setFileData(initialFileData);
          setDataChanged(true);

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
    setTimeout(() => {
      const keys = Object.keys(fileData);

      if (keys.length != 0) {
        const keys = Object.keys(fileData);

        keys.forEach((key1) => {
          const url = fileData[key1]?.url;
          const name = fileData[key1]?.name;
          const type = fileData[key1]?.type;
          const key = fileData[key1]?.key;

          const event = {
            url: url,
            name: name,
            key: key,
            type: type,
          };

          const innerIndex = key.split("-")[1];

          handleFileInputChange(event, event.name, undefined, innerIndex, true);
        });
      }
    }, 500);
  }, [datachanged]);

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

  const handleFileInputChange = (event, title_id, index, innerIndex, edit) => {

    const file = edit == undefined ? event.target.files[0] : event;
    if (file) {
      const documentId =
        edit == undefined
          ? groupedLoanDocuments[title_id][index]?.document_ids[innerIndex]
          : title_id;
      const key = event.key;
      const filePreview = {
        name: file.name,
        url: edit == undefined ? URL.createObjectURL(file) : file.url,
        type: file.type,
        documentId: documentId,
        key: key,
      };

      console.log(filePreview, "filePreview");

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

  console.log(fileData, "afsdkjaldskfldkfjldkfj");

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
      console.log(
        groupedLoanDocuments[title_id],
        "groupedLoanDocuments[title_id]"
      );
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
                    {groupedLoanDocuments[title_id].map((documentGroup) =>
                      documentGroup.document_names.map(
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
                                className="drop-zone__file-input"
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
                                  className={`upload-area__drop-zone drop-zone ${
                                    isDragging ? "drop-zone--over" : ""
                                  }`}
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
                                  }}
                                >
                                  <span className="drop-zone__icon">
                                    <i className="bx bxs-file-image"></i>
                                  </span>
                                  <p className="drop-zone__paragraph">
                                    Drop your file here or click to browse
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

            {/* Submit and Cancel Buttons */}
            <div>
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
              <Button
                mt={4}
                colorScheme="yellow"
                style={{ marginTop: 40, marginLeft: 8 }}
                onClick={() => history.push("/superadmin/filetable")}
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

export default EditFile;
