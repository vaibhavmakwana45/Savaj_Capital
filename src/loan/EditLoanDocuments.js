import React, { useEffect, useState } from "react";
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

  // const handleAddTitle = () => {
  //   if (!currentTitle || selectedDocs.length === 0) {
  //     toast.error("Please enter a title and select at least one document.");
  //     return;
  //   }

  //   const newTitle = {
  //     title: currentTitle,
  //     documents: selectedDocs.map((docName) => {
  //       const selectedDoc = currentDocs.find((doc) => doc.document === docName);
  //       return {
  //         document: selectedDoc.document,
  //         document_id: selectedDoc.document_id,
  //       };
  //     }),
  //   };

  //   const document_ids = newTitle.documents.map((doc) => doc.document_id);

  //   setTitles([...titles, { ...newTitle, document_ids }]);
  //   setCurrentTitle("");
  //   setSelectedDocs([]);
  //   toast.success("Title added successfully!");
  // };

  const handleAddTitle = () => {
    if (selectedDocs.length === 0) {
      toast.error("Please select at least one document.");
      return;
    }

    const selectedTitle = titleData.find(
      (title) => title.title_id === formData.title_id
    );
    if (!selectedTitle) {
      toast.error("Please select a title.");
      return;
    }

    const newTitle = {
      title: selectedTitle.title,
      title_id: selectedTitle.title_id,
      documents: selectedDocs.map((docName) => {
        const selectedDoc = currentDocs.find((doc) => doc.document === docName);
        return {
          document: selectedDoc.document,
          document_id: selectedDoc.document_id,
        };
      }),
    };

    const document_ids = newTitle.documents.map((doc) => doc.document_id);

    setTitles([...titles, { ...newTitle, document_ids }]);
    setSelectedDocs([]);
    toast.success("Title added successfully!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      for (const postData of titles) {
        const { title_id: title_id, document_ids } = postData;
        const response = await AxiosInstance.post(`/loan_docs`, {
          loan_id: formData.loan_id,
          loantype_id: formData.loantype_id,
          title_id: title_id,
          // title_id: formData.title_id,
          // title: titleName,
          document_id: document_ids,
        });

        toast.success("Document created successfully");
      }

      toast.success("Loan Added Successfully!");
      history.push("/superadmin/loan");
    } catch (error) {
      toast.error("Failed to add. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterSelectedDocs = () => {
    const selectedDocSet = new Set();
    titles.forEach((title) => {
      title.documents.forEach((doc) => {
        selectedDocSet.add(doc.document);
      });
    });
    return currentDocs.filter((doc) => !selectedDocSet.has(doc.document));
  };

  const [filteredData, setFilteredData] = useState("");
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
                    borderRadius: "5px",
                    borderColor: "inherit",
                  }}
                  placeholder="Select Loan-Type"
                  onFocus={() => {
                    setFilteredData(loandata);
                    filterToggle();
                  }}
                  onBlur={() => {
                    // Delay the filterToggle call to allow time for the click event
                    setTimeout(() => {
                      filterToggle();
                    }, 200); // Adjust the delay as needed
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
                            e.stopPropagation();
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

              {/*======================  Title Dropdawn  ======================= */}

              {/* <FormControl id="savajcapitalbranch_name" isRequired mt={4}>
                <FormLabel>Select Title</FormLabel>
                <Select
                  name="title"
                  placeholder="Select Title"
                  onChange={(e) => {
                    const selectedTitleId = e.target.value;
                    setFormData({ ...formData, title_id: selectedTitleId });
                  }}
                >
                  {titleData.map((index) => (
                    <option key={index.title_id} value={index.title_id}>
                      {index.title}
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
                    backgroundImage: `url(${
                      filteerOpen ? upArrow : downArrow
                    })`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right center",
                    backgroundSize: "10px",
                    backgroundPosition: "right 15px center",
                    borderRadius: "5px",
                    borderColor: "inherit",
                  }}
                  placeholder="Select Loan-Type"
                  onFocus={() => {
                    setFiltereedData(titleData);
                    filteerToggle();
                  }}
                  onBlur={() => {
                    // Delay the filterToggle call to allow time for the click event
                    setTimeout(() => {
                      filteerToggle();
                    }, 200); // Adjust the delay as needed
                  }}
                  onChange={(e) => {
                    if (e.target.value.length !== "") {
                      setFilteerOpen(true);
                    } else {
                      setFilteerOpen(false);
                    }
                    const filterData = titleData.filter((item) => {
                      return item.title
                        .toLowerCase()
                        .includes(e.target.value.toLowerCase());
                    });
                    setSelecteedLoan(e.target.value);
                    setFiltereedData(filterData);
                  }}
                  value={selecteedLoan}
                />
                <Dropdown
                  className="w-100"
                  isOpen={filteerOpen}
                  toggle={filteerToggle}
                >
                  <DropdownMenu className="w-100">
                    {filtereedData.length > 0 ? (
                      filtereedData.map((item, index) => (
                        <DropdownItem
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelecteedLoan(item.title);
                            setFilteerOpen(false);
                            const selectedLoanId = item.title_id;
                            setFormData({
                              ...formData,
                              title_id: selectedLoanId,
                            });
                          }}
                        >
                          {item.title}
                        </DropdownItem>
                      ))
                    ) : (
                      <DropdownItem>No data found</DropdownItem>
                    )}
                  </DropdownMenu>
                </Dropdown>
              </div>
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

export default EditLoanDocuments;
