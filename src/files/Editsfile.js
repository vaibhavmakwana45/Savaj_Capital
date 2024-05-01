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
} from "@chakra-ui/react";
import { useHistory, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
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
  const [loanType, setLoanType] = useState([]);
  const [loanSubType, setLoanSubType] = useState([]);
  const [selectedLoanType, setSelectedLoanType] = useState({});
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [selectedLoanSubtypeId, setSelectedLoanSubtypeId] = useState("");
  const [fileData, setFileData] = useState({});
  const CDN_BASE_URL = "https://cdn.dohost.in/upload/";
  const fileInputRefs = useRef({});
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const fetchFileDetails = async () => {
      try {
        const response = await AxiosInstance.get(
          `/file_upload/edit_file_upload/${id}`
        );
        if (response.data && response.data.statusCode === 200) {
          const details = response.data.data.fileDetails;
          setSelectedLoanId(details.loan_id);
          setSelectedLoanSubtypeId(details.loantype_id);
          const documentsWithCDN = details.documents.map((document) => ({
            ...document,
            file_path: `${CDN_BASE_URL}${document.file_path}`,
          }));
          const initialFileData = documentsWithCDN.reduce((acc, doc, index) => {
            return {
              ...acc,
              [`${doc.title_id}-${index}`]: {
                url: doc.file_path,
                name: doc.title_id,
                type: "application/pdf",
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
  }, [id, loanType, loanSubType]);

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
          setSelectedLoanSubtypeId(subtypes.length > 0 ? subtypes[0].loantype_id : "");
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

  const handleFileInputChange = (event, title_id, index) => {
    const file = event.target.files[0];
    if (file) {
      const key = `${title_id}-${index}`;
      const filePreview = {
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        new: true,
      };
      setFileData((prevData) => ({
        ...prevData,
        [key]: filePreview,
      }));
    }
  };

  const handleRemoveFile = (key) => {
    setFileData((prevData) => {
      const newData = { ...prevData };
      delete newData[key];
      return newData;
    });
  };

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card>
          <CardHeader>
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" color={textColor} fontWeight="bold">
                Edit File
              </Text>
            </Flex>
          </CardHeader>
          <CardBody>
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
              {Object.keys(fileData).map((key) => (
                <div key={key}>
                  <input
                    type="file"
                    id={`fileInput-${key}`}
                    className="drop-zoon__file-input"
                    onChange={(event) =>
                      handleFileInputChange(event, key.split("-")[0], key.split("-")[1])
                    }
                    style={{ display: "none" }}
                  />
                  {fileData[key] ? (
                    <div className="file-preview text-end">
                      <IconButton
                        aria-label="Remove file"
                        icon={<CloseIcon />}
                        size="sm"
                        onClick={() => handleRemoveFile(key)}
                        style={{ margin: "0 10px" }}
                      />
                      {fileData[key].url && (
                        <div className="file-preview">
                          {fileData[key].type === "application/pdf" ? (
                            <embed
                              src={fileData[key].url}
                              type="application/pdf"
                              style={{ width: "100%", minHeight: "100px" }}
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
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="upload-area__drop-zoon drop-zoon"
                      onClick={() => document.getElementById(`fileInput-${key}`).click()}
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
            <div>
              <Button
                mt={4}
                colorScheme="teal"
                isLoading={loading}
                onClick={() => handleSubmitData()}
              >
                Submit
              </Button>
              <Button mt={4} colorScheme="yellow" onClick={() => history.push("/superadmin/filetable")}>
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
