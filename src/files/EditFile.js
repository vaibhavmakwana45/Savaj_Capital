import React, { useState, useEffect, useRef, createRef } from "react";
import "./file.scss";
import { useHistory, useLocation } from "react-router-dom";
import {
  Button,
  Select,
  useColorModeValue,
  FormControl,
  FormLabel,
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

function EditFile() {
  const history = useHistory();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
  const textColor = useColorModeValue("gray.700", "white");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [loanType, setLoanType] = useState([]);
  const [loanSubType, setLoanSubType] = useState([]);
  const [selectedLoanType, setSelectedLoanType] = useState({});
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [selectedLoanSubtypeId, setSelectedLoanSubtypeId] = useState("");
  const [savajcapitalbranch, setSavajcapitalbranch] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [savajcapitalbranchUser, setSavajcapitalbranchUser] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedBranchUserId, setSelectedBranchUserId] = useState("");
  const [loanDocuments, setLoanDocuments] = useState([]);
  const [fileData, setFileData] = useState([]);
  const CDN_BASE_URL = "https://cdn.dohost.in/upload/";

  // function to get extension
  function getFileExtension(url) {
    // Split the URL by dot (.)
    if (url !== undefined) { 
      const parts = url.split(".");
      // Get the last part which should be the extension
      const extension = parts[parts.length - 1];
      return extension.toLowerCase(); // Return extension in lowercase for consistency
    }else{
      return;
    }
  }

  useEffect(() => {
    const fetchFileDetails = async () => {
      try {
        const response = await AxiosInstance.get(
          `/file_upload/edit_file_upload/${id}`
        );
        if (response.data && response.data.statusCode === 200) {
          const details = response.data.data.fileDetails;
          setSelectedLoanId(details.loan_id);
          setSelectedUser(details.user_id);
          setSelectedLoanSubtypeId(details.loantype_id);
          setSelectedBranchId(details.branch_id);
          setSelectedBranchUserId(details.branchuser_id);
          const documentsWithCDN = details.documents.map((doc) => ({
            ...doc,
            file_path: `${CDN_BASE_URL}${doc.file_path}`,
          }));
          setLoanDocuments(documentsWithCDN);

          const initialFileData = documentsWithCDN.reduce(
            (acc, doc, index) => ({
              ...acc,
              [index]: {
                url: doc.file_path,
                name: doc.file_name,
                type: "application/pdf",
                new: false,
              },
            }),
            {}
          );
          setFileData(initialFileData);
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
    const fetchSavajcapitalbranch = async () => {
      try {
        const response = await AxiosInstance.get("/branch");
        setSavajcapitalbranch(response.data.data);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    fetchSavajcapitalbranch();
    getRolesData();
  }, []);

  useEffect(() => {
    if (!selectedBranchId) {
      setSavajcapitalbranchUser([]);
      return;
    }
    const fetchSavajcapitalbranchUser = async () => {
      try {
        const response = await AxiosInstance.get(
          `/savaj_user/${selectedBranchId}`
        );
        setSavajcapitalbranchUser(response.data.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching branch users:", error);
      }
    };
    fetchSavajcapitalbranchUser();
  }, [selectedBranchId]);

  const getRolesData = async () => {
    try {
      const response = await AxiosInstance.get("/role/");
      if (response.data.success) {
        setRoles(response.data.data);
      } else {
        alert("Please try again later...!");
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const handleLoanTypeChange = (event) => {
    const loanId = event.target.value;
    const selectedLoan = loanType.find((loan) => loan.loan_id === loanId);
    setSelectedLoanType(selectedLoan || {});
  };

  const handleBranchChange = (event) => {
    setSelectedBranchId(event.target.value);
  };

  const handleBranchUserChange = (event) => {
    setSelectedBranchUserId(event.target.value);
  };

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

  const getRoleName = (roleId) => {
    const role = roles.find((role) => role.role_id === roleId);
    return role ? role.role : "No role found";
  };

  useEffect(() => {
    const fetchLoanDocuments = async () => {
      if (
        !selectedLoanId ||
        (selectedLoanType.is_subtype && !selectedLoanSubtypeId)
      ) {
        setLoanDocuments([]);
        return;
      }
      let url = selectedLoanType.is_subtype
        ? `/loan_docs/loan_docs/${selectedLoanId}/${selectedLoanSubtypeId}`
        : `/loan_docs/${selectedLoanId}`;

      try {
        const response = await AxiosInstance.get(url);
        setLoanDocuments(response.data.data || []);
      } catch (error) {
        toast.error("Error fetching loan documents.");
        setLoanDocuments([]);
      }
    };

    fetchLoanDocuments();
  }, [selectedLoanId, selectedLoanSubtypeId, selectedLoanType]);

  const fileInputRefs = useRef([]);

  useEffect(() => {
    fileInputRefs.current = loanDocuments.map(
      (_, index) => fileInputRefs.current[index] ?? createRef()
    );
  }, [loanDocuments]);

  const handleFileInputChange = (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileData((prevFileData) => {
      const safePrevFileData = { ...prevFileData };
      const url = URL.createObjectURL(file);

      const loanDocumentId =
        prevFileData[index]?.loan_document_id ||
        loanDocuments[index]?.loan_document_id;

      safePrevFileData[index] = {
        url,
        name: file.name,
        type: file.type,
        file,
        new: true,
        loan_document_id: loanDocumentId,
      };
      return safePrevFileData;
    });
  };

  const handleRemoveFile = (index) => {
    if (fileData[index]) {
      const updatedFileData = { ...fileData };
      delete updatedFileData[index];
      setFileData(updatedFileData);

      if (fileInputRefs.current && fileInputRefs.current[index]) {
        fileInputRefs.current[index].value = "";
      }
    }
  };

  const handleSubmitData = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fileDataArray = Object.values(fileData);

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
          path: response.data.iamge_path,
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
        branchuser_id: selectedBranchUserId,
        branch_id: selectedBranchId,
      };

      const finalResponse = await AxiosInstance.put(
        `/file_upload/${id}`,
        payload
      );

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
            <FormControl id="user_id" mt={4} isRequired>
              <FormLabel>User</FormLabel>
              <Select
                placeholder="Select user"
                onChange={(event) => setSelectedUser(event.target.value)}
                value={selectedUser}
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
              <div className="d-flex">
                <div className="d-flex">
                  {selectedLoanId &&
                    (!selectedLoanType.is_subtype || selectedLoanSubtypeId) &&
                    loanDocuments.length > 0 &&
                    loanDocuments.map((document, index) => (
                      <div key={document._id} className="upload-area col-6">
                        <Text
                          fontSize="xl"
                          className="mx-3"
                          color={textColor}
                          style={{
                            fontSize: "12px",
                            textTransform: "capitalize",
                          }}
                        >
                          {document.loan_document}
                        </Text>
                        <input
                          type="file"
                          ref={(el) => (fileInputRefs.current[index] = el)}
                          className="drop-zoon__file-input"
                          onChange={(event) =>
                            handleFileInputChange(event, index)
                          }
                          accept="image/*,application/pdf"
                          style={{ display: "none" }}
                        />
                        {fileData[index] ? (
                          <div
                            className="file-preview text-end"
                            style={{
                              marginTop: "15px",
                              justifyContent: "space-between",
                              width: "100%",
                              padding: "10px",
                              boxSizing: "border-box",
                              backgroundColor: "#e8f0fe",
                              borderRadius: "8px",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                              overflow: "hidden",
                            }}
                          >
                            <IconButton
                              aria-label="Remove file"
                              icon={<CloseIcon />}
                              size="sm"
                              onClick={() => handleRemoveFile(index)}
                              style={{ margin: "0 10px" }}
                            />

                            {
                              console.log(fileData, "fileData[index].type")
                            }

                            {getFileExtension(fileData[index].url) === "pdf" ||
                            getFileExtension(fileData[index].name) === "pdf" ? (
                              <embed
                                src={fileData[index].url}
                                type="application/pdf"
                                style={{
                                  width: "100%",
                                  minHeight: "100px",
                                }}
                              />
                            ) : (
                              <img
                                className="editimage"
                                src={fileData[index].url}
                                alt="Preview"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  borderRadius: "4px",
                                }}
                              />
                            )}
                          </div>
                        ) : (
                          <div
                            onClick={() => fileInputRefs.current[index].click()}
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

            <FormControl id="branch_id" mt={4} isRequired>
              <FormLabel>Branch</FormLabel>
              <Select
                placeholder="Select branch"
                onChange={handleBranchChange}
                value={selectedBranchId}
              >
                {savajcapitalbranch.map((branch) => (
                  <option key={branch.branch_id} value={branch.branch_id}>
                    {`${branch.branch_name} (${branch.city})`}
                  </option>
                ))}
              </Select>
            </FormControl>

            {selectedBranchId && (
              <FormControl id="branchuser_id" mt={4} isRequired>
                <FormLabel>Branch User</FormLabel>
                <Select
                  placeholder="Select branch user"
                  onChange={handleBranchUserChange}
                  value={selectedBranchUserId}
                >
                  {savajcapitalbranchUser.length > 0 ? (
                    savajcapitalbranchUser.map((branchUser) => (
                      <option
                        key={branchUser.branchuser_id}
                        value={branchUser.branchuser_id}
                      >
                        {`${branchUser.full_name} (${getRoleName(
                          branchUser.role_id
                        )})`}
                      </option>
                    ))
                  ) : (
                    <option disabled>No users available</option>
                  )}
                </Select>
              </FormControl>
            )}

            <Button
              mt={4}
              colorScheme="teal"
              onClick={handleSubmitData}
              isLoading={loading}
              loadingText="Submitting"
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

export default EditFile;
