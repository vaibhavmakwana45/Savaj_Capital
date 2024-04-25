import React, { useEffect, useState } from "react";
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
// import "./file.scss";
import { useHistory } from "react-router-dom";
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
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { IconButton } from "@chakra-ui/react";
import {
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";
import Loader from "react-js-loader";
import AxiosInstance from "config/AxiosInstance";
import { jwtDecode } from "jwt-decode";
import moment from "moment";

const theme = createTheme();

function Row(props) {
  const { id, file, handleEditClick, handleDelete } = props;
  const history = useHistory();
  const [open, setOpen] = React.useState(false);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await AxiosInstance.get("/file_upload");
        if (response.data.statusCode === 200) {
          setFiles(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, []);

  return (
    <React.Fragment>
      <TableRow
        sx={{ "& > *": { borderBottom: "unset" } }}
        onClick={() => props.handleRow("/bankuser/viewbankfile?id=" + id)}
        style={{ cursor: "pointer" }}
      >
        <TableCell >
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
        <TableCell align="">{file?.file_id}</TableCell>
        <TableCell align="">{file?.username}</TableCell>
        <TableCell align="">{file?.loan}</TableCell>
        <TableCell align="">{file?.loan_type || "-"}</TableCell>
        <TableCell align="">
          {moment(file?.bank_assign_date).format("DD/MM/YYYY hh:mm")}
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
            <div className="container-fluid progress-bar-area" style={{height:"20%"}}>
              <div className="row  ">
                <div className="col">
                  <ul className="progressbar">
                    <li id="step1" className="complete">
                      <div className="circle-container">
                        <a href="#">
                          <div className="circle-button"></div>
                        </a>
                      </div>
                      Step 1
                    </li>

                    <li id="step2" className="complete">
                      <div className="circle-container">
                        <a href="#">
                          <div className="circle-button"></div>
                        </a>
                      </div>
                      Step 2
                    </li>

                    <li id="step3" className="active">
                      <div className="circle-container">
                        <a href="#">
                          <div className="circle-button"></div>
                        </a>
                      </div>
                      Step 3
                    </li>

                    <li id="step4">
                      <div className="circle-container">
                        <a href="#">
                          <div className="circle-button"></div>
                        </a>
                      </div>
                      Step 4
                    </li>

                    <li id="step5">
                      <div className="circle-container">
                        <a href="#">
                          <div className="circle-button"></div>
                        </a>
                      </div>
                      Step 5
                    </li>
                  </ul>
                </div>
              </div>
            </div>
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
  const filteredUsers =
    searchTerm.length === 0
      ? files
      : files.filter(
          (user) =>
            (user.loan &&
              user.loan.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.file_id &&
              user.file_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.loan_type &&
              user.loan_type.toLowerCase().includes(searchTerm.toLowerCase()))
        );

  const history = useHistory();

  const handleRow = (url) => {
    history.push(url);
  };

  const [accessType, setAccessType] = useState("");
  console.log(accessType.bankuser_id, "id");
  const bankUserId = accessType.bankuser_id;
  console.log(bankUserId, "bankUserId");
  React.useEffect(() => {
    const jwt = jwtDecode(localStorage.getItem("authToken"));
    setAccessType(jwt._id);
  }, []);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await AxiosInstance.get(
          `/bank_approval/bank_user/1712915645772`
        );
        console.log(`/file_upload/branch_user/${bankUserId}`, "shivam");
        setFiles(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, []);

  $(function () {
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
    });

    function percentageToDegrees(percentage) {
      return (percentage / 100) * 360;
    }
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const cancelRef = React.useRef();
  const deletefile = async (fileId) => {
    try {
      await AxiosInstance.delete(`/file_upload/${fileId}`);
      setFiles(files.filter((file) => file.file_id !== fileId));
      setIsDeleteDialogOpen(false);
      toast.success("File deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("file not delete");
    }
  };
  const handleEditClick = (id) => {
    history.push(`/superadmin/editfile?id=${id}`);
  };
  const handleDelete = (id) => {
    setSelectedFileId(id);
    setIsDeleteDialogOpen(true);
  };
  return (
    <>
      <div
        className="card"
        style={{ marginTop: "120px", borderRadius: "30px" }}
      >
        <CardHeader style={{ padding: "30px" }}>
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontSize="xl" fontWeight="bold">
              Add File
            </Text>
            <div>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name"
                width="250px"
                marginRight="10px"
              />
            </div>
          </Flex>
        </CardHeader>
        <ThemeProvider theme={theme}>
          {loading ? (
            <Flex justify="center" align="center" height="100vh">
              <Loader
                type="spinner-circle"
                bgColor={"#3182CE"}
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
                      File Id
                    </TableCell>
                    <TableCell align="" style={{ color: "#BEC7D4" }}>
                      Username
                    </TableCell>
                    <TableCell align="" style={{ color: "#BEC7D4" }}>
                      Loan
                    </TableCell>
                    <TableCell align="" style={{ color: "#BEC7D4" }}>
                      Loan Type
                    </TableCell>
                    <TableCell align="" style={{ color: "#BEC7D4" }}>
                      Assign Date
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((file) => (
                    <Row
                      key={file._id}
                      file={file}
                      id={file.file_id}
                      handleRow={handleRow}
                      handleEditClick={handleEditClick}
                      handleDelete={handleDelete}
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
      </div>
      <Toaster />
    </>
  );
}
