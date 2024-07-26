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
  Input,
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
  const CDN_BASE_URL = "https://cdn.savajcapital.com/cdn/files/";
  const fileInputRefs = useRef({});
  const [uploadedFileName, setUploadedFileName] = useState([]);
  const [groupedLoanDocuments, setGroupedLoanDocuments] = useState({});
  const [selectedUser, setSelectedUser] = useState("");
  const [users, setUsers] = useState([]);
  // const [formData, setFormData] = useState({
  //   // stemp_paper_print: false,
  //   // loan_dispatch: false,
  //   // any other fields that need to be managed
  // });
  const [dateData, setdateData] = useState({
    start_date: "",
    end_date: "",
  });
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
          // setFormData({
          //   stemp_paper_print: details.stemp_paper_print,
          //   loan_dispatch: details.loan_dispatch,
          //   // set other necessary fields here
          // });
          setdateData({
            start_date: details.start_date || "",
            end_date: details.end_date || "",
          });

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

  const handleFileInputChange = (event, title_id, groupIndex, innerIndex) => {
    const file = event.target.files[0];
    if (file) {
      const documentId =
        groupedLoanDocuments[title_id][groupIndex].document_ids[innerIndex];
      const key = `${title_id}-${documentId}`;
      const filePreview = {
        name: file.name,
        url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
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
          formData.append("files", item.file);

          const response = await axios.post(
            "https://cdn.savajcapital.com/api/upload",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          if (response.data.status !== "ok") {
            throw new Error(response.data.message || "File upload failed");
          }

          if (!response.data.files || response.data.files.length === 0) {
            throw new Error("No file paths returned in the response");
          }

          const imageName = response.data.files[0].filename.split("/").pop();
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
        start_date: dateData.start_date,
        end_date: dateData.end_date,
        // stemp_paper_print: formData.stemp_paper_print,
        // loan_dispatch: formData.loan_dispatch,
      };

      await AxiosInstance.put(`/file_upload/${id}`, payload);
      history.push("/superadmin/filetable");
      toast.success("All data submitted successfully!");
    } catch (error) {
      console.error("Error while uploading files or submitting data:", error);
      toast.error("Submission failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // const handleCheckboxChange = (event) => {
  //   const { name, checked } = event.target;
  //   setFormData((prevFormData) => ({
  //     ...prevFormData,
  //     [name]: checked,
  //   }));
  // };
  const handledateChange = (e) => {
    const { name, value } = e.target;
    setdateData((prevDateData) => ({
      ...prevDateData,
      [name]: value,
    }));
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
                disabled={true} // This disables the Select component
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
                disabled={true} // This disables the Select component
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
                  disabled={true} // This disables the Select component
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
            <FormControl id="start_date" mt={4} isRequired>
              <FormLabel>Start Date</FormLabel>
              <Input
                name="start_date"
                type="date"
                onChange={handledateChange}
                value={dateData.start_date}
              />
            </FormControl>{" "}
            <FormControl id="end_date" mt={4} isRequired>
              <FormLabel>End Date</FormLabel>
              <Input
                name="end_date"
                type="date"
                onChange={handledateChange}
                value={dateData.end_date}
              />
            </FormControl>
            <div>
              {Object.entries(groupedLoanDocuments).map(
                ([title_id, documentGroups]) => (
                  <div key={title_id} className="my-3">
                    <h2 className="mx-4">
                      <i>
                        <u>
                          <b>{documentGroups[0].title}</b>
                        </u>
                      </i>
                    </h2>
                    <div
                      className="d-flex mainnnn"
                      style={{ overflow: "auto" }}
                    >
                      {documentGroups.map((documentGroup, groupIndex) =>
                        documentGroup.document_names.map(
                          (documentName, innerIndex) => {
                            const documentId =
                              documentGroup.document_ids[innerIndex];
                            const key = `${title_id}-${documentId}`;
                            return (
                              <div
                                key={key}
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
                                    id={`fileInput-${key}`}
                                    className="drop-zone__file-input"
                                    onChange={(event) =>
                                      handleFileInputChange(
                                        event,
                                        title_id,
                                        groupIndex,
                                        innerIndex
                                      )
                                    }
                                    style={{ display: "none" }}
                                  />
                                  {fileData[key] ? (
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
                                        onClick={() => handleRemoveFile(key)}
                                        style={{ margin: "0 10px" }}
                                      />
                                      {fileData[key].url ? (
                                        fileData[key].type ===
                                        "application/pdf" ? (
                                          <embed
                                            src={fileData[key].url}
                                            type="application/pdf"
                                            style={{
                                              width: "100%",
                                              minHeight: "100px",
                                            }}
                                          />
                                        ) : (
                                          <img
                                            src={fileData[key].url}
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
                                          {fileData[key].name}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <div
                                      className={`upload-area__drop-zone drop-zone`}
                                      onClick={() => {
                                        document
                                          .getElementById(`fileInput-${key}`)
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
                            );
                          }
                        )
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
            {/* <FormControl id="stemp_paper_print" mt={4}>
              <Checkbox
                name="stemp_paper_print"
                onChange={handleCheckboxChange}
                isChecked={formData.stemp_paper_print}
              >
                Stemp Paper Print
              </Checkbox>
            </FormControl>

            <FormControl id="loan_dispatch" mt={4}>
              <Checkbox
                name="loan_dispatch"
                onChange={handleCheckboxChange}
                isChecked={formData.loan_dispatch}
              >
                Loan Dispatch
              </Checkbox>
            </FormControl> */}
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
