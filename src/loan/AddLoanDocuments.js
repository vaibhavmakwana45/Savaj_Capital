import React, { useEffect, useState, useRef } from "react";
import {
  Flex,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Checkbox,
  CheckboxGroup,
  Stack,
  useColorModeValue,
  Select,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import toast, { Toaster } from "react-hot-toast";
import { useHistory } from "react-router-dom";
import axios from "axios";
import AxiosInstance from "config/AxiosInstance";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { Dropdown, DropdownItem, DropdownMenu } from "reactstrap";
import upArrow from "../assets/svg/uparrow.svg";
import downArrow from "../assets/svg/downarrow.svg";

function AddLoanDocuments() {
  const textColor = useColorModeValue("gray.700", "white");
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    loan_id: "",
    loantype_id: "",
    loan_documents: [""],
  });
  const [loandata, setLoanData] = useState([]);
  const [loanType, setLoanType] = useState([]);
  const [subType, setSubType] = useState(null);
  const [loanName, setLoanName] = useState("");
  const [titles, setTitles] = useState([]);
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentDocs, setCurrentDocs] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);

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

  const handleAddTitle = () => {
    if (!currentTitle || selectedDocs.length === 0) {
      toast.error("Please enter a title and select at least one document.");
      return;
    }
    const newTitle = {
      title: currentTitle,
      documents: selectedDocs.map((docName) =>
        currentDocs.find((doc) => doc.document === docName)
      ),
    };
    setTitles([...titles, newTitle]);
    setCurrentTitle("");
    setSelectedDocs([]);
    toast.success("Title added successfully!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        loan_id: formData.loan_id,
        loantype_id: formData.loantype_id,
        loan_document: formData.loan_documents.slice(
          0,
          formData.loan_documents.length - 1
        ),
      };

      const response = await AxiosInstance.post(`/loan_docs/`, data);
      if (response.data.success) {
        const msg = "Loan Added Successfully!";
        toast.success(msg);
        history.push("/superadmin/loan");
      } else {
        toast.error("Please try again later!");
      }
    } catch (error) {
      toast.error("Failed to add. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const filterSelectedDocs = () => {
    // Create a set of all selected documents
    const selectedDocSet = new Set();
    titles.forEach((title) => {
      title.documents.forEach((doc) => {
        selectedDocSet.add(doc.document);
      });
    });

    // Filter out selected documents from currentDocs
    return currentDocs.filter((doc) => !selectedDocSet.has(doc.document));
  };

  const [filteredData, setFilteredData] = useState("");
  const [filterOpen, setFilterOpen] = useState("");
  const filterToggle = () => setFilterOpen(!filterOpen);
  const [selectedLoan, setSelectedLoan] = useState("");

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }}>
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" color={textColor} fontWeight="bold">
                Add Documents
              </Text>
            </Flex>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              {/* <FormControl id="savajcapitalbranch_name" isRequired mt={4}>
                <FormLabel>Select Loan</FormLabel>
                <Select
                  name="city"
                  placeholder="Select Loan-Type"
                  onChange={(e) => {
                    const selectedLoanId = e.target.value;
                    setFormData({ ...formData, loan_id: selectedLoanId });
                  }}
                >
                  {loandata.map((index) => (
                    <option key={index.loan_id} value={index.loan_id}>
                      {index.loan}
                    </option>
                  ))}
                </Select>
              </FormControl> */}
              <div className="w-100">
              <FormLabel>Select Loan</FormLabel>

                <input
                  style={{
                    width: "100%",
                    border: "0.5px solid #333",
                    padding: "5px",
                    backgroundImage: `url(${filterOpen ? upArrow : downArrow})`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right center",
                    backgroundSize: "10px",
                    backgroundPosition: "right 15px center",
                    borderRadius:"5px",
                    borderColor:"inherit"
                  }}
                  placeholder="Select Loan-Type"
                  onFocus={() => {
                    setFilteredData(loandata);
                    setFilterOpen(true);
                  }}
                  onChange={(e) => {
                    if (e.target.value.length !== "") {
                      setFilterOpen(true);
                    } else {
                      setFilterOpen(false);
                    }
                    const filterData = loandata.filter((item) => {
                      return item.loan
                        .toLowerCase()
                        .includes(e.target.value.toLowerCase());
                    });
                    setSelectedLoan(e.target.value);
                    setFilteredData(filterData);
                  }}
                  value={selectedLoan}
                />
                <Dropdown
                  className="w-100"
                  isOpen={filterOpen}
                  toggle={filterToggle}
                >
                  <DropdownMenu className="w-100">
                    {filteredData.length > 0 ? (
                      filteredData.map((item, index) => (
                        <DropdownItem
                          key={index}
                          onClick={(e) => {
                            setSelectedLoan(item.loan);
                            setFilterOpen(false);
                            const selectedLoanId = item.loan_id;
                            setFormData({
                              ...formData,
                              loan_id: selectedLoanId,
                            });
                          }}
                        >
                          {item.loan}
                        </DropdownItem>
                      ))
                    ) : (
                      <DropdownItem>No data found</DropdownItem>
                    )}
                  </DropdownMenu>
                </Dropdown>
              </div>
              {subType === true &&
              loanName !== "Car" &&
              loanName !== "CRL-Car Loan" ? (
                <FormControl id="savajcapitalbranch_name" mt={4}>
                  <>
                    <FormLabel>Select Loan-Type</FormLabel>
                    <Select
                      name="city"
                      placeholder="Select Loan-Type"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          loantype_id: e.target.value,
                        })
                      }
                    >
                      <option key="title" disabled style={{ fontWeight: 800 }}>
                        {loanName}
                      </option>
                      {loanType.map((index) => (
                        <option
                          key={index.loantype_id}
                          value={index.loantype_id}
                        >
                          {index.loan_type}
                        </option>
                      ))}
                    </Select>
                  </>
                </FormControl>
              ) : null}

              <FormControl isRequired mt={4}>
                <FormLabel>Title</FormLabel>
                <Input
                  placeholder="Enter title for the documents"
                  value={currentTitle}
                  onChange={(e) => setCurrentTitle(e.target.value)}
                />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Documents</FormLabel>
                <Popover>
                  <PopoverTrigger>
                    <Button>Select Documents</Button>
                  </PopoverTrigger>
                  <PopoverContent style={{ marginLeft: "15px" }}>
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverHeader>Select the documents:</PopoverHeader>
                    <PopoverBody>
                      <CheckboxGroup
                        colorScheme="blue"
                        value={selectedDocs}
                        onChange={(values) => setSelectedDocs(values)}
                      >
                        <Stack>
                          {filterSelectedDocs().map((doc) => (
                            <Checkbox key={doc.id} value={doc.document}>
                              {doc.document}
                            </Checkbox>
                          ))}
                        </Stack>
                      </CheckboxGroup>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              </FormControl>

              <Button mt={4} colorScheme="blue" onClick={handleAddTitle}>
                Add Title
              </Button>
              <>
                {titles.length > 0 && (
                  <Text
                    fontSize="xl"
                    color={textColor}
                    fontWeight="bold"
                    mt={4}
                  >
                    Titles and Documents
                  </Text>
                )}
                <Flex direction="column" pt={{ base: "20px", md: "10px" }}>
                  {titles.map((title, index) => (
                    <Card key={index} mt={2}>
                      <CardHeader p="6px 0px 22px 0px">
                        <Flex
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Text
                            fontSize="md"
                            color={textColor}
                            fontWeight="bold"
                          >
                            {title.title}
                          </Text>
                        </Flex>
                      </CardHeader>
                      <CardBody>
                        <ul>
                          {title.documents.map((doc, docIndex) => (
                            <li key={docIndex}>{doc.document}</li>
                          ))}
                        </ul>
                      </CardBody>
                    </Card>
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
                  style={{ marginTop: 40 }}
                >
                  Submit
                </Button>

                <Button
                  mt={4}
                  colorScheme="yellow"
                  style={{ marginTop: 40, marginLeft: 8 }}
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

export default AddLoanDocuments;
