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
} from "@chakra-ui/react";
import $ from "jquery";
import { MoreVert as MoreVertIcon } from "@material-ui/icons";
import { Menu, MenuItem, ListItemIcon } from "@material-ui/core";
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
import { DeleteIcon, EditIcon, AddIcon } from "@chakra-ui/icons";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import AxiosInstance from "config/AxiosInstance";
// import "./user.css";
import moment from "moment";
import { Country, State, City } from "country-state-city";
import {
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";

function Files() {
  const [files, setFiles] = useState([]);
  const textColor = useColorModeValue("gray.700", "white");

  let menuBg = useColorModeValue("white", "navy.800");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLoan, setSelectedLoan] = useState("All Loan Types");
  const location = useLocation();
  const { loan, loan_id } = location?.state?.state || {};
  const [loans, setLoans] = useState([]);
  const [selectedStatusSearch, setSelectedStatusSearch] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);

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
  const toggleRowExpansion = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };
  const handleRowClick = (id) => {
    history.push(`/superadmin/viewfile?id=${id}`);
  };
  const history = useHistory();

  const handleRow = (url) => {
    history.push(url);
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
    if (loan_id) {
      const timeout = setTimeout(() => {
        setSelectedLoan(loan_id);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [loan_id, loans, loan]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecorrds] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await AxiosInstance.get("/file_upload", {
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
          selectedStatus: selectedStatusSearch,
          selectedState,
          selectedCity,
        },
      });
      setFiles(response.data.data);
      setTotalPages(response.data.totalPages);
      setTotalRecorrds(response.data.totalCount);
      setCurrentPage(response.data.currentPage);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    currentPage,
    itemsPerPage,
    searchTerm,
    selectedLoan,
    selectedStatusSearch,
    selectedState,
    selectedCity,
    loan_id,
  ]);

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

  const [totalAmount, setTotalAmount] = useState(null);
  const fetchTotalAmount = async () => {
    try {
      if (loan_id) {
        const response = await AxiosInstance.get(
          `/file_upload/amounts/${loan_id}`,
          {
            params: {
              state: selectedState,
              city: selectedCity,
            },
          }
        );
        const { totalAmount } = response.data;
        setTotalAmount(totalAmount);
      }
    } catch (error) {
      console.error("Error fetching total amount:", error);
    }
  };

  useEffect(() => {
    fetchTotalAmount();
  }, [loan_id, selectedState, selectedCity]);

  const [fileData, setFileData] = useState([]);

  const fetchFileData = async (fileId) => {
    try {
      const response = await AxiosInstance.get(
        `/file_upload/file-count/${fileId}`
      );
      console.log(response, "abc");
      setFileData([
        ...response.data.data.approvedData,
        ...response.data.data.pendingData,
      ]);
    } catch (error) {
      console.error("Error: ", error.message);
    }
  };

  useEffect(() => {
    if (files.length > 0) {
      const fileId = files[0].file_id;
      fetchFileData(fileId);
    }
  }, [files]);

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

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event, fileId) => {
    setAnchorEl(event.currentTarget);
    setSelectedFileId(fileId);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedFileId(null);
  };

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
          <CardHeader style={{ padding: "10px" }} className="card-main ">
            <Flex justifyContent="space-between" p="4" className="mainnnn">
              <Text fontSize="xl">
                {loan ? (
                  <>
                    {loan}
                    {selectedStatusSearch !== "running" &&
                    selectedStatusSearch !== "rejected" ? (
                      <Text
                        as="span"
                        color="green.400"
                        fontWeight="bold"
                        pl="1"
                      >
                        - {totalAmount !== null ? totalAmount : "-"}
                      </Text>
                    ) : null}
                  </>
                ) : (
                  <Text
                    fontSize="xl"
                    color={textColor}
                    fontWeight="bold"
                    className="ttext"
                  >
                    All Files
                  </Text>
                )}
              </Text>
            </Flex>
            <Flex justifyContent="end" py="1" className="mainnnn">
              <Flex className="theaddd p-2 ">
                <div className="d-flex first-drop-section gap-2">
                  {!loan && (
                    <select
                      className="form-select loan-type-dropdown"
                      aria-label="Default select example"
                      value={selectedLoan}
                      onChange={(e) => setSelectedLoan(e.target.value)}
                    >
                      <option value="All Loan Types">Select loan type</option>
                      {loans.map((loan) => (
                        <option key={loan.loan_id} value={loan.loan_id}>
                          {loan.loan}
                        </option>
                      ))}
                    </select>
                  )}

                  <select
                    class="form-select loan-type-dropdown"
                    aria-label="Default select example"
                    value={selectedState}
                    onChange={handleStateChange}
                  >
                    <option selected>Select State</option>
                    {states.map((state) => (
                      <option key={state.isoCode} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  <select
                    class="form-select loan-type-dropdown"
                    aria-label="Default select example"
                    disabled={!selectedState}
                    value={selectedCity}
                    onChange={handleCityChange}
                  >
                    <option selected>Select City</option>
                    {cities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  className="d-flex second-drop-section gap-2 "
                  style={{ marginLeft: "10px" }}
                >
                  <select
                    class="form-select loan-type-dropdown "
                    aria-label="Default select example"
                    value={selectedStatusSearch}
                    onChange={(e) => setSelectedStatusSearch(e.target.value)}
                    width="200px"
                  >
                    <option selected>Select Status</option>
                    <option value="running">Running</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name"
                    width="250px"
                    mr="10px"
                  />
                  <Button
                    onClick={() => history.push("/superadmin/addfile")}
                    className="dynamicImportantStyle"
                    colorScheme="blue"
                    style={{
                      backgroundColor: "#b19552",
                      color: "white",
                      width: "150px",
                    }}
                  >
                    Add File
                  </Button>
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
                  <Th>City</Th>
                  <Th>Loan</Th>
                  <Th>File Status</Th>
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
                        <Td style={{ fontSize: "14px" }}>{file?.city}</Td>
                        <Td style={{ fontSize: "14px" }}>{file?.loan}</Td>
                        <Td>
                          <div
                            style={{
                              color: "white",
                              backgroundColor:
                                file?.status === "approved"
                                  ? "#4CAF50"
                                  : file?.status === "rejected"
                                  ? "#F44336"
                                  : "#FF9C00",
                              padding: "4px 8px",
                              borderRadius: "10px",
                              display: "inline-block",
                              fontSize: "0.8em", // Decrease font size
                            }}
                          >
                            <span>
                              {file?.status === "approved"
                                ? `Approved`
                                : file?.status === "rejected"
                                ? `Rejected`
                                : `Running`}
                            </span>
                            {file?.status_message && (
                              <>
                                <br />
                                <span
                                  style={{
                                    display: "block",
                                    marginTop: "4px",
                                    fontSize: "0.9em", // Decrease font size
                                    color: "#FFFFFF",
                                  }}
                                >
                                  {file.status_message}
                                </span>
                              </>
                            )}
                            {file?.status !== "rejected" && file?.amount && (
                              <>
                                <br />
                                <span
                                  style={{
                                    display: "block",
                                    fontSize: "0.9em", // Decrease font size
                                    color: "#FFFFFF",
                                  }}
                                >
                                  Amount: {file.amount}
                                </span>
                              </>
                            )}
                          </div>
                        </Td>

                        <Td>
                          {" "}
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
                            <Flex>
                              <IconButton
                                aria-controls="menu"
                                aria-haspopup="true"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClick(e, file.file_id);
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
                                    console.log(
                                      selectedFileId,
                                      "selectedFileId"
                                    );
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
                              </Menu>
                            </Flex>
                            <Flex style={{ paddingLeft: "10px" }}>
                              <IconButton
                                aria-label={
                                  expandedRow === index ? "Collapse" : "Expand"
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRowExpansion(index);
                                }}
                              >
                                {expandedRow === index ? (
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
                          <Collapse in={expandedRow === index} animateOpacity>
                            <div
                              style={{
                                maxHeight:
                                  expandedRow === index ? "none" : "100%",
                                overflow: "hidden",
                              }}
                            >
                              {/* Wrapping the table in a div with a fixed height and scrollable overflow */}
                              <div
                                style={{
                                  maxHeight: "200px",
                                  overflowY: "auto",
                                }}
                              >
                                <Table
                                  variant="simple"
                                  bg={useColorModeValue("gray.50", "gray.700")}
                                  style={{ tableLayout: "fixed" }}
                                >
                                  <Thead>
                                    <Tr>
                                      <Th>Document Name</Th>
                                      <Th>Status</Th>
                                    </Tr>
                                  </Thead>
                                  <Tbody style={{ fontSize: "14px" }}>
                                    {fileData?.length > 0 ? (
                                      fileData.map((documentRow, index) => (
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
                                      ))
                                    ) : (
                                      <Tr>
                                        <Td colSpan={2} align="center">
                                          No documents available
                                        </Td>
                                      </Tr>
                                    )}
                                  </Tbody>
                                </Table>
                              </div>
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
            setSelectedStatus("");
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
                    updateFile(selecteUpdateFileId, selectedStatus);
                    setIsUpdateDialogOpen(false);
                  }}
                  ml={3}
                  isDisabled={!selectedStatus}
                >
                  Update
                </Button>
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

export default Files;
