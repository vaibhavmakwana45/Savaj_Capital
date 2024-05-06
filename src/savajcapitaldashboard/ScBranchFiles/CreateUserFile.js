import React, { useState, useEffect, useRef } from "react";
import "./userfile.scss";
import { useHistory } from "react-router-dom";
import {
  Button,
  Select,
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
import { IconButton } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import toast, { Toaster } from "react-hot-toast";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import AxiosInstance from "config/AxiosInstance";
import axios from "axios";
import { Country, State, City } from "country-state-city";

function CreateUserFile() {
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

  const [formData, setFormData] = useState({
    user_id: "",
    username: "",
    number: "",
    email: "",
    pan_card: "",
    aadhar_card: "",
    dob: "",
    country: "India",
    state: "",
    city: "",
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
  const [uploadedFileName, setUploadedFileName] = useState([]);

  const [fileData, setFileData] = useState({});
  const [groupedLoanDocuments, setGroupedLoanDocuments] = useState({});

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
      console.log(documentId, "documentId");
      const key = `${title_id}-${index}-${innerIndex}`;
      const filePreview = {
        name: file.name,
        url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        type: file.type,
        documentId: documentId,
        key: key,
      };

      console.log(filePreview, "meet");

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

  const handleSubmitData = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const uploadPromises = uploadedFileName.map(async (item) => {
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
        return { ...item, path: imageName, documentId: item.documentId };
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      const payload = {
        user_id: selectedUser,
        loan_id: selectedLoanId,
        loantype_id: selectedLoanSubtypeId,
        documents: uploadedFiles.map((file) => ({
          file_path: file.path,
          loan_document_id: file.documentId,
          title_id: file.title_id,
          key: file.key,
        })),
      };
      await AxiosInstance.post("/file_upload", payload);

      history.push("/savajcapitaluser/userfile");
      toast.success("All data submitted successfully!");
    } catch (error) {
      console.error("Error while uploading files or submitting data:", error);
      toast.error("Submission failed! Please try again.");
    } finally {
      setLoading(false);
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

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }}>
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" color={textColor} fontWeight="bold">
                Add File
              </Text>
              <Button
                onClick={onOpen}
                style={{ backgroundColor: "#b19552", color: "#fff" }}
              >
                Add New User
              </Button>
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
                  <option key="title" disabled style={{ fontWeight: 800 }}>
                    {selectedLoanType.loan}
                  </option>
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
                onClick={() => history.push("/savajcapitaluser/userfile")}
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
                <FormLabel>Username</FormLabel>
                <Input
                  placeholder="Username"
                  {...register("username", {
                    required: "Username is required",
                  })}
                />
                {errors.username && <p>{errors.username.message}</p>}
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Number</FormLabel>
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
              <FormControl mt={4}>
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

              <FormControl id="state" mt={4} isRequired>
                <FormLabel>State</FormLabel>
                <Select
                  name="state"
                  placeholder="Select state"
                  onChange={handleStateChange}
                  disabled={!selectedCountry}
                  value={selectedState}
                  // {...register("state", {
                  //   required: "State is required",
                  // })}
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

              <FormControl>
                <FormLabel>Dob</FormLabel>
                <Input
                  placeholder="DOB"
                  type="date"
                  {...register("dob", {
                    required: "DOB is required",
                  })}
                />
                {errors.dob && <p>{errors.dob.message}</p>}
              </FormControl>

              <FormControl className="my-2">
                <FormLabel>Aadhar Card</FormLabel>
                <Input
                  placeholder="Adhar Card"
                  type="number"
                  {...register("aadhar_card", {
                    required: "Aadhar card is required",
                  })}
                />
                {errors.aadhar_card && <p>{errors.aadhar_card.message}</p>}
              </FormControl>

              <FormControl>
                <FormLabel>Pan Card</FormLabel>
                <Input
                  placeholder="Pan Card"
                  type="string"
                  {...register("pan_card", {
                    required: "Pan card is required",
                  })}
                />
                {errors.pan_card && <p>{errors.pan_card.message}</p>}
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                type="submit"
                style={{ backgroundColor: "#b19552", color: "#fff" }}
              >
                Save
              </Button>
              <Button
                onClick={onClose}
                style={{
                  backgroundColor: "#414650",
                  color: "#fff",
                }}
              >
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
      <Toaster />
    </>
  );
}
export default CreateUserFile;
