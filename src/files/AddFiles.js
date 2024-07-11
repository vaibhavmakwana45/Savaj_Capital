import React, { useState, useEffect, useRef } from "react";
import "./file.scss";
import { useHistory } from "react-router-dom";
import {
  Button,
  useColorModeValue,
  FormControl,
  FormLabel,
  Flex,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Input,
  ModalFooter,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import AxiosInstance from "config/AxiosInstance";
import axios from "axios";
import { Country, State, City } from "country-state-city";
import Select from "react-select";

function AddFiles() {
  const history = useHistory();
  const textColor = useColorModeValue("gray.700", "white");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [loanType, setLoanType] = useState([]);
  const [loanSubType, setLoanSubType] = useState([]);
  const [selectedLoanType, setSelectedLoanType] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [countries, setCountries] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [cibilMessage, setCibilMessage] = useState("");
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [selectedLoanSubtypeId, setSelectedLoanSubtypeId] = useState("");
  const [cibilScore, setCibilScore] = useState(null);
  const [formData, setFormData] = useState({
    user_id: "",
    username: "",
    number: "",
    cibil_score: "",
    email: "",
    pan_card: "",
    aadhar_card: "",
    dob: "",
    country: "India",
    state: "",
    city: "",
    unit_address: "",
    gst_number: "",
    reference: "",
  });
  const [dateData, setdateData] = useState({
    start_date: "",
    end_date: "",
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

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

  const handleLoanTypeChange = async (selectedOption) => {
    setSelectedLoanId(selectedOption); // Set the selected loan id
    const selectedType = loanType.find(
      (loan) => loan.loan_id === selectedOption.value
    );
    setSelectedLoanType(selectedType || {});

    if (selectedType && selectedType.is_subtype) {
      try {
        const response = await AxiosInstance.get(
          `/loan_type/loan_type/${selectedOption.value}`
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
  const [uploadedFileName, setUploadedFileName] = useState([]);

  const [fileData, setFileData] = useState({});
  const [groupedLoanDocuments, setGroupedLoanDocuments] = useState({});

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

  const fileInputRefs = useRef({});

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

  const handleUserChange = (selectedOption) => {
    setSelectedUser(selectedOption);
    if (selectedOption) {
      const user = users.find((u) => u.user_id === selectedOption.value);
      if (user) {
        setCibilScore(user.cibil_score);
        if (user.cibil_score < 730) {
          setCibilMessage("User's cibil score is less than 730.");
        } else {
          setCibilMessage("");
        }
      }
    }
  };

  const handleLoanChange = (selectedOption) => {
    setSelectedLoanId(selectedOption);
    setSelectedLoanSubtypeId("");
  };

  const handleLoanSubtypeChange = (selectedOption) => {
    setSelectedLoanSubtypeId(selectedOption.value); // Update the selected loan subtype id
  };

  const onSubmit = async (data) => {
    try {
      const wrappedData = {
        userDetails: {
          ...data,
          country: formData.country,
          state: formData.state,
          city: formData.city,
          state_code: selectedState,
          country_code: selectedCountry,
        },
      };
      await AxiosInstance.post("/addusers/adduser", wrappedData);
      toast.success("User Added Successfully!");
      onClose();
      fetchUsers();
      reset();
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Please try again later!");
    }
  };

  useEffect(() => {
    setCountries(Country.getAllCountries());
    setStates(State.getStatesOfCountry("IN"));
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const statesOfSelectedCountry = State.getStatesOfCountry(selectedCountry);
      setStates(statesOfSelectedCountry);
      setSelectedState("");
    }
  }, [selectedCountry]);

  useEffect(() => {
    const citiesOfState = City.getCitiesOfState(selectedCountry, selectedState);
    setCities(citiesOfState);
  }, [selectedState, selectedCountry]);

  const handleCountryChange = (event) => {
    setSelectedCountry(event.target.value);
  };

  const handleStateChange = (event) => {
    const stateCode = event.target.value;
    const stateObj = states.find((state) => state.isoCode === stateCode);
    const stateFullName = stateObj ? stateObj.name : "";

    setSelectedState(stateCode);
    setFormData((prevFormData) => ({
      ...prevFormData,
      state: stateFullName,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleGstChange = (e) => {
    const { name, value } = e.target;
    if (name === "gst_number" && value.length <= 15) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleeChange = (e) => {
    const { name, value } = e.target;
    if (name === "pan_card" && value.toUpperCase().length <= 10) {
      setFormData({
        ...formData,
        [name]: value,
        [name]: value.toUpperCase(),
      });
    }
  };
  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: checked,
    }));
  };

  const handleadharChange = (e) => {
    const { name, value } = e.target;
    if (name === "aadhar_card" && /^\d{0,12}$/.test(value)) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmitData = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const uploadPromises = uploadedFileName.map(async (item) => {
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

        const uploadedFilesInfo = response.data.files.map((file) => ({
          filename: file.filename,
          fileType: file.fileType,
        }));

        if (!uploadedFilesInfo.length) {
          throw new Error("No files were processed.");
        }

        return uploadedFilesInfo.map((file) => ({
          ...item,
          path: file.filename,
          documentId: item.documentId,
        }));
      });

      const uploadedFiles = (await Promise.all(uploadPromises)).flat();

      const payload = {
        user_id: selectedUser.value,
        loan_id: selectedLoanId.value,
        loantype_id: selectedLoanSubtypeId,
        documents: uploadedFiles.map((file) => ({
          file_path: file.path,
          loan_document_id: file.documentId,
          title_id: file.title_id,
          key: file.key,
        })),
        start_date: dateData.start_date,
        end_date: dateData.end_date,
      };
      const responce = await AxiosInstance.post("/file_upload", payload);
      history.push("/superadmin/filetable");
      toast.success("All data submitted successfully!");
    } catch (error) {
      console.error("Error while uploading files or submitting data:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.status === 400
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || "Submission failed! Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

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
            <Flex justifyContent="space-between" className="mainnnn">
              <Text fontSize="xl" color={textColor} fontWeight="bold">
                Add File
              </Text>
              <Button
                onClick={onOpen}
                colorScheme="blue"
                style={{ backgroundColor: "#b19552" }}
              >
                Add New User
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            <FormControl id="user_id" mt={4} isRequired>
              <FormLabel>User</FormLabel>
              <Select
                placeholder="Select user"
                onChange={handleUserChange}
                value={selectedUser}
                options={users.map((user) => ({
                  value: user.user_id,
                  label: `${user.username} (${user.businessname})`,
                }))}
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              />

              {cibilMessage && (
                <p style={{ color: "red", marginTop: "10px" }}>
                  {cibilMessage}
                </p>
              )}
            </FormControl>
            <FormControl id="loan_id" mt={4} isRequired>
              <FormLabel>Loan Type</FormLabel>
              <Select
                placeholder="Select Loan"
                onChange={handleLoanTypeChange}
                options={loanType.map((loan) => ({
                  value: loan.loan_id,
                  label: loan.loan,
                }))}
                menuPortalTarget={document.body} // Render dropdown in a portal
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }} // Ensure dropdown appears above other content
              />
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
                  onChange={handleLoanSubtypeChange}
                  options={loanSubType.map((subType) => ({
                    value: subType.loantype_id,
                    label: subType.loan_type,
                  }))}
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                />
              </FormControl>
            )}
            {/* 
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
            </div> */}
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
              <Button
                mt={4}
                colorScheme="teal"
                onClick={handleSubmitData}
                isLoading={loading}
                loadingText="Submitting"
                disabled={cibilScore < 730}
                style={{
                  marginTop: 40,
                  backgroundColor: "#b19552",
                  color: "#fff",
                }}
              >
                Submit
              </Button>

              <Button
                mt={4}
                colorScheme="yellow"
                style={{
                  marginTop: 40,
                  marginLeft: 8,
                  backgroundColor: "#414650",
                  color: "#fff",
                }}
                onClick={() => history.push("/superadmin/filetable")}
              >
                Cancel
              </Button>
            </div>
          </CardBody>
        </Card>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent
          style={{ height: "80%", overflow: "scroll", scrollbarWidth: "thin" }}
        >
          <ModalHeader>Add New User</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody pb={6}>
              <FormControl>
                <FormLabel>Customer Name</FormLabel>
                <Input
                  placeholder="Customer Name"
                  {...register("username", {
                    required: "Username is required",
                  })}
                />
                {errors.username && <p>{errors.username.message}</p>}
              </FormControl>
              <FormControl>
                <FormLabel>Date of birth</FormLabel>
                <Input
                  placeholder="DOB"
                  type="date"
                  {...register("dob", {
                    required: "DOB is required",
                  })}
                />
                {errors.dob && <p>{errors.dob.message}</p>}
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Mobile Number</FormLabel>
                <Input
                  placeholder="Number"
                  {...register("number", {
                    required: "Number is required",
                    pattern: {
                      value: /^\d+$/,
                      message: "Invalid number",
                    },
                  })}
                />
                {errors.number && <p>{errors.number.message}</p>}
              </FormControl>
              <FormControl id="cibil_score" mt={4} isRequired>
                <FormLabel>Cibil Score</FormLabel>
                <Input
                  name="cibil_score"
                  onChange={handleChange}
                  value={formData.cibil_score}
                  placeholder="Enter your cibil score"
                />
              </FormControl>
              <FormControl id="gst_number" mt={4} isRequired>
                <FormLabel>GST Number</FormLabel>
                <Input
                  name="gst_number"
                  type="number"
                  onChange={handleGstChange}
                  value={formData.gst_number}
                  placeholder="Enter GST number"
                />
              </FormControl>

              <FormControl id="aadharcard" mt={4} isRequired>
                <FormLabel>Aadhar Card</FormLabel>
                <Input
                  name="aadhar_card"
                  type="number"
                  onChange={handleadharChange}
                  value={formData.aadhar_card}
                  placeholder="XXXX - XXXX - XXXX"
                />
              </FormControl>
              <FormControl id="pancard" mt={4} isRequired>
                <FormLabel>Pan Card</FormLabel>
                <Input
                  name="pan_card"
                  type="text"
                  onChange={handleeChange}
                  value={formData.pan_card}
                  placeholder="Enyrt your PAN"
                />
              </FormControl>
              <FormControl id="state" mt={4} isRequired>
                <FormLabel>State</FormLabel>
                <Select
                  name="state"
                  placeholder="Select state"
                  onChange={handleStateChange}
                  disabled={!selectedCountry}
                  value={selectedState}
                >
                  {states.length ? (
                    states.map((state) => (
                      <option key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </option>
                    ))
                  ) : (
                    <option>Please select a country first</option>
                  )}
                </Select>
              </FormControl>
              <FormControl id="city" mt={4} isRequired>
                <FormLabel>City</FormLabel>
                <Select
                  name="city"
                  placeholder="Select city"
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  disabled={!selectedState}
                  value={formData.city}
                >
                  {cities.length ? (
                    cities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))
                  ) : (
                    <option>Please select a state first</option>
                  )}
                </Select>
              </FormControl>
              <FormControl id="country" mt={4} isRequired>
                <FormLabel>Country</FormLabel>

                <Select
                  name="country"
                  value={selectedCountry}
                  onChange={handleCountryChange}
                >
                  {countries.map((country) => (
                    <option key={country.isoCode} value={country.isoCode}>
                      {country.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl id="unit_address" mt={4} isRequired>
                <FormLabel>Unit Address</FormLabel>
                <Input
                  name="unit_address"
                  type="string"
                  onChange={handleChange}
                  value={formData.unit_address}
                  placeholder="Enter unit address"
                />
              </FormControl>
              <FormControl id="reference" mt={4} isRequired>
                <FormLabel>Reference</FormLabel>
                <Input
                  name="reference"
                  type="string"
                  onChange={handleChange}
                  value={formData.reference}
                  placeholder="Enter reference"
                />
              </FormControl>
              {/* <FormControl mt={4}>
                <FormLabel>Email</FormLabel>
                <Input
                  placeholder="Email"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && <p>{errors.email.message}</p>}
              </FormControl> */}

              <Text fontSize="xl" color={textColor} fontWeight="bold" mt={6}>
                Login Credentials
              </Text>
              <FormControl mt={4}>
                {/* <FormLabel>Email</FormLabel> */}
                <Input
                  placeholder="Email"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && <p>{errors.email.message}</p>}
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                type="submit"
                style={{ backgroundColor: "#b19552" }}
              >
                Save
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <Toaster />
    </>
  );
}
export default AddFiles;
