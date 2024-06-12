import React, { useEffect, useState } from "react";
import {
  Flex,
  Text,
  Button,
  FormControl,
  FormLabel,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Checkbox,
  CheckboxGroup,
  useColorModeValue,
  Select,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import toast, { Toaster } from "react-hot-toast";
import { useHistory, useLocation } from "react-router-dom";
import AxiosInstance from "config/AxiosInstance";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { Dropdown, DropdownItem, DropdownMenu } from "reactstrap";
import upArrow from "../assets/svg/uparrow.svg";
import downArrow from "../assets/svg/downarrow.svg";
import { CloseIcon } from "@chakra-ui/icons";

function EditLoanDocuments() {
  const textColor = useColorModeValue("gray.700", "white");
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    loan_id: "",
    title_id: "",
    loantype_id: "",
    title: "",
    document_ids: [],
  });
  const [loandata, setLoanData] = useState([]);
  const [titleData, setTitleData] = useState([]);
  const [loanType, setLoanType] = useState([]);
  const [subType, setSubType] = useState(null);
  const [loanName, setLoanName] = useState("");
  const [titles, setTitles] = useState([]);
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentDocs, setCurrentDocs] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");

  const [checkSubType, setCheckSunType] = useState("");
  useEffect(() => {
    const fetchFileDetails = async () => {
      try {
        const response = await AxiosInstance.get(`/loan_docs/doc_edit/${id}`);
        const data = response.data.data[0];
        setCheckSunType(response.data.data[0]?.is_subtype);
        setFormData({
          ...formData,
          loan_id: data.loan_id,
          title_id: data.title_id,
          loantype_id: data?.loantype_id,
          is_subtype: data?.is_subtype,
          document_ids: data?.document_ids,
        });
      } catch (error) {
        console.error("Error fetching file details:", error);
        toast.error("Failed to load file details.");
      }
    };

    fetchFileDetails();
  }, []);

  useEffect(() => {
    const getLoanData = async () => {
      try {
        const response = await AxiosInstance.get("/loan/loan");

        if (response.data.success) {
          setLoanData(response.data.data);
        } else {
          alert("Please try again later...!");
        }
      } catch (error) {
        console.error(error);
      }
    };

    getLoanData();
  }, []);

  useEffect(() => {
    const getTitleData = async () => {
      try {
        const response = await AxiosInstance.get("/title");

        if (response.data.success) {
          setTitleData(response.data.data);
        } else {
          alert("Please try again later...!");
        }
      } catch (error) {
        console.error(error);
      }
    };

    getTitleData();
  }, []);

  const getData = async (loanId) => {
    try {
      const response = await AxiosInstance.get(
        `/loan_type/loan_type/${loanId}`
      );

      if (response.data.success) {
        setLoanType(response.data.data);
        setLoanName(response?.data?.loan[0]?.loan);
        setSubType(response.data.loan[0].is_subtype);
      } else {
        alert("Please try again later...!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getData(formData.loan_id);
  }, [formData.loan_id]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await AxiosInstance.get("/document");
        setCurrentDocs(response.data.data);
      } catch (error) {
        console.error("Error fetching documents", error);
        toast.error("Failed to load documents.");
      }
    };
    fetchDocuments();
  }, []);

  useEffect(() => {
    setCurrentTitle("");
    setSelectedDocs([]);
  }, [formData.loan_id, formData.loantype_id]);

  useEffect(() => {
    setTitles([]);
  }, [formData.loan_id, formData.loantype_id, loanName, subType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send a POST request for all titles at once
      const response = await AxiosInstance.post(`/loan_docs/update`, {
        title_id: formData.title_id,
        loan_id: formData.loan_id,
        loantype_id: formData?.loantype_id,
        document_id: formData.document_ids, // Pass the selected document IDs directly
      });

      // Check if any new documents were added successfully
      if (response.data.success) {
        toast.success("Document created successfully");
      } else {
        toast.error("Failed to create document");
      }

      toast.success("Loan Added Successfully!");
      history.push("/superadmin/loan");
    } catch (error) {
      toast.error("Failed to add. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const [filterOpen, setFilterOpen] = useState("");
  const filterToggle = () => setFilterOpen(!filterOpen);
  const [selectedLoan, setSelectedLoan] = useState("");

  const [filtereedData, setFiltereedData] = useState("");
  const [filteerOpen, setFilteerOpen] = useState("");
  const filteerToggle = () => setFilteerOpen(!filteerOpen);
  const [selecteedLoan, setSelecteedLoan] = useState("");

  const handleRemoveDocument = (titleIndex, docIndexToRemove) => {
    const updatedTitles = [...titles];
    updatedTitles[titleIndex].documents.splice(docIndexToRemove, 1);
    if (updatedTitles[titleIndex].documents.length === 0) {
      updatedTitles.splice(titleIndex, 1);
    }
    setTitles(updatedTitles);
    toast.success("Document removed successfully!");
  };

  return (
    <>
      <Flex direction="column" pt={{ md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden", overflow: "auto" }}>
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" color={textColor} fontWeight="bold">
                Add Documents
              </Text>
            </Flex>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <Select
                className="mt-3"
                name="title"
                disabled
                placeholder="Select Title"
                onChange={(e) => {
                  const selectedTitleId = e.target.value;
                  setFormData({ ...formData, loan_id: selectedTitleId });
                }}
                style={{ borderColor: "black", color: "black", opacity: "10" }}
                value={formData.loan_id}
              >
                {loandata.map((index) => (
                  <option key={index.loan_id} value={index.loan_id}>
                    {index.loan}
                  </option>
                ))}
              </Select>

              {checkSubType ? (
                <Select
                  className="mt-3"
                  name="title"
                  disabled
                  placeholder="Select Loan-type"
                  onChange={(e) => {
                    const selectedLoanTypeId = e.target.value;
                    setFormData({
                      ...formData,
                      loantype_id: selectedLoanTypeId,
                    });
                  }}
                  style={{
                    borderColor: "black",
                    color: "black",
                    opacity: "10",
                  }}
                  value={formData.loantype_id} // Set the value to the fetched loantype_id
                >
                  {loanType.map((index) => (
                    <option key={index.loantype_id} value={index.loantype_id}>
                      {index.loan_type}
                    </option>
                  ))}
                </Select>
              ) : null}

              {/*======================  Title Dropdawn  ======================= */}

              <Select
                className="mt-3"
                name="title"
                placeholder="Select Title"
                disabled
                onChange={(e) => {
                  const selectedTitleId = e.target.value;
                  setFormData({ ...formData, title_id: selectedTitleId });
                }}
                style={{ borderColor: "black", opacity: "10", color: "black" }}
                value={formData.title_id} // Set the value to the fetched title_id
              >
                {titleData.map((index) => (
                  <option key={index.title_id} value={index.title_id}>
                    {index.title}
                  </option>
                ))}
              </Select>

              <FormControl mt={4}>
                <FormLabel>Documents</FormLabel>
                <Popover>
                  <PopoverTrigger>
                    <Button>Select Documents</Button>
                  </PopoverTrigger>
                  <PopoverContent
                    style={{
                      marginLeft: "15px",
                      height: "250px",
                      overflow: "auto",
                      scrollbarWidth: "thin",
                    }}
                  >
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverHeader>Select the documents:</PopoverHeader>
                    <PopoverBody>
                      <CheckboxGroup
                        colorScheme="blue"
                        value={formData.document_ids}
                        onChange={(values) =>
                          setFormData({ ...formData, document_ids: values })
                        }
                      >
                        {/* <Stack> */}
                        {currentDocs.map((doc) => (
                          <>
                            <Checkbox
                              key={doc.id}
                              value={doc.document_id}
                              isChecked={formData.document_ids.includes(
                                doc.document_id
                              )}
                            >
                              {doc.document}
                            </Checkbox>
                            <br />
                          </>
                        ))}
                        {/* </Stack> */}
                      </CheckboxGroup>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              </FormControl>

              <>
                <Flex direction="row" pt={{ base: "20px", md: "10px" }}>
                  {titles.map((title, index) => (
                    <Flex direction="column" key={index} mr={4}>
                      <Text fontSize="lg" fontWeight="bold" mb={2}>
                        {title.title}
                      </Text>
                      {title.documents.length > 0 ? (
                        <ul>
                          {title.documents.map((doc, docIndex) => (
                            <li
                              key={docIndex}
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              {doc.document}
                              <CloseIcon
                                ml={2}
                                color="red.500"
                                cursor="pointer"
                                onClick={() =>
                                  handleRemoveDocument(index, docIndex)
                                }
                              />
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <Text>No documents added</Text>
                      )}
                    </Flex>
                  ))}
                </Flex>
              </>
              <div className="d-flex">
                <Button
                  mt={4}
                  colorScheme="teal"
                  type="submit"
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
                  onClick={() => history.push("/superadmin/loan")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </Flex>
      <Toaster />
    </>
  );
}

export default EditLoanDocuments;
