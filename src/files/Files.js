import React, { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import $ from "jquery";
import toast, { Toaster } from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  Box,
} from "@mui/material";
import "./file.scss";
import { useHistory } from "react-router-dom";
import { Select } from "@chakra-ui/react";
import {
  Button,
  useColorModeValue,
  Input,
  Flex,
  Text,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import CardHeader from "components/Card/CardHeader.js";
import { DeleteIcon, EditIcon, AddIcon } from "@chakra-ui/icons";
import { IconButton } from "@chakra-ui/react";
import {
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";
import Loader from "react-js-loader";
import AxiosInstance from "config/AxiosInstance";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";
import { Country, State, City } from "country-state-city";
const theme = createTheme();

function Row(props) {
  const {
    id,
    file,
    handleEditClick,
    handleDelete,
    pan_card,
    handleUpdate,
    index,
  } = props;
  const history = useHistory();
  const [open, setOpen] = useState(false);

  const [fileData, setFileData] = useState([]);
  let [filePercentageData, setFilePercentageData] = useState("");
  let fetchFileData = async () => {
    try {
      const file_id = file.file_id;
      const response = await AxiosInstance.get(
        `/file_upload/testfile/${file_id}`
      );
      setFileData([
        ...response.data.data.approvedData,
        ...response.data.data.pendingData,
      ]);
      setFilePercentageData(response.data.data.document_percentage);
    } catch (error) {
      console.log("Error: ", error.message);
    }
  };

  useEffect(() => {
    fetchFileData();
  }, [file]);

  useEffect(() => {
    $(".progress").each(function () {
      var value = parseInt($(this).attr("data-value"));
      var progressBars = $(this).find(".progress-bar");

      progressBars.removeClass("red yellow purple blue green");

      if (value >= 0 && value < 20) {
        progressBars.addClass("red");
      } else if (value >= 20 && value < 40) {
        progressBars.addClass("#FF9C00"); // Change yellow to #FF9C00
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
  }, [filePercentageData]);

  const handleClick = () => {
    AxiosInstance.get(`/idb_check?panCard=${pan_card}`)
      .then((response) => {
        console.log("Response:", response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <React.Fragment>
      <TableRow
        sx={{ "& > *": { borderBottom: "unset" } }}
        onClick={() => props.handleRow("/superadmin/viewfile?id=" + id)}
        style={{ cursor: "pointer" }}
      >
        <TableCell style={{ border: "" }}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={(e) => {
              setOpen(!open);
              e.stopPropagation();
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell align="">{index}</TableCell>
        <TableCell align="">
          <span
            style={{
              // color:
              //   file?.status === "approved"
              //     ? "#4CAF50"
              //     : file?.status === "rejected"
              //     ? "#F44336"
              //     : " #FF9C00",
              padding: "4px 8px",
              fontWeight: "bold",
            }}
          >
            {file?.file_id}
          </span>
        </TableCell>
        <TableCell align="">
          <span
            style={{
              // color:
              //   file?.status === "approved"
              //     ? "#4CAF50"
              //     : file?.status === "rejected"
              //     ? "#F44336"
              //     : " #FF9C00",
              padding: "4px 8px",
              fontWeight: "bold",
            }}
          >
            {file?.user_username} ({file?.businessname})
          </span>
        </TableCell>
        <TableCell align="">{file?.city}</TableCell>
        {/* <TableCell align="">{file?.pan_card}</TableCell> */}
        <TableCell align="">{file?.loan}</TableCell>
        <TableCell align="">
          <span
            style={{
              color: "white",
              backgroundColor:
                file?.status === "approved"
                  ? "#4CAF50"
                  : file?.status === "rejected"
                  ? "#F44336"
                  : " #FF9C00",
              padding: "4px 8px",
              borderRadius: "10px",
            }}
          >
            {file?.status === "approved"
              ? "Approved"
              : file?.status === "rejected"
              ? "Rejected"
              : "Running"}
          </span>
        </TableCell>

        <TableCell align="center">
          {filePercentageData && (
            <div class="progress " data-value={Number(filePercentageData)}>
              <span class="progress-left">
                <span class="progress-bar"></span>
              </span>
              <span class="progress-right">
                <span class="progress-bar"></span>
              </span>
              <div class="progress-value w-100 h-100 rounded-circle d-flex align-items-center justify-content-center">
                <div class="font-weight-bold">
                  {Number(filePercentageData)}
                  <sup class="small">%</sup>
                </div>
              </div>
            </div>
          )}
        </TableCell>

        <TableCell>
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
        </TableCell>

        <TableCell align="">
          <Flex>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(file.file_id);
              }}
              aria-label="Delete bank"
              icon={<DeleteIcon />}
              style={{ marginRight: 15, fontSize: "20px" }}
            />

            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(file.file_id);
              }}
              aria-label="Edit bank"
              icon={<EditIcon />}
              style={{ marginRight: 15, fontSize: "20px" }}
            />
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleUpdate(file.file_id);
              }}
              aria-label="Edit status"
              icon={<AddIcon />}
              style={{ fontSize: "20px" }}
            />
          </Flex>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse
            in={open}
            timeout="auto"
            unmountOnExit
            style={{ width: "100%" }}
          >
            <Box sx={{ margin: 1 }} className="d-flex gap-4 collapse-table">
              <Paper
                className="col-8 col-md-8 col-sm-12 paper"
                elevation={3}
                sx={{ borderRadius: 3 }}
                style={{
                  height: "104px",
                  overflow: "auto",
                  scrollbarWidth: "thin",
                }}
              >
                <Table size="small" aria-label="documents">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                        Document
                      </TableCell>
                      <TableCell
                        className="status"
                        sx={{ fontWeight: "bold", fontSize: "1rem" }}
                      >
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fileData?.map((documentRow, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          {documentRow?.name} ({documentRow?.title})
                        </TableCell>
                        <TableCell>
                          {documentRow?.status === "Uploaded" ? (
                            <span
                            // style={{ color: "green", fontWeight: "bold" }}
                            >
                              <i class="fa-regular fa-circle-check"></i>
                              &nbsp;&nbsp;Uploaded
                            </span>
                          ) : (
                            <span
                            // style={{ color: "#FF9C00 ", fontWeight: "bold" }}
                            >
                              <i class="fa-regular fa-clock"></i>
                              &nbsp;&nbsp;Pending
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
              <Paper
                className="col-4 col-md-4 col-sm-12 paper"
                elevation={3}
                sx={{ borderRadius: 3 }}
                style={{
                  height: "100px",
                  overflow: "auto",
                  scrollbarWidth: "thin",
                }}
              >
                <Table size="small" aria-label="documents">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                        Create
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                        Update
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{file?.createdAt}</TableCell>
                      <TableCell>{file?.updatedAt}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

Row.propTypes = {
  file: PropTypes.shape({
    file_id: PropTypes.string.isRequired,
    loan: PropTypes.string.isRequired,
    loan_type: PropTypes.string.isRequired,
    protein: PropTypes.number.isRequired,
    history: PropTypes.arrayOf(
      PropTypes.shape({
        amount: PropTypes.number.isRequired,
        customerId: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default function CollapsibleTable() {
  const [files, setFiles] = useState([]);
  let menuBg = useColorModeValue("white", "navy.800");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLoan, setSelectedLoan] = useState("All Loan Types");
  const location = useLocation();
  const { loan, loan_id } = location?.state?.state || {};
  const [loans, setLoans] = useState([]);
  const [selectedStatusSearch, setSelectedStatusSearch] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const states = State.getStatesOfCountry("IN"); // Assuming 'IN' is the country code for India

  // Retrieve cities whenever the selectedState changes
  // Here we find the state object first to get the correct ISO code for fetching cities
  const cities = selectedState
    ? City.getCitiesOfState(
        "IN",
        states.find((state) => state.name === selectedState)?.isoCode
      )
    : [];

  // const filteredUsers = files.filter((file) => {
  //   const searchTermLower = searchTerm.toLowerCase();
  //   const selectedLoanLower = selectedLoan.toLowerCase();
  //   const selectedStatusLower = selectedStatusSearch.toLowerCase();

  //   const matchesSearch =
  //     file.file_id?.toLowerCase().includes(searchTermLower) ||
  //     file.loan_type?.toLowerCase().includes(searchTermLower) ||
  //     file.user_username?.toLowerCase().includes(searchTermLower) ||
  //     file.loan?.toLowerCase().includes(searchTermLower) ||
  //     file.status?.toLowerCase().includes(searchTermLower);

  //   const matchesLoan =
  //     selectedLoan === "All Loan Types" ||
  //     file.loan?.toLowerCase().includes(selectedLoanLower);
  //   const matchesStatus =
  //     selectedStatusSearch === "" ||
  //     file.status?.toLowerCase() === selectedStatusLower;
  //   const matchesState = selectedState ? file.state === selectedState : true;
  //   const matchesCity = selectedCity ? file.city === selectedCity : true;
  //   return (
  //     matchesSearch &&
  //     matchesLoan &&
  //     matchesStatus &&
  //     matchesState &&
  //     matchesCity
  //   );
  // });

  const history = useHistory();

  const handleRow = (url) => {
    history.push(url);
  };

  useEffect(() => {
    const fetchDatas = async () => {
      try {
        const loanResponse = await AxiosInstance.get("/loan");
        setLoans(loanResponse.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchDatas();
  }, []);

  useEffect(() => {
    if (loan_id) {
      setSelectedLoan(loan_id);
    }
  }, [loan_id, loans]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchData = async () => {
    try {
      const response = await AxiosInstance.get("/file_upload", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
        },
      });
      setFiles(response.data.data);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
      setTotalRecords(response.data.count);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   if (cityFilterData.selectedCity !== "") {
  //     cityFilter();
  //   } else if (stateFilterData.selectedState !== "") {
  //     stateFilter();
  //   } else if (selectedStatusSearchApi !== "") {
  //     statusFilter();
  //   } else if (searchData.loan_id !== "" || loan_id !== "") {
  //     loanFilter();
  //   } else {
  //     fetchData();
  //   }
  // }, [currentPage, itemsPerPage]);

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

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const cancelRef = React.useRef();

  const deletefile = async (fileId) => {
    try {
      const fileData = files?.find((file) => file?.file_id === fileId);
      if (
        !fileData ||
        !fileData?.documents ||
        fileData?.documents.length === 0
      ) {
        console.error("No documents found for the file");
        toast.error("No documents found for the file");
        setIsDeleteDialogOpen(false);
        return;
      }

      let allDeleted = true;
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
            console.error("Failed to delete file from CDN:", cdnResponse.data);
            toast.error("Failed to delete file from CDN");
            allDeleted = false;
          }
        } catch (cdnError) {
          console.error("Error deleting from CDN:", cdnError);
          toast.error("Error deleting from CDN");
          allDeleted = false;
        }
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

  const handleEditClick = (id) => {
    history.push(`/superadmin/editfile?id=${id}`);
  };

  const handleDelete = (id) => {
    setSelectedFileId(id);
    setIsDeleteDialogOpen(true);
  };

  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selecteUpdateFileId, setSelecteUpdateFileId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const cancelRef1 = React.useRef();

  const updateFile = async (fileId, newStatus) => {
    try {
      if (!newStatus) {
        console.error("Status not selected");
        toast.error("Please select a status before updating.");
        return;
      }

      const response = await AxiosInstance.put(
        `/file_upload/updatestatus/${fileId}`,
        {
          status: newStatus,
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
      setSelectedStatus("");
      setSelecteUpdateFileId(null);
    }
  };

  const handleUpdate = (id) => {
    setSelecteUpdateFileId(id);
    setIsUpdateDialogOpen(true);
  };

  const [searchValueApi, setSearchValueApi] = useState("");
  const [searchLoader, setSearchLoader] = useState(false);
  let handleSearchData = async (values) => {
    try {
      setSearchLoader(true);
      let res = await axios.post(
        "http://localhost:5882/api/file_upload/search",
        {
          search: values,
        }
      );
      if (res.data.statusCode === 200) {
        setFiles(res.data.data);
        setTotalRecords(res.data.count);
        setSearchLoader(false);
      }
    } catch (error) {
      setSearchLoader(false);
      console.log(error);
    }
  };

  const handleReset = () => {
    setSearchValueApi(""); // Clear the search input value
    fetchData(); // Fetch all data using the GET API
  };

  useEffect(() => {
    if (searchValueApi === "") {
      handleReset();
    }
  }, [searchValueApi]);

  let [searchData, setSearchData] = useState({ loan_id: "" });
  const updateInputs = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    setSearchData((preVal) => {
      return {
        ...preVal,
        [name]: value,
      };
    });
  };

  // Loan Dropdawn
  const [loanFilterLoader, setLoanFilterLoader] = useState(false);
  var loanFilter = async () => {
    try {
      setLoanFilterLoader(true);
      let response = await axios.post(
        "http://localhost:5882/api/file_upload/filter",
        {
          loan_id: searchData.loan_id || loan_id,
        }
      );
      if (response.data.statusCode === 200) {
        setFiles(response.data.data);
        setLoanFilterLoader(false);
        setTotalRecords(response.data.count);
      }
    } catch (error) {
      setLoanFilterLoader(false);
      console.error("Error fetching filtered data:", error);
    }
  };

  React.useEffect(() => {
    if (searchData.loan_id !== "" || loan_id !== "") {
      loanFilter();
    } else if (searchData.loan_id === "" || loan_id === "") {
      fetchData();
    }
  }, [searchData.loan_id || loan_id]);

  // Status Dropdawn
  const [selectedStatusSearchApi, setSelectedStatusSearchApi] = useState("");
  const [statusLoader, setStatusLoader] = useState(false);
  var statusFilter = async () => {
    try {
      setStatusLoader(true);
      let response = await axios.post(
        "http://localhost:5882/api/file_upload/status",
        {
          status: selectedStatusSearchApi,
        }
      );
      if (response.data.statusCode === 200) {
        setFiles(response.data.data);
        setTotalRecords(response.data.count);
        setStatusLoader(false);
      }
    } catch (error) {
      setStatusLoader(false);
      console.error("Error fetching filtered data:", error);
    }
  };

  React.useEffect(() => {
    if (selectedStatusSearchApi !== "") {
      statusFilter();
    } else if (selectedStatusSearchApi === "") {
      fetchData();
    }
  }, [selectedStatusSearchApi]);

  // State Filter
  let [stateFilterData, setStateFilterData] = useState({});
  const updateStateInputs = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    setStateFilterData((preVal) => {
      return {
        ...preVal,
        [name]: value,
      };
    });
  };

  const [stateLoader, setStateLoader] = useState(false);
  var stateFilter = async () => {
    try {
      setStateLoader(true);
      let response = await axios.post(
        "http://localhost:5882/api/file_upload/state_filter",
        {
          state: stateFilterData.selectedState,
        }
      );
      if (response.data.statusCode === 200) {
        setFiles(response.data.data);
        setTotalRecords(response.data.count);
        setStateLoader(false);
      }
    } catch (error) {
      setStateLoader(false);
      console.error("Error fetching filtered data:", error);
    }
  };

  React.useEffect(() => {
    if (stateFilterData.selectedState !== "") {
      stateFilter();
    } else if (stateFilterData.selectedState === "") {
      fetchData();
    }
  }, [stateFilterData.selectedState]);

  // City Filter
  let [cityFilterData, setCityFilterData] = useState({});
  const updateCityInputs = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    setCityFilterData((preVal) => {
      return {
        ...preVal,
        [name]: value,
      };
    });
  };

  const [cityLoader, setCityLoader] = useState(false);
  var cityFilter = async () => {
    try {
      setCityLoader(true);
      let response = await axios.post(
        "http://localhost:5882/api/file_upload/city_filter",
        {
          city: cityFilterData.selectedCity,
        }
      );
      if (response.data.statusCode === 200) {
        setFiles(response.data.data);
        setTotalRecords(response.data.count);
        setCityLoader(false);
      }
    } catch (error) {
      setCityLoader(false);
      console.error("Error fetching filtered data:", error);
    }
  };

  React.useEffect(() => {
    if (cityFilterData.selectedCity !== "") {
      cityFilter();
    } else if (cityFilterData.selectedCity === "") {
      fetchData();
    }
  }, [cityFilterData.selectedCity]);

  return (
    <>
      <div className="card" style={{ marginTop: "80px", borderRadius: "30px" }}>
        <CardHeader style={{ padding: "10px" }} className="card-main ">
          <Flex justifyContent="space-between" p="4" className="mainnnn">
            <Text fontSize="xl" fontWeight="bold">
              {loan ? `${loan}` : "All Files"}
            </Text>
            <Button
              onClick={() => history.push("/superadmin/addfile")}
              className="dynamicImportantStyle"
            >
              Add File
            </Button>
          </Flex>
          <Flex justifyContent="end" py="1" className="mainnnn">
            <Flex className="thead p-2 ">
              {!loan_id && (
                <Flex className="thead ">
                  <Select
                    placeholder="Select a loan type"
                    name="loan_id"
                    value={searchData?.loan_id}
                    onChange={updateInputs}
                    mr="10px"
                    width="200px"
                    className="mb-2"
                  >
                    <option value="">All Loan Types</option>
                    {loans.map((loan) => (
                      <option key={loan.loan_id} value={loan.loan_id}>
                        {loan.loan}
                      </option>
                    ))}
                  </Select>
                </Flex>
              )}
              <Select
                name="selectedState"
                value={stateFilterData.selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  updateStateInputs(e);
                }}
                placeholder="Select State"
                width="200px"
                marginRight="10px"
                className="mb-2 drop"
              >
                {states.map((state) => (
                  <option key={state.isoCode} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </Select>
              <Select
                name="selectedCity"
                value={cityFilterData.selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  updateCityInputs(e);
                }}
                placeholder="Select City"
                disabled={!selectedState}
                width="200px"
                marginRight="10px"
                className="mb-2 drop"
              >
                {cities.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </Select>
              <Select
                value={selectedStatusSearchApi}
                onChange={(e) => setSelectedStatusSearchApi(e.target.value)}
                mr="10px"
                width="200px"
                className="mb-2"
              >
                <option value="">Select a Status</option>
                <option value="">All</option>
                <option value="running">Running</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Select>
              <form className="form-inline">
                <input
                  id="serchbar-size"
                  className="form-control mr-sm-2"
                  type="search"
                  value={searchValueApi}
                  onChange={(e) => setSearchValueApi(e.target.value)}
                  placeholder="Search"
                  aria-label="Search"
                />
                {searchValueApi ? (
                  <Button onClick={() => handleSearchData(searchValueApi)}>
                    Search
                  </Button>
                ) : null}
                {searchValueApi && <Button onClick={handleReset}>Reset</Button>}
              </form>
              <div>
                <style>
                  {`
                    .dynamicImportantStyle {
                      background-color: #b19552 !important;
                      color: #fff !important;
                    }
                  `}
                </style>
              </div>
            </Flex>
          </Flex>
        </CardHeader>
        <ThemeProvider theme={theme}>
          {loading ||
          stateLoader ||
          cityLoader ||
          statusLoader ||
          loanFilterLoader ||
          searchLoader ? (
            <Flex justify="center" align="center">
              <Loader
                type="spinner-circle"
                bgColor={"#b19552"}
                color={"black"}
                size={50}
              />
            </Flex>
          ) : (
            <TableContainer component={Paper}>
              {files.length > 0 ? (
                <Table aria-label="collapsible table">
                  <TableHead style={{ borderBottom: "1px solid red" }}>
                    <TableRow>
                      <TableCell />
                      <TableCell align="">Index</TableCell>
                      <TableCell align="">File Id</TableCell>
                      <TableCell align="">Customer (Business)</TableCell>
                      <TableCell align="">City</TableCell>
                      {/* <TableCell align="">Pan Card</TableCell> */}
                      <TableCell align="">Loan</TableCell>
                      <TableCell align="">File Status</TableCell>
                      <TableCell align="">Document Status</TableCell>
                      <TableCell
                        align=""
                        // }
                      ></TableCell>
                      <TableCell align="">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {files.map((file, index) => (
                      <Row
                        key={file._id}
                        file={file}
                        id={file.file_id}
                        pan_card={file.pan_card}
                        index={index + 1}
                        handleRow={handleRow}
                        handleEditClick={handleEditClick}
                        handleDelete={handleDelete}
                        handleUpdate={handleUpdate}
                      />
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Flex justify="center" align="center">
                  <TableCell variant="h6" color="textSecondary">
                    No data found.
                  </TableCell>
                </Flex>
              )}
            </TableContainer>
          )}
        </ThemeProvider>
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
            setSelectedStatus(""); // Reset the selected status when closing the dialog
          }}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Update File Status
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to update the status of this file?
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{
                    marginLeft: "10px",
                    marginTop: "20px",
                    width: "100%",
                    height: "35px",
                  }}
                >
                  <option value="">Select a Status</option>
                  <option value="running">Running</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
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
                    updateFile(selecteUpdateFileId, selectedStatus); // Pass selectedStatus to update function
                    setIsUpdateDialogOpen(false);
                  }}
                  ml={3}
                  isDisabled={!selectedStatus} // Disable the button if no status is selected
                >
                  Update
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </div>
      <Flex justifyContent="flex-end" alignItems="center" p="4">
        <Text mr="4">Total Records: {totalRecords}</Text>
        <Text mr="2">Rows per page:</Text>
        <Select
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          mr="2"
          width="100px"
        >
          {[10, 20, 50].map((perPage) => (
            <option key={perPage} value={perPage}>
              {perPage}
            </option>
          ))}
        </Select>
        <Text mr="4">
          Page {currentPage} of {totalPages}
        </Text>
        <IconButton
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          aria-label="Previous Page"
          icon={<KeyboardArrowUpIcon />}
          mr="2"
        />
        <IconButton
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          aria-label="Next Page"
          icon={<KeyboardArrowDownIcon />}
        />
      </Flex>
      <Toaster />
    </>
  );
}
