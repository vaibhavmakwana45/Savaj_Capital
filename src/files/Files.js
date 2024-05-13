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
  const fetchFileData = async () => {
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
              color:
                file?.status === "approved"
                  ? "#4CAF50"
                  : file?.status === "rejected"
                  ? "#F44336"
                  : "#f5c71a",
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
              color:
                file?.status === "approved"
                  ? "#4CAF50"
                  : file?.status === "rejected"
                  ? "#F44336"
                  : "#f5c71a",
              padding: "4px 8px",
              fontWeight: "bold",
            }}
          >
            {file?.user_username} ({file?.businessname})
          </span>
        </TableCell>

        <TableCell align="">{file?.pan_card}</TableCell>
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
                  : "#f5c71a",
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
                              style={{ color: "green", fontWeight: "bold" }}
                            >
                              <i class="fa-regular fa-circle-check"></i>
                              &nbsp;&nbsp;Uploaded
                            </span>
                          ) : (
                            <span
                              style={{ color: "#FFB302 ", fontWeight: "bold" }}
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
  const { loan } = location?.state?.state || {};
  const [loans, setLoans] = useState([]);
  const [selectedStatusSearch, setSelectedStatusSearch] = useState("");

  const filteredUsers = files.filter((file) => {
    const loanSafe =
      file.loan && typeof file.loan === "string" ? file.loan.toLowerCase() : "";
    const fileIdSafe =
      file.file_id && typeof file.file_id === "string"
        ? file.file_id.toLowerCase()
        : "";
    const loanTypeSafe =
      file.loan_type && typeof file.loan_type === "string"
        ? file.loan_type.toLowerCase()
        : "";
    const usernameSafe =
      file.user_username && typeof file.user_username === "string"
        ? file.user_username.toLowerCase()
        : "";
    const statusSafe =
      file.status && typeof file.status === "string"
        ? file.status.toLowerCase()
        : "";

    return (
      (selectedLoan === "All Loan Types" ||
        loanSafe.includes(selectedLoan.toLowerCase())) &&
      (loanSafe.includes(searchTerm.toLowerCase()) ||
        fileIdSafe.includes(searchTerm.toLowerCase()) ||
        loanTypeSafe.includes(searchTerm.toLowerCase()) ||
        usernameSafe.includes(searchTerm.toLowerCase())) &&
      (selectedStatusSearch === "" ||
        statusSafe === selectedStatusSearch.toLowerCase())
    );
  });

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
    if (loan) {
      console.log(loan);
      setSelectedLoan(loan);
    }
  }, [loan, loans]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await AxiosInstance.get("/file_upload", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
        },
      });
      console.log(response, "response");
      setFiles(response.data.data);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage]);

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

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const fileResponse = await AxiosInstance.get("/file_upload");
  //       const loanResponse = await AxiosInstance.get("/loan");

  //       setFiles(fileResponse.data.data);
  //       setLoans(loanResponse.data.data);
  //       setLoading(false);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);

  // Inside the Row component

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const cancelRef = React.useRef();

  const deletefile = async (fileId) => {
    try {
      const fileData = files.find((file) => file.file_id === fileId);
      if (!fileData || !fileData.documents || fileData.documents.length === 0) {
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

  return (
    <>
      <div
        className="card"
        style={{ marginTop: "120px", borderRadius: "30px" }}
      >
        <CardHeader style={{ padding: "30px" }} className="card-main">
          <Flex justifyContent="space-between" p="4" className="mainnnn">
            <Text fontSize="xl" fontWeight="bold">
              {loan ? `${loan}` : "All Files"}
            </Text>
            <Flex className="thead">
              {!loan && (
                <Flex className="thead">
                  <Select
                    placeholder="Select a loan type"
                    value={selectedLoan}
                    onChange={(e) => setSelectedLoan(e.target.value)}
                    mr="10px"
                    width="200px"
                  >
                    <option value="All Loan Types">All Loan Types</option>
                    {loans.map((loan) => (
                      <option key={loan.loan_id} value={loan.loan}>
                        {loan.loan}
                      </option>
                    ))}
                  </Select>
                </Flex>
              )}
              <Select
                value={selectedStatusSearch}
                onChange={(e) => setSelectedStatusSearch(e.target.value)}
                mr="10px"
                width="200px"
              >
                <option value="">Select a Status</option>
                <option value="running">Running</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Select>

              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name"
                width="250px"
                mr="10px"
              />
              <div>
                <style>
                  {`
                    .dynamicImportantStyle {
                      background-color: #b19552 !important;
                      color: #fff !important;
                    }
                  `}
                </style>
                <Button
                  onClick={() => history.push("/superadmin/addfile")}
                  className="dynamicImportantStyle"
                >
                  Add File
                </Button>
              </div>
            </Flex>
          </Flex>
        </CardHeader>
        <ThemeProvider theme={theme}>
          {loading ? (
            <Flex justify="center" align="center" height="100vh">
              <Loader
                type="spinner-circle"
                bgColor={"#b19552"}
                color={"black"}
                size={50}
              />
            </Flex>
          ) : (
            <TableContainer component={Paper}>
              <Table aria-label="collapsible table">
                <TableHead style={{ borderBottom: "1px solid red" }}>
                  <TableRow>
                    <TableCell />
                    <TableCell align="" style={{ color: "#BEC7D4" }}>
                      Index
                    </TableCell>
                    <TableCell align="" style={{ color: "#BEC7D4" }}>
                      File Id
                    </TableCell>
                    <TableCell align="" style={{ color: "#BEC7D4" }}>
                      Customer (Business)
                    </TableCell>
                    <TableCell align="" style={{ color: "#BEC7D4" }}>
                      Pan Card
                    </TableCell>
                    <TableCell align="" style={{ color: "#BEC7D4" }}>
                      Loan
                    </TableCell>
                    <TableCell align="" style={{ color: "#BEC7D4" }}>
                      File Status
                    </TableCell>
                    <TableCell align="" style={{ color: "#BEC7D4" }}>
                      Document Status
                    </TableCell>
                    <TableCell
                      align=""
                      style={{ color: "#BEC7D4" }}
                    ></TableCell>
                    <TableCell align="" style={{ color: "#BEC7D4" }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((file, index) => (
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
        <Text mr="4">Total Records: {files.length}</Text>
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
