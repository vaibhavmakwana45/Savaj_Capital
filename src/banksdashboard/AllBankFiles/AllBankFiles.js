import axios from "axios";
import {
  Flex,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  Td,
  useColorModeValue,
  Button,
  IconButton,
  Input,
  Select,
  Collapse,
  FormControl,
  FormLabel,
  Box,
} from "@chakra-ui/react";
import $ from "jquery";
import { MoreVert as MoreVertIcon } from "@material-ui/icons";
import { Menu, MenuItem } from "@material-ui/core";
import Loader from "react-js-loader";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";
import toast, { Toaster } from "react-hot-toast";
import {
  DeleteIcon,
  EditIcon,
  AddIcon,
  ExternalLinkIcon,
} from "@chakra-ui/icons";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import AxiosInstance from "config/AxiosInstance";
import { State, City } from "country-state-city";
import {
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";
// import upArrow from "../assets/svg/uparrow.svg";
// import downArrow from "../assets/svg/downarrow.svg";
// import { Dropdown, DropdownItem, DropdownMenu } from "reactstrap";
import { jwtDecode } from "jwt-decode";

function AllBankFiles() {
  const [files, setFiles] = useState([]);
  const textColor = useColorModeValue("gray.700", "white");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLoan, setSelectedLoan] = useState("All Loan Types");
  const location = useLocation();
  const { loan, loan_id, loantype_id } = location?.state?.state || {};
  const [loans, setLoans] = useState([]);
  const [selectedStatusSearch, setSelectedStatusSearch] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const history = useHistory();

  const states = State.getStatesOfCountry("IN");

  const cities = selectedState
    ? City.getCitiesOfState(
        "IN",
        states.find((state) => state.name === selectedState)?.isoCode
      )
    : [];

  const handleStateChange = (event) => {
    setSelectedState(event.target.value);
    setSelectedCity("");
  };

  const handleCityChange = (event) => {
    setSelectedCity(event.target.value);
  };

  const toggleRowExpansion = (fileId) => {
    setExpandedRow(expandedRow === fileId ? null : fileId);
    if (expandedRow !== fileId) {
      fetchFileData(fileId);
    }
  };

  const handleRowClick = (id) => {
    history.push(`/bankuser/viewbankfile?id=${id}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const loanResponse = await AxiosInstance.get("/loan");
        setLoans(loanResponse.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (location?.state?.state) {
      const { loan_id, loantype_id } = location.state.state;
      setSelectedLoan(loan_id || "All Loan Types");

      if (loantype_id) {
        setSelectedLoanSubType(loantype_id);
      }
    }
  }, [location?.state?.state]);

  const [loanSubtypes, setLoanSubtypes] = useState([]);
  const [selectedLoanSubType, setSelectedLoanSubType] = useState("");

  useEffect(() => {
    if (selectedLoan) {
      const selectedLoanObj = loans.find(
        (loan) => loan.loan_id === selectedLoan
      );
      if (selectedLoanObj && selectedLoanObj.is_subtype) {
        const fetchSubtypes = async () => {
          try {
            const subtypeResponse = await AxiosInstance.get(
              `/loan_type/loan_type/${selectedLoan}`
            );
            setLoanSubtypes(subtypeResponse.data.data);
          } catch (error) {
            console.error("Error fetching subtypes:", error);
          }
        };

        fetchSubtypes();
      } else {
        setLoanSubtypes([]);
      }
    } else {
      setLoanSubtypes([]);
    }
  }, [selectedLoan, loans]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecorrds] = useState(0);
  const [loading, setLoading] = useState(true);

  const [accessType, setAccessType] = useState("");
  React.useEffect(() => {
    const jwt = jwtDecode(localStorage.getItem("authToken"));
    setAccessType(jwt._id);
  }, []);

  const fetchData = async () => {
    if (accessType) {
      try {
        if (!accessType.state || !accessType.city) {
          console.error("State or city is missing.");
          return;
        }

        // const loanIds = accessType?.loan_ids.join(",");

        const response = await AxiosInstance.get(
          `/file_upload/bankusers/${accessType.state}/${accessType.city}/${accessType.bankuser_id}`,
          {
            params: {
              page: currentPage,
              limit: itemsPerPage,
              searchTerm,
              selectedLoan: loan_id
                ? loan_id === "All Loan Types"
                  ? ""
                  : loan_id
                : selectedLoan === "All Loan Types"
                ? ""
                : selectedLoan,
              selectedStatus:
                selectedStatusSearch === "All Loan Status"
                  ? ""
                  : selectedStatusSearch,
              selectedSubtype: loantype_id
                ? loantype_id === "All Loan Subtypes"
                  ? ""
                  : loantype_id
                : selectedLoanSubType === "All Loan Subtypes"
                ? ""
                : selectedLoanSubType,
              selectedState: selectedState === "All State" ? "" : selectedState,
              selectedCity: selectedCity === "All City" ? "" : selectedCity,
            },
          }
        );
        setFiles(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotalRecorrds(response.data.totalCount);
        setCurrentPage(response.data.currentPage);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData(); // Initial fetch when component mounts
  }, [
    currentPage,
    itemsPerPage,
    searchTerm,
    selectedLoan,
    selectedStatusSearch,
    selectedLoanSubType,
    selectedState,
    selectedCity,
    loan_id,
    loantype_id,
    accessType,
  ]);

  useEffect(() => {
    setSelectedLoanSubType("");
  }, [selectedLoan]);

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    if (nextPage <= totalPages) {
      setCurrentPage(nextPage);
    }
  };

  const handlePrevPage = () => {
    const prevPage = currentPage - 1;
    if (prevPage >= 1) {
      setCurrentPage(prevPage);
    }
  };

  //file percentege count
  const [fileData, setFileData] = useState([]);

  const fetchFileData = async (fileId) => {
    try {
      const response = await AxiosInstance.get(
        `/file_upload/file-count/${fileId}`
      );

      setFileData((prevFileData) => ({
        ...prevFileData,
        [fileId]: {
          approvedData: response.data.data.approvedData,
          pendingData: response.data.data.pendingData,
        },
      }));
    } catch (error) {
      console.error("Error: ", error.message);
    }
  };

  useEffect(() => {
    // Fetch data for the initially expanded rows
    files.forEach((file) => {
      if (expandedRow === file.file_id) {
        fetchFileData(file.file_id);
      }
    });
  }, [expandedRow]);

  useEffect(() => {
    $(".progress").each(function () {
      var value = parseInt($(this).attr("data-value"));
      var progressBars = $(this).find(".progress-bar");

      progressBars.removeClass("red yellow purple blue green");

      if (value >= 0 && value < 20) {
        progressBars.addClass("red");
      } else if (value >= 20 && value < 40) {
        progressBars.addClass("yellow");
      } else if (value >= 40 && value < 60) {
        progressBars.addClass("purple");
      } else if (value >= 60 && value < 80) {
        progressBars.addClass("blue");
      } else if (value >= 80 && value <= 100) {
        progressBars.addClass("green");
      }

      if (value <= 50) {
        progressBars
          .eq(1)
          .css("transform", "rotate(" + percentageToDegrees(value) + "deg)");
      } else {
        progressBars.eq(1).css("transform", "rotate(180deg)");
        progressBars
          .eq(0)
          .css(
            "transform",
            "rotate(" + percentageToDegrees(value - 50) + "deg)"
          );
      }
      function percentageToDegrees(percentage) {
        return (percentage / 100) * 360;
      }
    });
  }, [files, fetchFileData]);

  //total loan amount
  const [totalAmount, setTotalAmount] = useState(null);
  const [totalFiles, setTotalFiles] = useState(null);
  const [statusCounts, setStatusCounts] = useState(null);

  const fetchTotalAmount = async () => {
    try {
      let url = "/file_upload/bankamounts";

      if (accessType.bankuser_id) {
        url += `/${accessType.bankuser_id}`;
      }

      if (selectedLoan && selectedLoan !== "All Loan Types") {
        url += `/${selectedLoan}`;
      } else if (loan_id && loan_id !== "All Loan Types") {
        url += `/${loan_id}`;
      }

      if (selectedLoanSubType && selectedLoanSubType !== "All Loan Subtypes") {
        url += `/${selectedLoanSubType}`;
      } else if (loantype_id && loantype_id !== "All Loan Subtypes") {
        url += `/${loantype_id}`;
      }

      const response = await AxiosInstance.get(url, {
        params: {
          selectedStatusSearch:
            selectedStatusSearch === "All Loan Status"
              ? ""
              : selectedStatusSearch,
          selectedState: selectedState === "All State" ? "" : selectedState,
          selectedCity: selectedCity === "All City" ? "" : selectedCity,
        },
      });

      const { totalAmount, fileCount, statusCounts } = response.data;
      setTotalAmount(totalAmount);
      setTotalFiles(fileCount);
      setStatusCounts(statusCounts);
    } catch (error) {
      console.error("Error fetching total amount:", error);
    }
  };
  useEffect(() => {
    fetchTotalAmount();
  }, [
    selectedLoan,
    selectedLoanSubType,
    selectedState,
    selectedCity,
    selectedStatusSearch,
    loantype_id,
    loan_id,
    accessType,
  ]);

  useEffect(() => {
    fetchTotalAmount();
  }, [loan_id, selectedState, selectedCity]);

  //model open edit delete update assign
  const [anchorEl, setAnchorEl] = useState(null);
  const cancelRefAssign = React.useRef();

  const handleClick = (event, fileId, city, loanId, loanSubtypeId, userId) => {
    setAnchorEl(event.currentTarget);
    setSelectedFileId(fileId);
    setSelectedCityName(city);
    setSelectedBankCityName(city);
    setSelectedLoanId(loanId);
    setSelectedUserId(userId);
    setSelectedLoanSubtypeId(loanSubtypeId);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedFileId(null);
  };

  //delete
  const handleDelete = (id) => {
    setSelectedFileId(id);
    setIsDeleteDialogOpen(true);
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const cancelRef = React.useRef();

  const deletefile = async (fileId) => {
    try {
      const fileData = files?.find((file) => file?.file_id === fileId);
      let allDeleted = true;

      if (fileData?.documents?.length > 0) {
        for (const document of fileData.documents) {
          if (!document.file_path) {
            console.error("File path is missing for document");
            toast.error("File path is missing for document");
            allDeleted = false;
            continue;
          }

          try {
            const cdnResponse = await axios.delete(
              `https://cdn.savajcapital.com/api/upload/${document.file_path}`
            );
            if (cdnResponse.status !== 204 && cdnResponse.status !== 200) {
              if (cdnResponse.status === 404) {
                console.warn(
                  "File not found on CDN, treating as deleted:",
                  document.file_path
                );
              } else {
                console.error(
                  "Failed to delete file from CDN:",
                  cdnResponse.data
                );
                toast.error("Failed to delete file from CDN");
                allDeleted = false;
              }
            }
          } catch (cdnError) {
            if (cdnError.response && cdnError.response.status === 404) {
              console.warn(
                "File not found on CDN, treating as deleted:",
                document.file_path
              );
            } else {
              console.error("Error deleting from CDN:", cdnError);
              toast.error("Error deleting from CDN");
              allDeleted = false;
            }
          }
        }
      } else {
        console.warn(
          "No documents found for the file, but will attempt to delete file metadata."
        );
      }

      if (allDeleted) {
        const dbResponse = await AxiosInstance.delete(`/file_upload/${fileId}`);
        if (dbResponse.status === 200) {
          setFiles((prevFiles) =>
            prevFiles.filter((file) => file.file_id !== fileId)
          );
          toast.success("File deleted successfully!");
        } else {
          console.error("Failed to delete file metadata:", dbResponse.data);
          toast.error("Failed to delete file metadata");
          allDeleted = false;
        }
      }

      if (!allDeleted) {
        toast.error("Not all files/documents could be deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting files:", error);
      toast.error("Files could not be deleted");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  //edit
  const handleEditClick = (id) => {
    history.push(`/savajcapitaluser/edituserfile?id=${id}`);
  };

  //update status
  const handleUpdate = (id) => {
    setSelecteUpdateFileId(id);
    setIsUpdateDialogOpen(true);
  };

  const [allLoanStatus, setAllLoanStatus] = useState([]);
  const [selecteLoanStatusId, setSelecteLoanStatusId] = useState("");
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selecteUpdateFileId, setSelecteUpdateFileId] = useState(null);
  const cancelRef1 = React.useRef();

  useEffect(() => {
    const fetchLoanStatus = async () => {
      try {
        const response = await AxiosInstance.get("/loanstatus");
        setAllLoanStatus(response.data.data);
      } catch (error) {
        console.error("Error fetching loan statuses:", error);
      }
    };

    fetchLoanStatus();
  }, []);

  const updateFile = async (fileId, newStatusId) => {
    try {
      if (!newStatusId) {
        console.error("Status not selected");
        toast.error("Please select a status before updating.");
        return;
      }

      const response = await AxiosInstance.put(
        `/file_upload/updatestatus/${fileId}`,
        {
          status: newStatusId,
        }
      );

      if (response.data.success) {
        toast.success("File status updated successfully!");
        fetchData();
      } else {
        throw new Error(
          response.data.message || "Failed to update the status."
        );
      }
    } catch (error) {
      console.error("Error updating file status:", error);
      toast.error("File status could not be updated: " + error.message);
    } finally {
      setIsUpdateDialogOpen(false);
      setSelecteLoanStatusId("");
      setSelecteUpdateFileId(null);
    }
  };
  //assign
  const [selectedCityName, setSelectedCityName] = useState("");
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedLoanSubtypeId, setSelectedLoanSubtypeId] = useState("");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selecteAssignFileId, setSelecteAssignFileId] = useState(null);
  const [savajcapitalbranch, setSavajcapitalbranch] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [savajcapitalbranchUser, setSavajcapitalbranchUser] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedBranchUserId, setSelectedBranchUserId] = useState(null);
  const [selectedUserFileCount, setSelectedUserFileCount] = useState(0);

  const handleAssign = (id, city, loanId, loanSubtypeId, userId) => {
    const selectedFile = allFiles.find((file) => file.file_id === id);
    if (selectedFile) {
      setSelecteAssignFileId(selectedFile.file_id);
      setSelectedLoanId(loanId);
      setSelectedLoanSubtypeId(loanSubtypeId);
      setSelectedCityName(city);
      setSelectedUserId(userId);
      setIsAssignDialogOpen(true);
    }
  };

  const [allFiles, setAllFiles] = useState([]);

  const fetchFiles = async () => {
    try {
      const response = await AxiosInstance.get("/file_upload/allfiles");
      setAllFiles(response.data.data);
      if (response.data.data.length > 0) {
        setSelecteAssignFileId(response.data.data[0].file_id);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  useEffect(() => {
    fetchFiles();
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
    const fetchSavajcapitalbranchUser = async () => {
      if (!selectedBranchId) {
        setSavajcapitalbranchUser([]);
        return;
      }
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

  const getRoleName = (roleId) => {
    const role = roles.find((role) => role.role_id === roleId);
    return role ? role.role : "No role found";
  };

  const handleSubmitData = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        file_id: selecteAssignFileId,
        loan_id: selectedLoanId,
        loantype_id: selectedLoanSubtypeId,
        branch_id: selectedBranchId,
        bankuser_id: selectedBranchUserId,
        user_id: selectedUserId,
      };

      const response = await AxiosInstance.post("/branch_assign", payload);

      if (response.data.success) {
        history.push("/savajcapitaluser/userfile");
        toast.success("All data submitted successfully!");
      } else {
        toast.error(
          response.data.message || "Submission failed! Please try again."
        );
      }
    } catch (error) {
      console.error("Error while uploading files or submitting data:", error);
      console.error("Error response from server:", error.response);
      toast.error(
        error.response?.data?.message || "Submission failed! Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredBranchUsers = savajcapitalbranchUser.filter(
    (user) =>
      Array.isArray(user.loan_ids) && user.loan_ids.includes(selectedLoanId)
  );

  //Bank Assign
  const [selectedBankCityName, setSelectedBankCityName] = useState("");
  const [bankFiles, setBankFiles] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [bankUser, setBankUser] = useState([]);
  const [selectedBankUserId, setSelectedBankUserId] = useState(null);
  const [selectedFileBankId, setSelectedFileBankId] = useState(null);
  const [filteredData, setFilteredData] = useState("");
  const [filterOpen, setFilterOpen] = useState("");
  const filterToggle = () => setFilterOpen(!filterOpen);
  const [selectedBankLoan, setSelectedBankLoan] = useState("");
  const [isBankAssignDialogOpen, setIsBankAssignDialogOpen] = useState(false);
  const [selectedBankUserFileCount, setSelectedBankUserFileCount] = useState(0);

  const handleBankAssign = (id, city, loanId, loanSubtypeId, userId) => {
    const selectedFile = allFiles.find((file) => file.file_id === id);
    if (selectedFile) {
      setSelectedFileBankId(selectedFile.file_id);
      setSelectedLoanId(loanId);
      setSelectedBankCityName(city);
      setSelectedUserId(userId);
      setSelectedLoanSubtypeId(loanSubtypeId);
      setIsBankAssignDialogOpen(true);
    }
  };
  const fetchBankFiles = async () => {
    try {
      const response = await AxiosInstance.get("/file_upload/allfiles");
      setBankFiles(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedFileBankId(response.data.data[0].file_id);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  useEffect(() => {
    fetchBankFiles();
  }, []);
  const [banks, setBanks] = useState([]);

  const fetchBanks = async () => {
    try {
      const response = await AxiosInstance.get("/addbankuser");
      setBanks(response.data.data);
    } catch (error) {
      console.error("Error fetching banks:", error);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  useEffect(() => {
    const fetchBankUser = async () => {
      if (!selectedBankId) {
        setBankUser([]);
        return;
      }
      try {
        const response = await AxiosInstance.get(
          `/bank_user/${selectedBankId}`
        );
        setBankUser(response.data.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching branch users:", error);
      }
    };

    fetchBankUser();
  }, [selectedBankId]);

  const handleSubmitBankData = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        file_id: selectedFileBankId,
        bank_id: selectedBankId,
        loan_id: selectedLoanId,
        bankuser_id: selectedBankUserId,
        loantype_id: selectedLoanSubtypeId,
        user_id: selectedUserId,
      };

      const response = await AxiosInstance.post("/bank_approval", payload);

      if (response.data.success) {
        history.push("/savajcapitaluser/userfile");
        toast.success("All data submitted successfully!");
      } else {
        toast.error(
          response.data.message || "Submission failed! Please try again."
        );
      }
    } catch (error) {
      console.error("Error while uploading files or submitting data:", error);
      console.error("Error response from server:", error.response);
      toast.error(
        error.response?.data?.message || "Submission failed! Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getLoanName = (loanId) => {
    const loan = loans.find((loan) => loan.loan_id === loanId);
    return loan ? loan.loan : "All Files";
  };
  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
          <CardHeader pb="4">
            <Flex justifyContent="space-between" alignItems="center" pb="4">
              <Box>
                <Text fontSize="3xl" fontWeight="bold" mb="2">
                  {loan ? (
                    <>
                      <Flex alignItems="center" mt="2">
                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          bgGradient="linear(to-r, #b19552, #212529)"
                          bgClip="text"
                        >
                          {getLoanName(selectedLoan)}
                        </Text>
                        <Text
                          as="span"
                          color="black"
                          fontSize="xl"
                          fontWeight="medium"
                          mr="1"
                          ml="1"
                        >
                          ₹
                        </Text>
                        <Text
                          as="span"
                          color="green.500"
                          fontSize="2xl"
                          fontWeight="bold"
                          display="inline-flex"
                          alignItems="center"
                        >
                          {totalAmount !== null ? totalAmount : "-"}
                          <Box
                            as="span"
                            // ml="1"
                            display="inline-block"
                            bg="green.500"
                            height="2px"
                            width="100%"
                          />
                        </Text>
                        <Text as="span" color="gray.600" ml="1" fontSize="lg">
                          - {totalFiles} files
                        </Text>
                      </Flex>
                      {statusCounts && (
                        <Flex wrap="wrap" mt="2">
                          {Object.keys(statusCounts).map((status) => (
                            <Text
                              key={status}
                              color={statusCounts[status]?.color || "gray.700"}
                              fontSize="lg"
                           m="1"
                              p="1"
                              borderRadius="md"
                              bg="gray.100"
                              display="inline-block"
                              _hover={{
                                bg: statusCounts[status]?.color || "gray.300",
                                color: "white",
                              }}
                            >
                              {statusCounts[status]?.count} {status}
                            </Text>
                          ))}
                        </Flex>
                      )}
                    </>
                  ) : (
                    <>
                      <Flex alignItems="center" mt="2">
                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          bgGradient="linear(to-r, #b19552, #212529)"
                          bgClip="text"
                        >
                          {getLoanName(selectedLoan)}
                        </Text>
                        <Text
                          as="span"
                          color="black"
                          fontSize="xl"
                          fontWeight="medium"
                          mr="1"
                          ml="1"
                        >
                          ₹
                        </Text>
                        <Text
                          as="span"
                          color="green.500"
                          fontSize="2xl"
                          fontWeight="bold"
                          display="inline-flex"
                          alignItems="center"
                        >
                          {totalAmount !== null ? totalAmount : "-"}
                          <Box
                            as="span"
                            // ml="1"
                            display="inline-block"
                            bg="green.500"
                            height="2px"
                            width="100%"
                          />
                        </Text>
                        <Text as="span" color="gray.600" ml="1" fontSize="lg">
                          - {totalFiles} files
                        </Text>
                      </Flex>
                      {statusCounts && (
                        <Flex wrap="wrap" mt="2">
                          {Object.keys(statusCounts).map((status) => (
                            <Text
                              key={status}
                              color={statusCounts[status]?.color || "gray.700"}
                              fontSize="lg"
                           m="1"
                              p="1"
                              borderRadius="md"
                              bg="gray.100"
                              display="inline-block"
                              _hover={{
                                bg: statusCounts[status]?.color || "gray.300",
                                color: "white",
                              }}
                            >
                              {statusCounts[status]?.count} {status}
                            </Text>
                          ))}
                        </Flex>
                      )}
                    </>
                  )}
                </Text>
              </Box>
            </Flex>
            <Flex justifyContent="end" py="1" className="mainnnn">
              <Flex className="theaddd p-2">
                <div className="d-flex first-drop-section gap-2">
                  {!loan && (
                    <select
                      className="form-select loan-type-dropdown"
                      aria-label="Default select example"
                      value={selectedLoan}
                      onChange={(e) => setSelectedLoan(e.target.value)}
                      style={{
                        padding: "5px",
                        fontSize: "16px",
                        borderRadius: "8px",
                        border: "2px solid #b19552",
                        backgroundColor: "#ffffff",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        width: "100%",
                        maxWidth: "300px",
                        appearance: "none",
                        color: "#333333",
                        outline: "none",
                        transition: "all 0.3s ease-in-out",
                      }}
                    >
                      <option value="All Loan Types" disabled>
                        Select loan type
                      </option>
                      <option value="All Loan Types">All Loan Types</option>
                      {loans.map((loan) => (
                        <option
                          key={loan.loan_id}
                          value={loan.loan_id}
                          style={{
                            backgroundColor: "#ffffff",
                            color: "#333333",
                            padding: "10px",
                            borderRadius: "8px",
                            transition: "all 0.3s ease-in-out",
                          }}
                        >
                          {loan.loan}
                        </option>
                      ))}
                    </select>
                  )}
                  {!loan && loanSubtypes.length > 0 && (
                    <select
                      className="form-select loan-subtype-dropdown"
                      value={selectedLoanSubType}
                      disabled={!selectedLoan}
                      onChange={(e) => setSelectedLoanSubType(e.target.value)}
                      style={{
                        padding: "5px",
                        fontSize: "16px",
                        borderRadius: "8px",
                        border: "2px solid #b19552",
                        backgroundColor: "#ffffff",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        width: "100%",
                        maxWidth: "300px",
                        appearance: "none",
                        color: "#333333",
                        outline: "none",
                        transition: "all 0.3s ease-in-out",
                      }}
                    >
                      <option value="" disabled>
                        Select loan subtype
                      </option>
                      <option value="All Loan Subtypes">
                        All Loan SubTypes
                      </option>
                      {loanSubtypes.map((subtype) => (
                        <option
                          key={subtype.loantype_id}
                          value={subtype.loantype_id}
                          style={{
                            backgroundColor: "#ffffff",
                            color: "#333333",
                            padding: "10px",
                            borderRadius: "8px",
                            transition: "all 0.3s ease-in-out",
                          }}
                        >
                          {subtype.loan_type}
                        </option>
                      ))}
                    </select>
                  )}
                  {/* <select
                    className="form-select loan-type-dropdown"
                    aria-label="Default select example"
                    value={selectedState}
                    onChange={handleStateChange}
                    style={{
                      padding: "5px",
                      fontSize: "16px",
                      borderRadius: "8px",
                      border: "2px solid #b19552",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      width: "100%",
                      maxWidth: "300px",
                      appearance: "none",
                      color: "#333333",
                      outline: "none",
                      transition: "all 0.3s ease-in-out",
                    }}
                  >
                    <option value="" disabled>
                      Select State
                    </option>
                    <option value="All State">All State</option>
                    {states.map((state) => (
                      <option key={state.isoCode} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="form-select loan-type-dropdown"
                    aria-label="Default select example"
                    disabled={!selectedState}
                    value={selectedCity}
                    onChange={handleCityChange}
                    style={{
                      padding: "5px",
                      fontSize: "16px",
                      borderRadius: "8px",
                      border: "2px solid #b19552",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      width: "100%",
                      maxWidth: "300px",
                      appearance: "none",
                      color: "#333333",
                      outline: "none",
                      transition: "all 0.3s ease-in-out",
                    }}
                  >
                    <option value="" disabled>
                      Select City
                    </option>

                    <option value="All City">All City</option>
                    {cities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select> */}
                </div>
                <div
                  className="d-flex second-drop-section gap-2"
                  style={{ marginLeft: "10px" }}
                >
                  <select
                    className="form-select loan-type-dropdown"
                    aria-label="Default select example"
                    value={selectedStatusSearch}
                    onChange={(e) => setSelectedStatusSearch(e.target.value)}
                    style={{
                      padding: "5px",
                      fontSize: "16px",
                      borderRadius: "8px",
                      border: "2px solid #b19552",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      width: "100%",
                      maxWidth: "300px",
                      appearance: "none",
                      color: "#333333",
                      outline: "none",
                      transition: "all 0.3s ease-in-out",
                    }}
                  >
                    <option value="" disabled selected>
                      Select Status
                    </option>
                    <option value="All Loan Status">All Loan Status</option>
                    {allLoanStatus?.map((loanstatus) => (
                      <option
                        key={loanstatus.loanstatus_id}
                        value={loanstatus.loanstatus_id}
                      >
                        {loanstatus.loanstatus}
                      </option>
                    ))}
                  </select>

                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search"
                    width="250px"
                    // marginRight="10px"
                    style={{
                      padding: "5px",
                      fontSize: "16px",
                      borderRadius: "8px",
                      border: "2px solid #b19552",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      width: "100%",
                      maxWidth: "300px",
                      color: "#333333",
                      outline: "none",
                      transition: "all 0.3s ease-in-out",
                    }}
                  />

                  {/* <Button
                    onClick={() => history.push("/superadmin/addfile")}
                    className="dynamicImportantStyle"
                    colorScheme="blue"
                    style={{
                      paddingX: "20px",
                      fontSize: "16px",
                      borderRadius: "8px",
                      backgroundColor: "#b19552",
                      color: "white",
                      width: "150px",
                      transition: "all 0.3s ease-in-out",
                    }}
                  >
                    Add File
                  </Button> */}
                </div>
              </Flex>
            </Flex>
          </CardHeader>
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>#</Th>
                  <Th>File Id</Th>
                  <Th>Customer (Business)</Th>
                  {/* <Th>City</Th> */}
                  <Th>Loan</Th>
                  <Th>File Status</Th>
                  <Th>Current Step</Th>
                  <Th>Document Status</Th>
                  <Th></Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan="10">
                      <Flex justify="center" align="center" height="400px">
                        <Loader
                          type="spinner-circle"
                          bgColor={"#b19552"}
                          color={"black"}
                          size={50}
                        />
                      </Flex>
                    </Td>
                  </Tr>
                ) : files.length === 0 ? (
                  <Tr>
                    <Td colSpan="10">
                      <Flex justify="center" align="center" height="200px">
                        <Text
                          variant="h6"
                          color="textSecondary"
                          textAlign="center"
                        >
                          No data found
                        </Text>
                      </Flex>
                    </Td>
                  </Tr>
                ) : (
                  files.map((file, index) => (
                    <React.Fragment key={file.file_id}>
                      <Tr
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(file.file_id);
                        }}
                        cursor="pointer"
                      >
                        <Td>{index + 1}</Td>
                        <Td style={{ fontWeight: "bold", fontSize: "14px" }}>
                          {file?.file_id}
                        </Td>

                        <Td style={{ fontWeight: "bold", fontSize: "14px" }}>
                          {file?.user_username} ({file?.businessname})
                        </Td>
                        {/* <Td style={{ fontSize: "14px" }}>{file?.city}</Td> */}
                        <Td style={{ fontSize: "14px" }}>
                          {" "}
                          {`${file.loan}${
                            file.loan_type ? ` (${file.loan_type})` : ""
                          }`}
                        </Td>

                        <Td>
                          <div
                            style={{
                              color: "white",
                              backgroundColor: file?.color,
                              padding: "4px 8px",
                              borderRadius: "10px",
                              display: "inline-block",
                              fontSize: "0.8em",
                            }}
                          >
                            <span>{file?.status}</span>

                            {file?.status_message && (
                              <div
                                style={{
                                  marginTop: "4px",
                                  fontSize: "0.9em",
                                  color: "#FFFFFF",
                                }}
                              >
                                {file.status_message}
                              </div>
                            )}

                            {file?.status !== "1718861593296" && file?.amount && (
                              <div
                                style={{
                                  fontSize: "0.9em",
                                  color: "#FFFFFF",
                                }}
                              >
                                Amount: {file.amount}
                              </div>
                            )}
                            {/* <div
                              style={{
                                fontSize: "0.9em",
                                color: "#FFFFFF",
                              }}
                            >
                              {file.running_step_name || "CIBIL"}
                            </div> */}
                          </div>
                        </Td>
                        <Td style={{ fontSize: "14px" }}>
                          {" "}
                          {file.running_step_name || "CIBIL"}
                        </Td>
                        <Td>
                          {file.document_percentage != null &&
                          !isNaN(file.document_percentage) ? (
                            <div
                              className="progress"
                              data-value={Number(file.document_percentage)}
                            >
                              <span className="progress-left">
                                <span className="progress-bar"></span>
                              </span>
                              <span className="progress-right">
                                <span className="progress-bar"></span>
                              </span>
                              <div className="progress-value w-100 h-100 rounded-circle d-flex align-items-center justify-content-center">
                                <div className="font-weight-bold">
                                  {Number(file.document_percentage)}
                                  <sup className="small">%</sup>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="progress" data-value="0">
                              <span className="progress-left">
                                <span className="progress-bar"></span>
                              </span>
                              <span className="progress-right">
                                <span className="progress-bar"></span>
                              </span>
                              <div className="progress-value w-100 h-100 rounded-circle d-flex align-items-center justify-content-center">
                                <div className="font-weight-bold">
                                  0<sup className="small">%</sup>
                                </div>
                              </div>
                            </div>
                          )}
                        </Td>
                        <Td style={{ fontSize: "14px" }}>
                          {" "}
                          {file.loan_id === "1715150207654" ? (
                            // <Button
                            //   style={{
                            //     padding: "5px",
                            //     borderRadius: "5px",
                            //     backgroundColor: "#ededed",
                            //     width: "100%",
                            //   }}
                            //   onClick={(e) => {
                            //     e.stopPropagation(e.target.value);
                            //     // handleClick(pan_card);
                            //     href="https://ibdlp.indianbank.in/GSTAdvantage/components/"

                            //   }}
                            // >
                            //   IDB
                            // </Button>
                            <a
                              href="https://ibdlp.indianbank.in/GSTAdvantage/"
                              target="_blank"
                              onClick={(e) => e.stopPropagation(e.target.value)}
                            >
                              IDB
                            </a>
                          ) : (
                            "-"
                          )}
                        </Td>
                        <Td>
                          <Flex
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            {/* <Flex>
                              <IconButton
                                aria-controls="menu"
                                aria-haspopup="true"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClick(
                                    e,
                                    file.file_id,
                                    file.city,
                                    file.loan_id,
                                    file.loantype_id || "",
                                    file.user_id
                                  );
                                }}
                              >
                                <MoreVertIcon />
                              </IconButton>

                              <Menu
                                id="menu"
                                anchorEl={anchorEl}
                                keepMounted
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                              >
                                <MenuItem
                                  onClick={(e) => {
                                    handleClose();
                                    handleDelete(selectedFileId);
                                    e.stopPropagation();
                                  }}
                                >
                                  <DeleteIcon style={{ marginRight: "5px" }} />
                                  Delete
                                </MenuItem>
                                <MenuItem
                                  onClick={(e) => {
                                    handleClose();
                                    handleEditClick(selectedFileId);
                                    e.stopPropagation();
                                  }}
                                >
                                  <EditIcon style={{ marginRight: "5px" }} />
                                  Edit
                                </MenuItem>
                                <MenuItem
                                  onClick={(e) => {
                                    handleClose();
                                    handleUpdate(selectedFileId);
                                    e.stopPropagation();
                                  }}
                                >
                                  <AddIcon style={{ marginRight: "5px" }} />
                                  Update
                                </MenuItem>
                                <MenuItem
                                  onClick={(e) => {
                                    handleClose();
                                    handleAssign(
                                      selectedFileId,
                                      selectedCityName,
                                      selectedLoanId,
                                      selectedLoanSubtypeId,
                                      selectedUserId
                                    );
                                    e.stopPropagation();
                                  }}
                                >
                                  <ExternalLinkIcon
                                    style={{ marginRight: "5px" }}
                                  />
                                  Branch Assign
                                </MenuItem>
                                <MenuItem
                                  onClick={(e) => {
                                    handleClose();
                                    handleBankAssign(
                                      selectedFileId,
                                      selectedBankCityName,
                                      selectedLoanId,
                                      selectedLoanSubtypeId,
                                      selectedUserId
                                    );
                                    e.stopPropagation();
                                  }}
                                >
                                  <ExternalLinkIcon
                                    style={{ marginRight: "5px" }}
                                  />
                                  Bank Assign
                                </MenuItem>
                              </Menu>
                            </Flex> */}
                            <Flex style={{ paddingLeft: "10px" }}>
                              <IconButton
                                aria-label={
                                  expandedRow === file.file_id
                                    ? "Collapse"
                                    : "Expand"
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRowExpansion(file.file_id);
                                }}
                              >
                                {expandedRow === file.file_id ? (
                                  <ChevronUpIcon />
                                ) : (
                                  <ChevronDownIcon />
                                )}
                              </IconButton>
                            </Flex>
                          </Flex>
                        </Td>
                      </Tr>
                      <Tr>
                        <Td
                          colSpan="10"
                          p={0}
                          border="none"
                          style={{
                            maxHeight: expandedRow === index ? "none" : "0",
                            overflow: "hidden",
                          }}
                        >
                          <Collapse
                            in={expandedRow === file.file_id}
                            animateOpacity
                          >
                            <div
                              style={{
                                maxHeight:
                                  expandedRow === file.file_id
                                    ? "none"
                                    : "100%",
                                overflow: "hidden",
                              }}
                            >
                              {fileData[file.file_id] ? ( // Check if file data is available
                                <div
                                  style={{
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                  }}
                                >
                                  <Table
                                    variant="simple"
                                    bg={useColorModeValue(
                                      "gray.50",
                                      "gray.700"
                                    )}
                                    style={{ tableLayout: "fixed" }}
                                  >
                                    <Thead>
                                      <Tr>
                                        <Th>Document Name</Th>
                                        <Th>Status</Th>
                                      </Tr>
                                    </Thead>
                                    <Tbody style={{ fontSize: "14px" }}>
                                      {(
                                        fileData[file.file_id]?.approvedData ||
                                        []
                                      ).map((documentRow, index) => (
                                        <Tr key={index}>
                                          <Td>
                                            {" "}
                                            {documentRow?.name} (
                                            {documentRow?.title})
                                          </Td>
                                          <Td>
                                            {documentRow?.status ===
                                            "Uploaded" ? (
                                              <span
                                                style={{
                                                  color: "green",
                                                  fontWeight: "bold",
                                                }}
                                              >
                                                <i className="fa-regular fa-circle-check"></i>
                                                &nbsp;&nbsp;Uploaded
                                              </span>
                                            ) : (
                                              <span
                                                style={{
                                                  color: "#FF9C00",
                                                  fontWeight: "bold",
                                                }}
                                              >
                                                <i className="fa-regular fa-clock"></i>
                                                &nbsp;&nbsp;Pending
                                              </span>
                                            )}
                                          </Td>
                                        </Tr>
                                      ))}
                                      {(
                                        fileData[file.file_id]?.pendingData ||
                                        []
                                      ).map((documentRow, index) => (
                                        <Tr key={index}>
                                          <Td>
                                            {documentRow?.name} (
                                            {documentRow?.title})
                                          </Td>
                                          <Td>
                                            {documentRow?.status ===
                                            "Uploaded" ? (
                                              <span
                                                style={{
                                                  color: "green",
                                                  fontWeight: "bold",
                                                }}
                                              >
                                                <i className="fa-regular fa-circle-check"></i>
                                                &nbsp;&nbsp;Uploaded
                                              </span>
                                            ) : (
                                              <span
                                                style={{
                                                  color: "#FF9C00",
                                                  fontWeight: "bold",
                                                }}
                                              >
                                                <i className="fa-regular fa-clock"></i>
                                                &nbsp;&nbsp;Pending
                                              </span>
                                            )}
                                          </Td>
                                        </Tr>
                                      ))}
                                    </Tbody>
                                  </Table>
                                </div>
                              ) : (
                                <Loader
                                  type="spinner-circle"
                                  bgColor={"#b19552"}
                                  color={"black"}
                                  size={50}
                                />
                              )}
                            </div>
                          </Collapse>
                        </Td>
                      </Tr>
                    </React.Fragment>
                  ))
                )}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
        <AlertDialog
          isOpen={isDeleteDialogOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsDeleteDialogOpen(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete File
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure? You can't undo this action afterwards.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={() => deletefile(selectedFileId)}
                  ml={3}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
        <AlertDialog
          isOpen={isUpdateDialogOpen}
          leastDestructiveRef={cancelRef1}
          onClose={() => {
            setIsUpdateDialogOpen(false);
            setSelecteLoanStatusId("");
          }}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Update File Status
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to update the status of this file?
                <Select
                  placeholder="Select Status"
                  value={selecteLoanStatusId}
                  onChange={(e) => setSelecteLoanStatusId(e.target.value)}
                >
                  {allLoanStatus?.map((loanstatus) => (
                    <option
                      key={loanstatus.loanstatus_id}
                      value={loanstatus.loanstatus_id}
                    >
                      {loanstatus.loanstatus}
                    </option>
                  ))}
                </Select>
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef1}
                  onClick={() => setIsUpdateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={() => {
                    updateFile(selecteUpdateFileId, selecteLoanStatusId);
                    setIsUpdateDialogOpen(false);
                  }}
                  ml={3}
                  isDisabled={!selecteLoanStatusId}
                >
                  Update
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
        <AlertDialog
          isOpen={isAssignDialogOpen}
          leastDestructiveRef={cancelRefAssign}
          onClose={() => {
            setIsAssignDialogOpen(false);
            setSelecteAssignFileId(null);
            setSelectedBranchId(null);
            setSelectedBranchUserId(null);
            setSelectedCityName("");
            setSelectedLoanId("");
          }}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Assign File
              </AlertDialogHeader>
              <AlertDialogBody>
                <FormControl id="file_id" mt={4} isRequired>
                  <FormLabel>File</FormLabel>
                  <Select
                    placeholder="Select File"
                    value={selecteAssignFileId}
                    isDisabled={selecteAssignFileId}
                    onChange={(e) => setSelecteAssignFileId(e.target.value)}
                  >
                    {allFiles?.map((file) => (
                      <option key={file.file_id} value={file.file_id}>
                        {`${file.file_id}`}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl id="branch_id" mt={4} isRequired>
                  <FormLabel>Savaj Capital Branch</FormLabel>
                  <Select
                    placeholder="Select Branch"
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                  >
                    {savajcapitalbranch
                      .filter((branch) => branch.city === selectedCityName)
                      .map((branch) => (
                        <option key={branch.branch_id} value={branch.branch_id}>
                          {`${branch.branch_name} (${branch.city})`}
                        </option>
                      ))}
                  </Select>
                </FormControl>
                {selectedBranchId && (
                  <FormControl id="bankuser_id" mt={4} isRequired>
                    <FormLabel>Branch User</FormLabel>
                    {filteredBranchUsers.length > 0 ? (
                      <>
                        <Select
                          placeholder="Select User"
                          onChange={(e) => {
                            setSelectedBranchUserId(e.target.value);
                            const user = filteredBranchUsers.find(
                              (u) => u.bankuser_id === e.target.value
                            );
                            if (user) {
                              setSelectedUserFileCount(
                                user.assigned_file_count || 0
                              );
                            }
                          }}
                        >
                          {filteredBranchUsers.map((user) => (
                            <option
                              key={user.bankuser_id}
                              value={user.bankuser_id}
                            >
                              {`${user.full_name} (${getRoleName(
                                user.role_id
                              )})`}
                            </option>
                          ))}
                        </Select>
                        {selectedBranchUserId && (
                          <Text
                            style={{ paddingTop: "20px", fontWeight: "bold" }}
                          >
                            Assigned Files Count: {selectedUserFileCount}
                          </Text>
                        )}
                      </>
                    ) : (
                      <Text>No users available for this branch or loan.</Text>
                    )}
                  </FormControl>
                )}
              </AlertDialogBody>

              <AlertDialogFooter>
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
                  Assign
                </Button>

                <Button
                  mt={4}
                  style={{
                    backgroundColor: "#414650",
                    color: "#fff",
                    marginTop: 40,
                    marginLeft: 8,
                  }}
                  onClick={() => {
                    setIsAssignDialogOpen(false);
                    setSelecteAssignFileId(null);
                    setSelectedBranchId(null);
                    setSelectedBranchUserId(null);
                    setSelectedCityName("");
                    setSelectedLoanId("");
                  }}
                >
                  Cancel
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
        <AlertDialog
          isOpen={isBankAssignDialogOpen}
          leastDestructiveRef={cancelRefAssign}
          onClose={() => {
            setIsBankAssignDialogOpen(false);
            setSelectedFileBankId(null);
            setSelectedBankId(null);
            setSelectedBankUserId(null);
            setSelectedBankCityName("");
            // setSelectedLoanId("");
          }}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Assign File
              </AlertDialogHeader>
              <AlertDialogBody>
                <FormControl id="file_id" mt={4} isRequired>
                  <FormLabel>File</FormLabel>
                  <Select
                    placeholder="Select File"
                    value={selectedFileBankId}
                    isDisabled={selectedFileBankId}
                    onChange={(e) => setSelectedFileBankId(e.target.value)}
                  >
                    {bankFiles?.map((file) => (
                      <option key={file.file_id} value={file.file_id}>
                        {`${file.file_id}`}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl id="bank_id" mt={4} isRequired>
                  <FormLabel>Select Branch</FormLabel>
                  {banks.length > 0 ? (
                    <Select
                      placeholder="Select Branch"
                      onChange={(e) => setSelectedBankId(e.target.value)}
                    >
                      {banks
                        .filter((bank) => bank.city === selectedBankCityName)
                        .map((bank) => (
                          <option key={bank.bank_id} value={bank.bank_id}>
                            {`${bank.bank_name} (${bank.branch_name})`}
                          </option>
                        ))}
                    </Select>
                  ) : (
                    <Text>No branches available for this city.</Text>
                  )}
                </FormControl>
                {/* <div className="w-100 my-3">
                  <FormLabel>Select Bank</FormLabel>
                  {bankUser.length > 0 ? (
                      <Select
                        placeholder="Select User"
                        onChange={(e) => setSelectedBankUserId(e.target.value)}
                      >
                  {banks
                    .filter((bank) => bank.city === selectedBankCityName)
                    .map((bank) => (
                      <option key={bank.bank_id} value={bank.bank_id}>
                        {`${bank.bank_name} (${bank.city})`}
                      </option>
                    ))}
                  ) : (
                      <Text>No users available for this branch.</Text>
                    )}
                </div> */}

                {selectedBankId && (
                  <FormControl id="bankuser_id" mt={4} isRequired>
                    <FormLabel>Bank User</FormLabel>
                    {bankUser.length > 0 ? (
                      <>
                        <Select
                          placeholder="Select User"
                          onChange={(e) => {
                            setSelectedBankUserId(e.target.value);
                            const user = bankUser.find(
                              (u) => u.bankuser_id === e.target.value
                            );
                            if (user) {
                              setSelectedBankUserFileCount(
                                user.assigned_file_count || 0
                              );
                            }
                          }}
                        >
                          {bankUser.map((user) => (
                            <option
                              key={user.bankuser_id}
                              value={user.bankuser_id}
                            >
                              {user.email}
                            </option>
                          ))}
                        </Select>
                        {selectedBankUserId && (
                          <Text
                            style={{ paddingTop: "20px", fontWeight: "bold" }}
                          >
                            Assigned Files Count: {selectedBankUserFileCount}
                          </Text>
                        )}
                      </>
                    ) : (
                      <Text>No users available for this branch.</Text>
                    )}
                  </FormControl>
                )}
              </AlertDialogBody>

              <AlertDialogFooter>
                <div>
                  <Button
                    mt={4}
                    colorScheme="teal"
                    onClick={handleSubmitBankData}
                    isLoading={loading}
                    loadingText="Submitting"
                    style={{
                      backgroundColor: "#b19552",
                      color: "#fff",
                      marginTop: 40,
                    }}
                  >
                    Assign
                  </Button>

                  <Button
                    mt={4}
                    style={{
                      backgroundColor: "#414650",
                      color: "#fff",
                      marginTop: 40,
                      marginLeft: 8,
                    }}
                    onClick={() => {
                      setIsBankAssignDialogOpen(false);
                      setSelectedFileBankId(null);
                      setSelectedBankId(null);
                      setSelectedBankUserId(null);
                      setSelectedBankCityName("");
                      // setSelectedLoanId("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Flex>
      <Flex
        justifyContent="flex-end"
        alignItems="center"
        p="4"
        borderBottom="1px solid #ccc"
      >
        <Text mr="4" fontSize="sm">
          Total Records: {totalRecords}
        </Text>
        <Text mr="2" fontSize="sm">
          Rows per page:
        </Text>
        <Select
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          mr="2"
          width="100px"
          fontSize="sm"
        >
          {[10, 20, 50].map((perPage) => (
            <option key={perPage} value={perPage}>
              {perPage}
            </option>
          ))}
        </Select>
        <Text mr="4" fontSize="sm">
          Page {currentPage} of {totalPages}
        </Text>
        <IconButton
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          aria-label="Previous Page"
          icon={<KeyboardArrowUpIcon />}
          mr="2"
          variant="outline"
          colorScheme="gray"
          size="sm"
        />
        <IconButton
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          aria-label="Next Page"
          icon={<KeyboardArrowDownIcon />}
          variant="outline"
          colorScheme="gray"
          size="sm"
        />
      </Flex>
      <Toaster />
    </>
  );
}

export default AllBankFiles;
