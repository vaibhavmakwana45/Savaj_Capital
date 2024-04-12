import React, { useState, useEffect, useRef, createRef } from "react";
import "./file.scss";

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
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import { useForm } from "react-hook-form";
import AxiosInstance from "config/AxiosInstance";

function AddFiles() {
  const textColor = useColorModeValue("gray.700", "white");
  const [users, setUsers] = useState([]);
  const [loanType, setLoanType] = useState([]);
  const [loanSubType, setLoanSubType] = useState([]);
  const [selectedLoanType, setSelectedLoanType] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();
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

  const onSubmit = async (data) => {
    try {
      const wrappedData = { userDetails: data };
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

  const handleFileInputChange = (event, index) => {
    const file = event.target.files[0];
    setUploadedFileName((prevState) => {
      const newState = [...prevState];
      newState[index] = file;
      return newState;
    });
    const blobUrl = URL.createObjectURL(file);
    setPreviewImage((prevState) => {
      const newState = [...prevState];
      newState[index] = blobUrl;
      return newState;
    });
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
        const response = await AxiosInstance.get("/loan_docs/1712751552190");
        setLoanDocuments(response.data.data);
      } catch (error) {
        console.error("Error fetching loan documents:", error);
      }
    };

    fetchLoanDocuments();
  }, []);

  const fileInputRefs = useRef([]);

  useEffect(() => {
    // Initialize refs array
    fileInputRefs.current = loanDocuments.map(
      (_, index) => fileInputRefs.current[index] || createRef()
    );
  }, [loanDocuments]);

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }}>
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" color={textColor} fontWeight="bold">
                Add File
              </Text>
              <Button onClick={onOpen} colorScheme="blue">
                Add New User
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            <FormControl id="user_id" mt={4} isRequired>
              <FormLabel>User</FormLabel>
              <Select placeholder="Select user">
                {users.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {`${user.username} (${user.email})`}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl id="loan_id" mt={4} isRequired>
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
              <FormControl id="loantype_id" mt={4} isRequired>
                <FormLabel>Loan Subtype</FormLabel>
                <Select placeholder="Select Loan Subtype">
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
              {/* <h2>Aadhar card</h2> */}

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
                      accept="image/*"
                      onChange={(event) => handleFileInputChange(event, index)}
                      style={{ display: "none" }}
                    />
                    <div
                      className={`upload-area__drop-zoon drop-zoon ${
                        isDragging ? "drop-zoon--over" : ""
                      }`}
                      onClick={() => {
                        fileInputRefs.current[index].current.click();
                      }}
                    >
                      <span className="drop-zoon__icon">
                        <i className="bx bxs-file-image"></i>
                      </span>
                      <p className="drop-zoon__paragraph">
                        Drop your file here
                      </p>
                      <span
                        id="loadingText"
                        className="drop-zoon__loading-text"
                        style={{ display: isLoading ? "block" : "none" }}
                      >
                        Please Wait
                      </span>
                      {previewImage[index] && (
                        <img
                          src={previewImage[index]}
                          className="drop-zoon__preview-image"
                          style={{ display: previewImage ? "block" : "none" }}
                          draggable="false"
                        />
                      )}
                    </div>
                    <div
                      className="upload-area__file-details file-details"
                      style={{ display: previewImage ? "block" : "none" }}
                    >
                      <h3 className="file-details__title">Uploaded File</h3>
                      <div className="uploaded-file">
                        <div className="uploaded-file__icon-container">
                          <i className="bx bxs-file-blank uploaded-file__icon"></i>
                          <span className="uploaded-file__icon-text">
                            {document.loan_document.split(".").pop()}
                          </span>
                        </div>
                        <div className="uploaded-file__info uploaded-file__info--active">
                          <span className="uploaded-file__name">
                            {document.loan_document}
                          </span>
                          <span className="uploaded-file__counter">{`${uploadProgress}%`}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
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
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} type="submit">
                Save
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}

export default AddFiles;
